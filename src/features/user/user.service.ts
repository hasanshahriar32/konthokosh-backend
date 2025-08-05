import { eq, and, or, sql } from 'drizzle-orm';
import db from '../../db/db';
import { getPaginatedData, getPagination } from '../../utils/common';
import { ListQuery } from '../../types/types';
import { users } from '../../db/schema/users';
import axios from 'axios';
import { CLERK_SECRET_KEY } from '../../configs/envConfig';

// Helper: filter users by keyword (firstName, lastName, or email)
function buildUserKeywordFilter(keyword: string) {
  if (!keyword) return undefined;
  return or(
    sql`LOWER(${users.firstName}) LIKE LOWER('%' || ${keyword} || '%')`,
    sql`LOWER(${users.lastName}) LIKE LOWER('%' || ${keyword} || '%')`,
    sql`LOWER(${users.username}) LIKE LOWER('%' || ${keyword} || '%')`,
    sql`EXISTS (SELECT 1 FROM jsonb_array_elements(${users.emails}) elem WHERE LOWER(elem->>'email_address') LIKE LOWER('%' || ${keyword} || '%'))`
  );
}

export async function getUsers(filters: ListQuery) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  const whereClause = buildUserKeywordFilter(filters.keyword || '');
  const data = await db
    .select()
    .from(users)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getUser(id: string | number) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(id)));
  return user[0] || null;
}

export async function createUser(data: typeof users.$inferInsert) {
  const [created] = await db.insert(users).values(data).returning();
  return created;
}

export async function updateUser({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof users.$inferInsert>;
}) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteUser(id: string | number) {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, Number(id)))
    .returning();
  return deleted;
}

// Find user by primary email in emails JSONB
export async function getUserByPrimaryEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(sql`${users.emails} @> '[{"email_address": "${email}"}]'`);
  return user[0] || null;
}

// Find user by Clerk UID
export async function getUserByClerkUID(clerkUID: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkUID, clerkUID));
  return user[0] || null;
}

// Fetch user details from Clerk API and create user if not exists
export async function createUserFromClerk(clerkUID: string) {
  // Check if user already exists
  const found = await getUserByClerkUID(clerkUID);
  if (found) {
    return { user: found, alreadyExists: true };
  }
  // Fetch user details from Clerk API
  let userDetails = null;
  try {
    const clerkRes = await axios.get(
      `https://api.clerk.dev/v1/users/${clerkUID}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        },
      }
    );
    userDetails = clerkRes.data;
    console.log('Fetched user from Clerk:', userDetails);
  } catch (apiErr) {
    throw new Error('Failed to fetch user from Clerk');
  }
  
  // Map Clerk user data to your DB model
  const userData = {
    firstName: userDetails.first_name,
    lastName: userDetails.last_name,
    username: userDetails.username,
    imageUrl: userDetails.image_url,
    profileImageUrl: userDetails.profile_image_url,
    hasImage: userDetails.has_image || false,
    emails: userDetails.email_addresses || [],
    phoneNumbers: userDetails.phone_numbers || [],
    web3Wallets: userDetails.web3_wallets || [],
    externalAccounts: userDetails.external_accounts || [],
    primaryEmailAddressId: userDetails.primary_email_address_id,
    primaryPhoneNumberId: userDetails.primary_phone_number_id,
    primaryWeb3WalletId: userDetails.primary_web3_wallet_id,
    passwordEnabled: userDetails.password_enabled || false,
    twoFactorEnabled: userDetails.two_factor_enabled || false,
    mfaEnabledAt: userDetails.mfa_enabled_at ? new Date(userDetails.mfa_enabled_at) : null,
    mfaDisabledAt: userDetails.mfa_disabled_at ? new Date(userDetails.mfa_disabled_at) : null,
    banned: userDetails.banned || false,
    locked: userDetails.locked || false,
    lockoutExpiresInSeconds: userDetails.lockout_expires_in_seconds,
    verificationAttemptsRemaining: userDetails.verification_attempts_remaining || 100,
    lastSignInAt: userDetails.last_sign_in_at ? new Date(userDetails.last_sign_in_at) : null,
    lastActiveAt: userDetails.last_active_at ? new Date(userDetails.last_active_at) : null,
    legalAcceptedAt: userDetails.legal_accepted_at ? new Date(userDetails.legal_accepted_at) : null,
    publicMetadata: userDetails.public_metadata || {},
    privateMetadata: userDetails.private_metadata || {},
    unsafeMetadata: userDetails.unsafe_metadata || {},
    externalId: userDetails.external_id,
    deleteSelfEnabled: userDetails.delete_self_enabled !== false,
    createOrganizationEnabled: userDetails.create_organization_enabled !== false,
    clerkUID: userDetails.id,
    isActive: true,
    isDeleted: false,
    createdAt: new Date(userDetails.created_at),
    updatedAt: new Date(userDetails.updated_at),
  };
  
  const created = await createUser(userData);
  return { user: created, alreadyExists: false };
}
