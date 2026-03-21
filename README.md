# Dolphin Centrifuge Website

Production website for [Dolphin Centrifuge](https://dolphincentrifuge.com) — industrial centrifuge systems for oil purification, fuel treatment, wastewater processing, and more.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) (static site generator)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** React (interactive elements)
- **Hosting:** [Netlify](https://www.netlify.com/)

## Project Structure

```
site/
├── public/
│   └── images/          # Legacy + optimized images per page slug
├── src/
│   ├── components/      # Reusable Astro/React components
│   ├── layouts/
│   │   ├── BaseLayout.astro          # Homepage only
│   │   └── ApplicationLayout.astro   # ALL other pages (155 total)
│   ├── pages/
│   │   ├── index.astro               # Homepage
│   │   ├── applications/             # Application hub pages
│   │   ├── centrifuges/              # Dolphin product pages (DMPX/DMB)
│   │   └── *.astro                   # Legacy flat-URL pages
│   └── styles/
├── docs/                # IMAGE_GAPS.md and other docs
├── SEO-AND-STANDARDS.md # Quality standards (read before ANY page work)
└── astro.config.mjs
```

## Commands

| Command | Action |
|:--------|:-------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |

## Key Rules

- **155 pages total** — 1 homepage (BaseLayout) + 154 pages (ApplicationLayout)
- **All legacy URLs preserved flat** — no path prefixes on legacy slugs
- **Build must pass with 0 errors** before deploying
- See `SEO-AND-STANDARDS.md` for full quality checklist
- See `../CLAUDE.md` for the 11 critical rules

## Brand

- **Phone:** (248) 522-2573
- **Email:** sales@dolphincentrifuge.com
- **Address:** 24248 Gibson Dr, Warren MI 48089
