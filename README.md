# parthcreations

React + Vite portfolio, styled after a Photoshop workspace. Every artwork has
its own URL. Copy is editable through an admin panel at `/admin`.

## Run locally

```
npm install
npm run dev
```

Your images live in `public/assets/`. Open http://localhost:5173.

## Where the content lives

| File | Holds | Editable at /admin |
| --- | --- | --- |
| `src/site.json` | Header, About, email, socials | Site |
| `src/projects.json` | Project order, titles, copy, covers | Projects |
| `src/content.json` | Group headings, notes, which files go where | Captions |
| `src/assets.json` | Image dimensions (from the extractor) | no — generated |

`?edit` on any URL stamps thumbnails with their filenames, for matching
captions to the right image.

## Deploying to GitHub + Netlify

**1. Put it on GitHub.** In the project folder:

```
git init
git add .
git commit -m "Portfolio"
git branch -M main
```

Create an empty repo at github.com (no README, no .gitignore), then:

```
git remote add origin https://github.com/YOURNAME/portfolio.git
git push -u origin main
```

**2. Connect Netlify.** app.netlify.com → Add new site → Import an existing
project → GitHub → pick the repo. It reads `netlify.toml`, so the build
command and publish directory are already set. Deploy.

From here every `git push` redeploys automatically.

**3. Turn on the admin panel.** In your Netlify site settings:

- **Identity** → Enable Identity
- **Identity → Registration** → set to **Invite only** (otherwise anyone can
  sign up and edit your site)
- **Identity → Services → Git Gateway** → Enable
- **Identity → Invite users** → invite your own email, then accept the emailed
  invite and set a password

Now visit `yoursite.netlify.app/admin/`, log in, and edit. Saving commits to
GitHub, which triggers a rebuild — live in under a minute.

### Editing the CMS locally

```
npx decap-server        # in a second terminal
npm run dev
```

Then http://localhost:5173/admin/ — no login, writes straight to your files.

## Image sizes

Source exports are large. To compress:

```
python3 optimize_images.py --quality 90 --max 2800
```

Converts to WebP, caps dimensions, moves originals to `_originals/`, and
rewrites the data files. Check the tradeoff first with
`python3 compare_quality.py`.

## After unzipping a new copy of the source

Overwriting `src/` can reintroduce old image filenames. Run:

```
python3 sync_assets.py
```

It rewrites every reference to match what's actually in `public/assets`.

## Still to do

- Replace `REPLACE@EMAIL.COM` in `src/site.json` (or in /admin → Site)
- Add Brett Conti stills to `public/assets/brett-conti/` and list them under
  Captions
