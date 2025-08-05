import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  jsonb,
  text,
  integer,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 64 }), // Made nullable
  lastName: varchar('last_name', { length: 64 }), // Made nullable
  username: varchar('username', { length: 64 }),
  imageUrl: text('image_url'),
  profileImageUrl: text('profile_image_url'),
  hasImage: boolean('has_image').default(false),
  emails: jsonb('emails').default([]), // [{ id: string, email: string, type: 'primary' | 'additional' }]
  phoneNumbers: jsonb('phone_numbers').default([]), // [{ id: string, phone_number: string }]
  web3Wallets: jsonb('web3_wallets').default([]), // [{ id: string, web3_wallet: string, verification: object }]
  externalAccounts: jsonb('external_accounts').default([]), // External OAuth accounts
  primaryEmailAddressId: varchar('primary_email_address_id', { length: 128 }),
  primaryPhoneNumberId: varchar('primary_phone_number_id', { length: 128 }),
  primaryWeb3WalletId: varchar('primary_web3_wallet_id', { length: 128 }),
  passwordEnabled: boolean('password_enabled').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  mfaEnabledAt: timestamp('mfa_enabled_at'),
  mfaDisabledAt: timestamp('mfa_disabled_at'),
  banned: boolean('banned').default(false),
  locked: boolean('locked').default(false),
  lockoutExpiresInSeconds: integer('lockout_expires_in_seconds'),
  verificationAttemptsRemaining: integer('verification_attempts_remaining').default(100),
  lastSignInAt: timestamp('last_sign_in_at'),
  lastActiveAt: timestamp('last_active_at'),
  legalAcceptedAt: timestamp('legal_accepted_at'),
  publicMetadata: jsonb('public_metadata').default({}),
  privateMetadata: jsonb('private_metadata').default({}),
  unsafeMetadata: jsonb('unsafe_metadata').default({}),
  externalId: varchar('external_id', { length: 128 }),
  deleteSelfEnabled: boolean('delete_self_enabled').default(true),
  createOrganizationEnabled: boolean('create_organization_enabled').default(true),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  clerkUID: varchar('clerk_uid', { length: 128 }).notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
