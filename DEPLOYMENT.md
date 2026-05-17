# Deployment Guide — Easy PDF Signature

This guide walks you through deploying the app to Vercel using GitHub Actions.

## Prerequisites

- A GitHub account
- A Vercel account (free tier works)
- Git installed locally

## Step 1: Push to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/easy-pdf-signature.git
git push -u origin main
```

## Step 2: Create a Vercel Account and Project

1. Go to [vercel.com](https://vercel.com) and sign up (GitHub login recommended)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite. Keep the defaults:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click "Deploy" for the initial deployment

## Step 3: Get Vercel Credentials

You need three values from Vercel for GitHub Actions:

### VERCEL_TOKEN
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it `github-actions`
4. Copy the token

### VERCEL_ORG_ID
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your profile picture → "Settings"
3. Under "General", find your "Team ID" (or "User ID" for personal accounts)
4. Copy this value

### VERCEL_PROJECT_ID
1. In Vercel dashboard, click on your project
2. Go to "Settings" → "General"
3. Find "Project ID"
4. Copy this value

## Step 4: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" for each of the following:

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | Token from Step 3 |
| `VERCEL_ORG_ID` | Org/User ID from Step 3 |
| `VERCEL_PROJECT_ID` | Project ID from Step 3 |

## Step 5: Push and Deploy

The GitHub Actions workflow is already configured in `.github/workflows/deploy.yml`. It will:

- **On every push to `main`**: Run tests, then deploy to production
- **On every pull request to `main`**: Run tests, then deploy a preview

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

## Step 6: Verify

1. Go to your GitHub repository → "Actions" tab
2. You should see the workflow running
3. Once complete, your app will be live at `https://YOUR-PROJECT.vercel.app`

## Updating the App

After the initial setup, every push to `main` automatically:
1. Runs all Playwright tests
2. Builds the app
3. Deploys to Vercel production

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main
```

## Troubleshooting

- **Tests fail**: Check the Actions tab for error details. Fix issues and push again.
- **Build fails**: Run `npm run build` locally to debug.
- **Deployment fails**: Verify your Vercel secrets are correct in GitHub Settings.
