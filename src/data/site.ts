// Central site identity + offerings. Single source of truth for copy that
// appears in more than one place. Résumé content is pulled separately from
// resume.md (see scripts/pull-resume.mjs) so it can never drift.

export const site = {
  name: 'Brayden Jones',
  handle: 'bwj95',
  role: 'Computer Engineer',
  // one-liner: the site is the proof
  tagline: 'I build across web, embedded & infrastructure — and this site is the proof.',
  location: 'Markham, ON',
  email: 'bwj9515@gmail.com',
  links: {
    github: 'https://github.com/bwj95',
    linkedin: 'https://linkedin.com/in/bwj95',
    resumePdf: '/Brayden-Jones-Resume.pdf',
  },
  // marquee band — the stack, said fast
  stack: [
    'React', 'Astro', 'TypeScript', 'C / C++', 'C#', 'Python',
    'ESP32 firmware', 'BLE + Wi-Fi', 'Cloudflare Workers', 'OpenSCAD',
    '3D printing', 'Linux', 'MCP / agentic AI',
  ],
};

// What can actually be bought / hired. This is the sales surface.
export const offerings = [
  {
    title: 'Websites that ship',
    price: 'from $600',
    blurb:
      'Design, build, deploy. Fast, accessible, SEO-ready. React or Astro, live on your domain with a real contact pipeline — not a template you fight with.',
    cta: 'Start a build',
  },
  {
    title: 'Custom apps & tools',
    price: 'project-based',
    blurb:
      'Dashboards, data tools, PWAs, small SaaS. If it runs in a browser or on the edge, I can make it exist — including the AI-powered parts.',
    cta: 'Scope an app',
  },
  {
    title: 'Embedded & hardware',
    price: 'let’s talk',
    blurb:
      'ESP32 firmware, BLE/Wi-Fi devices, custom 3D-printed enclosures. From breadboard to a thing you can hold, wired to a host app.',
    cta: 'Talk hardware',
  },
];
