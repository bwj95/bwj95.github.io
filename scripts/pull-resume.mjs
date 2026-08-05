// Pull the résumé from the canonical Resume project into the hub, so the site
// and the PDF can never drift. Source of truth: Cooking/Pot/Resume.
//   - src/resume.md  -> src/generated/resume.md   (rendered on /resume)
//   - *.pdf          -> public/                    (download button)
// Runs automatically before `dev` and `build` (see package.json scripts).
// If the Resume project isn't reachable (e.g. deploying from a detached repo),
// it warns and keeps whatever is already committed.

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hubRoot = resolve(here, '..');
const resumeDir = resolve(hubRoot, '..', 'Resume');

const srcMd = resolve(resumeDir, 'src', 'resume.md');
const outMd = resolve(hubRoot, 'src', 'generated', 'resume.md');
const pdfs = ['Brayden-Jones-Resume.pdf', 'Brayden-Jones-Resume-1page.pdf'];

function log(msg) { console.log(`[pull-resume] ${msg}`); }

if (!existsSync(srcMd)) {
  log(`WARN source not found at ${srcMd} — keeping committed copy.`);
  process.exit(0);
}

mkdirSync(dirname(outMd), { recursive: true });

// Copy the markdown, stripping the top H1 + contact line (the page supplies its
// own header) so we don't render the name twice.
const raw = readFileSync(srcMd, 'utf8');
const body = raw
  .replace(/^#\s+.*$/m, '')                 // drop leading "# Brayden Jones"
  .replace(/^\*\*Computer Engineering.*$/m, '') // drop role subtitle
  .replace(/^Markham, ON.*$/m, '')          // drop the contact line (page has it)
  .replace(/^\n+/, '');                     // trim leading blank lines
writeFileSync(outMd, body);
log('synced src/generated/resume.md');

const publicDir = resolve(hubRoot, 'public');
mkdirSync(publicDir, { recursive: true });
for (const pdf of pdfs) {
  const from = resolve(resumeDir, pdf);
  if (existsSync(from)) { copyFileSync(from, resolve(publicDir, pdf)); log(`copied ${pdf}`); }
}
