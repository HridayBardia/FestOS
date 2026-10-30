import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL.trim();
  }
  return '';
};

const getEnvKey = () => {
  if (typeof process !== 'undefined') {
    return (process.env?.NEXT_PUBLIC_SUPABASE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  }
  return '';
};

export const getStoredCredentials = () => {
  let url = getEnvUrl();
  let key = getEnvKey();

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('festos_supabase_url');
    const localKey = localStorage.getItem('festos_supabase_key');
    if (localUrl && localUrl.trim().length > 0) url = localUrl.trim();
    if (localKey && localKey.trim().length > 0) key = localKey.trim();
  }

  return { url, key };
};

export const saveCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('festos_supabase_url', url.trim());
    localStorage.setItem('festos_supabase_key', key.trim());
    clientInstance = null; // Reset cached client
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredCredentials();
  return (
    typeof url === 'string' &&
    url.length > 0 &&
    !url.includes('your-project') &&
    !url.includes('placeholder') &&
    typeof key === 'string' &&
    key.length > 0 &&
    !key.includes('your-anon-key') &&
    !key.includes('placeholder')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredCredentials();
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return clientInstance;
};

export const supabase = isSupabaseConfigured()
  ? createClient(getStoredCredentials().url, getStoredCredentials().key)
  : (null as unknown as SupabaseClient);
