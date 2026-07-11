# Chat notes — 2026-07-09

## What this project is
`digitaOcean` is a personal project dashboard/landing page served at `pavellevitin.co.il`.

- **Homepage** (`app/page.tsx`): dark-themed grid of cards linking to other projects, read from `projects.json`. Currently lists: HBS Studio, payRase, ternerClock.
- **Admin page** (`app/admin/page.tsx`): password-protected via `X-Admin-Password` header checked against `ADMIN_PASSWORD` in `.env`. Lets you add projects or enable/disable existing ones.
- **API routes** (`app/api/projects/...`): GET/POST/PATCH backing the admin UI, persisted to `projects.json` on disk.
- **nginx.conf**: sits in front, presumably reverse-proxying `pavellevitin.co.il` and routing subpaths (`/hbs`, `/paycheck`, `/ternerclock`) to the other projects.

## Two implementations coexist
- The Next.js app (`app/` dir) — current, served on port 3001 (`next dev/start -p 3001`).
- `server.js` — an older/parallel plain Express server doing the same job (serves `public/` static files + `/api/projects`), also on port 3001.

Not yet determined which one is actually live in production / fronted by nginx — worth checking `nginx.conf` and whatever process manager (pm2?) is running.

## Bug found (not fixed yet)
In `server.js`, the `PATCH /api/projects/:id` handler (around lines 62-74) has a dead `if` block:

```js
if (typeof req.body.enabled === 'boolean') {
}
```

It checks for `enabled` but never applies it to `project.enabled` — so toggling a project's enabled/disabled state would silently fail through this Express server. Need to check whether `app/api/projects/[id]/route.ts` (the Next.js equivalent) has the same bug.

## Open follow-up
- Check `app/api/projects/[id]/route.ts` for the same missing-enabled-toggle bug.
- Decide whether `server.js` is legacy/dead code that can be removed, or if it's still in active use.
