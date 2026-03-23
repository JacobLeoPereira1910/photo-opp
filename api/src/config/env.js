import dotenv from 'dotenv';

dotenv.config();

function parseInteger(value, defaultValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseCorsOrigin(value) {
  if (!value || value === '*') {
    return true;
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeStoragePublicPath(value) {
  const normalized = value || '/storage';
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}`
  );
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInteger(process.env.PORT, 3333),
  ACTIVE_EVENT_KEY: process.env.ACTIVE_EVENT_KEY || 'nexlab-default',
  DATABASE_URL: process.env.DATABASE_URL,
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:3333',
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL || 'http://localhost:5173',
  APP_TIMEZONE: process.env.APP_TIMEZONE || 'America/Sao_Paulo',
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN),
  STORAGE_PUBLIC_BASE_PATH: normalizeStoragePublicPath(
    process.env.STORAGE_PUBLIC_BASE_PATH
  ),
  MAX_UPLOAD_SIZE_MB: parseInteger(process.env.MAX_UPLOAD_SIZE_MB, 10),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  BCRYPT_SALT_ROUNDS: parseInteger(process.env.BCRYPT_SALT_ROUNDS, 10)
};
