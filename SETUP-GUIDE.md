# ReelRadar — One-Time Setup Guide (30 minutes, then fully automatic forever)

You will do 4 things, once. After that the site updates itself every Friday with zero work from you.

---

## Step 1 — Create a free GitHub account (5 min)

1. Go to **github.com** and click **Sign up**
2. Use your email (vikramksharma87@gmail.com works fine), pick a username — this username becomes part of your website address, so something like `reelradar-vikram` or just `vikramwuvden` is good
3. Verify your email when GitHub sends the confirmation

---

## Step 2 — Get a free TMDB API key (5 min)

TMDB is the free movie database that powers the scan.

1. Go to **themoviedb.org** and click **Join TMDB** → sign up free
2. After logging in, go to **Settings → API** (or visit themoviedb.org/settings/api)
3. Click **Create** → choose **Developer**
4. Fill the short form:
   - Type of use: **Website**
   - Application name: **ReelRadar**
   - Application URL: you can put `https://github.com` for now
   - Application summary: "A free weekly movie and OTT release tracker"
5. Accept terms → you'll see your **API Key (v3 auth)** — a long string of letters and numbers
6. **Copy it and keep it handy** — you'll paste it in Step 3

---

## Step 3 — Upload the website to GitHub (15 min)

### 3a. Create the repository

1. On GitHub, click the **+** icon (top right) → **New repository**
2. Repository name: **reelradar**
3. Keep it **Public** (required for free hosting)
4. Click **Create repository**

### 3b. Upload the files

1. On the new repository page, click **uploading an existing file** (link in the middle of the page)
2. Unzip the **reelradar-site.zip** file I gave you on your computer
3. Drag ALL the unzipped files and folders into the upload box:
   - `index.html`
   - `data.json`
   - `robots.txt`
   - `sitemap.xml`
   - `scripts` folder
   - `.github` folder ← **important: if this folder doesn't drag properly (it's hidden), see the note below**
4. Click **Commit changes**

> **Note about the .github folder:** On Windows/Mac, folders starting with a dot are hidden. If you can't see or drag it: in your repository click **Add file → Create new file**, type the filename as `.github/workflows/update.yml` (typing the slashes creates the folders), then copy-paste the contents of the update.yml file into the editor and click **Commit changes**.

### 3c. Add your TMDB key as a secret

1. In your repository, click **Settings** (top menu) → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `TMDB_API_KEY` (exactly like this, all caps)
4. Secret: paste the API key you copied in Step 2
5. Click **Add secret**

### 3d. Turn on the free website hosting

1. Still in **Settings**, click **Pages** (left sidebar)
2. Under "Source" choose **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)** → click **Save**
4. Wait 2–3 minutes, refresh the page — you'll see your live URL:
   **`https://YOUR-USERNAME.github.io/reelradar/`**

### 3e. Run the first scan

1. Click the **Actions** tab (top menu)
2. Click **Weekly ReelRadar Update** in the left sidebar
3. Click **Run workflow** → green **Run workflow** button
4. Wait ~1 minute, refresh — when you see a green tick, the scan is done
5. Open your website URL — it now shows this week's top releases! 🎬

From now on this happens automatically every Friday at 9 AM IST.

### 3f. Fix the website address in two files (2 min)

The files contain a placeholder `YOUR-USERNAME` that needs your real username:

1. In your repository, open **index.html** → click the pencil icon (edit) → find `YOUR-USERNAME` and replace with your GitHub username → Commit changes
2. Do the same in **robots.txt** and **sitemap.xml**

---

## Step 4 — Get on Google search (5 min, then wait 1–2 weeks)

1. Go to **search.google.com/search-console**
2. Sign in with your Google account
3. Click **Add property** → choose **URL prefix** → paste your full site URL: `https://YOUR-USERNAME.github.io/reelradar/`
4. Verification: choose the **HTML tag** method → copy the meta tag it shows you → edit your `index.html` on GitHub and paste that tag just below the `<head>` line → Commit → back in Search Console click **Verify**
5. Once verified, go to **Sitemaps** (left sidebar) → enter `sitemap.xml` → **Submit**

Google typically starts showing new sites in search results within 1–2 weeks. Searches like "ReelRadar movies" will find you first; broader searches take longer as the site builds history.

---

## That's it — what happens automatically from now on

- ✅ Every Friday 9 AM IST: the scan runs, fetches the top 5 theatre + top 10 OTT releases with ratings, and updates your live site
- ✅ Anyone in the world can open the site — no login, no payment
- ✅ Google re-crawls it weekly (the sitemap tells it to)
- ✅ Costs you ₹0 forever (GitHub Pages and TMDB free tiers are permanent, not trials)

## If something breaks

- Site shows "First scan has not run yet" → run the workflow manually (Step 3e)
- Workflow shows a red cross → click into it and check if the TMDB_API_KEY secret was added correctly (Step 3c)
- Stuck anywhere → take a screenshot and ask me, I'll debug it with you
