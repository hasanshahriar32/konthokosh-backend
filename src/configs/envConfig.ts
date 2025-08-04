// Centralized environment config for all secrets and env variables
import dotenv from 'dotenv';
dotenv.config();

// List all required env vars (from .env.example and code usage)
const REQUIRED_ENV_VARS = [
  'PORT',
  'DATABASE_URL',
  'DATABASE_DIALECT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_JWT_SECRET',
  'REFRESH_JWT_EXPIRES_IN',
  'FROM_EMAIL',
  'PASSWORD',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_BUCKET_NAME',
  'SMS_SENDER_ID',
  'SMS_API_KEY',
  'SMS_API_SECRET',
  'DOC_USER',
  'DOC_PASS',
  'BASE_URL',
  'CLERK_SECRET_KEY', 
  'THINKSOURCE_API_TOKEN',
  'EXTERNAL_SERVICE_BASE_URL',
  'EXTERNAL_SERVICE_TOKEN',
  'WORKER_SERVER_URL',
  'WORKER_SERVER_TOKEN',
  'WEBHOOK_SECRET_TOKEN',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX',
  'RATE_LIMIT_MESSAGE',
];

// Helper to check for missing env vars (checks .env and .env.example)
export function checkMissingEnvVars() {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    // Warn in dev, throw in prod
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    // if (process.env.NODE_ENV === 'production') throw new Error(msg);
    // else
    console.warn(msg);
  }
}

// Export all env vars as consts (with fallback defaults if needed)
export const PORT = process.env.PORT || 2000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const DATABASE_DIALECT =
  (process.env.DATABASE_DIALECT as
    | 'postgresql'
    | 'mysql'
    | 'sqlite'
    | 'turso'
    | 'singlestore'
    | 'gel') || 'postgresql';
export const JWT_SECRET = process.env.JWT_SECRET || 'smsk-jwt-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const REFRESH_JWT_SECRET =
  process.env.REFRESH_JWT_SECRET || 'smsk-refresh-jwt-secret';
export const REFRESH_JWT_EXPIRES_IN =
  process.env.REFRESH_JWT_EXPIRES_IN || '7d';
export const FROM_EMAIL = process.env.FROM_EMAIL || '';
export const PASSWORD = process.env.PASSWORD || '';
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
export const SMS_SENDER_ID = process.env.SMS_SENDER_ID || '';
export const SMS_API_KEY = process.env.SMS_API_KEY || '';
export const SMS_API_SECRET = process.env.SMS_API_SECRET || '';
export const DOC_USER = process.env.DOC_USER || 'password';
export const DOC_PASS = process.env.DOC_PASS || 'admin';
export const BASE_URL = process.env.BASE_URL || 'http://localhost:2000';
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
export const THINKSOURCE_API_TOKEN = process.env.THINKSOURCE_API_TOKEN;
export const EXTERNAL_SERVICE_BASE_URL = process.env.EXTERNAL_SERVICE_BASE_URL || 'https://thinksource.onrender.com'; // Default to ThinkSource service URL
export const WORKER_SERVER_URL = process.env.WORKER_SERVER_URL || 'https://thinkscribe-worker.onrender.com';
export const WORKER_SERVER_TOKEN = process.env.WORKER_SERVER_TOKEN;

export const WEBHOOK_SECRET_TOKEN = process.env.WEBHOOK_SECRET_TOKEN || '';
export const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || '900000',
  10
);
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
export const RATE_LIMIT_MESSAGE =
  process.env.RATE_LIMIT_MESSAGE ||
  'Too many requests from this IP, please try again later.';

// Centralized config object
export const envConfig = {
  PORT,
  DATABASE_URL,
  DATABASE_DIALECT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_JWT_SECRET,
  REFRESH_JWT_EXPIRES_IN,
  FROM_EMAIL,
  PASSWORD,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
  SMS_SENDER_ID,
  SMS_API_KEY,
  SMS_API_SECRET,
  DOC_USER,
  DOC_PASS,
  BASE_URL,
  CLERK_SECRET_KEY,
  THINKSOURCE_API_TOKEN,
  EXTERNAL_SERVICE_BASE_URL,
  WORKER_SERVER_URL,
  WORKER_SERVER_TOKEN,
  WEBHOOK_SECRET_TOKEN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_MESSAGE,
};

// Run check on import (can be disabled in prod if needed)
checkMissingEnvVars();
