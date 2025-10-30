/**
 * Supabase Client Configuration for FanzDash
 *
 * Provides both client and server-side Supabase instances
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { dbLogger } from '../utils/logger';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate configuration
function validateConfig(): void {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    dbLogger.warn('Supabase not configured - using fallback database');
  }
}

validateConfig();

/**
 * Public client (for client-side operations)
 * Uses anon key with Row Level Security
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side, don't persist
      detectSessionInUrl: false
    }
  }
);

/**
 * Admin client (for server-side operations)
 * Uses service role key - bypasses Row Level Security
 * CAUTION: Only use for trusted server-side operations
 */
export const supabaseAdmin: SupabaseClient = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if no service key

/**
 * Create a Supabase client with a specific user's JWT token
 * Useful for operations on behalf of a user
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Database helper functions
 */

/**
 * Execute a query with error logging
 */
export async function executeQuery<T>(
  queryName: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T | null> {
  const startTime = Date.now();

  try {
    const { data, error } = await queryFn();

    const duration = Date.now() - startTime;

    if (error) {
      dbLogger.database(queryName, 'unknown', duration, error);
      throw error;
    }

    dbLogger.database(queryName, 'unknown', duration);
    return data;
  } catch (error) {
    dbLogger.error(`Query ${queryName} failed`, error as Error);
    throw error;
  }
}

/**
 * Storage helper functions
 */

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) {
      dbLogger.error(`File upload failed: ${bucket}/${path}`, error);
      return null;
    }

    dbLogger.info('File uploaded', { bucket, path });

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (error) {
    dbLogger.error('File upload error', error as Error);
    return null;
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      dbLogger.error(`File deletion failed: ${bucket}/${path}`, error);
      return false;
    }

    dbLogger.info('File deleted', { bucket, path });
    return true;
  } catch (error) {
    dbLogger.error('File deletion error', error as Error);
    return false;
  }
}

/**
 * Get signed URL for private files
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error || !data) {
      dbLogger.error(`Signed URL creation failed: ${bucket}/${path}`, error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    dbLogger.error('Signed URL error', error as Error);
    return null;
  }
}

/**
 * Realtime subscription helper
 */
export function subscribeToTable<T>(
  table: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T;
    old: T;
  }) => void,
  filter?: string
) {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter && { filter })
      },
      callback
    )
    .subscribe();

  dbLogger.info('Realtime subscription created', { table, filter });

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
    dbLogger.info('Realtime subscription removed', { table });
  };
}

/**
 * Authentication helpers
 */

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) {
    dbLogger.error('Sign up failed', error);
    throw error;
  }

  dbLogger.info('User signed up', { userId: data.user?.id });
  return data;
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    dbLogger.error('Sign in failed', error);
    throw error;
  }

  dbLogger.info('User signed in', { userId: data.user?.id });
  return data;
}

/**
 * Sign out user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    dbLogger.error('Sign out failed', error);
    throw error;
  }

  dbLogger.info('User signed out');
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    dbLogger.error('Get user failed', error);
    return null;
  }

  return user;
}

/**
 * Database query builders with type safety
 */

// Example typed query helpers
export const db = {
  users: () => supabaseAdmin.from('users'),
  posts: () => supabaseAdmin.from('posts'),
  comments: () => supabaseAdmin.from('comments'),
  subscriptions: () => supabaseAdmin.from('subscriptions'),
  transactions: () => supabaseAdmin.from('transactions'),
  liveStreams: () => supabaseAdmin.from('live_streams'),
  notifications: () => supabaseAdmin.from('notifications'),
  // Add more as needed
};

/**
 * Health check function
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    dbLogger.error('Supabase health check failed', error as Error);
    return false;
  }
}

// Export default client
export default supabase;
