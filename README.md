# bwj95.github.io — the hub

Personal hub + portfolio + storefront. The site *is* the demo: dark, alive,
unconventional. Built with **Astro**. Deploys to the root of `bwj95.github.io`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321  (runs sync:resume first)
npm run build      # → dist/  (also runs sync:resume)
npm run preview
```

> First install: this box uses a hardened npm. If esbuild/sharp are blocked,
> run `npm approve-scripts esbuild sharp` once.

## Where things live

| Path | What |
|------|------|
| `src/data/projects.ts` | The real work — one entry per build. Edit here to add/feature projects. |
| `src/data/site.ts` | Identity, stack marquee, and the **offerings** (the sales surface). |
| `src/components/ParticleField.astro` | The living background canvas. |
| `src/styles/global.css` | Design system — the spectrum accent + glass tokens. |
| `src/pages/index.astro` | Home: hero → work → hardware → hire. |
| `src/pages/resume.astro` | Résumé page, rendered from Markdown. |
| `scripts/pull-resume.mjs` | Syncs `../Resume/src/resume.md` + PDFs in. **Résumé never drifts.** |
| `public/shots/<id>.webp` | Drop a real screenshot here + set `image` on the project to replace the gradient poster. |

## Résumé pipeline

The résumé is **not** authored here. Source of truth is
`Cooking/Pot/Resume/src/resume.md`. `sync:resume` copies the Markdown +
compiled PDFs into this project before every dev/build, so the site and the
downloadable PDF can't disagree. The generated copy + PDFs are committed so CI
builds standalone (the Resume project isn't in this repo).

## Deploy

GitHub Pages via Actions (`.github/workflows/deploy.yml`). One-time: set repo
**Settings → Pages → Source = GitHub Actions**. Then push to `main`.

⚠️ This **replaces** the current live site at `bwj95.github.io`.
