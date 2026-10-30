import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from './db';

// Load environment variables (.env.local first, then .env)
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else {
  dotenv.config();
}

interface SeedReport {
  totalProcessed: number;
  accountsCreated: number;
  accountsUpdated: number;
  accountsSkipped: number;
  accountsDisabled: number;
  skippedMembers: Array<{ id: string; name: string; reason: string }>;
  disabledMembers: Array<{ id: string; name: string; role: string; reason: string }>;
  accountsSummary: Array<{ loginId: string; roleKey: string; isActive: boolean }>;
}

const ROLE_MAP: Record<string, string> = {
  'registration desk': 'registration',
  'hospitality': 'hospitality',
  'events team': 'events',
  'logistics head': 'logistics',
  'merchandise desk': 'merch',
  'food coordinator': 'food',
  'volunteer': 'volunteer',
  'festival director': 'director',
};

export async function seedUsers(): Promise<SeedReport> {
  const defaultPassword = process.env.DEFAULT_PASSWORD;
  if (!defaultPassword || defaultPassword.trim().length === 0) {
    throw new Error('DEFAULT_PASSWORD environment variable must be set in .env.local');
  }

  const isReset = process.argv.includes('--reset');
  console.log(`Seeding users from core_team table (idempotent mode, reset: ${isReset})...`);

  // Compute password hash once for initial default passwords
  const defaultHash = await bcrypt.hash(defaultPassword, 10);

  const coreRows = await db.query(
    'SELECT member_id, name, role, department, shift, phone FROM core_team ORDER BY member_id;'
  );

  const report: SeedReport = {
    totalProcessed: coreRows.rows.length,
    accountsCreated: 0,
    accountsUpdated: 0,
    accountsSkipped: 0,
    accountsDisabled: 0,
    skippedMembers: [],
    disabledMembers: [],
    accountsSummary: [],
  };

  const seenIds = new Set<string>();

  for (let idx = 0; idx < coreRows.rows.length; idx++) {
    const row = coreRows.rows[idx];
    const rawId = row.member_id ? String(row.member_id).trim() : '';
    const loginId = rawId.toUpperCase();
    const memberName = row.name ? String(row.name).trim() : 'Unknown';
    const rawRole = row.role ? String(row.role).trim() : '';

    // Validate Member ID
    if (!loginId || loginId.length === 0) {
      report.accountsSkipped++;
      report.skippedMembers.push({ id: '(blank)', name: memberName, reason: 'Blank member ID' });
      await db.query(
        `INSERT INTO import_issues (
          id, file, row_number, field, severity, issue_type, description, suggested_action, raw_value, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          `ISSUE-USR-${Date.now()}-${idx}`,
          'core_team.csv',
          idx + 1,
          'member_id',
          'CRITICAL',
          'BLANK_MEMBER_ID',
          `Core team member at row ${idx + 1} has blank member ID`,
          'Skip account creation until member ID is provided',
          rawId || null,
          'open'
        ]
      );
      continue;
    }

    if (seenIds.has(loginId)) {
      report.accountsSkipped++;
      report.skippedMembers.push({ id: loginId, name: memberName, reason: 'Duplicate member ID' });
      await db.query(
        `INSERT INTO import_issues (
          id, file, row_number, field, severity, issue_type, description, suggested_action, raw_value, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          `ISSUE-USR-${Date.now()}-${idx}`,
          'core_team.csv',
          idx + 1,
          'member_id',
          'CRITICAL',
          'DUPLICATE_MEMBER_ID',
          `Duplicate core team member ID encountered: ${loginId}`,
          'Skip duplicate record and verify source roster',
          loginId,
          'open'
        ]
      );
      continue;
    }

    if (!/^ST\d{2,}$/.test(loginId)) {
      report.accountsSkipped++;
      report.skippedMembers.push({ id: loginId, name: memberName, reason: 'Malformed member ID pattern' });
      await db.query(
        `INSERT INTO import_issues (
          id, file, row_number, field, severity, issue_type, description, suggested_action, raw_value, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          `ISSUE-USR-${Date.now()}-${idx}`,
          'core_team.csv',
          idx + 1,
          'member_id',
          'CRITICAL',
          'MALFORMED_MEMBER_ID',
          `Malformed core team member ID format: ${loginId}`,
          'Skip account creation and correct ID format',
          rawId,
          'open'
        ]
      );
      continue;
    }

    seenIds.add(loginId);

    // Validate Role
    const mappedRole = ROLE_MAP[rawRole.toLowerCase()];
    let roleKey = mappedRole || '';
    let isActive = true;

    if (!mappedRole) {
      isActive = false;
      roleKey = 'disabled';
      report.accountsDisabled++;
      report.disabledMembers.push({
        id: loginId,
        name: memberName,
        role: rawRole,
        reason: 'Unrecognized or blank role'
      });
      await db.query(
        `INSERT INTO import_issues (
          id, file, row_number, field, severity, issue_type, description, suggested_action, raw_value, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          `ISSUE-USR-${Date.now()}-${idx}`,
          'core_team.csv',
          idx + 1,
          'role',
          'ERROR',
          'UNRECOGNIZED_ROLE',
          `Member ${loginId} (${memberName}) has unrecognized role: "${rawRole}"`,
          'Account created as disabled without assigned permissions',
          rawRole || null,
          'open'
        ]
      );
    }

    // Check existing record
    const existing = await db.query(
      'SELECT id, login_id, password_hash, must_change_password FROM app_users WHERE login_id = $1;',
      [loginId]
    );

    const userId = `USR-${loginId}`;

    if (existing.rows.length === 0) {
      // Create new account
      await db.query(
        `INSERT INTO app_users (
          id, login_id, core_team_id, role_key, password_hash, is_active, must_change_password
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [userId, loginId, loginId, roleKey, defaultHash, isActive, true]
      );
      report.accountsCreated++;
    } else {
      // Existing account: preserve custom password unless --reset is passed
      if (isReset) {
        await db.query(
          `UPDATE app_users
           SET core_team_id = $1, role_key = $2, password_hash = $3, is_active = $4, must_change_password = true
           WHERE login_id = $5;`,
          [loginId, roleKey, defaultHash, isActive, loginId]
        );
      } else {
        await db.query(
          `UPDATE app_users
           SET core_team_id = $1, role_key = $2, is_active = $3
           WHERE login_id = $4;`,
          [loginId, roleKey, isActive, loginId]
        );
      }
      report.accountsUpdated++;
    }

    report.accountsSummary.push({ loginId, roleKey, isActive });
  }

  return report;
}

if (require.main === module) {
  seedUsers()
    .then((report) => {
      console.log('Seed users completed:');
      console.log(`- Total Processed: ${report.totalProcessed}`);
      console.log(`- Accounts Created: ${report.accountsCreated}`);
      console.log(`- Accounts Updated: ${report.accountsUpdated}`);
      console.log(`- Accounts Skipped: ${report.accountsSkipped}`);
      console.log(`- Accounts Disabled: ${report.accountsDisabled}`);
      return db.close();
    })
    .catch((err) => {
      console.error('Seed users failed:', err);
      process.exit(1);
    });
}
