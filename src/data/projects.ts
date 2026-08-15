// Gallery + free-tools data.
// `kind` routes an entry into a section:
//   'flagship' / 'lab' → "On the screen"   |   'hardware' → "Off the glass"
//   'tool'             → "The Toolbox" (free, working tools + toys, no sign-up, no fee)
// The dropdown shows `name`; the info button reveals `blurb`.
// `url` (optional) makes the entry a FUNCTIONAL link — the selector shows an
//   "Open ▸" button. Internal tools live under /t/<slug>/ (shipped in public/);
//   omit `url` for a piece that isn't live yet (button stays hidden).

export type Kind = 'flagship' | 'hardware' | 'lab' | 'tool';

export interface Project {
  id: string;
  name: string;
  kind: Kind;
  blurb: string;
  url?: string;        // present → launchable ("Open ▸")
  external?: boolean;  // true → opens in a new tab (separate site)
}

export const projects: Project[] = [
  // ── On the screen ────────────────────────────────────────────────
  { id: 'traditions', name: 'Traditions', kind: 'flagship', url: '/traditions', external: true,
    blurb: 'A field guide to nine wellness traditions and thirty-odd techniques — breathwork, movement, stillness — laid out to be read, not sold.' },
  { id: 'screen-1', name: 'Placeholder project 1', kind: 'flagship', blurb: 'Description coming soon.' },
  { id: 'screen-2', name: 'Placeholder project 2', kind: 'flagship', blurb: 'Description coming soon.' },

  // ── Off the glass ────────────────────────────────────────────────
  { id: 'glass-1', name: 'Placeholder hardware 1', kind: 'hardware', blurb: 'Description coming soon.' },
  { id: 'glass-2', name: 'Placeholder hardware 2', kind: 'hardware', blurb: 'Description coming soon.' },
  { id: 'glass-3', name: 'Placeholder hardware 3', kind: 'hardware', blurb: 'Description coming soon.' },

  // ── The Toolbox: free, working tools + toys. All live under /t/<slug>/. ──
  // Built-for-the-site utilities (100% client-side, nothing uploaded):
  { id: 'tool-image',    name: 'Image Toolkit',    kind: 'tool', url: '/t/image/',             blurb: 'Compress, resize, and convert images — PNG, JPEG, WebP — right in the browser. Batch-friendly, and nothing is ever uploaded.' },
  { id: 'tool-pdf',      name: 'PDF Toolkit',      kind: 'tool', url: '/t/pdf/',               blurb: 'Merge, split, and rotate PDFs entirely on your machine. Your documents never leave the page.' },
  { id: 'tool-dev',      name: 'Dev & Text Utilities', kind: 'tool', url: '/t/dev/',           blurb: 'The everyday grab-bag: JSON formatter, Base64, URL encode/decode, case converter, live word count.' },
  { id: 'tool-gen',      name: 'Generators',       kind: 'tool', url: '/t/gen/',               blurb: 'QR codes, cryptographically-strong passwords, and color palettes with a WCAG contrast checker.' },
  // Built earlier — apps + toys carried in from the workshop:
  { id: 'tool-enthea',   name: 'ENTHEA',           kind: 'tool', url: '/t/enthea/',            blurb: 'An altered-states visual synthesizer — a canvas that breathes, warps, and blooms. Free to play with.' },
  { id: 'tool-lumina',   name: 'LuminaTimer',      kind: 'tool', url: '/t/lumina-timer/',      blurb: 'A focus timer with more polish than a timer has any right to. Pomodoro and beyond — no account, no fee.' },
  { id: 'tool-shadow',   name: 'LongTermShadow',   kind: 'tool', url: '/t/long-term-shadow/',  blurb: 'A sober tool for seeing what substances actually cost a body over time — harm laid out plainly.' },
  { id: 'tool-physio',   name: 'ShoulderPhys',     kind: 'tool', url: '/t/shoulder-phys/',     blurb: 'A rehab dashboard for coaxing a stubborn shoulder back to working order.' },
  { id: 'tool-molecule', name: 'Molecular Observation', kind: 'tool', url: '/t/molecular/',    blurb: 'Molecules turned in the light so you can see how they are put together.' },
  { id: 'tool-cosmic',   name: 'Cosmic Observation', kind: 'tool', url: '/t/cosmic/',          blurb: 'The night sky, made to be poked at rather than merely admired.' },
  { id: 'tool-galaga',   name: 'Galaga',           kind: 'tool', url: '/t/galaga/',            blurb: 'The arcade shooter, rebuilt to be played in a browser.' },
  { id: 'tool-solitaire',name: 'Solitaire',        kind: 'tool', url: '/t/solitaire/',         blurb: 'The card game, for when the room is quiet.' },
  { id: 'tool-dash',     name: 'Dash Runner',      kind: 'tool', url: '/t/dash-runner/',       blurb: 'An endless 3D runner — dodge, and keep dodging.' },
  { id: 'tool-bubbles',  name: 'Speedy Bubbles',   kind: 'tool', url: '/t/speedy-bubbles/',    blurb: 'A brisk little bubble game with somewhere to be.' },
  // Libris (ebook library) dropped from the web toolbox — its conversion engine
  // needs a local Calibre backend (localhost:5001), so it can't run as a static
  // browser tool. Stays a local-only app in the Pot.
];

export const byKind = (k: Kind) => projects.filter((p) => p.kind === k);
