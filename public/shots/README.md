# Project images

Drop project screenshots / background images here, then point a project at one.

1. Save an image as WebP here, e.g. `public/shots/sparkplay.webp`
   (WebP keeps the site fast — re-encode photos before adding).
2. In `src/data/projects.ts`, set `image: '/shots/sparkplay.webp'` on that project.

The image then replaces the generated gradient poster on the card, and — in the
**Rail** work layout (Design Console → Components → Work layout → Rail) — it becomes
the full-bleed panel background with a scrim for legible text.

Free, commercial-safe sources: Unsplash, Pexels, Pixabay (no attribution required).
Avoid recognizable logos / identifiable people on a client-facing site.
