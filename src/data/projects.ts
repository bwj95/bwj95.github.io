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
    tagline: 'Website for a registered Canadian charity — client work, shipped.',
    blurb:
      'Designed, built and deployed end-to-end through multiple client feedback rounds. Cut page weight ~84% (2.2 MB → 353 kB) with sized WebP + vector logos, added Open Graph / JSON-LD / sitemap, and stood up a serverless contact form on a Cloudflare Worker with Turnstile anti-spam.',
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
    tagline: 'A professional phrase guide across four language directions.',
    blurb:
      'Data-driven reference app — 350+ phrases, instant search, category filters, favorites, and flashcard/quiz practice that builds itself from one declarative dataset. Native-accent audio via the Web Speech API; favorites persist in localStorage. Auto-deploys via GitHub Actions.',
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
    tagline: 'A calm, static wellness guide — 9 traditions, 34 techniques.',
    blurb:
      'A quiet, fast reference site built from a single content dataset and shipped to GitHub Pages via Actions. Proof that "simple and static" can still feel considered.',
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
    tagline: 'A device you can hold: firmware, host GUIs, and a printed case.',
    blurb:
      'Lab firmware exposing a shared serial + BLE (Nordic UART) control protocol for RGB, Wi-Fi and system commands — one parser across both transports. Cross-platform Python host GUIs drive it over USB or Bluetooth. Custom snap-fit enclosure modeled in OpenSCAD and 3D-printed (prototype V1 accepted).',
    tags: ['Embedded C++', 'BLE / Wi-Fi', 'Python (Tkinter)', 'OpenSCAD', '3D print'],
    links: [],
    poster: { hue: 25, glyph: '⚙' },
  },
  {
    id: 'web-studio',
    name: 'Web Studio',
    kind: 'flagship',
    status: 'in-progress',
    tagline: 'The storefront for the web-dev service — config-driven Astro.',
    blurb:
      'A marketing site for the "I build websites" offer, driven entirely by one config file with six real builds as proof. Currently finishing copy and brand before it goes public.',
    tags: ['Astro', 'TypeScript', 'Config-driven'],
    links: [],
    poster: { hue: 320, glyph: '◈' },
  },
  {
    id: 'ai-worker',
    name: 'AI Worker',
    kind: 'lab',
    status: 'in-progress',
    tagline: 'A call-Claude-from-your-app primitive on the edge.',
    blurb:
      'A minimal Cloudflare Worker (POST /api/ask → Claude) with the API key held as a Worker secret — the reusable building block for dropping AI into any of these apps without exposing keys client-side.',
    tags: ['Cloudflare Workers', 'Claude API', 'MCP-adjacent'],
    links: [],
    poster: { hue: 260, glyph: '◇' },
  },
  {
    id: 'rf-lab',
    name: 'ESP32 RF / Wi-Fi Lab',
    kind: 'hardware',
    status: 'research',
    tagline: 'Authorized lab work in Wi-Fi behavior and captive portals.',
    blurb:
      'Bench research on the classic DevKit V1 — SoftAP, beaconing and captive-portal internals — run strictly in an isolated, authorized lab to understand how these systems actually work. Security foundation, not a product.',
    tags: ['ESP32', 'Wi-Fi / SoftAP', 'C firmware', 'Security research'],
    links: [],
    poster: { hue: 95, glyph: '⌁' },
  },
];

export const byKind = (k: Kind) => projects.filter((p) => p.kind === k);
