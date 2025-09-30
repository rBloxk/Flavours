# Flavours Platform - Deployment Guide

This guide covers deploying the Flavours platform using GitHub Actions CI/CD pipeline.

## Deployment Options

### 1. Vercel (Recommended for Next.js)

Vercel offers the best integration with Next.js applications.

#### Setup Steps:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project:**
   ```bash
   vercel
   ```

4. **Set GitHub secrets in your repository:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     ```
     VERCEL_TOKEN=your-vercel-token
     VERCEL_ORG_ID=your-org-id
     VERCEL_PROJECT_ID=your-project-id
     NEXT_PUBLIC_SUPABASE_URL=https://yrdwgiyfybnshhkznbaj.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

5. **Environment Variables in Vercel Dashboard:**
   - Go to your Vercel dashboard → Project → Settings → Environment Variables
   - Add the same environment variables

### 2. Netlify Deployment

#### Setup Steps:

1. **Create Netlify site:**
   - Go to Netlify dashboard and create a new site
   - Copy your Site ID

2. **Generate Auth Token:**
   - Go to Netlify dashboard → User Settings → Applications → Personal access tokens
   - Generate a new token

3. **Set GitHub secrets:**
   ```
   NETLIFY_AUTH_TOKEN=your-netlify-token
   NETLIFY_SITE_ID=your-site-id
   NEXT_PUBLIC_SUPABASE_URL=https://yrdwgiyfybnshhkznbaj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Update next.config.js for Netlify:**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     distDir: 'out',
     trailingSlash: true,
     eslint: {
       ignoreDuringBuilds: true,
     },
     images: { unoptimized: true },
   }
   ```

## GitHub Actions Workflows

### CI/CD Pipeline (.github/workflows/ci.yml)
- Runs on push to `main` and `develop` branches
- Runs tests, linting, and type checking
- Deploys to staging (develop) and production (main)

### Netlify Deployment (.github/workflows/netlify-deploy.yml)
- Alternative deployment option for Netlify
- Builds and deploys to Netlify automatically

## Branch Strategy

- **main**: Production deployment
- **develop**: Staging deployment
- **feature branches**: Testing and development

## Environment Variables

### Required Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://yrdwgiyfybnshhkznbaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_WS_URL=https://your-backend-url.com
```

## Deployment Commands

### Local Development:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Deploy via GitHub:
1. Push to `main` branch for production
2. Push to `develop` branch for staging
3. GitHub Actions will automatically build and deploy

## Troubleshooting

### Build Failures:
- Check that all environment variables are set
- Ensure all dependencies are properly installed
- Verify TypeScript configuration

### Deployment Issues:
- Check GitHub Actions logs
- Verify deployment service credentials
- Ensure proper permissions for secrets

## Security Considerations

- Never commit sensitive environment variables
- Use GitHub Secrets for all sensitive data
- Enable HTTPS redirects in production
- Implement proper CSP headers

## Monitoring

### Recommended Tools:
- Vercel Analytics (if using Vercel)
- Sentry for error tracking
- Google Analytics for user analytics
- Lighthouse for performance monitoring
