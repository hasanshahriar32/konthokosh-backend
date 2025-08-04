import db from '../../db/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { users } from '../../db/schema/users';
import {
  userRoles,
  roles,
  permissions,
  actions,
  modules,
  subModules,
  rolePermissions,
} from '../../db/schema/rbac';
import { channels } from '../../db/schema/channels';
import { eq } from 'drizzle-orm';
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_JWT_SECRET,
  REFRESH_JWT_EXPIRES_IN,
} from '../../configs/envConfig';
import clerkClient from '@clerk/backend';

export async function getUser(conds: Record<string, unknown>) {
  // Support lookup by id or by email (in emails JSONB array)
  let userRows: any[] = [];
  if (conds.id) {
    userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(conds.id)));
  } else if (conds.email) {
    // emails is a JSONB array of objects, e.g. [{ email: 'foo@bar.com', ... }]
    // Use Postgres JSONB containment operator via Drizzle ORM
    userRows = await db
      .select()
      .from(users)
      .where(
        // @ts-expect-error: Drizzle ORM may not have perfect types for JSONB ops
        users.emails.contains([{ email: conds.email }])
      );
  }
  const user = userRows[0];
  if (!user) return null;
  // Get role name via userRoles
  const userRole = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));
  let roleName = null;
  if (userRole[0]?.roleId) {
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, userRole[0].roleId));
    roleName = role[0]?.name || null;
  }
  return { ...user, role: roleName };
}

export async function getPermissionsByRole(roleId: number) {
  // Get all permissions for a role, including action/module/submodule/channel names
  const perms = await db
    .select({
      permissionId: permissions.id,
      actionName: actions.name,
      moduleName: modules.name,
      subModuleName: subModules.name,
      channelName: channels.name,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(actions, eq(permissions.actionId, actions.id))
    .innerJoin(modules, eq(permissions.moduleId, modules.id))
    .innerJoin(subModules, eq(permissions.subModuleId, subModules.id))
    // If you have channelId in permissions, join here; otherwise, remove this join
    //.innerJoin(channels, eq(permissions.channelId, channels.id))
    .where(eq(rolePermissions.roleId, roleId));
  return perms;
}

export async function getAccessToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function getRefreshToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, REFRESH_JWT_SECRET, {
    expiresIn: REFRESH_JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function verifyPassword(hashedPassword: string, password: string) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a new access token using a verified Clerk refresh token payload.
 * Calls Clerk's session API to issue a new JWT for the user.
 */

export async function generateAccessTokenFromRefresh(userPayload: any): Promise<string> {
  // Clerk's user ID is typically in sub or userId
  const clerkUserId = userPayload.sub || userPayload.userId;
  if (!clerkUserId) throw new Error('Invalid Clerk user payload');

  // Use Clerk's backend SDK to create a new session token
  // (You must have CLERK_SECRET_KEY set in your env)
  const sessionId = userPayload.sid;
  if (!sessionId) {
    // clerkUserId is available from the outer scope and can be used for context in the error message.
    throw new Error(`Invalid Clerk user payload for user ${clerkUserId}: Missing session ID (sid).`);
  }

  try {
    // This assumes 'clerkClient.default' holds the actual SDK instance,
    // maintaining consistency with the access pattern observed in the original selection 
    // (e.g., (clerkClient as any).default.users.getUser(...)).
    // If 'clerkClient' is directly the SDK instance, this would be 'clerkClient.sessions.getToken(...)'.
    const newSessionToken = await (clerkClient as any).default.sessions.getToken(sessionId);
    return newSessionToken;
  } catch (error: any) {
    // Log the detailed error for server-side debugging.
    console.error(`Clerk SDK error while attempting to get a new session token for session ${sessionId} (user ${clerkUserId}):`, error);
    
    // Provide a more user-friendly error message or handle specific Clerk errors.
    // Example: Check for common HTTP status codes that might indicate an invalid/expired session.
    if (error.status === 401 || error.status === 404) { 
        throw new Error(`Failed to generate new session token: The session (SID: ${sessionId}) may be invalid or expired.`);
    }
    // You might want to check for Clerk's specific error structures if available, e.g., error.errors array.
    // if (Array.isArray(error.errors) && error.errors.length > 0) {
    //   const clerkErr = error.errors[0];
    //   throw new Error(`Clerk API Error (${clerkErr.code || 'unknown_code'}): ${clerkErr.message || 'Failed to refresh token.'}`);
    // }

    // Fallback generic error message.
    throw new Error(`An unexpected error occurred while communicating with Clerk to generate a new session token for user ${clerkUserId}.`);
  }
}
