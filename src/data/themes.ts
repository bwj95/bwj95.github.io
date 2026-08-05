// Single source of truth for the Design Console. Rendered server-side into the
// console buttons AND injected into the pre-paint theme engine (see Base.astro),
// so there's no duplication and no flash of the wrong theme on load.

export interface Style { id: string; label: string; note: string; }
export interface FontSet { label: string; display: string; body: string; hero: string; }
export interface Accent { label: string; spectrum: string; accent: string; }

export const styles: Style[] = [
  { id: 'aurora',    label: 'Aurora Glass', note: 'dark · glass · spectrum' },
  { id: 'brutalist', label: 'Brutalist',    note: 'concrete · hard edges' },
  { id: 'editorial', label: 'Editorial',    note: 'paper · serif · calm' },
  { id: 'neon',      label: 'Neon Noir',    note: 'dark · electric glow' },
];

export const fonts: FontSet[] = [
  { label: 'Satoshi',  display: "'Satoshi', sans-serif",  body: "'Satoshi', sans-serif", hero: "'Array', monospace" },
  { label: 'Sentient', display: "'Sentient', serif",      body: "'Author', serif",       hero: "'Sentient', serif" },
  { label: 'Alpino',   display: "'Alpino', sans-serif",   body: "'Alpino', sans-serif",  hero: "'Array', monospace" },
  { label: 'Array',    display: "'Array', monospace",     body: "'Satoshi', sans-serif", hero: "'Array Wide', monospace" },
  { label: 'Segment',  display: "'Segment', monospace",   body: "'Satoshi', sans-serif", hero: "'Segment', monospace" },
];

export const accents: Accent[] = [
  { label: 'Spectrum', spectrum: 'linear-gradient(115deg,#6ceaff,#a78bfa,#ff6ec7)', accent: '#a78bfa' },
  { label: 'Sunset',   spectrum: 'linear-gradient(115deg,#ff9966,#ff5e62,#ff2a68)', accent: '#ff5e62' },
  { label: 'Emerald',  spectrum: 'linear-gradient(115deg,#43e97b,#38f9d7)',         accent: '#37e0b0' },
  { label: 'Gold',     spectrum: 'linear-gradient(115deg,#f6d365,#fda085)',         accent: '#f4c04e' },
  { label: 'Electric', spectrum: 'linear-gradient(115deg,#4facfe,#00f2fe)',         accent: '#4facfe' },
  { label: 'Mono',     spectrum: '#e6e6ec',                                          accent: '#cfcfd6' },
];
