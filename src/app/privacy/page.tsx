import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/learn/SiteHeader";

export const metadata: Metadata = { title: "Privacy" };

const ITEMS: { title: string; body: string }[] = [
  {
    title: "Your progress stays in your browser",
    body: "Completed lessons, your current lesson and your code drafts are saved in this browser's local storage. They are not sent to CodeMentor's server. They don't move to other devices, and they are deleted if you clear your browser data or use \"Reset my progress\" on the course map.",
  },
  {
    title: "One anonymous cookie",
    body: "If the AI tutor is switched on, CodeMentor sets a cookie with a random ID (not your name or email). Its only job is to count how many AI requests you've made today so everyone gets a fair share. The daily counters are stored as one-way hashes.",
  },
  {
    title: "Code you run is not kept",
    body: "When you press Run or Check answer, your code is sent to an isolated code runner, compiled, run and then deleted. CodeMentor does not store the code you write in lessons.",
  },
  {
    title: "AI help (only when enabled)",
    body: "When you use the help panel with AI switched on, your question, your code and the current lesson are sent to the AI provider the site is configured with (Anthropic or OpenAI) to write the answer. CodeMentor does not store your question or the answer — only the time, the type of request and how many tokens it used, to control cost. The provider handles the request under its own data policy; don't put personal information in questions. With AI switched off, nothing is sent to any AI provider.",
  },
  {
    title: "Logs",
    body: "The server keeps short technical logs (errors, timings) without your code or questions. The hosting provider may log network addresses as part of normal operation.",
  },
  {
    title: "Optional accounts",
    body: "You never need an account to learn. The older account-based practice area stores the email and display name you sign up with and your practice history, so that it can work across sessions.",
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
