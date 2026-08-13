// Real work. One entry per build. `kind` drives which section it lands in.
// `poster.hue` generates a gradient poster until a real screenshot is dropped
// into /public/shots/<id>.webp (then set `image`).

export type Kind = 'flagship' | 'hardware' | 'lab';
export type Status = 'live' | 'in-progress' | 'research';

export interface Project {
  id: string;
  name: string;
  kind: Kind;
  status: Status;
  tagline: string;
  blurb: string;
  tags: string[];
  links: { label: string; href: string }[];
  poster: { hue: number; glyph: string };
  image?: string; // /shots/<id>.webp once captured
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: 'sparkplay',
    name: 'Spark+Play Foundation',
    kind: 'flagship',
    status: 'live',
    featured: true,
    tagline: 'A site for a registered Canadian charity — paying work, delivered and done.',
    blurb:
      'Designed, built and deployed end to end, through as many rounds of client fussing as it took to get it right. I put the thing on a diet — page weight down some 84% (2.2 MB → 353 kB) with properly sized WebP and honest vector logos — bolted on the search-engine plumbing (Open Graph, JSON-LD, sitemap), and stood up a serverless contact form on a Cloudflare Worker with Turnstile to keep the spammers out. It works. That is the entire point of it.',
    tags: ['React 19', 'Vite', 'Cloudflare Workers', 'Turnstile', 'SEO'],
    links: [{ label: 'Live site', href: 'https://sparkplayevents.bwj9515.workers.dev/' }],
    poster: { hue: 285, glyph: '✦' },
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    kind: 'flagship',
    status: 'live',
    featured: true,
    tagline: 'A phrase-book across four language directions — for the traveler who refuses to point and grunt.',
    blurb:
      'A reference that builds itself: 350-odd phrases, instant search, category filters, favorites, and flashcard drill — the whole apparatus generated from one honest dataset, so it cannot contradict itself. Native-accent audio by way of the browser’s own speech engine; your favorites remembered in localStorage. It deploys itself when I push, via GitHub Actions. Idle machinery is a small sin.',
    tags: ['React 19', 'Vite', 'Web Speech API', 'GitHub Pages'],
    links: [{ label: 'Live site', href: 'https://bwj95.github.io/polyglot/' }],
    poster: { hue: 200, glyph: '⌘' },
  },
  {
    id: 'traditions',
    name: 'Traditions',
    kind: 'flagship',
    status: 'live',
    featured: true,
    tagline: 'A calm, unhurried guide to well-being — 9 traditions, 34 techniques, no nagging.',
    blurb:
      'A quiet, fast reference raised from a single content dataset and shipped to GitHub Pages via Actions without ceremony. Proof — should any fool require it — that "simple and static" can still be a considered, civilized thing, and not an excuse for laziness.',
    tags: ['React', 'Vite', 'GitHub Pages'],
    links: [{ label: 'Live site', href: 'https://bwj95.github.io/traditions/' }],
    poster: { hue: 150, glyph: '❋' },
  },
  {
    id: 'esp32-s3',
    name: 'ESP32-S3 — firmware + enclosure',
    kind: 'hardware',
    status: 'in-progress',
    featured: true,
    tagline: 'An actual object: firmware, the software that drives it, and a case printed to fit.',
    blurb:
      'Lab firmware that speaks one control protocol down both a serial wire and Bluetooth (Nordic UART) — one parser, two roads, no duplicated nonsense — for RGB, Wi-Fi and system commands. Cross-platform Python host programs work it over USB or over the air. The snap-fit enclosure I drew myself in OpenSCAD and printed; the first prototype snapped shut, and I accepted it. Honest work, hand to circuit.',
    tags: ['Embedded C++', 'BLE / Wi-Fi', 'Python (Tkinter)', 'OpenSCAD', '3D print'],
    links: [],
    poster: { hue: 25, glyph: '⚙' },
  },
  {
    id: 'web-studio',
    name: 'Web Studio',
    kind: 'flagship',
    status: 'in-progress',
    tagline: 'The shop-front for all this — one config file, and the audacity to let you touch it.',
    blurb:
      'The site that argues my case for building sites, run entirely off a single config file, with real work hung on the wall as evidence. Still being fussed over — its copy and its character — before I turn it loose on the public.',
    tags: ['Astro', 'TypeScript', 'Config-driven'],
    links: [],
    poster: { hue: 320, glyph: '◈' },
  },
  {
    id: 'ai-worker',
    name: 'AI Worker',
    kind: 'lab',
    status: 'in-progress',
    tagline: 'A small primitive for putting a mind inside your app, out on the edge.',
    blurb:
      'A spare little Cloudflare Worker — POST a question to /api/ask, get Claude’s answer — with the API key locked away as a Worker secret where no browser can pickpocket it. The reusable part I drop into anything that wants a brain, without leaving the keys in the ignition.',
    tags: ['Cloudflare Workers', 'Claude API', 'MCP-adjacent'],
    links: [],
    poster: { hue: 260, glyph: '◇' },
  },
  {
    id: 'rf-lab',
    name: 'ESP32 RF / Wi-Fi Lab',
    kind: 'hardware',
    status: 'research',
    tagline: 'Authorized bench work in how Wi-Fi actually behaves when no one’s watching.',
    blurb:
      'Bench study on the humble DevKit V1 — SoftAP, beaconing, the innards of captive portals — conducted strictly in an isolated, authorized lab, for the oldest and best reason there is: to understand how the damned things truly work. A foundation, not a product, and no apology for the curiosity.',
    tags: ['ESP32', 'Wi-Fi / SoftAP', 'C firmware', 'Security research'],
    links: [],
    poster: { hue: 95, glyph: '⌁' },
  },
];

export const byKind = (k: Kind) => projects.filter((p) => p.kind === k);
