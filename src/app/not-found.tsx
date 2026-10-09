import { ButtonLink } from "@/components/ui";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <LogoMark size={44} />
      <h1 className="text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="max-w-md text-ink-2">It may have moved, or the link might be mistyped. <code className="font-mono">404</code> — like an index past the end of an array.</p>
      <ButtonLink href="/">Go home</ButtonLink>
    </main>
  );
}
