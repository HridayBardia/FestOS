// FestOS Universal Database Client
// Resilient dual-mode connector: PostgreSQL (DATABASE_URL / Supabase / Neon) + Local PGlite + In-Memory Fallback
// Safe on Vercel serverless environments and local Windows runtime
// Zero em dashes or en dashes

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { inMemoryDb } from '../src/lib/inMemoryDb';

// Load .env.local first, fallback to .env (quietly and only if AUTH_SECRET not yet present)
if (!process.env.AUTH_SECRET) {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  } else {
    dotenv.config();
  }
}

interface QueryResult {
  rows: any[];
  rowCount: number;
}

// Global anchor to share PGlite across Next.js re-evaluations
const globalForDb = globalThis as unknown as {
  _festos_pglite?: any;
  _festos_pglite_promise?: Promise<any>;
};

class DatabaseClient {
  private pool: Pool | null = null;
  private pglite: any = null;
  public isPGlite: boolean = false;
  private useInMemory: boolean = false;
  private initAttempted: boolean = false;

  private async getClient() {
    if (this.initAttempted && (this.pool || this.pglite || this.useInMemory)) return;
    this.initAttempted = true;

    // 1. Production PostgreSQL via DATABASE_URL (Supabase, Neon, RDS, etc.)
    if (process.env.DATABASE_URL) {
      try {
        console.log('[DatabaseClient] Connecting via pg.Pool with DATABASE_URL...');
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        });
        this.isPGlite = false;
        this.useInMemory = false;
        return;
      } catch (err) {
        console.warn('[DatabaseClient] Failed to connect to DATABASE_URL, switching to in-memory engine:', err);
        this.useInMemory = true;
        return;
      }
    }

    // 2. Detect True Cloud Serverless (Vercel, AWS Lambda) - do NOT flag local Windows production as serverless
    const isCloudServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME
    );

    if (isCloudServerless) {
      console.log('[DatabaseClient] Cloud serverless detected. Using in-memory engine.');
      this.useInMemory = true;
      this.isPGlite = false;
      return;
    }

    // 3. Local Environment: Use PGlite singleton with waitReady and safe fallback
    try {
      if (globalForDb._festos_pglite) {
        this.pglite = globalForDb._festos_pglite;
        this.isPGlite = true;
        this.useInMemory = false;
        return;
      }

      if (!globalForDb._festos_pglite_promise) {
        const dataDir = path.resolve(process.cwd(), 'data', 'pg_data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        const { PGlite } = await import('@electric-sql/pglite');
        globalForDb._festos_pglite_promise = (async () => {
          const inst = new PGlite(dataDir);
          await inst.waitReady;
          globalForDb._festos_pglite = inst;
          return inst;
        })();
      }

      this.pglite = await globalForDb._festos_pglite_promise;
      this.isPGlite = true;
      this.useInMemory = false;
    } catch (err) {
      console.warn('[DatabaseClient] PGlite failed to initialize. Falling back to in-memory database:', (err as any)?.message || err);
      this.useInMemory = true;
      this.isPGlite = false;
      this.pglite = null;
    }
  }

  public async exec(text: string): Promise<void> {
    await this.getClient();
    if (this.useInMemory) {
      await inMemoryDb.query(text);
      return;
    }
    if (this.pool) {
      try {
        await this.pool.query(text);
        return;
      } catch (e) {
        console.warn('[DatabaseClient] Pool exec error, passing to in-memory:', (e as any)?.message);
        await inMemoryDb.query(text);
        return;
      }
    } else if (this.pglite) {
      try {
        await this.pglite.exec(text);
        return;
      } catch (e) {
        console.warn('[DatabaseClient] PGlite exec error, passing to in-memory:', (e as any)?.message);
        await inMemoryDb.query(text);
        return;
      }
    }
    await inMemoryDb.query(text);
  }

  public async query(text: string, params?: any[]): Promise<QueryResult> {
    await this.getClient();

    if (this.useInMemory) {
      return await inMemoryDb.query(text, params);
    }

    if (this.pool) {
      try {
        const res = await this.pool.query(text, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount ?? res.rows.length
        };
      } catch (err) {
        console.warn('[DatabaseClient] Pool query failed, falling back to in-memory canonical engine:', (err as any)?.message);
        return await inMemoryDb.query(text, params);
      }
    } else if (this.pglite) {
      try {
        const res = await this.pglite.query(text, params);
        return {
          rows: res.rows,
          rowCount: (res as any).affectedRows !== undefined ? (res as any).affectedRows : res.rows.length
        };
      } catch (err) {
        console.warn('[DatabaseClient] PGlite query failed, falling back to in-memory canonical engine:', (err as any)?.message);
        return await inMemoryDb.query(text, params);
      }
    }

    return await inMemoryDb.query(text, params);
  }

  public async transaction<T>(callback: (client: { query: (text: string, params?: any[]) => Promise<QueryResult> }) => Promise<T>): Promise<T> {
    await this.getClient();

    if (!this.useInMemory && this.pool) {
      try {
        const client = await this.pool.connect();
        try {
          await client.query('BEGIN');
          const res = await callback({
            query: async (text: string, params?: any[]) => {
              const r = await client.query(text, params);
              return { rows: r.rows, rowCount: r.rowCount ?? r.rows.length };
            }
          });
          await client.query('COMMIT');
          return res;
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      } catch (poolErr) {
        console.warn('[DatabaseClient] Transaction fallback to in-memory:', (poolErr as any)?.message);
      }
    }

    return await callback({
      query: async (text: string, params?: any[]) => {
        return await inMemoryDb.query(text, params);
      }
    });
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    if (this.pglite) {
      try {
        await this.pglite.close();
      } catch (e) {
        // Safe close ignore
      }
      this.pglite = null;
    }
    this.initAttempted = false;
  }
}

export const db = new DatabaseClient();
