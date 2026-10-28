/**
 * Account recovery without email: recovery codes, reset links (admin / linked parent), password
 * changes. Every reset rotates the recovery code and signs the account out everywhere.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { schema, type DB } from "@/server/db/client";
import { createSession, createUser, getUserBySessionToken, verifyCredentials, type SessionUser } from "@/server/auth/auth";
import {
  changePassword, createResetLink, generateRecoveryCode, hasRecoveryCode, issueRecoveryCode, normalizeRecoveryCode,
  peekResetLink, regenerateRecoveryCode, resetWithLink, resetWithRecoveryCode, sessionHash,
} from "@/server/auth/recovery";
import { createLinkCode, linkWithCode } from "@/server/services/parents";
import { exportData } from "@/server/services/privacy";
import { freshDb } from "./helpers";

let db: DB;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await freshDb());
});
afterAll(async () => close());

let n = 0;
const make = (role: "STUDENT" | "PARENT" = "STUDENT") =>
  createUser({ username: `rec${++n}_${role.toLowerCase()}`, displayName: `User ${n}`, password: "first-password", role });

async function makeAdmin(): Promise<SessionUser> {
  const u = await make();
  await db.update(schema.users).set({ role: "ADMIN" }).where(eq(schema.users.id, u.id));
  return { ...u, role: "ADMIN" };
}

describe("recovery codes", () => {
  it("look like XXXX-XXXX-XXXX-XXXX and normalise forgivingly", () => {
    const code = generateRecoveryCode();
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/);
    expect(normalizeRecoveryCode(" ab-cd o1 il ")).toBe("ABCD0111");
    expect(new Set(Array.from({ length: 50 }, generateRecoveryCode)).size).toBe(50);
  });

  it("reset the password once, rotate the code and sign out every session", async () => {
    const u = await make();
    const code = await issueRecoveryCode(u.id);
    const { token } = await createSession(u.id);
    expect(await getUserBySessionToken(token)).not.toBeNull();

    const typed = code.toLowerCase().replace(/-/g, " ");
    const { recoveryCode } = await resetWithRecoveryCode(u.username.toUpperCase(), typed, "second-password");
    expect(recoveryCode).not.toBe(code);
    await expect(verifyCredentials(u.username, "second-password")).resolves.toMatchObject({ id: u.id });
    await expect(verifyCredentials(u.username, "first-password")).rejects.toThrow();
    expect(await getUserBySessionToken(token)).toBeNull();

    // The old code is spent; the new one works.
    await expect(resetWithRecoveryCode(u.username, code, "third-password")).rejects.toThrow(/don't match/);
    await resetWithRecoveryCode(u.username, recoveryCode, "third-password");
    await expect(verifyCredentials(u.username, "third-password")).resolves.toBeTruthy();

    const audit = await db.select().from(schema.auditLog).where(eq(schema.auditLog.targetId, u.id));
    expect(audit.filter((a) => a.action === "account.password_reset")).toHaveLength(2);
  });

  it("give the same error for unknown users, wrong codes, accounts without a code and guests", async () => {
    const u = await make();
    await issueRecoveryCode(u.id);
    const noCode = await make();
    const msg = /That username and recovery code don't match/;
    await expect(resetWithRecoveryCode("nobody-here", generateRecoveryCode(), "whatever-123")).rejects.toThrow(msg);
    await expect(resetWithRecoveryCode(u.username, generateRecoveryCode(), "whatever-123")).rejects.toThrow(msg);
    await expect(resetWithRecoveryCode(noCode.username, generateRecoveryCode(), "whatever-123")).rejects.toThrow(msg);
    await expect(resetWithRecoveryCode(u.username, generateRecoveryCode(), "short")).rejects.toThrow(/at least 8/);
  });

  it("can be regenerated with the current password, which invalidates the old one", async () => {
    const u = await make();
    expect(await hasRecoveryCode(u.id)).toBe(false);
    await expect(regenerateRecoveryCode(u.id, "wrong-password")).rejects.toThrow(/current password/);
    const a = await regenerateRecoveryCode(u.id, "first-password");
    const b = await regenerateRecoveryCode(u.id, "first-password");
    expect(await hasRecoveryCode(u.id)).toBe(true);
    await expect(resetWithRecoveryCode(u.username, a, "new-password-1")).rejects.toThrow();
    await resetWithRecoveryCode(u.username, b, "new-password-1");
  });

  it("are never included in a data export", async () => {
    const u = await make();
    await issueRecoveryCode(u.id);
    const data = JSON.stringify(await exportData(u.id));
    expect(data).not.toMatch(/recoveryCodeHash|passwordHash/);
  });
});

describe("reset links", () => {
  it("admins can create one for any account; it works once and signs out other sessions", async () => {
    const admin = await makeAdmin();
    const u = await make();
    const { token: session } = await createSession(u.id);
    const link = await createResetLink(admin, { username: u.username });
    expect(await peekResetLink(link.token)).toMatchObject({ username: u.username });

    const { user, recoveryCode } = await resetWithLink(link.token, "linked-password");
    expect(user.id).toBe(u.id);
    expect(recoveryCode).toMatch(/-/);
    expect(await getUserBySessionToken(session)).toBeNull();
    await expect(verifyCredentials(u.username, "linked-password")).resolves.toBeTruthy();

    expect(await peekResetLink(link.token)).toBeNull();
    await expect(resetWithLink(link.token, "again-password")).rejects.toThrow(/expired or was already used/);
  });

  it("only the newest link works, and expired links are refused", async () => {
    const admin = await makeAdmin();
    const u = await make();
    const first = await createResetLink(admin, { userId: u.id });
    const second = await createResetLink(admin, { userId: u.id });
    await expect(resetWithLink(first.token, "nope-nope-1")).rejects.toThrow();
    await db.update(schema.passwordResets).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(schema.passwordResets.userId, u.id));
    await expect(resetWithLink(second.token, "nope-nope-2")).rejects.toThrow(/expired/);
  });

  it("parents can only create links for students they are linked to", async () => {
    const parent = await make("PARENT");
    const child = await make();
    const stranger = await make();
    await expect(createResetLink(parent, { userId: child.id })).rejects.toThrow();
    const { code } = await createLinkCode(child.id);
    await linkWithCode(parent.id, code);
    const link = await createResetLink(parent, { userId: child.id });
    await resetWithLink(link.token, "child-new-password");
    await expect(verifyCredentials(child.username, "child-new-password")).resolves.toBeTruthy();
    await expect(createResetLink(parent, { userId: stranger.id })).rejects.toThrow();
    const otherParent = await make("PARENT");
    await expect(createResetLink(parent, { userId: otherParent.id })).rejects.toThrow();
  });

  it("students can't create links, and nobody can make one for themselves", async () => {
    const student = await make();
    const other = await make();
    await expect(createResetLink(student, { userId: other.id })).rejects.toThrow(/can't reset/);
    const admin = await makeAdmin();
    await expect(createResetLink(admin, { userId: admin.id })).rejects.toThrow(/Change password/);
  });

  it("malformed tokens are rejected without a database hit", async () => {
    expect(await peekResetLink("short")).toBeNull();
    expect(await peekResetLink("../../etc/passwd-and-more-characters")).toBeNull();
  });
});

describe("change password", () => {
  it("needs the current password and keeps only the current session", async () => {
    const u = await make();
    const keep = await createSession(u.id);
    const other = await createSession(u.id);
    await expect(changePassword(u.id, "wrong", "changed-password", sessionHash(keep.token))).rejects.toThrow(/current password/);
    await changePassword(u.id, "first-password", "changed-password", sessionHash(keep.token));
    expect(await getUserBySessionToken(keep.token)).not.toBeNull();
    expect(await getUserBySessionToken(other.token)).toBeNull();
    await expect(verifyCredentials(u.username, "changed-password")).resolves.toBeTruthy();
  });
});
