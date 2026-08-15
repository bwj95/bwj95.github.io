// Bookmarks — other people's sites worth keeping a pointer to. Free to use,
// no sign-up wall on the thing being linked.
//
// SEEDED, NOT CURATED: these are strong defaults picked to match the kind of
// work done here (web, firmware, printing). Brayden — prune hard and swap in
// the ones you actually reach for. Edit this file, nothing else.

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
    group: 'Design',
    items: [
      { name: 'Fontshare', url: 'https://fontshare.com', note: 'Quality fonts, free for commercial use.' },
      { name: 'Coolors', url: 'https://coolors.co', note: 'Palette generator, fast.' },
      { name: 'Unsplash', url: 'https://unsplash.com', note: 'Photos, free, no attribution required.' },
      { name: 'Squoosh', url: 'https://squoosh.app', note: 'Image compression with a live before/after.' },
      { name: 'SVG Repo', url: 'https://www.svgrepo.com', note: 'Half a million open-licensed vectors.' },
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
