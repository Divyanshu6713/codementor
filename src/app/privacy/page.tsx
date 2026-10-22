import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/learn/SiteHeader";

export const metadata: Metadata = { title: "Privacy" };

const ITEMS: { title: string; body: string }[] = [
  {
    title: "Guest accounts hold no personal data",
    body: "When you press Start learning, CodeMentor creates a guest account with a random name and no email or password. Your progress, XP, answers and achievements are stored with it on CodeMentor's server so they survive reloads. The only key to a guest account is a sign-in cookie in your browser — clear your cookies and the guest progress can't be recovered. You can add a username and password in Settings to keep it.",
  },
  {
    title: "What is stored",
    body: "Your answers and progress (to teach you and compute XP), your display name, and — only for accounts with a username — the username and a hashed password. Code from the playground and adaptive sessions is stored with your account so you can see your history; lesson-exercise code is only kept as a draft in your own browser. You can download or delete everything from Settings.",
  },
  {
    title: "AI help (only when enabled)",
    body: "When the AI mentor is switched on and you use it, your question, your code and the current lesson are sent to the AI provider the site is configured with (Anthropic or OpenAI) to write the answer. CodeMentor doesn't store mentor-panel questions or answers — only the time, the type of request, token counts and cost. Adaptive-session chats are stored only if you turn that on in Settings. Don't put personal information in questions. With AI switched off, nothing is sent to any AI provider.",
  },
  {
    title: "Daily limits",
    body: "To share AI help fairly, CodeMentor counts AI requests per account per day. The counters are stored as one-way hashes, not as your account id or network address.",
  },
  {
    title: "Logs",
    body: "The server keeps short technical logs (errors, timings) without your code or questions. The hosting provider may log network addresses as part of normal operation.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy, in plain words</h1>
        <p className="mt-2 text-ink-2">CodeMentor collects as little as possible. Here is everything it does with your data.</p>
        <div className="mt-8 space-y-6">
          {ITEMS.map((i) => (
            <section key={i.title}>
              <h2 className="font-semibold">{i.title}</h2>
              <p className="mt-1 text-ink-2">{i.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
