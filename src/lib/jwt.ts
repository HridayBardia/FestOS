// FestOS Edge-Safe JWT Utilities
// Pure jose implementation compatible with Next.js edge runtime and Node.js
// Zero em dashes or en dashes in any copy or comments

import { jwtVerify, SignJWT } from 'jose';
import { RoleKey } from '@/config/roles';

export interface SessionPayload {
  memberId: string;
  name: string;
  role: RoleKey;
  shift: string;
}

export const SESSION_COOKIE_NAME = 'festos_session';
const DEFAULT_SECRET = 'festos_super_secure_auth_secret_minimum_32_characters_key_2026';

export function getJwtSecret(): Uint8Array {
  const secretStr =
    process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32
      ? process.env.AUTH_SECRET
      : DEFAULT_SECRET;
  return new TextEncoder().encode(secretStr);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({
    memberId: payload.memberId,
    name: payload.name,
    role: payload.role,
    shift: payload.shift,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10h')
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    if (!payload.memberId || !payload.role) {
      return null;
    }
    return {
      memberId: String(payload.memberId),
      name: String(payload.name || ''),
      role: payload.role as RoleKey,
      shift: String(payload.shift || ''),
    };
  } catch (err) {
    return null;
  }
}

