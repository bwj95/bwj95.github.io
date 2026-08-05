// Single source of truth for the Design Console. Rendered server-side into the
// console buttons AND injected into the pre-paint theme engine (see Base.astro),
// so there's no duplication and no flash of the wrong theme on load.

export interface Style { id: string; label: string; note: string; }
export interface FontSet { label: string; display: string; body: string; hero: string; }
export interface Accent { label: string; spectrum: string; accent: string; }
export interface OptionChoice { val: string; label: string; }
export interface Option { key: string; attr: string; label: string; default: string; choices: OptionChoice[]; }
// A curated one-click look: pairs a vibe with a font, an accent, and a few
// component tweaks that are known to look good together (the fontpair idea).
export interface Preset { name: string; blurb: string; style: string; font: string; accent: string; opts?: Record<string, string>; }

export const styles: Style[] = [
  { id: 'aurora',    label: 'Aurora Glass', note: 'dark · glass · spectrum' },
  { id: 'brutalist', label: 'Brutalist',    note: 'concrete · hard edges' },
  { id: 'editorial', label: 'Editorial',    note: 'paper · serif · calm' },
  { id: 'neon',      label: 'Neon Noir',    note: 'dark · electric glow' },
  { id: 'bento',     label: 'Bento',        note: 'soft · rounded mosaic' },
  { id: 'kinetic',   label: 'Kinetic',      note: 'bold · in motion' },
  { id: 'fresh',     label: 'Fresh',        note: 'bright · open · vibrant' },
  { id: 'cyber',     label: 'Cyber',        note: 'terminal green · grid · glow' },
];

// Component-level design options. Each writes a data-* attribute on <html>;
// CSS in global.css reacts to it. `default` = the attribute-absent base look.
export const options: Option[] = [
  { key: 'hero', attr: 'data-hero', label: 'Hero title', default: 'fill', choices: [
    { val: 'fill', label: 'Filled' }, { val: 'outline', label: 'Outline' }, { val: 'glow', label: 'Glow' },
  ] },
  { key: 'nav', attr: 'data-nav', label: 'Taskbar', default: 'float', choices: [
    { val: 'float', label: 'Floating' }, { val: 'bar', label: 'Top bar' }, { val: 'mini', label: 'Minimal' },
  ] },
  { key: 'menu', attr: 'data-menu', label: 'Menu', default: 'dropdown', choices: [
    { val: 'dropdown', label: 'Dropdown' }, { val: 'overlay', label: 'Fullscreen' },
  ] },
  { key: 'burger', attr: 'data-burger', label: 'Menu icon', default: 'lines', choices: [
    { val: 'lines', label: 'Lines' }, { val: 'plus', label: 'Plus' },
    { val: 'dots', label: 'Dots' }, { val: 'text', label: '“Menu”' },
  ] },
  { key: 'banner', attr: 'data-banner', label: 'Banner', default: 'on', choices: [
    { val: 'on', label: 'On' }, { val: 'off', label: 'Off' },
  ] },
  { key: 'corners', attr: 'data-corners', label: 'Corners', default: 'round', choices: [
    { val: 'round', label: 'Round' }, { val: 'sharp', label: 'Sharp' },
  ] },
  { key: 'bg', attr: 'data-bg', label: 'Background', default: 'particles', choices: [
    { val: 'particles', label: 'Particles' }, { val: 'aurora', label: 'Aurora' },
    { val: 'grid', label: 'Grid' }, { val: 'dots', label: 'Dots' }, { val: 'none', label: 'None' },
  ] },
  { key: 'cards', attr: 'data-cards', label: 'Cards', default: 'glass', choices: [
    { val: 'glass', label: 'Glass' }, { val: 'solid', label: 'Solid' },
    { val: 'outline', label: 'Outline' }, { val: 'elevated', label: 'Elevated' },
  ] },
  { key: 'media', attr: 'data-media', label: 'Card image', default: 'poster', choices: [
    { val: 'poster', label: 'Poster' }, { val: 'full', label: 'Full' },
    { val: 'duotone', label: 'Duotone' }, { val: 'minimal', label: 'None' },
  ] },
  { key: 'density', attr: 'data-density', label: 'Density', default: 'cozy', choices: [
    { val: 'cozy', label: 'Cozy' }, { val: 'compact', label: 'Compact' }, { val: 'spacious', label: 'Spacious' },
  ] },
  { key: 'cursor', attr: 'data-cursor', label: 'Cursor', default: 'default', choices: [
    { val: 'default', label: 'Default' }, { val: 'dot', label: 'Dot' }, { val: 'ring', label: 'Ring' },
  ] },
  { key: 'layout', attr: 'data-layout', label: 'Work layout', default: 'grid', choices: [
    { val: 'grid', label: 'Grid' }, { val: 'rail', label: 'Rail →' }, { val: 'list', label: 'Index' },
    { val: 'stack', label: 'Stack' }, { val: 'coverflow', label: '3D' }, { val: 'collage', label: 'Collage' },
  ] },
  { key: 'parallax', attr: 'data-parallax', label: 'Parallax', default: 'off', choices: [
    { val: 'off', label: 'Off' }, { val: 'sideways', label: 'Sideways' },
  ] },
  { key: 'crt', attr: 'data-crt', label: 'CRT screen', default: 'off', choices: [
    { val: 'off', label: 'Off' }, { val: 'on', label: 'On' },
  ] },
  { key: 'motion', attr: 'data-motion', label: 'Motion', default: 'on', choices: [
    { val: 'on', label: 'On' }, { val: 'off', label: 'Off' },
  ] },
];

// `hero` = the typeface used on the big hero headline for this pick. Each font
// applies to its OWN hero so selecting it visibly changes the headline; Array is
// the only dot-matrix one (that's the site's default hero identity).
export const fonts: FontSet[] = [
  { label: 'Satoshi',  display: "'Satoshi', sans-serif",  body: "'Satoshi', sans-serif", hero: "'Satoshi', sans-serif" },
  { label: 'Sentient', display: "'Sentient', serif",      body: "'Author', serif",       hero: "'Sentient', serif" },
  { label: 'Alpino',   display: "'Alpino', sans-serif",   body: "'Alpino', sans-serif",  hero: "'Alpino', sans-serif" },
  { label: 'Array',    display: "'Array', monospace",     body: "'Satoshi', sans-serif", hero: "'Array Wide', monospace" },
  { label: 'Segment',  display: "'Segment', monospace",   body: "'Satoshi', sans-serif", hero: "'Segment', monospace" },
  { label: 'Clash',    display: "'Clash Display', sans-serif", body: "'General Sans', sans-serif", hero: "'Clash Display', sans-serif" },
  { label: 'Cabinet',  display: "'Cabinet Grotesk', sans-serif", body: "'General Sans', sans-serif", hero: "'Cabinet Grotesk', sans-serif" },
  { label: 'Zodiak',   display: "'Zodiak', serif",         body: "'General Sans', sans-serif", hero: "'Zodiak', serif" },
];

export const accents: Accent[] = [
  { label: 'Spectrum', spectrum: 'linear-gradient(115deg,#6ceaff,#a78bfa,#ff6ec7)', accent: '#a78bfa' },
  { label: 'Sunset',   spectrum: 'linear-gradient(115deg,#ff9966,#ff5e62,#ff2a68)', accent: '#ff5e62' },
  { label: 'Emerald',  spectrum: 'linear-gradient(115deg,#43e97b,#38f9d7)',         accent: '#37e0b0' },
  { label: 'Gold',     spectrum: 'linear-gradient(115deg,#f6d365,#fda085)',         accent: '#f4c04e' },
  { label: 'Electric', spectrum: 'linear-gradient(115deg,#4facfe,#00f2fe)',         accent: '#4facfe' },
  { label: 'Mono',     spectrum: '#e6e6ec',                                          accent: '#cfcfd6' },
  { label: 'Citrus',   spectrum: 'linear-gradient(115deg,#ff7a3c,#ffd23f,#3ec46d)',  accent: '#ff7a3c' },
];

// Curated one-click looks (fontpair-style). `font`/`accent` reference labels
// above; `opts` sets component options, everything else resets to default.
export const presets: Preset[] = [
  { name: 'Aurora Pop',     blurb: 'the house look',          style: 'aurora',    font: 'Satoshi',  accent: 'Spectrum' },
  { name: 'Clean Studio',   blurb: 'minimal, dotted, airy',   style: 'aurora',    font: 'Clash',    accent: 'Mono',     opts: { cards: 'outline', bg: 'dots', density: 'spacious' } },
  { name: 'Dark Serif',     blurb: 'editorial on black',      style: 'aurora',    font: 'Sentient', accent: 'Emerald',  opts: { cards: 'solid', bg: 'grid' } },
  { name: 'Editorial Warm', blurb: 'paper, serif, calm',      style: 'editorial', font: 'Sentient', accent: 'Gold',     opts: { banner: 'off', bg: 'none' } },
  { name: 'Brutalist Pop',  blurb: 'concrete + electric',     style: 'brutalist', font: 'Array',    accent: 'Electric', opts: { corners: 'sharp' } },
  { name: 'Neon Arcade',    blurb: 'LED glow, ring cursor',   style: 'neon',      font: 'Segment',  accent: 'Spectrum', opts: { hero: 'glow', cursor: 'ring' } },
  { name: 'Soft Bento',     blurb: 'rounded mosaic, sunset',  style: 'bento',     font: 'Alpino',   accent: 'Sunset',   opts: { cards: 'elevated' } },
  { name: 'Kinetic Flux',   blurb: 'bold, animated',          style: 'kinetic',   font: 'Clash',    accent: 'Spectrum' },
  { name: 'Grotesk Studio', blurb: 'characterful + clean',    style: 'aurora',    font: 'Cabinet',  accent: 'Emerald',  opts: { cards: 'outline', density: 'spacious' } },
  { name: 'Zodiak Press',   blurb: 'serif display, paper',    style: 'editorial', font: 'Zodiak',   accent: 'Gold',     opts: { banner: 'off', bg: 'none' } },
  { name: 'Orchard',        blurb: 'bright, open, horizontal rail', style: 'fresh', font: 'Clash', accent: 'Citrus', opts: { layout: 'rail', parallax: 'sideways', density: 'spacious', bg: 'none', banner: 'off', cards: 'elevated' } },
  { name: 'The Index',      blurb: 'editorial list, hover previews', style: 'aurora', font: 'Zodiak', accent: 'Mono', opts: { layout: 'list', bg: 'none', banner: 'off', density: 'spacious' } },
  { name: 'Card Deck',      blurb: 'cards stack as you scroll', style: 'aurora', font: 'Clash', accent: 'Spectrum', opts: { layout: 'stack', cards: 'solid', bg: 'dots' } },
  { name: 'Reel',           blurb: '3D coverflow carousel', style: 'neon', font: 'Alpino', accent: 'Electric', opts: { layout: 'coverflow', hero: 'glow' } },
  { name: 'Cyberdeck',      blurb: 'terminal grid + cursor-lit dots', style: 'cyber', font: 'Array', accent: '', opts: { bg: 'dots', hero: 'glow', cards: 'outline', crt: 'on' } },
];
