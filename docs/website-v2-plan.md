# Website v2 plan

_Written 3 Oct 2026. A high-level plan for rebuilding the club website (`apps/website`) as an Astro app (`apps/website-v2`) inside a pnpm monorepo._

**Status:** the pnpm workspace and Prettier are set up, and `apps/website-v2` is scaffolded with Astro's starter page. The CI workflow (phase 0) and the rest of phase 1 are still to do.

## Why rebuild

The current site is the "GYMSTER" HTML template, edited by hand: five pages, each with its own copy of the header, footer and contact details.

| Today                                                                                                                      | With v2                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Header, footer, email and phone copied into every page. One change means editing 5 files.                                  | One `Header` and one `Footer` component; contact details, coaches, sponsors and schedule each live in a single data file. |
| URLs end in `.php` and `.html` (`/about.html`, `/schedule.php`).                                                           | Clean URLs: `/about/`, `/schedule/`. Old URLs redirect.                                                                   |
| The homepage loads ~15 MB of coach photos (six 2–3.5 MB PNGs).                                                             | Images resized and converted to WebP/AVIF at build time: a few hundred KB in total.                                       |
| jQuery, Owl Carousel, Waypoints, CounterUp, Easing, Flaticon and Font Awesome are loaded from the template, mostly unused. | Only what's used, installed from npm and bundled. Most pages ship little or no JavaScript.                                |
| No checks: broken links, typos in markup and missing images are found by visitors.                                         | TypeScript and `astro check` at build time; CI blocks a broken build from being released.                                 |
| Libraries pinned to whatever the template shipped with (Bootstrap 5.0.0, jQuery 3.4.1).                                    | Dependencies managed with pnpm and upgraded deliberately.                                                                 |
| Template leftovers live alongside real pages (unused pages, a `scss/` folder, demo assets).                                | Only what the site uses is in the app.                                                                                    |

Kept from today: static files on the cPanel host, deployed over FTPS by a GitHub release. Astro builds every page to plain HTML, so link previews (WhatsApp, Google) keep each page's own title and description.

## Target layout

```
pirates-website/
├── apps/
│   ├── website/        ← current site, retired after cutover
│   └── website-v2/     ← new Astro app
├── docs/
├── .github/workflows/
├── package.json        ← root scripts: format, lint, build
├── pnpm-workspace.yaml
├── .prettierrc / .prettierignore
└── .nvmrc              ← Node 22 (LTS)
```

Inside `apps/website-v2/`:

```
src/
├── layouts/BaseLayout.astro   ← <head> (title, description, Open Graph), header, footer
├── components/                ← Header, Footer, ExternalLink, CoachCard, ScheduleCard, SponsorCarousel, …
├── pages/                     ← index, about, schedule, gallery, contact  →  /, /about/, …
├── data/                      ← site.ts (email, phone, socials, form links), coaches.ts, schedule.ts, sponsors.ts, feeds.ts
├── assets/                    ← images processed at build time
└── styles/
public/                        ← copied as-is: favicon, contact.php, ics-to-json.php, .htaccess
```

## Phases

Each phase is one or more pull requests, and none of them changes the live site until phase 6.

### 0. Monorepo tooling

- pnpm workspace: `pnpm-workspace.yaml` (`apps/*`), root `package.json` with `packageManager: pnpm@10`, `.nvmrc` with Node 22.
- Prettier for the whole repo, with `prettier-plugin-astro`, `pnpm format` and `pnpm format:check` scripts, and a `.gitignore` for `node_modules/` and `dist/`.
- **Prettier formats the whole repo, including the old app.** Its formatted files now use LF line endings instead of Windows ones. It skips the template's third-party code (`lib/`, `scss/`, minified files) and the server-managed `uploads/`.
- A CI workflow on pull requests: install, format check, type check and build.

### 1. Scaffold `apps/website-v2`

- Astro with TypeScript in strict mode and `output: 'static'`. `build.format: 'directory'` builds `about/index.html`, which Apache serves at `/about/` with no rewrite rules.
- Set `site: 'https://helderbergpirates.co.za'` for canonical URLs and the sitemap.
- Build `BaseLayout`, `Header` and `Footer`, with every page as an empty shell. This proves the build and deploy end to end.

### 2. Port the pages

- Port page by page: Home, About, Schedule, Gallery, Contact. Match today's look first and only redesign later, so the stakeholder review compares like with like.
- **Styling:** install Bootstrap 5 from npm and port `style.css`, so the look stays the same. Drop jQuery and the template's plugins. Whether to drop Bootstrap later is a separate decision.
- **Content as data:** coaches, schedule cards, sponsors and contact details move into `src/data/`, so content edits don't touch markup.
- **One component per pattern:** for example, `ExternalLink` always adds the new tab, the ↗ arrow and the "opens in a new tab" text, so no one can forget.

### 3. Interactive parts and server endpoints

| Feature              | v2 approach                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Mobile menu          | Bootstrap's collapse script, or a few lines of TypeScript                                                     |
| Coach bios           | CSS (hover and focus), as today                                                                               |
| Sponsor carousel     | CSS, or Bootstrap's carousel                                                                                  |
| Match calendar       | FullCalendar from npm, loaded only on pages that show it; feed list imported at build time instead of fetched |
| Gallery viewer       | A small lightbox (e.g. PhotoSwipe)                                                                            |
| Contact form         | Still posts to `contact.php` (PHP `mail()`), shipped in `public/`, at an absolute URL (`/contact.php`)        |
| Calendar feeds proxy | `ics-to-json.php` in `public/`, restricted to LeagueLobster URLs (today it fetches any URL)                   |

While moving the two PHP files, fix their known issues: email header injection in `contact.php`, and the open proxy in `ics-to-json.php`.

### 4. SEO, redirects, images, accessibility

- Per-page title and description through `BaseLayout` props, plus a sitemap (`@astrojs/sitemap`), canonical links and `robots.txt`.
- **`public/.htaccess` with 301 redirects** from the old URLs: `/index.php` and `/index.html` → `/`, `/about.html` → `/about/`, `/schedule.php` → `/schedule/`, `/gallery.php` → `/gallery/`, `/contact.html` → `/contact/`. Shared and bookmarked links keep working.
- All images go through Astro's `<Image>`, sized for their slot, with responsive sources.
- Targets: Lighthouse 90+ on mobile, everything usable by keyboard, and nothing below 4.5:1 contrast for body text.

### 5. Preview and stakeholder review

- Deploy v2 to a separate address before it replaces the live site. Options:
  - a cPanel subdomain (e.g. `beta.helderbergpirates.co.za`) with its own FTP folder and its own deploy workflow (PHP works there);
  - a free static host (Cloudflare Pages or Netlify) with a preview link per pull request (no PHP, so the contact form and calendar won't work).
- Review against the live site with the club, then fix any gaps.

### 6. Cutover

- Point the release workflow at `apps/website-v2/dist/` (build first, then upload), and test with a dry run.
- **The first v2 release deletes the old pages.** The deploy deletes files it uploaded before that are no longer in the build (`index.php`, `about.html`, …), so the redirects must be in that same release. `uploads/` stays excluded.
- Check the live site, then delete `apps/website` from the repo.

## Decisions needed

| Decision                       | Options                                                                                                                                                                    | Needed by           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Where gallery photos come from | Images in the repo (optimised, but every change needs a release), keep a PHP gallery reading `uploads/`, or a hosted service (see `docs/photo-gallery-management-plan.md`) | Phase 2             |
| Preview address                | cPanel subdomain or a free static host                                                                                                                                     | Phase 5             |
| Keep Bootstrap after the port  | Keep it, or replace it with the app's own CSS                                                                                                                              | After phase 6       |
| Who edits content, and how     | Data files through pull requests (default), or a headless CMS later                                                                                                        | Before handing over |
| Calendar feeds                 | New LeagueLobster links for this season (the current ones return "Feed is dead")                                                                                           | Any time            |

## Risks

- **The host's support for `.htaccess`.** The redirects need it, and an unsupported rule takes the whole site down with a 500 error. Test a small `.htaccess` on the live server before phase 4.
- **Missing a feature during the port.** Make a page-by-page checklist of today's features before phase 2, and tick it off in review.
- **Old pages lingering at cutover.** A file the old deploys never uploaded isn't deleted by the new deploy. Check the server against the build after cutover.
- **Content edits made outside the repo during the rebuild.** Freeze content changes to `apps/website`, or copy each one into v2 as it lands.
