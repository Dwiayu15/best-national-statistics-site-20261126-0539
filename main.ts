// Hand-in program for the national statistics site "Indonesia in Numbers".
//
// The site itself lives in app/ beside this file as plain static files —
// open app/index.html in a browser and it works, no build step, nothing
// fetched over the network. This program is only the courier: it copies
// app/ — and screenshots/, when the maker has put renders there — into
// the output directory and writes a dossier.json summary of the entry
// with the vendored make.fun library, exactly the summary the scorer
// rebuilds and compares against.
//
// Run it the way the grader does, or point MAKEFUN_OUTPUT_DIR somewhere
// scratch first to see what would be handed in:
//   mkdir -p /tmp/out && MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// This file's own folder is the root of the entry.
const entryRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader mounts the hand-in at /output; locally the environment
// variable stands in for it.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });

// The site itself, copied wholesale so the handed-in tree is the tree
// that was checked in the browser.
cpSync(join(entryRoot, 'app'), join(outDir, 'app'), { recursive: true });

// Screenshots are the maker's own renders of the site (the scorer wants
// 3 or 4): copy whatever the maker left beside the site.
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
const shotsHere = join(entryRoot, 'screenshots');
if (existsSync(shotsHere)) {
  cpSync(shotsHere, join(outDir, 'screenshots'), { recursive: true });
}

// The dossier, with the scorer's caps passed through untouched: the byte
// cap shapes the summary's text, the rest make this program refuse an
// entry the scorer would refuse anyway (too many or too heavy
// screenshots, an oversized site tree).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
