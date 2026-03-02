# Supplied · Linear Gantt Dashboard

A self-hosted, auto-refreshing product roadmap dashboard pulled live from Linear.

**Live URL:** `https://<your-org>.github.io/<repo-name>/`

---

## Setup (5 minutes)

### 1. Create the GitHub repo

Create a new **public** repo in your GitHub org (e.g. `supplied-eu/gantt`).  
Push this folder to it:

```bash
git init
git remote add origin https://github.com/supplied-eu/gantt.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

### 2. Add your Linear API key as a GitHub Secret

1. Go to [linear.app/settings/api](https://linear.app/settings/api)
2. Create a new **Personal API key** (read-only scope is fine)
3. In your GitHub repo → **Settings → Secrets and variables → Actions**
4. Click **New repository secret**
   - Name: `LINEAR_API_KEY`
   - Value: your Linear key (starts with `lin_api_...`)

---

### 3. Enable GitHub Pages

1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. Click **Save**

Your dashboard will be live at:
`https://<org>.github.io/<repo>/`

---

### 4. Trigger the first build

Go to **Actions → Refresh Gantt Dashboard → Run workflow**

After ~30 seconds, your `index.html` will be committed and the site will go live.

---

## How it works

```
On manual trigger (or scheduled if you add cron):
  scripts/fetch-linear.js   → fetches all data from Linear GraphQL API
                               writes gantt-data.json
  scripts/build-html.js     → reads gantt-data.json
                               writes index.html (self-contained)
  git commit & push          → GitHub Pages serves the updated file
```

No external services. No API keys exposed in the browser. Pure static HTML.

---

## Manual refresh

Go to **Actions → Refresh Gantt Dashboard → Run workflow** any time.

Or run locally:
```bash
LINEAR_API_KEY=lin_api_xxx npm run refresh
open index.html
```

---

## Customise refresh schedule

Edit `.github/workflows/refresh.yml` and change the cron:

| Schedule | Cron |
|---|---|
| Daily 7am Amsterdam | `0 5 * * *` |
| Twice daily | `0 5,15 * * *` |
| Every hour | `0 * * * *` |
| Weekdays only | `0 5 * * 1-5` |

---

## Share the URL

Send the GitHub Pages URL to your team. No login required.  
The page auto-refreshes in the browser and always shows the last build timestamp.
