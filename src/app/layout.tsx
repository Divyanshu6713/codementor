import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const ui = DM_Sans({ variable: "--font-ui", subsets: ["latin"] });
const head = Space_Grotesk({ variable: "--font-head", subsets: ["latin"], weight: ["500", "600", "700"] });
const code = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CodeMentor — learn to code like you mean it", template: "%s · CodeMentor" },
  description: "Learn C++ and Python by doing: adaptive lessons, code checked by a real compiler and sandbox, hints that teach instead of giving answers, daily challenges and an arena. No sign-up needed.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

// Applies the saved/OS theme before first paint (no flash). Kept tiny and static.
const themeScript = `(function(){try{var t=localStorage.getItem("cmk-theme");if(!t||t==="system"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;var s=localStorage.getItem("cmk-text");if(s)document.documentElement.dataset.text=s}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${head.variable} ${code.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain min-h-full flex flex-col bg-bg text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:shadow-pop">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
