// drizzle/seed-initial-data.ts
import db from '../src/db/db';
import { products } from '../src/db/schema/products';
import { actions, modules, permissions, rolePermissions, roles, subModules, userRoles } from '../src/db/schema/rbac';
import { users } from '../src/db/schema/users';

async function seed() {
  // --- USERS ---
  const [user1, user2, user3] = await db.insert(users).values([
    {
      firstName: 'Alice',
      lastName: 'Admin',
      username: 'alice_admin',
      imageUrl: 'https://img.clerk.com/default_profile_pic',
      profileImageUrl: 'https://img.clerk.com/default_profile_pic',
      hasImage: false,
      emails: [{ 
        id: 'email_alice_primary', 
        email: 'alice@demo.com', 
        type: 'primary',
        primary: true 
      }],
      phoneNumbers: [],
      web3Wallets: [],
      externalAccounts: [],
      primaryEmailAddressId: 'email_alice_primary',
      primaryPhoneNumberId: null,
      primaryWeb3WalletId: null,
      passwordEnabled: true,
      twoFactorEnabled: false,
      mfaEnabledAt: null,
      mfaDisabledAt: null,
      banned: false,
      locked: false,
      lockoutExpiresInSeconds: null,
      verificationAttemptsRemaining: 100,
      lastSignInAt: new Date(),
      lastActiveAt: new Date(),
      legalAcceptedAt: null,
      publicMetadata: {},
      privateMetadata: {},
      unsafeMetadata: {},
      externalId: null,
      deleteSelfEnabled: true,
      createOrganizationEnabled: true,
      clerkUID: 'clerk_alice_uid',
      isActive: true,
      isDeleted: false,
    },
    {
      firstName: 'Bob',
      lastName: 'User',
      username: 'bob_user',
      imageUrl: 'https://img.clerk.com/default_profile_pic',
      profileImageUrl: 'https://img.clerk.com/default_profile_pic',
      hasImage: false,
      emails: [{ 
        id: 'email_bob_primary', 
        email: 'bob@demo.com', 
        type: 'primary',
        primary: true 
      }],
      phoneNumbers: [],
      web3Wallets: [],
      externalAccounts: [],
      primaryEmailAddressId: 'email_bob_primary',
      primaryPhoneNumberId: null,
      primaryWeb3WalletId: null,
      passwordEnabled: true,
      twoFactorEnabled: false,
      mfaEnabledAt: null,
      mfaDisabledAt: null,
      banned: false,
      locked: false,
      lockoutExpiresInSeconds: null,
      verificationAttemptsRemaining: 100,
      lastSignInAt: new Date(),
      lastActiveAt: new Date(),
      legalAcceptedAt: null,
      publicMetadata: {},
      privateMetadata: {},
      unsafeMetadata: {},
      externalId: null,
      deleteSelfEnabled: true,
      createOrganizationEnabled: true,
      clerkUID: 'clerk_bob_uid',
      isActive: true,
      isDeleted: false,
    },
    {
      firstName: null,
      lastName: null,
      username: null,
      imageUrl: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzMwbjk4QXppVWFBRDdYRDNXY0pkSWM5VGRhdCJ9',
      profileImageUrl: 'https://images.clerk.dev/uploaded/img_30n98AziUaAD7XD3WcJdIc9Tdat',
      hasImage: true,
      emails: [],
      phoneNumbers: [],
      web3Wallets: [{
        id: 'idn_30mtI5WFZbalrqHNiZ6quCXxRmK',
        web3_wallet: '0x47467ce010a06498fe58d5b3bfc256a8009408c6',
        verification: { status: 'verified' },
        created_at: 1754244492429,
        updated_at: 1754244500108
      }],
      externalAccounts: [],
      primaryEmailAddressId: null,
      primaryPhoneNumberId: null,
      primaryWeb3WalletId: 'idn_30mtI5WFZbalrqHNiZ6quCXxRmK',
      passwordEnabled: false,
      twoFactorEnabled: false,
      mfaEnabledAt: null,
      mfaDisabledAt: null,
      banned: false,
      locked: false,
      lockoutExpiresInSeconds: null,
      verificationAttemptsRemaining: 100,
      lastSignInAt: new Date('2025-08-05T05:49:18.059Z'),
      lastActiveAt: new Date('2025-08-05T05:49:18.059Z'),
      legalAcceptedAt: null,
      publicMetadata: {},
      privateMetadata: {},
      unsafeMetadata: {},
      externalId: null,
      deleteSelfEnabled: true,
      createOrganizationEnabled: true,
      clerkUID: 'user_30mtJ2279mXidm3YTJapeNb9INB',
      isActive: true,
      isDeleted: false,
    },
  ]).returning();

  // --- ROLES ---
  const [adminRole, userRole, devRole] = await db.insert(roles).values([
    { name: 'ADMIN', description: 'Administrator', isActive: true },
    { name: 'USER', description: 'Regular User', isActive: true },
    { name: 'DEVELOPER', description: 'Developer', isActive: true },
  ]).returning();

  // --- MODULES ---
  const [modUserMgmt, modProduct] = await db.insert(modules).values([
    { name: 'USER_MANAGEMENT', description: 'User management module', isActive: true },
    { name: 'PRODUCT', description: 'Product module', isActive: true },
  ]).returning();

  // --- SUBMODULES ---
  const [subUser, subUserRoleAssign, subProductCategory, subProduct] = await db.insert(subModules).values([
    { moduleId: modUserMgmt.id, name: 'USER', description: 'User submodule', isActive: true },
    { moduleId: modUserMgmt.id, name: 'USER_ROLE_ASSIGN', description: 'User role assignment', isActive: true },
    { moduleId: modProduct.id, name: 'PRODUCT_CATEGORY', description: 'Product category', isActive: true },
    { moduleId: modProduct.id, name: 'PRODUCT', description: 'Product submodule', isActive: true },
  ]).returning();

  // --- ACTIONS ---
  const [actionCreate, actionView, actionUpdate, actionDelete] = await db.insert(actions).values([
    { name: 'CREATE', description: 'Create resource' },
    { name: 'VIEW', description: 'View resource' },
    { name: 'UPDATE', description: 'Update resource' },
    { name: 'DELETE', description: 'Delete resource' },
  ]).returning();

  // --- PERMISSIONS ---
  // Example: grant all actions on all submodules to ADMIN
  type PermissionInsert = {
    actionId: number;
    moduleId: number | null;
    subModuleId: number;
    name: string;
    description: string;
  };
  const perms: PermissionInsert[] = [];
  for (const action of [actionCreate, actionView, actionUpdate, actionDelete]) {
    for (const sub of [subUser, subUserRoleAssign, subProductCategory, subProduct]) {
      perms.push({
        actionId: action.id,
        moduleId: sub.moduleId,
        subModuleId: sub.id,
        name: `${sub.name}:${action.name}`,
        description: `${action.name} on ${sub.name}`,
      });
    }
  }
  const insertedPerms = await db.insert(permissions).values(perms).returning();

  // --- ROLE PERMISSIONS ---
  // Grant all permissions to ADMIN, VIEW to USER, CREATE/VIEW to DEVELOPER
  const adminPerms = insertedPerms.map((p) => ({ roleId: adminRole.id, permissionId: p.id }));
  const userPerms = insertedPerms.filter((p) => p.name.endsWith(':VIEW')).map((p) => ({ roleId: userRole.id, permissionId: p.id }));
  const devPerms = insertedPerms.filter((p) => p.name.endsWith(':CREATE') || p.name.endsWith(':VIEW')).map((p) => ({ roleId: devRole.id, permissionId: p.id }));
  await db.insert(rolePermissions).values([...adminPerms, ...userPerms, ...devPerms]);

  // --- USER ROLES ---
  await db.insert(userRoles).values([
    { userId: user1.id, roleId: adminRole.id },
    { userId: user2.id, roleId: userRole.id },
    { userId: user3.id, roleId: devRole.id },
  ]);

  // --- PRODUCTS ---
  await db.insert(products).values([
    { name: 'Demo Product', price: 1000 },
  ]);

  // Add more seeding as needed for other tables

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
