/**
 * Account recovery without email.
 *
 * - Every account with a password gets a one-time **recovery code** (shown once, stored as a
 *   sha256 hash). Username + recovery code lets the owner choose a new password; the code is then
 *   replaced by a fresh one.
 * - An admin, or a parent linked to a student, can issue a one-time **reset link** (24 h).
 * - Signed-in users can change their password and generate a new recovery code.
 *
 * Every successful reset signs the account out everywhere and is written to the audit log.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull, ne } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { AuthError, normalizeUsername, type SessionUser } from "./auth";
import { assertParentOf } from "@/server/services/parents";

type Db = Awaited<ReturnType<typeof getDb>>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Crockford base32 without I, L, O and U: easy to read aloud and copy by hand. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const RESET_LINK_HOURS = 24;

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

/** Upper-cases and drops spaces/dashes, and maps easily-confused letters (O→0, I/L→1). */
export function normalizeRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
}

/** 16 symbols × 5 bits = 80 bits of randomness, shown as XXXX-XXXX-XXXX-XXXX. */
export function generateRecoveryCode(): string {
  const bytes = crypto.randomBytes(16);
  let out = "";
  for (let i = 0; i < 16; i++) out += ALPHABET[bytes[i] & 31];
  return out.match(/.{4}/g)!.join("-");
}

const hashCode = (code: string) => sha256(`recovery:${normalizeRecoveryCode(code)}`);

/** Gives the account a new recovery code (replacing any old one) and returns it — show it once. */
export async function issueRecoveryCode(userId: string, tx?: Tx): Promise<string> {
  const db = tx ?? (await getDb());
  const code = generateRecoveryCode();
  await db.update(schema.users).set({ recoveryCodeHash: hashCode(code) }).where(eq(schema.users.id, userId));
  return code;
}

function validPassword(password: string) {
  if (password.length < 8 || password.length > 128) throw new AuthError("Choose a password with at least 8 characters.", 400);
}

const userColumns = { id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, role: schema.users.role, isGuest: schema.users.isGuest };

/** Sets the password, signs out every session and rotates the recovery code. Returns the new code. */
async function setPassword(tx: Tx, userId: string, password: string): Promise<string> {
  const passwordHash = await bcrypt.hash(password, 12);
  await tx.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, userId));
  await tx.delete(schema.authSessions).where(eq(schema.authSessions.userId, userId));
  return issueRecoveryCode(userId, tx);
}

const GENERIC = "That username and recovery code don't match.";

/** Username + recovery code → new password. Same error for every failure so nothing leaks. */
export async function resetWithRecoveryCode(usernameRaw: string, code: string, password: string): Promise<{ user: SessionUser; recoveryCode: string }> {
  validPassword(password);
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(schema.users.username, normalizeUsername(usernameRaw)) });
  const expected = user?.recoveryCodeHash ?? sha256("no-code-for-this-account");
  const given = hashCode(code);
  const match = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
  if (!user || user.isGuest || !user.recoveryCodeHash || !match) throw new AuthError(GENERIC);
  return db.transaction(async (tx) => {
    // The update only succeeds if the code is still the one we checked (no double use).
    const [still] = await tx.update(schema.users).set({ recoveryCodeHash: null })
      .where(and(eq(schema.users.id, user.id), eq(schema.users.recoveryCodeHash, given))).returning({ id: schema.users.id });
    if (!still) throw new AuthError(GENERIC);
    const recoveryCode = await setPassword(tx, user.id, password);
    await tx.insert(schema.auditLog).values({ actorId: user.id, action: "account.password_reset", targetType: "user", targetId: user.id, details: { method: "recovery_code" } });
    return { user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role, isGuest: false }, recoveryCode };
  });
}

/**
 * A one-time reset link for another account. Admins may issue one for any non-guest account;
 * parents only for a student they are linked to.
 */
export async function createResetLink(actor: SessionUser, target: { userId?: string; username?: string }): Promise<{ token: string; username: string; expiresAt: Date }> {
  const db = await getDb();
  const user = target.userId
    ? await db.query.users.findFirst({ where: eq(schema.users.id, target.userId) })
    : await db.query.users.findFirst({ where: eq(schema.users.username, normalizeUsername(target.username ?? "")) });
  if (!user || user.isGuest) throw new AuthError("No account with that username.", 404);
  if (actor.role === "PARENT") {
    if (user.role !== "STUDENT") throw new AuthError("No account with that username.", 404);
    await assertParentOf(actor.id, user.id);
  } else if (actor.role !== "ADMIN") {
    throw new AuthError("You can't reset other people's passwords.", 403);
  }
  if (user.id === actor.id) throw new AuthError("Use Settings → Change password for your own account.", 400);
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_LINK_HOURS * 3_600_000);
  await db.transaction(async (tx) => {
    // Only the newest link works.
    await tx.delete(schema.passwordResets).where(eq(schema.passwordResets.userId, user.id));
    await tx.insert(schema.passwordResets).values({ tokenHash: sha256(token), userId: user.id, createdBy: actor.id, expiresAt });
    await tx.insert(schema.auditLog).values({ actorId: actor.id, action: "account.reset_link_created", targetType: "user", targetId: user.id, details: { by: actor.role } });
  });
  return { token, username: user.username, expiresAt };
}

/** Looks up a reset link without using it (to show "for account X" on the reset page). */
export async function peekResetLink(token: string): Promise<{ username: string; displayName: string } | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const db = await getDb();
  const rows = await db.select({ username: schema.users.username, displayName: schema.users.displayName })
    .from(schema.passwordResets).innerJoin(schema.users, eq(schema.users.id, schema.passwordResets.userId))
    .where(and(eq(schema.passwordResets.tokenHash, sha256(token)), isNull(schema.passwordResets.usedAt), gt(schema.passwordResets.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function resetWithLink(token: string, password: string): Promise<{ user: SessionUser; recoveryCode: string }> {
  validPassword(password);
  const db = await getDb();
  return db.transaction(async (tx) => {
    const [link] = await tx.update(schema.passwordResets).set({ usedAt: new Date() })
      .where(and(eq(schema.passwordResets.tokenHash, sha256(token)), isNull(schema.passwordResets.usedAt), gt(schema.passwordResets.expiresAt, new Date())))
      .returning({ userId: schema.passwordResets.userId });
    if (!link) throw new AuthError("This reset link has expired or was already used. Ask for a new one.", 410);
    const [user] = await tx.select(userColumns).from(schema.users).where(eq(schema.users.id, link.userId));
    const recoveryCode = await setPassword(tx, user.id, password);
    await tx.insert(schema.auditLog).values({ actorId: user.id, action: "account.password_reset", targetType: "user", targetId: user.id, details: { method: "reset_link" } });
    return { user, recoveryCode };
  });
}

async function checkPassword(userId: string, password: string) {
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
  if (!user || user.isGuest || !(await bcrypt.compare(password, user.passwordHash))) throw new AuthError("Your current password isn't right.", 403);
  return user;
}

/** Change password while signed in: other sessions are signed out, this one stays. */
export async function changePassword(userId: string, current: string, next: string, keepSessionHash: string | null) {
  validPassword(next);
  await checkPassword(userId, current);
  const db = await getDb();
  const passwordHash = await bcrypt.hash(next, 12);
  await db.transaction(async (tx) => {
    await tx.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, userId));
    await tx.delete(schema.authSessions).where(keepSessionHash
      ? and(eq(schema.authSessions.userId, userId), ne(schema.authSessions.id, keepSessionHash))
      : eq(schema.authSessions.userId, userId));
    await tx.insert(schema.auditLog).values({ actorId: userId, action: "account.password_changed", targetType: "user", targetId: userId });
  });
}

/** A new recovery code for a signed-in user (needs the current password). */
export async function regenerateRecoveryCode(userId: string, password: string): Promise<string> {
  await checkPassword(userId, password);
  const code = await issueRecoveryCode(userId);
  const db = await getDb();
  await db.insert(schema.auditLog).values({ actorId: userId, action: "account.recovery_code_regenerated", targetType: "user", targetId: userId });
  return code;
}

export async function hasRecoveryCode(userId: string): Promise<boolean> {
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId), columns: { recoveryCodeHash: true } });
  return Boolean(user?.recoveryCodeHash);
}

export const sessionHash = sha256;
