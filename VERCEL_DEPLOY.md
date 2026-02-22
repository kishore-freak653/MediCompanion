# 🚀 Quick Vercel Deployment Guide

## Before You Deploy

### 1. ✅ Check Build Works Locally

```bash
cd frontend
npm install
npm run build
```

If build succeeds, you're ready!

### 2. ✅ Environment Variables Setup

**IMPORTANT**: Never commit `.env.local` to Git!

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://buxddgmkorflxpimgbsx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4FRu_q687xTGaY6ENzkdFA_oMmIgZng
```

⚠️ **Note**: The Gmail credentials in your `.env.local` are for backend email functionality. If you're not using email features, you can skip them.

### 3. ✅ Deploy Steps

#### Option A: Via Vercel Dashboard (Easiest)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
   - Click **"Add New Project"**
   - Import your repository
   - **Root Directory**: Set to `frontend` (important!)
   - Add environment variables (see step 2)
   - Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from frontend directory)
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No (first time)
# - Project name? medicine-app (or your choice)
# - Root directory? ./ (or frontend if running from parent)
# - Override settings? No

# Production deploy
vercel --prod
```

## ⚙️ Vercel Configuration

### Root Directory Issue

If your Next.js app is in `frontend/` folder, set in Vercel:
- **Settings** → **General** → **Root Directory**: `frontend`

Or create `vercel.json` in project root:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install"
}
```

## 🔍 Post-Deployment Checklist

- [ ] App loads at `https://your-app.vercel.app`
- [ ] Login/Signup works
- [ ] Can add medications
- [ ] Can mark medications as taken
- [ ] Schedule view displays correctly
- [ ] History view loads
- [ ] Photos upload to Supabase Storage
- [ ] No console errors

## 🐛 Common Issues

### Build Fails: "Cannot find module"

**Fix**: Make sure `Root Directory` is set to `frontend` in Vercel settings.

### Environment Variables Not Working

**Fix**: 
- Variables must start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check spelling (case-sensitive)

### Database Connection Error

**Fix**:
- Verify Supabase URL and key are correct
- Check Supabase project is not paused
- Ensure RLS policies are set up

### Images Not Loading

**Fix**:
- Verify `medication-proofs` bucket exists in Supabase Storage
- Set bucket to **Public** or configure RLS
- Check CORS settings

## 📊 Monitoring

- **Logs**: Vercel Dashboard → Deployments → Click deployment → Logs
- **Analytics**: Enable in Project Settings → Analytics
- **Real-time**: Vercel automatically redeploys on git push

## 🔗 Your Deployment URL

After deployment, you'll get:
- **Production**: `https://your-project-name.vercel.app`
- **Preview**: `https://your-project-name-git-branch.vercel.app` (for PRs)

---

**Need Help?** Check full guide in `DEPLOYMENT.md`
