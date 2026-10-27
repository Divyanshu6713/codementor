/** `npm run content:manifest` — regenerate docs/CPP_CURRICULUM_MANIFEST.md from the course catalogue. */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { renderManifest } from "../src/content/course/manifest";

const file = path.join(process.cwd(), "docs", "CPP_CURRICULUM_MANIFEST.md");
writeFileSync(file, renderManifest());
console.log(`Wrote ${path.relative(process.cwd(), file)}`);
