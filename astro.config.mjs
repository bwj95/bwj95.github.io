import { defineConfig } from 'astro/config';

// bwj95.github.io is a USER site → served from the domain root, so base '/'.
// (Project repos like /polyglot use a subpath base; this one does not.)
export default defineConfig({
  site: 'https://bwj95.github.io',
  base: '/',
  build: { format: 'directory' },
});
