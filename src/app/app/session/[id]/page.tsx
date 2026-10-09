import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requirePageUser } from "@/server/auth/current";
import { getSessionView } from "@/server/services/sessions";
import { isAppError } from "@/server/errors";
import { SessionRunner } from "@/components/session/SessionRunner";

export const metadata: Metadata = { title: "Learning session" };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const view = await getSessionView(user.id, id).catch((err) => {
    if (isAppError(err) && err.status === 404) notFound();
    throw err;
  });
  if (view.status !== "active") redirect(`/app/session/${id}/report`);
  return <SessionRunner initial={view} />;
}
