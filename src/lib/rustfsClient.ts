import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { ResumeDocument } from '@/types/resume';
import { defaultResumeData } from '@/data/defaultResume';

const RUSTFS_ENDPOINT =
  process.env.RUSTFS_ENDPOINT ||
  process.env.RUSTFS_URL ||
  (process.env.NODE_ENV === 'production' ? 'http://rustfs:9000' : 'http://localhost:9000');

const RUSTFS_ACCESS_KEY =
  process.env.RUSTFS_ACCESS_KEY || process.env.RUSTFS_ROOT_USER || 'rustfsadmin';
const RUSTFS_SECRET_KEY =
  process.env.RUSTFS_SECRET_KEY || process.env.RUSTFS_ROOT_PASSWORD || 'rustfsadmin';
const RUSTFS_REGION = process.env.RUSTFS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.RUSTFS_BUCKET || 'resumes';

// S3-compatible client for RustFS
export const rustfsClient = new S3Client({
  endpoint: RUSTFS_ENDPOINT,
  region: RUSTFS_REGION,
  credentials: {
    accessKeyId: RUSTFS_ACCESS_KEY,
    secretAccessKey: RUSTFS_SECRET_KEY,
  },
  forcePathStyle: true,
});

let bucketEnsured = false;

export async function ensureBucket() {
  if (bucketEnsured) return;
  try {
    await rustfsClient.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    bucketEnsured = true;
  } catch (err: any) {
    try {
      await rustfsClient.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      bucketEnsured = true;
    } catch (createErr) {
      console.warn('Could not ensure RustFS bucket:', createErr);
    }
  }
}

/**
 * List all resume JSON documents directly stored in RustFS
 */
export async function listResumesFromRustFS(): Promise<ResumeDocument[]> {
  await ensureBucket();

  const listRes = await rustfsClient.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    })
  );

  const contents = listRes.Contents || [];
  const resumes: ResumeDocument[] = [];

  for (const item of contents) {
    if (item.Key && item.Key.endsWith('.json')) {
      try {
        const getRes = await rustfsClient.send(
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: item.Key,
          })
        );

        const str = await getRes.Body?.transformToString();
        if (str) {
          const parsed = JSON.parse(str);
          resumes.push(parsed);
        }
      } catch (e) {
        console.warn(`Failed to read resume ${item.Key} from RustFS:`, e);
      }
    }
  }

  // If RustFS has 0 resumes, automatically seed initial sample resume JSON
  if (resumes.length === 0) {
    const initialSample: ResumeDocument = {
      id: 'sample-resume',
      title: 'Software Engineer Resume (Sample)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: defaultResumeData,
    };
    await saveResumeToRustFSStorage('sample-resume', initialSample);
    resumes.push(initialSample);
  }

  // Sort by updatedAt descending
  resumes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return resumes;
}

/**
 * Get a specific resume JSON by ID directly from RustFS
 */
export async function getResumeFromRustFS(id: string): Promise<ResumeDocument | null> {
  await ensureBucket();
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');

  try {
    const res = await rustfsClient.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${safeId}.json`,
      })
    );

    const str = await res.Body?.transformToString();
    if (!str) return null;
    return JSON.parse(str);
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Save a resume document directly as a JSON file in RustFS
 */
export async function saveResumeToRustFSStorage(
  id: string,
  resume: ResumeDocument
): Promise<ResumeDocument> {
  await ensureBucket();
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');

  const payload: ResumeDocument = {
    ...resume,
    id: safeId,
    updatedAt: Date.now(),
  };

  await rustfsClient.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${safeId}.json`,
      Body: JSON.stringify(payload, null, 2),
      ContentType: 'application/json',
    })
  );

  return payload;
}

/**
 * Delete a resume JSON document directly from RustFS
 */
export async function deleteResumeFromRustFSStorage(id: string): Promise<boolean> {
  await ensureBucket();
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');

  await rustfsClient.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${safeId}.json`,
    })
  );

  return true;
}
