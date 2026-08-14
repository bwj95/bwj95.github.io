// Placeholder gallery data — real names + descriptions to come (Brayden will fill).
// `kind` routes an entry into a section:
//   'flagship' / 'lab' → "On the screen"   |   'hardware' → "Off the glass"
// The dropdown shows `name`; the info button reveals `blurb`.

export type Kind = 'flagship' | 'hardware' | 'lab';

export interface Project {
  id: string;
  name: string;
  kind: Kind;
  blurb: string;
}

export const projects: Project[] = [
  { id: 'screen-1', name: 'Placeholder project 1', kind: 'flagship', blurb: 'Description coming soon.' },
  { id: 'screen-2', name: 'Placeholder project 2', kind: 'flagship', blurb: 'Description coming soon.' },
  { id: 'screen-3', name: 'Placeholder project 3', kind: 'flagship', blurb: 'Description coming soon.' },
  { id: 'screen-4', name: 'Placeholder project 4', kind: 'flagship', blurb: 'Description coming soon.' },

  { id: 'glass-1', name: 'Placeholder hardware 1', kind: 'hardware', blurb: 'Description coming soon.' },
  { id: 'glass-2', name: 'Placeholder hardware 2', kind: 'hardware', blurb: 'Description coming soon.' },
  { id: 'glass-3', name: 'Placeholder hardware 3', kind: 'hardware', blurb: 'Description coming soon.' },
];

export const byKind = (k: Kind) => projects.filter((p) => p.kind === k);
