import { aiStatus } from "@/server/ai";
import { executionStatus } from "@/server/execution/providers";
import { currentGuestId, ensureGuestId } from "@/server/guest/request";
import { withPublic } from "@/server/http";
import { guestTutorStatus } from "@/server/services/guest-tutor";

export const dynamic = "force-dynamic";

/** What the lesson page needs to know: can code run, and is AI help on (with today's remaining quota). */
export const GET = withPublic(async (req) => {
  // The anonymous cookie exists only to share out AI requests fairly, so it's only issued when AI is on.
  const guestId = aiStatus().provider !== "curated" ? await ensureGuestId(req) : await currentGuestId();
  const [exec, tutor] = await Promise.all([executionStatus(), guestTutorStatus(guestId)]);
  return Response.json(
    { execution: { available: exec.available, devOnly: exec.devOnly, message: exec.message }, tutor },
    { headers: { "cache-control": "no-store" } },
  );
});
