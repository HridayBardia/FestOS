import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';

// Load .env.local first, fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

interface QueryResult {
  rows: any[];
  rowCount: number;
}

class DatabaseClient {
  private pool: Pool | null = null;
  private pglite: PGlite | null = null;
  public isPGlite: boolean = false;

  private async getClient() {
    if (this.pool || this.pglite) return;

    if (process.env.DATABASE_URL) {
      console.log('Connecting via pg.Pool with DATABASE_URL...');
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      });
      this.isPGlite = false;
    } else {
      const dataDir = path.resolve(process.cwd(), 'data', 'pg_data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.pglite = new PGlite(dataDir);
      this.isPGlite = true;
    }
  }

  public async exec(text: string): Promise<void> {
    await this.getClient();
    if (this.pool) {
      await this.pool.query(text);
    } else if (this.pglite) {
      await this.pglite.exec(text);
    }
  }

  public async query(text: string, params?: any[]): Promise<QueryResult> {
    await this.getClient();

    if (this.pool) {
      const res = await this.pool.query(text, params);
      return {
        rows: res.rows,
        rowCount: res.rowCount ?? res.rows.length
      };
    } else if (this.pglite) {
      const res = await this.pglite.query(text, params);
      return {
        rows: res.rows,
        rowCount: (res as any).affectedRows !== undefined ? (res as any).affectedRows : res.rows.length
      };
    }
    throw new Error('Database not initialized');
  }

  public async transaction<T>(callback: (client: { query: (text: string, params?: any[]) => Promise<QueryResult> }) => Promise<T>): Promise<T> {
    await this.getClient();

    if (this.pool) {
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
    } else if (this.pglite) {
      await this.pglite.query('BEGIN');
      try {
        const res = await callback({
          query: async (text: string, params?: any[]) => {
            const r = await this.pglite!.query(text, params);
            return { rows: r.rows, rowCount: (r as any).affectedRows !== undefined ? (r as any).affectedRows : r.rows.length };
          }
        });
        await this.pglite.query('COMMIT');
        return res;
      } catch (e) {
        await this.pglite.query('ROLLBACK');
        throw e;
      }
    }
    throw new Error('Database not initialized');
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    if (this.pglite) {
      await this.pglite.close();
      this.pglite = null;
    }
  }
}

export const db = new DatabaseClient();
