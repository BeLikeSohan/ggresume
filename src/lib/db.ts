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
        CREATE TABLE IF NOT EXISTS resumes (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes(updated_at DESC);

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
 * List all resumes stored in PostgreSQL
 */
export async function listResumesFromDB(): Promise<ResumeDocument[]> {
  await ensureDatabaseSchema();

  const res = await pool.query(
    'SELECT id, title, data, created_at, updated_at FROM resumes ORDER BY updated_at DESC'
  );

  const resumes: ResumeDocument[] = res.rows.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    data: row.data,
  }));

  // Automatically seed sample resume if the database is empty
  if (resumes.length === 0) {
    const initialSample: ResumeDocument = {
      id: 'sample-resume',
      title: 'Software Engineer Resume (Sample)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: defaultResumeData,
    };
    await saveResumeToDB('sample-resume', initialSample);
    resumes.push(initialSample);
  }

  return resumes;
}

/**
 * Retrieve a specific resume by ID from PostgreSQL
 */
export async function getResumeFromDB(id: string): Promise<ResumeDocument | null> {
  await ensureDatabaseSchema();

  const res = await pool.query(
    'SELECT id, title, data, created_at, updated_at FROM resumes WHERE id = $1',
    [id]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];
  return {
    id: row.id,
    title: row.title,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    data: row.data,
  };
}

/**
 * Insert or update (UPSERT) a resume document into PostgreSQL
 */
export async function saveResumeToDB(
  id: string,
  resume: ResumeDocument
): Promise<ResumeDocument> {
  await ensureDatabaseSchema();

  const now = Date.now();
  const createdAt = resume.createdAt || now;
  const updatedAt = now;
  const title = resume.title || 'Untitled Resume';
  const data = resume.data || defaultResumeData;

  const query = `
    INSERT INTO resumes (id, title, data, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      data = EXCLUDED.data,
      updated_at = EXCLUDED.updated_at
    RETURNING id, title, data, created_at, updated_at;
  `;

  const res = await pool.query(query, [
    id,
    title,
    JSON.stringify(data),
    createdAt,
    updatedAt,
  ]);

  const row = res.rows[0];
  return {
    id: row.id,
    title: row.title,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    data: row.data,
  };
}

/**
 * Delete a resume by ID from PostgreSQL
 */
export async function deleteResumeFromDB(id: string): Promise<boolean> {
  await ensureDatabaseSchema();

  const res = await pool.query('DELETE FROM resumes WHERE id = $1', [id]);
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

