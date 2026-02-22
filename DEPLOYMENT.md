# Deployment Guide - Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Supabase Project**: Your Supabase project should be set up and running

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Select your repository

### 3. Configure Project Settings

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `frontend` (if your Next.js app is in a subdirectory)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

### 4. Environment Variables

Add these environment variables in Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find Supabase credentials:**
- Go to your Supabase project dashboard
- Navigate to **Settings** → **API**
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Post-Deployment Checklist

### ✅ Database Setup

Make sure your Supabase database has these tables:

1. **`medications`** table:
   ```sql
   CREATE TABLE medications (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     name TEXT NOT NULL,
     dosage TEXT NOT NULL,
     deadline_time TEXT NOT NULL,
     notes TEXT,
     caretaker_email TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **`medication_logs`** table:
   ```sql
   CREATE TABLE medication_logs (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     medication_id UUID NOT NULL REFERENCES medications(id),
     user_id UUID NOT NULL REFERENCES auth.users(id),
     taken_date DATE NOT NULL,
     status TEXT DEFAULT 'taken',
     photo_url TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(medication_id, taken_date)
   );
   ```

3. **Storage bucket** `medication-proofs`:
   - Go to Supabase Dashboard → Storage
   - Create bucket named `medication-proofs`
   - Set to **Public** (or configure RLS policies)

### ✅ Row Level Security (RLS)

Enable RLS on your tables and create policies:

```sql
-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Policies for medications
CREATE POLICY "Users can view their own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for medication_logs
CREATE POLICY "Users can view their own logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### ✅ Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are fixed: `npm run build` locally

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase project is active (not paused)
- Ensure RLS policies allow access

### Images/Storage Not Loading

- Verify `medication-proofs` bucket exists in Supabase
- Check bucket is set to **Public** or has proper RLS policies
- Verify CORS settings in Supabase Storage

## Quick Deploy Commands

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Production deploy
vercel --prod
```

## Continuous Deployment

Vercel automatically deploys when you push to your main branch. Each push creates a new deployment preview.

- **Production**: Deploys from `main` branch
- **Preview**: Deploys from other branches/PRs

## Monitoring

- **Analytics**: Enable in Vercel dashboard (Project Settings → Analytics)
- **Logs**: View in Vercel dashboard → Deployments → Click deployment → Logs
- **Errors**: Check Vercel dashboard → Functions → Logs
