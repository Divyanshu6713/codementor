import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { config } from "@/server/config";
import type { Role } from "@/server/db/schema";

export const SESSION_COOKIE = "cmk_session";

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  /** Always read from the database — never from the client. */
  role: Role;
  /** A one-click guest account that hasn't been given a username and password yet. */
  isGuest: boolean;
}

export class AuthError extends Error {
  constructor(message: string, readonly status = 401) {
    super(message);
  }
}

let dummyHash: Promise<string> | undefined;
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
export const normalizeUsername = (u: string) => u.trim().toLowerCase();

const userColumns = { id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, role: schema.users.role, isGuest: schema.users.isGuest };

/** Stored instead of a password hash for guests: not a bcrypt hash, so no password can ever match. */
const NO_PASSWORD = "!guest-no-password";

const FRIENDLY = ["Curious", "Clever", "Bright", "Bold", "Brave", "Calm", "Keen", "Quick", "Sharp", "Steady"];

/**
 * A guest student account: no username to remember, no password, no personal data. The session
 * cookie is the only key to it. Guests skip the onboarding questions; `start` picks where they begin.
 */
export async function createGuestUser(start: "beginner" | "placement"): Promise<SessionUser> {
  const db = await getDb();
  const suffix = crypto.randomBytes(6).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "x");
  const displayName = `${FRIENDLY[crypto.randomInt(FRIENDLY.length)]} Coder ${crypto.randomInt(1000, 10000)}`;
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(schema.users)
      .values({ username: `guest_${suffix}`, displayName, passwordHash: NO_PASSWORD, role: "STUDENT", isGuest: true })
      .returning(userColumns);
    await tx.insert(schema.studentProfiles).values({
      userId: user.id, onboardedAt: new Date(),
      experience: start === "beginner" ? "none" : null,
      goal: start === "beginner" ? "learn_from_scratch" : null,
    });
    await tx.insert(schema.auditLog).values({ actorId: user.id, action: "account.guest_created", targetType: "user", targetId: user.id, details: { start } });
    return user;
  });
}

/** Turns a guest into a normal account with a username and password, keeping all progress. */
export async function claimGuestAccount(userId: string, input: { username: string; password: string; displayName: string }): Promise<SessionUser> {
  const db = await getDb();
  const username = normalizeUsername(input.username);
  const current = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
  if (!current?.isGuest) throw new AuthError("This account already has a username.", 409);
  const taken = await db.query.users.findFirst({ where: eq(schema.users.username, username) });
  if (taken) throw new AuthError("That username is taken. Try another one.", 409);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const [user] = await db.update(schema.users)
    .set({ username, passwordHash, displayName: input.displayName.trim(), isGuest: false })
    .where(and(eq(schema.users.id, userId), eq(schema.users.isGuest, true)))
    .returning(userColumns);
  if (!user) throw new AuthError("This account already has a username.", 409);
  await db.insert(schema.auditLog).values({ actorId: userId, action: "account.guest_claimed", targetType: "user", targetId: userId });
  return user;
}

export async function createUser(input: { username: string; displayName: string; password: string; role: "STUDENT" | "PARENT"; email?: string | null }): Promise<SessionUser> {
  const db = await getDb();
  const username = normalizeUsername(input.username);
  const existing = await db.query.users.findFirst({ where: eq(schema.users.username, username) });
  if (existing) throw new AuthError("That username is taken. Try another one.", 409);
  const passwordHash = await bcrypt.hash(input.password, 12);
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(schema.users)
      .values({ username, displayName: input.displayName.trim(), passwordHash, role: input.role, email: input.email?.trim().toLowerCase() || null })
      .returning(userColumns);
    if (input.role === "STUDENT") await tx.insert(schema.studentProfiles).values({ userId: user.id });
    else await tx.insert(schema.parentProfiles).values({ userId: user.id });
    await tx.insert(schema.auditLog).values({ actorId: user.id, action: "account.created", targetType: "user", targetId: user.id, details: { role: input.role } });
    return user;
  });
}

export async function verifyCredentials(usernameRaw: string, password: string): Promise<SessionUser> {
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(schema.users.username, normalizeUsername(usernameRaw)) });
  // Compare against a dummy hash when the user doesn't exist to keep timing similar.
  dummyHash ??= bcrypt.hash("codementor-timing-equaliser", 12);
  const usable = user && !user.isGuest;
  const ok = await bcrypt.compare(password, usable ? user.passwordHash : await dummyHash);
  if (!usable || !ok) throw new AuthError("Username or password is incorrect.");
  return { id: user.id, username: user.username, displayName: user.displayName, role: user.role, isGuest: false };
}

export async function createSession(userId: string, days = config.sessionDays): Promise<{ token: string; expiresAt: Date }> {
  const db = await getDb();
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 86_400_000);
  await db.insert(schema.authSessions).values({ id: hashToken(token), userId, expiresAt });
  await db.delete(schema.authSessions).where(and(eq(schema.authSessions.userId, userId), lt(schema.authSessions.expiresAt, new Date())));
  return { token, expiresAt };
}

export async function getUserBySessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;
  const db = await getDb();
  const rows = await db.select(userColumns)
    .from(schema.authSessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.authSessions.userId))
    .where(and(eq(schema.authSessions.id, hashToken(token)), gt(schema.authSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function deleteSession(token: string | undefined | null) {
  if (!token) return;
  const db = await getDb();
  await db.delete(schema.authSessions).where(eq(schema.authSessions.id, hashToken(token)));
}
