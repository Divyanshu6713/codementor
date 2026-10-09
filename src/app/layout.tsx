import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const ui = Plus_Jakarta_Sans({ variable: "--font-ui", subsets: ["latin"] });
const code = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CodeMentor — learn C++ one concept at a time", template: "%s · CodeMentor" },
  description: "Learn C++ from zero without signing up: plain-language lessons, worked examples, exercises checked by a real compiler, and hints that teach instead of giving answers.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1020" },
  ],
};

// Applies the saved/OS theme before first paint (no flash). Kept tiny and static.
const themeScript = `(function(){try{var t=localStorage.getItem("cmk-theme");if(!t||t==="system"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;var s=localStorage.getItem("cmk-text");if(s)document.documentElement.dataset.text=s}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${code.variable} h-full`} suppressHydrationWarning>
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
