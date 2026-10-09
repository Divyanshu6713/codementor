import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth/current";
import { executionStatus } from "@/server/execution/providers";
import { PageHeader } from "@/components/ui";
import { Playground } from "@/components/app/Playground";

export const metadata: Metadata = { title: "Playground" };

export default async function PlaygroundPage() {
  await requirePageUser(["STUDENT"]);
  const status = await executionStatus();
  return (
    <div>
      <PageHeader title="Code Playground" subtitle="Write any C++ program and run it. Try changing the code and the input." />
      <Playground available={status.available} message={status.message} />
    </div>
  );
}
