// Bookmarks — other people's sites worth keeping a pointer to. Free to use,
// no sign-up wall on the thing being linked.
//
// The AI, Design and Inspiration entries came out of Brayden's own Brave
// bookmarks, so those are the real ones he reaches for. Build / Hardware /
// Reference are still SEEDED defaults picked to match the work done here —
// prune those and swap in the ones you actually use. Edit this file, nothing else.

export interface Bookmark {
  name: string;
  url: string;
  note: string;   // one line — what it's for
}

export interface BookmarkGroup {
  group: string;
  items: Bookmark[];
}

export const bookmarks: BookmarkGroup[] = [
  {
    group: 'Build',
    items: [
      { name: 'Excalidraw', url: 'https://excalidraw.com', note: 'Hand-drawn diagrams, instant, no account.' },
      { name: 'CyberChef', url: 'https://gchq.github.io/CyberChef/', note: 'Encoding, hashing, parsing — the whole knife.' },
      { name: 'regex101', url: 'https://regex101.com', note: 'Regex with a live explanation of every token.' },
      { name: 'Compiler Explorer', url: 'https://godbolt.org', note: 'See the assembly your C/C++ actually compiles to.' },
      { name: 'JSON Crack', url: 'https://jsoncrack.com', note: 'Turn JSON into a graph you can read.' },
    ],
  },
  {
    group: 'AI',
    items: [
      { name: 'Claude', url: 'https://claude.ai', note: 'Anthropic. Long context, strongest on code.' },
      { name: 'Gemini', url: 'https://gemini.google.com', note: 'Google. Huge context, reads images and video.' },
      { name: 'Grok', url: 'https://grok.com', note: 'xAI. Fast, and current on what just happened.' },
      { name: 'NotebookLM', url: 'https://notebooklm.google.com', note: 'Load your own sources, ask questions grounded in them.' },
    ],
  },
  {
    group: 'Design',
    items: [
      { name: 'Fontshare', url: 'https://fontshare.com', note: 'Quality fonts, free for commercial use.' },
      { name: 'Fontpair', url: 'https://fontpair.co', note: 'Type pairings that already work together.' },
      { name: 'Coolors', url: 'https://coolors.co', note: 'Palette generator, fast.' },
      { name: 'Unsplash', url: 'https://unsplash.com', note: 'Photos, free, no attribution required.' },
      { name: 'Squoosh', url: 'https://squoosh.app', note: 'Image compression with a live before/after.' },
      { name: 'SVG Repo', url: 'https://www.svgrepo.com', note: 'Half a million open-licensed vectors.' },
    ],
  },
  {
    group: 'Inspiration',
    items: [
      { name: 'Awwwards', url: 'https://www.awwwards.com', note: 'The top of the craft, judged.' },
      { name: 'Land-book', url: 'https://land-book.com', note: 'Landing pages, sorted and searchable.' },
      { name: 'CollectUI', url: 'https://collectui.com', note: 'Daily UI shots, filtered by element.' },
      { name: 'Mobbin', url: 'https://mobbin.com', note: 'Real app and site flows, screen by screen.' },
      { name: 'recent.design', url: 'https://recent.design', note: 'What shipped lately, updated constantly.' },
      { name: 'CanvasUI', url: 'https://canvasui.dev', note: 'Canvas and WebGL interface patterns.' },
      { name: 'I Spy', url: 'https://ispy.heihei.resn.co', note: "Resn's WebGL showpiece — what a browser can really do." },
    ],
  },
  {
    group: 'Hardware',
    items: [
      { name: 'Wokwi', url: 'https://wokwi.com', note: 'Simulate ESP32 / Arduino in the browser, wiring and all.' },
      { name: 'Printables', url: 'https://printables.com', note: 'Print-ready models worth the filament.' },
      { name: 'KiCad', url: 'https://www.kicad.org', note: 'Full PCB design suite, open source.' },
      { name: 'Random Nerd Tutorials', url: 'https://randomnerdtutorials.com', note: 'ESP32 recipes that actually work.' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { name: 'MDN', url: 'https://developer.mozilla.org', note: 'The web platform, documented properly.' },
      { name: 'Can I Use', url: 'https://caniuse.com', note: 'Whether you can ship that feature yet.' },
      { name: 'Astro Docs', url: 'https://docs.astro.build', note: 'The stack most of this is built on.' },
      { name: 'Cloudflare Docs', url: 'https://developers.cloudflare.com', note: 'Workers, Pages, and the rest of the edge.' },
    ],
  },
];

export const bookmarkCount = bookmarks.reduce((n, g) => n + g.items.length, 0);
