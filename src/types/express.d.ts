import { Request } from 'express';
import { JwtPayload as ClerkJwtPayload } from '@clerk/backend';

// Extend Clerk's JwtPayload type if needed
export interface JwtPayload extends ClerkJwtPayload {
  sub: string; // Clerk user ID (subject)
  email?: string;
  // Optionally add legacy fields for backward compatibility
  id?: string;
  clerkUID?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
