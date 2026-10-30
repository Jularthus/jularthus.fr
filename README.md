# jularthus.fr

Source of [jularthus.fr](https://jularthus.fr), the portfolio of Jules-Arthus Klein.

It is a single page in French and English, plus a 404 page. Everything is static, with no
framework and no build step: hand-written HTML, CSS and JavaScript in `public/`, served by
nginx in a Docker container.

## What's on the page

- **Hero**: a WebGL "Yves Klein blue" pigment field (`pigment.js`, one fragment shader, no
  library) that the pointer smears around, a typed `jularthus.fr` and counters that count up.
- **Terminal**: it replays facts about the self-hosted infrastructure, then you can type in it
  (`help`, `ls`, `cat`, `neofetch`, `open`, `lang`…, with tab completion).
- **Project gallery**: a horizontal gallery that is pinned while you scroll on desktop, with live
  previews. The beer tracker card shows a live counter (only in production, since it needs the
  `/live/beers` proxy). A card can be linked directly with `#p-<id>`, such as `#p-beers`.
- **Timeline, skills and languages**: each skill opens a sheet (a native `<dialog>`) explaining
  how it was learned. Sheets can be linked directly with `#skill-<name>`.
- **Command palette**: `Ctrl/⌘ K` or `/` searches sections, projects, skills and actions.
- **404 page**: shows the path that was requested and the pigment field. Mew hides on it: it is
  nearly invisible until the cursor gets close, then it wanders and teleports when clicked.

Each feature degrades on its own. Without GSAP, reveals are plain. With
`prefers-reduced-motion`, the page stays still. Without JavaScript, the page is the complete
French HTML.

## Layout

```
public/                  the whole site, copied as-is into the image
  index.html             the page, French content (what search engines see)
  404.html               served for any unknown URL, so it uses absolute paths
  assets/js/boot.js      runs in <head>: picks the language, flags JS / reduced motion
  assets/js/data.js      English strings, skill sheets, UI strings (SITE_DATA)
  assets/js/site.js      all the interactions on the home page
  assets/js/pigment.js   the WebGL hero, shared with the 404 page
  assets/js/404.js       the 404 page
  assets/vendor/         GSAP, ScrollTrigger, SplitText 3.15, Lenis (vendored, not from a CDN)
  assets/fonts/          self-hosted woff2 subsets
  .well-known/security.txt
ops/nginx/site.conf      nginx inside the container: headers, CSP, 404, cache, gzip
ops/nginx/jularthus.fr.conf   host nginx: TLS and proxying to the container
ops/migrate-to-docker.sh one-off move from /var/www to the container
tools/                   local preview, browser tests, image rendering, git hook
```

## Languages

The French text lives in the HTML, so the page is complete without JavaScript. The English text
lives in `data.js`, keyed by the `data-i18n` attributes in the HTML (`data-i18n-html` and
`data-i18n-attr` work the same way for markup and attributes).

`boot.js` picks the language before the first paint, in this order: `?lang=fr|en` in the URL,
then the choice saved in `localStorage`, then the browser language. When the language is
English, the page stays hidden until it is translated, so there is no flash of French. A CSS
failsafe shows the page anyway if translation never finishes.

To add text, write the French in `index.html` with a `data-i18n` key and add the same key to
`EN` in `data.js`.

## Running it locally

Requirements: Python 3 for the preview. Node and Docker are optional.

```sh
make dev      # http://127.0.0.1:8787, unknown paths get 404.html with a real 404 status
```

`make` alone lists every target.

To test the production setup locally, run it in the container:

```sh
cp .env.example .env
make up       # http://127.0.0.1:8380 (PORT in .env)
make logs
make down
```

## Checks

Run once to install Playwright with Chromium and turn on the git hook:

```sh
make setup
```

Then, while `make dev` is running:

```sh
make check                              # against the dev server
make check URL=http://127.0.0.1:8380/   # against the container
```

`tools/check.js` loads the page as desktop light and dark, tablet, mobile, reduced motion and
no-JS, and saves screenshots to `tools/out/`. It prints a JSON report with:

- console and page errors
- horizontal scroll and elements wider than the viewport
- em dashes in visible text, in French and English (house rule: there should be none)
- French strings left over after switching to English
- differences between switching language at runtime and loading the page in that language
- the 404 page in both languages, with reduced motion, without JS and on mobile
- `security.txt`: it must be served and its `Expires` date must be at least 30 days away

The report doesn't set an exit code, so read it after each run.

Other scripts in `tools/` cover single features. All of them expect `make dev` to be running:

| Script | What it does |
| --- | --- |
| `csp.js` | Loads the page under the production CSP and lists any violations |
| `term.js` | Drives the terminal, the palette, a skill sheet and the language switch |
| `sections.js` | Screenshots each section, with optional viewport, color scheme and section list |
| `duo-shots.js` | Screenshots the ACDC / YAKA block once its animations have played |
| `lost-*.js` | 404 page: Mew's perches, wandering, teleporting, reduced motion |
| `shots.js` | Screenshots the live sub-sites used as gallery previews |
| `render.js` | Renders `og.jpg` and `apple-touch-icon.png` from `tools/render/*.html` |

`npm run lighthouse` (in `tools/`) writes a Lighthouse report to `tools/reports/`.

## Cache busting

nginx lets browsers cache `/assets/` for 7 days, so the pages load CSS and JS as
`file.css?v=<hash>`. `tools/stamp-assets.py` rewrites those hashes from the files' content.

The pre-commit hook (`tools/hooks/pre-commit`, enabled by `make setup`) runs it whenever a
commit includes a file in `public/assets/css/` or `public/assets/js/`, then stages the updated
pages. If a page has unstaged changes, the hook stops instead of committing them by accident.
You can also run `python3 tools/stamp-assets.py` by hand at any time.

Images and fonts don't get a hash. If you replace one, give it a new name.

## Security

`ops/nginx/site.conf` sets a strict Content Security Policy: everything comes from `'self'`,
with no inline scripts and no third-party requests (fonts and libraries are self-hosted). New
code has to follow the same rules. Run `tools/csp.js` to check.

The site also sets HSTS, `X-Frame-Options: DENY`, `nosniff`, a restrictive
`Permissions-Policy` and `Cross-Origin-Opener-Policy`. Hidden files (except `/.well-known/`)
and backup files (`.bak`, `.swp`, …) return a 404.

The email address never appears in the HTML. `site.js` puts it together at runtime, which
keeps it away from scrapers.

## Deployment

In production, host nginx terminates TLS and proxies to the container, which only listens on
`127.0.0.1:8380`:

```
internet → host nginx (TLS, ops/nginx/jularthus.fr.conf) → container nginx :8080 (ops/nginx/site.conf) → public/
```

Everything that belongs to the site (headers, 404, caching, gzip) is set in the container's
config, so `make up` on a laptop behaves like production. The host vhost adds three things:

- a maintenance page through `offline.conf` when the container is down (502 to 504)
- `/live/beers`, a same-origin proxy to the beer tracker's API that feeds the gallery's live
  counter, so the page needs no CORS and no CSP exception
- `/files/`, a phishing-awareness page served from `/var/www/maintenance`, with its own CSP

To deploy on the server:

```sh
make deploy   # git pull, then rebuild and restart the container
```

The container runs `nginx-unprivileged` (non-root, port 8080) and has a healthcheck on
`/health`. Only `public/` and `site.conf` go into the image (see `.dockerignore`).

`make backup` adds a dated git bundle of the whole repo to `data/backups/`. It never deletes
old bundles.

`ops/migrate-to-docker.sh` was the one-off switch from static files to the container. It
checks the result and restores the previous vhost if anything fails.

## Maintenance

- `security.txt` expires on 2027-10-01. `make check` warns 30 days before that date.
- The phishing page's CSP pins the hash of its inline script. If you change that script,
  recompute the `sha256` in `ops/nginx/jularthus.fr.conf`.
- No em dashes in visible text, in either language.
