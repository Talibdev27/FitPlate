# Vercel Deployment Guide

## Quick Fix for DEPLOYMENT_NOT_FOUND Error

### Common Causes
1. **Project not linked to Vercel** - Most common issue
2. **Missing `vercel.json` configuration** - Now fixed ✅
3. **Wrong deployment URL being accessed**
4. **Build failures preventing deployment**
5. **Using Vercel CLI without authentication**

## Step-by-Step Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository: `Talibdev27/FitPlate`
   - Select the **root directory** as `frontend` (not the repo root)

3. **Configure Build Settings**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables**
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - This is where your backend API is hosted (Railway, Render, etc.)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

3. **Link Project (First Time Only)**
   ```bash
   vercel
   ```
   - Follow prompts to:
     - Login to Vercel
     - Link to existing project or create new
     - Confirm settings

4. **Deploy**
   ```bash
   # Production deployment
   vercel --prod
   
   # Preview deployment
   vercel
   ```

### Option 3: Automatic Deployments via GitHub

1. **Connect Repository in Vercel Dashboard**
   - Already done if you imported via dashboard

2. **Automatic Deploys**
   - Every push to `main` → Production deployment
   - Every PR → Preview deployment

3. **No CLI needed** - Just push to GitHub!

## Troubleshooting DEPLOYMENT_NOT_FOUND

### Error: "Deployment not found"
**Cause**: Trying to access a deployment that doesn't exist or was deleted

**Solutions**:
1. Check Vercel dashboard for active deployments
2. Verify the URL you're accessing matches a deployment
3. Redeploy if deployment was deleted:
   ```bash
   cd frontend
   vercel --prod
   ```

### Error: "Project not found"
**Cause**: Project not linked or wrong project ID

**Solutions**:
1. Re-link project:
   ```bash
   cd frontend
   vercel link
   ```
2. Or create new project in dashboard

### Build Failures
**Common Issues**:
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Check**:
```bash
# Test build locally first
cd frontend
npm run build
```

### CORS Issues with Backend
**Solution**: Update backend CORS to include Vercel URL:
```typescript
// In backend/src/server.ts
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-project.vercel.app', // Add your Vercel URL
  // Vercel preview deployments are auto-allowed via regex
];
```

## Environment Variables

### Required for Production
- `VITE_API_URL`: Your backend API URL (e.g., `https://api.yourdomain.com/api`)

### Setting in Vercel Dashboard
1. Go to Project Settings → Environment Variables
2. Add variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL
   - **Environment**: Production, Preview, Development (select all)

### Important Notes
- Vite requires `VITE_` prefix for environment variables
- Changes to env vars require redeployment
- Preview deployments use Preview env vars
- Production deployments use Production env vars

## Project Structure for Vercel

```
food-delivery-platform/
├── frontend/              ← Vercel deploys from here
│   ├── vercel.json       ← Vercel configuration
│   ├── package.json
│   ├── vite.config.ts
│   ├── dist/             ← Build output (auto-generated)
│   └── src/
└── backend/              ← Deploy separately (Railway, Render, etc.)
```

## Next Steps After Deployment

1. **Update Backend CORS**
   - Add Vercel URL to `FRONTEND_URL` in backend env vars
   - Or add to allowed origins array

2. **Test Deployment**
   - Visit your Vercel URL
   - Test authentication flow
   - Verify API connections

3. **Custom Domain (Optional)**
   - In Vercel dashboard: Settings → Domains
   - Add your domain
   - Update DNS records as instructed

4. **Monitor Deployments**
   - Check Vercel dashboard for build logs
   - Monitor function logs for runtime errors

## Common Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm [deployment-url]

# Check project status
vercel inspect
```

