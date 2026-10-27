# jularthus.fr

Portfolio of Jules-Arthus Klein. Static, hand-made, no build step.

```
public/   the site, and the only folder nginx serves
ops/      nginx vhost and the deploy script
tools/    preview, browser tests, Lighthouse, generated images
```

## Work on it

```sh
cd tools
npm run serve        # preview on http://127.0.0.1:8787, unknown URLs show the 404 page like nginx does
                     # (from another machine: ssh -L 8787:localhost:8787)
npm run check        # screenshots + console errors, horizontal scroll, em dashes, FR/EN, reduced motion, no-JS
npm run interact     # terminal, command palette, skill sheet, language switch
npm run csp          # page under the production Content-Security-Policy
npm run lighthouse   # report in tools/reports/lighthouse.html (needs npm run serve)
npm run render       # regenerate public/og.jpg and public/apple-touch-icon.png from tools/render/
```

First time on a machine: `cd tools && npm install && npx playwright install chromium`,
then `git config core.hooksPath tools/hooks` at the repo root.

Results land in `tools/out/` (ignored by git).

**Cache busting.** nginx lets browsers keep `/assets/` for 7 days, so CSS/JS are
linked with a content hash (`site.css?v=3f9a1c2b`). The pre-commit hook rewrites
those hashes in `public/index.html` whenever a stylesheet or script is committed;
`npm run stamp` does it by hand.

**House rules.** No em dashes in visible text (the check enforces it). Any new
visible string needs its English version in `public/assets/js/data.js`.

## Deploy

The live folder `/var/www/jularthus.fr` is a git checkout of this repo.

```sh
sudo ops/deploy.sh        # first time: ownership, site, nginx config + gzip
ops/deploy.sh             # put the v2 branch live (no password once owned)
ops/deploy.sh v1          # roll back to any branch, tag or commit
```

Unknown URLs get `public/404.html` (status 404), set up in the nginx vhost.

With sudo, the script also applies `ops/nginx/jularthus.fr.conf` when it changed
(backup in `/etc/nginx/backup/`, `nginx -t`, reload, automatic restore on failure).

## Versions

- `v1`: the site as it was live on 2026-10-26
- `v2`: current branch
- `v2-checkpoint`: before the new hero numbers
