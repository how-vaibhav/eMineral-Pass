# Deployment & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier available)
- Vercel account (for hosting)

### Local Development Setup

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd form-qr-pdf-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add:
   - `NEXT_PUBLIC_SUPABASE_URL`: From Supabase dashboard → Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase dashboard → Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY`: From Supabase dashboard → Settings → API (service_role)
   - `NEXT_PUBLIC_APP_URL`: http://localhost:3000 (local) or your domain (production)

4. **Initialize Supabase database**
   ```bash
   # Run migrations manually via Supabase dashboard:
   # 1. Go to Supabase dashboard → SQL Editor
   # 2. Create new query
   # 3. Copy & paste contents of: supabase/migrations/001_init_schema.sql
   # 4. Execute
   ```

5. **Create Supabase storage buckets**
   ```
   - Bucket name: qr-codes
   - Bucket name: pdfs
   - Set to PUBLIC for signed URL access
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:3000

---

## 📊 Supabase Setup

### 1. Create Project
- Go to supabase.com
- Create new project
- Choose region closest to your users
- Note the Project URL and Anon Key

### 2. Create Tables
Use SQL editor to run the migration:
- File: `supabase/migrations/001_init_schema.sql`

### 3. Create Storage Buckets
```
Storage → Buckets → Create new bucket
- Name: qr-codes
  - Public access: Yes
- Name: pdfs
  - Public access: Yes (with signed URLs)
```

### 4. Configure Row Level Security (RLS)
- Already included in migration
- Ensures users can only access their own records
- Public pages accessible via public_token

### 5. Enable Auth
- Supabase Auth is enabled by default
- Email/password authentication ready to use
- OAuth providers (optional): Enable Google, GitHub, etc.

---

## 🌐 Deployment to Vercel

### 1. Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub in Vercel dashboard and set up auto-deploy
```

### 2. Environment Variables in Vercel
Dashboard → Settings → Environment Variables

Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production domain)

### 3. Custom Domain
- In Vercel dashboard → Settings → Domains
- Add your custom domain
- Update DNS records as shown

### 4. Auto-Deploy
- Push to `main` branch
- Vercel automatically builds and deploys
- Deployments take ~2 minutes

---

## 🔒 Security Best Practices

### Production Checklist
- [ ] Environment variables never in git (use .env.local)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Supabase project configured for production
- [ ] Row Level Security (RLS) policies active
- [ ] Rate limiting enabled (TODO: Implement)
- [ ] Audit logging enabled (auto-enabled in schema)
- [ ] Backup strategy in place (Supabase daily backups)

### API Security
- Service role key never exposed to frontend
- Public API routes rate-limited
- User actions verified server-side
- CORS configured for your domain only

### Database Security
- RLS policies enforce data isolation
- Timestamps immutable (generated_on, valid_upto)
- Sensitive data not logged in audit trails
- Scan logs anonymized (no user identification)

---

## 📱 Mobile Responsiveness Testing

### Local Testing
```bash
# Open on different screen sizes
# Chrome DevTools → Toggle device toolbar

# Or test on real device:
# 1. Find your local IP:
ifconfig | grep "inet "

# 2. Access from phone:
http://<YOUR_IP>:3000
```

### Recommended Screen Sizes
- Mobile: 375px (iPhone SE), 412px (Android)
- Tablet: 768px (iPad), 1024px (iPad Pro)
- Desktop: 1440px+

---

## 🧪 Testing Workflows

### Form Submission Workflow
1. Log in as host
2. Click "New Record"
3. Fill form (test all field types)
4. Submit
5. Verify:
   - ✓ Record created
   - ✓ QR code generated
   - ✓ PDF available for download
   - ✓ Public page accessible
   - ✓ Form auto-resets for next entry

### QR Scanning Workflow
1. From public page, scan QR code
2. Verify:
   - ✓ Opens correct public page
   - ✓ Scan counted in dashboard
   - ✓ No auth required
   - ✓ Data displayed read-only

### Dashboard Workflow
1. Log in to admin
2. Verify:
   - ✓ Stats calculated correctly
   - ✓ Records table filterable
   - ✓ Charts display data
   - ✓ PDF download works
   - ✓ Pagination works

---

## 🐛 Troubleshooting

### Supabase Connection Issues
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined

Solution:
1. Check .env.local exists
2. Verify all env vars set
3. Restart dev server: npm run dev
```

### QR/PDF Generation Fails
```
- Check Supabase Storage buckets exist
- Verify bucket access permissions (Public)
- Check file size limits (usually 100MB+ allowed)
```

### Dark Mode Not Working
```
Solution:
1. Clear browser cache
2. Check localStorage for theme preference
3. Verify next-themes is imported in layout.tsx
```

### Database Connection Timeout
```
Solution:
1. Check internet connection
2. Verify Supabase project status
3. Check rate limits (free tier: 50k requests/month)
4. Upgrade to pro if needed
```

---

## 📈 Scaling Considerations

### Current Limits (Free Tier)
- Database: 500MB
- Storage: 1GB
- API rate limit: 50k requests/month
- Concurrent connections: 10

### Upgrade Path
1. **Small Scale (1k records/month)**
   - Free tier sufficient
   - Monitor database size

2. **Medium Scale (10k records/month)**
   - Upgrade to Supabase Pro ($25/month)
   - 8GB database, 100GB storage
   - 500k API requests

3. **Large Scale (100k+ records/month)**
   - Custom Supabase plan
   - Consider Redis for caching
   - Implement request batching
   - Add CDN for PDF delivery

### Performance Optimizations
- [ ] Implement server-side pagination
- [ ] Add database indexes (already done)
- [ ] Cache dashboard stats (Redis)
- [ ] Compress PDFs before storage
- [ ] Use CDN for static assets (Vercel auto-handles)

---

## 🔄 Continuous Improvement

### Monitoring
- Enable Vercel Analytics
- Set up Supabase monitoring alerts
- Track error rates in Vercel dashboard
- Monitor database query performance

### Backups
- Supabase provides automatic daily backups
- Export database weekly to Git repository
- Download PDFs periodically to external storage

### Updates
- Keep Next.js updated (`npm update next`)
- Update Supabase SDK monthly
- Review security patches for dependencies

---

## 📞 Support

### Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Common Commands
```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run linter

# Database
npm run migrate      # Run migrations (manual process)
npm run seed         # Seed test data (optional)
```

---

## 🎯 Next Steps After Deployment

1. **Monitor Performance**
   - Check Vercel dashboard daily first week
   - Monitor Supabase query performance
   - Set up error notifications

2. **Collect Feedback**
   - Test with real users
   - Gather UX feedback
   - Track form abandonment

3. **Iterate**
   - Add custom form fields based on user feedback
   - Optimize PDF layout
   - Add email notifications

4. **Scale**
   - Plan for multi-tenant support
   - Add team collaboration features
   - Integrate with third-party services
