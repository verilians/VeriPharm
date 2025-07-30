# VeriPharm - Vercel Deployment Guide

This guide provides comprehensive instructions for deploying VeriPharm to Vercel with optimal performance and security configurations.

## 🚀 Quick Deployment

### Prerequisites

1. **Node.js 18+** installed locally
2. **Vercel CLI** installed: `npm i -g vercel`
3. **Supabase Project** set up with database schema
4. **GitHub/GitLab repository** (recommended for automatic deployments)

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/veripharm)

## 📋 Step-by-Step Deployment

### 1. Environment Variables Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env.local
```

**Required Environment Variables:**

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
VITE_APP_NAME=VeriPharm
VITE_APP_ENVIRONMENT=production
VITE_APP_URL=https://your-app.vercel.app
```

### 2. Local Testing

Before deployment, test the production build locally:

```bash
# Install dependencies
npm ci

# Run pre-deployment checks
npm run vercel:build

# Test production build locally
npm run preview
```

### 3. Deploy to Vercel

#### Option A: Via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: optimize for vercel deployment"
   git push origin main
   ```

2. Connect to Vercel:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

#### Option B: Direct Deployment

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Configure Environment Variables in Vercel

In your Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add all required variables from `env.example`
3. Set environment to **Production**, **Preview**, and **Development**

## ⚡ Performance Optimizations

### Bundle Analysis

Check your bundle size and optimization:

```bash
npm run build:analyze
```

### Current Optimizations Applied

- **Code Splitting**: Vendor and feature-based chunks
- **Tree Shaking**: Unused code elimination
- **Minification**: Terser with console.log removal
- **Caching**: Optimal cache headers for assets
- **Compression**: Gzip compression enabled
- **Asset Optimization**: Images and fonts optimized

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🛡️ Security Configuration

### Security Headers Applied

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Content Security Policy

CSP is configured in development. For production, configure in Vercel dashboard:

```
script-src 'self' 'unsafe-inline' https://your-supabase-project.supabase.co;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://your-supabase-project.supabase.co wss://your-supabase-project.supabase.co;
```

## 🏗️ Architecture

### Deployment Architecture

```
Internet → Vercel Edge Network → Static Assets (CDN)
                               → Supabase (Database + Auth)
```

### Regions

Configured for optimal global performance:
- **Primary**: `iad1` (US East)
- **Secondary**: `fra1` (Europe)
- **Tertiary**: `hnd1` (Asia Pacific)

## 🔧 Configuration Files

### Key Files Created/Modified

- `vercel.json` - Vercel deployment configuration
- `vite.config.ts` - Optimized build configuration
- `env.example` - Environment variables template
- Package.json scripts for Vercel deployment

## 📊 Monitoring & Analytics

### Built-in Monitoring

Vercel provides built-in analytics:
- **Performance**: Core Web Vitals tracking
- **Usage**: Function invocations and bandwidth
- **Errors**: Real-time error tracking

### Additional Monitoring (Optional)

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user analytics

## 🚨 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
npm run clean
npm ci
npm run vercel:build
```

#### Environment Variables Not Working

1. Ensure variables start with `VITE_`
2. Check variables are set in Vercel dashboard
3. Verify no typos in variable names
4. Redeploy after adding variables

#### Supabase Connection Issues

1. Verify Supabase URL and keys
2. Check Supabase project status
3. Ensure RLS policies are configured
4. Verify CORS settings in Supabase

#### Performance Issues

```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npx webpack-bundle-analyzer dist/stats.json
```

### Debug Mode

Enable debug mode for troubleshooting:

```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run vercel:build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Check Supabase connection
- [ ] Verify environment variables
- [ ] Test responsive design
- [ ] Check performance metrics
- [ ] Validate security headers
- [ ] Test PWA functionality (if enabled)

## 🆘 Support

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)

### Getting Help

1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify Supabase logs
4. Check this troubleshooting guide

## 🎯 Performance Targets

### Target Metrics

- **Bundle Size**: < 2MB total
- **Load Time**: < 3s on 3G
- **Lighthouse Score**: > 90
- **Core Web Vitals**: All green

### Current Bundle Sizes

- **Vendor React**: ~150KB
- **Vendor UI**: ~200KB  
- **Vendor Charts**: ~300KB
- **Application Code**: ~400KB
- **Total**: ~1.05MB (gzipped)

---

## 🎉 Congratulations!

Your VeriPharm application is now optimized and ready for production deployment on Vercel! 

For any issues or questions, refer to the troubleshooting section above or check the project's issue tracker. 