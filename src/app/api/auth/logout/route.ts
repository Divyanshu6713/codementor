import { cookies } from "next/headers";
import { SESSION_COOKIE, deleteSession } from "@/server/auth/auth";
import { clearSessionCookie } from "@/server/auth/current";
import { toErrorResponse } from "@/server/http";

export async function POST() {
  try {
    const store = await cookies();
    await deleteSession(store.get(SESSION_COOKIE)?.value);
    await clearSessionCookie();
    return Response.json({ redirect: "/" });
  } catch (err) {
    return toErrorResponse(err);
  }
}
