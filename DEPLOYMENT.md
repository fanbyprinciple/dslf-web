# GitHub Pages Deployment Guide

## Quick Start (5 minutes)

### Step 1: Initialize Git Repository

Open terminal in the `dslf-web` folder and run:

```bash
git init
git add .
git commit -m "Initial commit: DSLF web app"
```

### Step 2: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `dslf-web`
3. Make it **Public** (required for free GitHub Pages)
4. Click "Create repository"

### Step 3: Push Code to GitHub

Copy the commands from GitHub and run them. They'll look like:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dslf-web.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 4: Enable GitHub Pages

1. Go to your repository: `github.com/YOUR_USERNAME/dslf-web`
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source" select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

Wait 1-2 minutes for GitHub to build and deploy.

### Step 5: Visit Your App

Your app will be live at:
```
https://YOUR_USERNAME.github.io/dslf-web/
```

Share this link with anyone!

---

## Making Updates

After you make changes locally:

```bash
git add .
git commit -m "Your change description"
git push
```

GitHub will automatically rebuild and deploy. Changes go live in ~1-2 minutes.

## Manual Deployment with gh-pages Package

If you want one-command deployment:

```bash
npm install --save-dev gh-pages
npm run deploy
```

This automatically builds and pushes to the `gh-pages` branch.

---

## Troubleshooting

### App is blank/404

- Make sure deployment is complete (check Actions tab)
- Clear browser cache and reload
- Verify the URL is correct (with `/dslf-web/` at the end)

### Changes aren't showing up

- Force refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check Actions tab to see if deployment is in progress

### Data isn't persisting

That's expected! Each time you deploy, your local storage might be cleared. Make sure to manually export data if needed.

---

## Custom Domain (Optional)

If you own a domain, you can use it instead:

1. In Settings → Pages, add your domain under "Custom domain"
2. Update your domain registrar's DNS settings (GitHub provides instructions)

---

## Tips

- Make it more personal by editing the title in `index.html`
- Customize colors in `src/constants.ts`
- Add a favicon by placing an icon in the root directory
- Share the link with your partner to track together!

Happy tracking! 💪
