import { ResumeData, ResumeDocument } from '@/types/resume';
import { defaultResumeData, emptyResumeData } from '@/data/defaultResume';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Fetch all resumes directly from PostgreSQL via API
 */
export async function fetchResumesFromDB(): Promise<ResumeDocument[]> {
  const res = await fetch('/api/resumes', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Database returned status ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch a specific resume directly by ID
 */
export async function fetchResumeByIdFromDB(id: string): Promise<ResumeDocument | null> {
  const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Database returned status ${res.status}`);
  }

  return res.json();
}

/**
 * Create a new resume directly in PostgreSQL
 */
export async function createResumeInDB(options?: {
  title?: string;
  template?: 'sample' | 'blank';
  data?: ResumeData;
}): Promise<ResumeDocument> {
  const { title, template = 'sample', data } = options || {};

  let resumeContent: ResumeData;
  if (data) {
    resumeContent = deepClone(data);
  } else if (template === 'blank') {
    resumeContent = deepClone(emptyResumeData);
  } else {
    resumeContent = deepClone(defaultResumeData);
  }

  const defaultTitle =
    template === 'blank' ? 'Untitled Resume' : 'Software Engineer Resume';

  const newResume: ResumeDocument = {
    id: generateId(),
    title: (title && title.trim()) || defaultTitle,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: resumeContent,
  };

  const res = await fetch('/api/resumes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(newResume),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create resume in database (status ${res.status})`);
  }

  return res.json();
}

/**
 * Update an existing resume directly in PostgreSQL
 */
export async function updateResumeInDB(
  id: string,
  updates: { title?: string; data?: ResumeData }
): Promise<ResumeDocument> {
  // Fetch existing document to merge updates
  const existing = await fetchResumeByIdFromDB(id);
  if (!existing) {
    throw new Error(`Resume "${id}" does not exist in database`);
  }

  const updated: ResumeDocument = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    data: updates.data !== undefined ? deepClone(updates.data) : existing.data,
    updatedAt: Date.now(),
  };

  const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update resume in database (status ${res.status})`);
  }

  return res.json();
}

/**
 * Duplicate a resume directly in PostgreSQL
 */
export async function duplicateResumeInDB(id: string): Promise<ResumeDocument> {
  const original = await fetchResumeByIdFromDB(id);
  if (!original) {
    throw new Error(`Cannot duplicate: Resume "${id}" not found in database`);
  }

  const duplicateDoc: ResumeDocument = {
    id: generateId(),
    title: `${original.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: deepClone(original.data),
  };

  const res = await fetch('/api/resumes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(duplicateDoc),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save duplicated resume in database');
  }

  return res.json();
}

/**
 * Delete a resume directly from PostgreSQL
 */
export async function deleteResumeFromDB(id: string): Promise<boolean> {
  const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete resume from database (status ${res.status})`);
  }

  return true;
}

// Aliases for seamless compatibility
export const fetchResumesFromRustFS = fetchResumesFromDB;
export const fetchResumeByIdFromRustFS = fetchResumeByIdFromDB;
export const createResumeInRustFS = createResumeInDB;
export const updateResumeInRustFS = updateResumeInDB;
export const duplicateResumeInRustFS = duplicateResumeInDB;
export const deleteResumeFromRustFS = deleteResumeFromDB;

/**
 * Formats a timestamp into human-readable relative time (e.g. "5m ago", "Yesterday")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formats a timestamp into full date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
