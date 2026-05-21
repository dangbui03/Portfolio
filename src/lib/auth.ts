import { db, users, authTokens } from "@/db";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "maimai_session";
const SESSION_EXPIRY_MS = 10 * 24 * 60 * 60 * 1000; // Exactly 10 days in milliseconds

export interface SessionData {
  token: string;
  userId: string;
  expiresAt: number;
}

/**
 * Creates a new secure session token, stores it in SQLite, and returns the token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;

  // Insert session token into database
  await db.insert(authTokens).values({
    id: crypto.randomUUID(),
    userId,
    token,
    expiresAt,
  });

  return token;
}

/**
 * Validates a session token string against the SQLite database and returns the User if valid and not expired.
 */
export async function validateSession(token: string) {
  const now = Date.now();

  // Find active session in database that hasn't expired yet
  const sessionResult = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.token, token), gt(authTokens.expiresAt, now)))
    .limit(1);

  if (sessionResult.length === 0) return null;

  const session = sessionResult[0];

  // Fetch corresponding user
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (userResult.length === 0) return null;

  return userResult[0];
}

/**
 * Deletes a session token from the database.
 */
export async function destroySession(token: string): Promise<void> {
  await db.delete(authTokens).where(eq(authTokens.token, token));
}

/**
 * Helper to get the session token from Next.js request headers/cookies.
 */
export function getSessionTokenFromCookies(cookieStore: any): string | null {
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie ? cookie.value : null;
}

/**
 * Helper options for setting cookies in Next.js response headers.
 */
export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    maxAge: 10 * 24 * 60 * 60, // 10 days in seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
