import { Pool, PoolConfig } from 'pg';
import { ResumeDocument } from '@/types/resume';
import { defaultResumeData } from '@/data/defaultResume';

// Configure database connection parameters
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  (process.env.POSTGRES_HOST
    ? `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${encodeURIComponent(
        process.env.POSTGRES_PASSWORD || 'postgres'
      )}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || 5432}/${
        process.env.POSTGRES_DB || 'ggresume'
      }`
    : undefined);

const poolConfig: PoolConfig = connectionString
  ? { connectionString }
  : {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT || 5432),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'ggresume',
    };

// Global singleton pool for Next.js hot reload safety
declare global {
  var __pgPool: Pool | undefined;
}

export const pool: Pool =
  global.__pgPool ||
  new Pool({
    ...poolConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__pgPool = pool;
}

export function isPostgresConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_HOST ||
      process.env.NODE_ENV === 'production'
  );
}

let schemaEnsured = false;

/**
 * Ensures required database tables and indexes exist.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  if (schemaEnsured) return;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          provider VARCHAR(50) DEFAULT 'email',
          email_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

        CREATE TABLE IF NOT EXISTS verification_tokens (
          token VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);

        CREATE TABLE IF NOT EXISTS resumes (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        );

        ALTER TABLE resumes ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
        CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes(updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_resumes_user_id_updated_at ON resumes(user_id, updated_at DESC);
      `);
      schemaEnsured = true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('PostgreSQL connection / schema check failed:', err);
    throw err;
  }
}

/**
 * List resumes stored in PostgreSQL for a specific user
 */
export async function listResumesFromDB(userId: string): Promise<ResumeDocument[]> {
  await ensureDatabaseSchema();

  const res = await pool.query(
    'SELECT id, user_id, title, data, created_at, updated_at FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );

  const resumes: ResumeDocument[] = res.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    data: row.data,
  }));

  return resumes;
}

/**
 * Retrieve a specific resume by ID from PostgreSQL, strictly verifying user ownership
 */
export async function getResumeFromDB(
  id: string,
  userId: string
): Promise<ResumeDocument | null> {
  await ensureDatabaseSchema();

  const res = await pool.query(
    'SELECT id, user_id, title, data, created_at, updated_at FROM resumes WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    data: row.data,
  };
}

/**
 * Insert or update a resume document into PostgreSQL, scoped to the authenticated user
 */
export async function saveResumeToDB(
  id: string,
  resume: ResumeDocument,
  userId: string
): Promise<ResumeDocument> {
  await ensureDatabaseSchema();

  // Check if resume exists and if it belongs to someone else
  const existingRes = await pool.query('SELECT user_id FROM resumes WHERE id = $1', [id]);
  if (existingRes.rows.length > 0) {
    const existingUserId = existingRes.rows[0].user_id;
    // If it has an owner and the owner is different, disallow access
    if (existingUserId && existingUserId !== userId) {
      throw new Error('Forbidden: You do not have permission to modify this resume.');
    }
  }

  const now = Date.now();
  const createdAt = resume.createdAt || now;
  const updatedAt = now;
  const title = resume.title || 'Untitled Resume';
  const data = resume.data || defaultResumeData;

  const query = `
    INSERT INTO resumes (id, user_id, title, data, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      data = EXCLUDED.data,
      updated_at = EXCLUDED.updated_at,
      user_id = EXCLUDED.user_id
    WHERE resumes.user_id = EXCLUDED.user_id OR resumes.user_id IS NULL
    RETURNING id, user_id, title, data, created_at, updated_at;
  `;

  const res = await pool.query(query, [
    id,
    userId,
    title,
    JSON.stringify(data),
    createdAt,
    updatedAt,
  ]);

  if (res.rows.length === 0) {
    throw new Error('Forbidden: Could not update resume belonging to another user.');
  }

  const row = res.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    data: row.data,
  };
}

/**
 * Delete a resume by ID from PostgreSQL strictly scoped to the authenticated user
 */
export async function deleteResumeFromDB(id: string, userId: string): Promise<boolean> {
  await ensureDatabaseSchema();

  const res = await pool.query('DELETE FROM resumes WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return (res.rowCount ?? 0) > 0;
}

export interface DBUser {
  id: string;
  email: string;
  password_hash: string | null;
  provider: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Find user by email in PostgreSQL
 */
export async function getUserByEmailFromDB(email: string): Promise<DBUser | null> {
  await ensureDatabaseSchema();
  const normalizedEmail = email.trim().toLowerCase();
  const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [
    normalizedEmail,
  ]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    provider: row.provider || 'email',
    email_verified: !!row.email_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Find user by ID in PostgreSQL
 */
export async function getUserByIdFromDB(id: string): Promise<DBUser | null> {
  await ensureDatabaseSchema();
  const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    provider: row.provider || 'email',
    email_verified: !!row.email_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Create a new user in PostgreSQL
 */
export async function createUserInDB(params: {
  id?: string;
  email: string;
  passwordHash?: string | null;
  provider?: string;
  emailVerified?: boolean;
}): Promise<DBUser> {
  await ensureDatabaseSchema();
  const id = params.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const email = params.email.trim().toLowerCase();
  const passwordHash = params.passwordHash || null;
  const provider = params.provider || 'email';
  const emailVerified = params.emailVerified ?? false;

  const res = await pool.query(
    `INSERT INTO users (id, email, password_hash, provider, email_verified)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, password_hash, provider, email_verified, created_at, updated_at`,
    [id, email, passwordHash, provider, emailVerified]
  );

  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    provider: row.provider,
    email_verified: !!row.email_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Upsert or update a Google OAuth user in PostgreSQL.
 * If user exists by email, mark email_verified = true and return user.
 * If user doesn't exist, create user with provider 'google' and email_verified = true.
 */
export async function upsertGoogleUserInDB(params: {
  email: string;
}): Promise<DBUser> {
  await ensureDatabaseSchema();
  const email = params.email.trim().toLowerCase();

  const existing = await getUserByEmailFromDB(email);
  if (existing) {
    if (!existing.email_verified) {
      await markUserEmailVerifiedInDB(existing.id);
      existing.email_verified = true;
    }
    return existing;
  }

  return createUserInDB({
    email,
    provider: 'google',
    emailVerified: true,
  });
}

/**
 * Mark a user's email as verified
 */
export async function markUserEmailVerifiedInDB(userId: string): Promise<boolean> {
  await ensureDatabaseSchema();
  const res = await pool.query(
    'UPDATE users SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Create a verification token for email verification
 */
export async function createVerificationTokenInDB(params: {
  userId: string;
  email: string;
  token: string;
  expiresInHours?: number;
  expiresAt?: Date;
}): Promise<{ token: string; expiresAt: Date }> {
  await ensureDatabaseSchema();
  const { userId, email, token, expiresInHours = 24, expiresAt: customExpiresAt } = params;
  const expiresAt = customExpiresAt || new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Delete any existing tokens for this user
  await pool.query('DELETE FROM verification_tokens WHERE user_id = $1', [userId]);

  await pool.query(
    `INSERT INTO verification_tokens (token, user_id, email, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [token, userId, email, expiresAt]
  );

  return { token, expiresAt };
}

/**
 * Find and validate a verification token
 */
export async function getVerificationTokenFromDB(token: string): Promise<{
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  isExpired: boolean;
} | null> {
  await ensureDatabaseSchema();
  const res = await pool.query(
    'SELECT token, user_id, email, expires_at FROM verification_tokens WHERE token = $1 LIMIT 1',
    [token]
  );

  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  const expiresAt = new Date(row.expires_at);
  const isExpired = expiresAt.getTime() < Date.now();

  return {
    token: row.token,
    userId: row.user_id,
    email: row.email,
    expiresAt,
    isExpired,
  };
}

/**
 * Delete a verification token after use
 */
export async function deleteVerificationTokenFromDB(token: string): Promise<boolean> {
  await ensureDatabaseSchema();
  const res = await pool.query('DELETE FROM verification_tokens WHERE token = $1', [token]);
  return (res.rowCount ?? 0) > 0;
}
