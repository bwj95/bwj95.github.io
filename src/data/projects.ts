// Everything built, in ONE list — the site is a launcher, so an entry earns its
// place by being openable. `kind` is only a scan tag in the dropdown.
// Internal tools live under /t/<slug>/ (shipped verbatim from public/).

export type Kind = 'site' | 'tool' | 'toy' | 'game' | 'hardware';

export interface Project {
  id: string;
  name: string;
  kind: Kind;
  blurb: string;      // one line — what it does, not why it exists
  url: string;
  external?: boolean; // true → opens in a new tab (separate site)
  updated: string;    // ISO date, last real work on this piece — drives dropdown order
}

export const KIND_LABEL: Record<Kind, string> = {
  site: 'Site',
  tool: 'Tool',
  toy: 'Toy',
  game: 'Game',
  hardware: 'Hardware',
};

const all: Project[] = [
  { id: 'demo-universe', name: 'Cosmos Universe', kind: 'site', url: '/d/universe/', updated: '2026-08-24',
    blurb: 'Interactive 3D universe demo using Astro, React Three Fiber, and GSAP.' },
  { id: 'demo-dog-breeds', name: 'Dog Breeds', kind: 'site', url: '/d/dog-breeds/', updated: '2026-08-24',
    blurb: 'Editorial content site showcasing 77 breeds with vanilla-JS search and filtering.' },
  { id: 'demo-tempo-landing', name: 'Tempo Landing Page', kind: 'site', url: '/d/tempo-landing/', updated: '2026-08-24',
    blurb: 'Conversion-focused SaaS landing page with interactive pricing toggle and FAQ.' },
  { id: 'bazi', name: 'BaZi Calculator', kind: 'site', url: 'https://bazi.bwj9515.workers.dev/', external: true, updated: '2026-08-19',
    blurb: 'Four Pillars chart from a birth moment — astronomy computed from scratch, not table lookups.' },
  { id: 'traditions', name: 'Traditions', kind: 'site', url: '/traditions', external: true, updated: '2026-08-17',
    blurb: 'Field guide to nine wellness traditions and thirty-odd techniques.' },
  { id: 'customizer', name: 'Web Customizer', kind: 'site', url: 'https://web-customizer.bwj9515.workers.dev/', external: true, updated: '2026-08-17',
    blurb: 'Restyle a whole site live — pick a look from a game-menu style select, then tune every knob.' },
  { id: 'tool-cosmic', name: 'Cosmic Observation', kind: 'game', url: 'https://cosmic-observation.pages.dev/', external: true, updated: '2026-08-17',
    blurb: 'Fly a defender ship and hold the solar system against invading alien planets.' },

  { id: 'tool-image', name: 'Image Toolkit', kind: 'tool', url: '/t/image/', updated: '2026-08-15',
    blurb: 'Compress, resize and convert PNG / JPEG / WebP. Batch, nothing uploaded.' },
  { id: 'tool-pdf', name: 'PDF Toolkit', kind: 'tool', url: '/t/pdf/', updated: '2026-08-15',
    blurb: 'Merge, split and rotate PDFs entirely on your machine.' },
  { id: 'tool-dev', name: 'Dev & Text Utilities', kind: 'tool', url: '/t/dev/', updated: '2026-08-15',
    blurb: 'JSON formatter, Base64, URL encode/decode, case converter, word count.' },
  { id: 'tool-gen', name: 'Generators', kind: 'tool', url: '/t/gen/', updated: '2026-08-15',
    blurb: 'QR codes, strong passwords, colour palettes with a WCAG contrast check.' },
  { id: 'tool-lumina', name: 'LuminaTimer', kind: 'tool', url: '/t/lumina-timer/', updated: '2026-08-15',
    blurb: 'Focus timer — Pomodoro and beyond.' },
  { id: 'tool-physio', name: 'ShoulderPhys', kind: 'tool', url: '/t/shoulder-phys/', updated: '2026-08-15',
    blurb: 'Rehab dashboard for working a shoulder back to range.' },
  { id: 'tool-shadow', name: 'LongTermShadow', kind: 'tool', url: '/t/long-term-shadow/', updated: '2026-08-15',
    blurb: 'What substances cost a body over time, laid out plainly.' },
  { id: 'tool-enthea', name: 'ENTHEA', kind: 'toy', url: '/t/enthea/', updated: '2026-08-15',
    blurb: 'Visual synthesizer — a canvas that breathes and blooms.' },
  { id: 'tool-molecule', name: 'Molecular Observation', kind: 'toy', url: '/t/molecular/', updated: '2026-08-15',
    blurb: 'Molecules turned in the light to see how they are put together.' },
  { id: 'tool-galaga', name: 'Galaga', kind: 'game', url: '/t/galaga/', updated: '2026-08-15',
    blurb: 'The arcade shooter, rebuilt for the browser.' },
  { id: 'tool-solitaire', name: 'Solitaire', kind: 'game', url: '/t/solitaire/', updated: '2026-08-15',
    blurb: 'The card game, for when the room is quiet.' },
  { id: 'tool-dash', name: 'Dash Runner', kind: 'game', url: '/t/dash-runner/', updated: '2026-08-15',
    blurb: 'Endless 3D runner — dodge, and keep dodging.' },
  { id: 'tool-bubbles', name: 'Speedy Bubbles', kind: 'game', url: '/t/speedy-bubbles/', updated: '2026-08-15',
    blurb: 'A brisk little bubble game with somewhere to be.' },
];

// NOTE: the ESP32 firmware / enclosure work isn't listed — this page launches
// things, and none of it has a URL to launch yet. Add entries (repo or demo
// links) when there's somewhere for them to point.
// Libris stays out too: its ebook conversion needs a local Calibre backend.

// Dropdown order: most recently worked on first. `updated` is a plain
// YYYY-MM-DD string, so lexical comparison sorts it correctly.
export const projects: Project[] = [...all].sort(
  (a, b) => b.updated.localeCompare(a.updated)
);
