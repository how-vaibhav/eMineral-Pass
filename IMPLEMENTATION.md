# Implementation Guide

## Overview

This guide walks through implementing the repeatable form → QR → PDF → dashboard system step-by-step.

---

## Phase 1: Local Development Setup

### 1.1 Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these from Supabase Dashboard:
- Go to Settings → API
- Copy Project URL
- Copy anon key
- Copy service_role key (keep this secret!)

### 1.2 Database Initialization

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Create new query
4. Copy entire `supabase/migrations/001_init_schema.sql`
5. Execute query
6. Verify tables created in Table Editor

### 1.3 Storage Buckets

1. Go to Storage → Buckets
2. Create bucket: `qr-codes`
   - Set to PUBLIC
   - Click "Public" toggle
3. Create bucket: `pdfs`
   - Set to PUBLIC
   - Click "Public" toggle

### 1.4 Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Phase 2: Authentication Flow

### 2.1 User Registration

1. Create account at login page
2. Use test account: `test@example.com` / `password123`
3. Verify:
   - User created in Supabase Auth
   - User record created in `users` table
   - JWT token stored in cookie

### 2.2 Protected Routes

All routes under `(dashboard)` require authentication:
- `/dashboard` - Admin dashboard
- `/form` - Create new record
- `/records` - View all records
- `/settings` - User settings

Access without login redirects to `/login`

---

## Phase 3: Form Submission Workflow

### 3.1 Form Page (`/form`)

The form page demonstrates the core workflow:

```typescript
// Key steps:
1. User fills form fields
2. Client-side validation (Zod)
3. Submit button calls server action
4. Server-side validation
5. Create record with UUID
6. Generate QR code
7. Generate PDF
8. Store URLs in database
9. Show success message
10. Auto-reset form
```

### 3.2 Testing Form Submission

1. Navigate to `/form`
2. Fill all fields:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "(555) 123-4567"
   - Date: Today's date
   - Type: "Standard"
   - Details: "Test submission"
3. Click "Submit Form"
4. Verify:
   - ✓ Success message appears
   - ✓ Record ID shown
   - ✓ QR code displayed
   - ✓ PDF download link present
   - ✓ Form resets automatically

### 3.3 Server Action Flow

File: `src/lib/records.server.ts`

```typescript
export async function createRecord({
  userId,
  formData,
  fields,
  validityHours = 24,
}) {
  // 1. Generate unique IDs
  const recordId = uuidv4()
  const publicToken = generatePublicToken()
  const generatedOn = new Date()
  const validUpto = addHours(generatedOn, validityHours)

  // 2. Create record in database
  // 3. Generate and upload QR code
  // 4. Generate and upload PDF
  // 5. Update record with URLs
  // 6. Log audit event
  // 7. Return success
}
```

---

## Phase 4: QR Code Generation

### 4.1 How It Works

File: `src/lib/qr-generator.ts`

```typescript
// 1. Generate QR data from public URL
const publicUrl = `https://yourdomain.com/records/${publicToken}`

// 2. Create QR code as PNG buffer
const qrBuffer = await generateQRCodeBuffer(publicUrl)

// 3. Upload to Supabase Storage
const qrCodeUrl = await uploadQRCode(recordId, userId, qrBuffer)

// 4. Store URL in record
record.qr_code_url = qrCodeUrl
```

### 4.2 Verifying QR Code

1. From record success message, right-click QR code
2. Save image
3. Use phone camera or QR scanner app
4. Should open: `http://localhost:3000/records/{publicToken}`

---

## Phase 5: PDF Generation

### 5.1 PDF Structure

File: `src/lib/pdf-generator.ts`

PDF includes:
- Professional header with title
- Status badge (Active/Expired)
- Key metadata (Record ID, dates)
- Divider line
- Form data in table format
- QR code image (embedded)
- Footer with generation date

### 5.2 Testing PDF Generation

1. Submit form successfully
2. Click "📥 Download PDF"
3. Verify:
   - ✓ File downloads as `record-{timestamp}.pdf`
   - ✓ PDF opens properly
   - ✓ All form data displayed
   - ✓ QR code visible
   - ✓ Status badge present
   - ✓ Dates formatted correctly
   - ✓ A4 size (should print perfectly)

### 5.3 PDF Customization

To change PDF styling, edit `src/lib/pdf-generator.ts`:

```typescript
// Change colors
pdf.setTextColor(255, 0, 0) // RGB

// Change fonts
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(18)

// Add images
pdf.addImage(imageUrl, 'PNG', x, y, width, height)

// Draw shapes
pdf.line(x1, y1, x2, y2)
pdf.rect(x, y, width, height)
```

---

## Phase 6: Public Page (QR Scanner View)

### 6.1 Public Page Route

File: `src/app/(public)/records/[recordId]/page.tsx`

Features:
- No authentication required
- Display read-only record data
- Show status badge
- Show scan count
- Provide PDF download link
- Embed QR code for verification

### 6.2 Testing Public Page

1. From form success message, copy public token
2. Open: `http://localhost:3000/records/{publicToken}`
3. Verify:
   - ✓ Page loads without login
   - ✓ All form data displayed
   - ✓ Status shows correct status
   - ✓ QR code visible
   - ✓ PDF download works
   - ✓ No edit options available

### 6.3 Scan Logging

When public page is viewed:
1. Server logs scan event (asynchronous)
2. Scan log includes:
   - Record ID
   - Timestamp
   - User agent
   - IP address
   - Referrer
3. Record's `total_scans` incremented
4. Dashboard shows updated count

---

## Phase 7: Admin Dashboard

### 7.1 Dashboard Components

File: `src/app/(dashboard)/page.tsx`

Shows:
- Total records created (all time)
- Total QR scans (all time)
- Records created today
- Records created this week
- Average scans per record
- Active vs expired records

### 7.2 Records Table

Features:
- List all user's records
- Sort by: Date, Expiry, Scans
- Filter by: Status, Date range
- Actions: View, Download PDF, View QR, Delete
- Pagination

### 7.3 Analytics Charts

Charts show (last 30 days):
- Records created per day (line chart)
- Scans per day (line chart)
- Status distribution (pie chart)

### 7.4 Testing Dashboard

1. Create 5+ records
2. Scan some QR codes (from public page)
3. Dashboard updates automatically:
   - ✓ Totals correct
   - ✓ Chart shows data
   - ✓ Table lists records
   - ✓ Scan counts updated

---

## Phase 8: Dark/Light Mode

### 8.1 Theme Setup

Uses `next-themes` library (already installed).

Root layout includes:
```tsx
<ThemeProvider>
  {children}
</ThemeProvider>
```

### 8.2 Theme Toggle

In navbar: Click theme icon to toggle

Colors defined in `src/app/globals.css`:
- Light mode: `--background: 100%` (white)
- Dark mode: `--background: 3.6%` (very dark)

### 8.3 Testing Dark Mode

1. Click theme icon in navbar
2. Verify:
   - ✓ All text readable
   - ✓ Contrast sufficient
   - ✓ Forms still usable
   - ✓ Charts visible
   - ✓ Images display correctly

---

## Phase 9: Mobile Responsiveness

### 9.1 Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 9.2 Testing on Mobile

Chrome DevTools:
1. Press F12
2. Click device toggle (top-left)
3. Select "iPhone 12" or "Pixel 5"
4. Test:
   - ✓ Form fields stack vertically
   - ✓ Buttons full-width
   - ✓ Tables scroll horizontally
   - ✓ All text readable

---

## Phase 10: Deployment to Vercel

### 10.1 Connect Repository

```bash
# If using GitHub:
1. Push code to GitHub
2. Go to vercel.com
3. Import project
4. Select GitHub repo
5. Click Deploy

# Or use Vercel CLI:
npm i -g vercel
vercel
```

### 10.2 Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables:

Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production domain)

### 10.3 Deploy

Push to `main` branch:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

Vercel auto-deploys. Wait ~2 minutes for deployment.

---

## Phase 11: Production Configuration

### 11.1 Supabase Production Setup

1. In Supabase dashboard:
   - Enable Auth → Email provider
   - Configure SMTP (optional, for email confirmations)
   - Enable RLS on all tables ✓ (already done)
   - Set up backups ✓ (automatic daily)

### 11.2 Security Checklist

- [ ] Environment variables never in git
- [ ] Service role key protected
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (auto with Vercel)
- [ ] Database backups verified
- [ ] Audit logging enabled ✓
- [ ] RLS policies active ✓
- [ ] Rate limiting considered

### 11.3 Domain Setup

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel Dashboard → Settings → Domains
3. Add your domain
4. Follow DNS instructions
5. Wait 24-48 hours for propagation
6. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

---

## Phase 12: Monitoring & Maintenance

### 12.1 Monitoring

Watch:
- Vercel dashboard for deployments
- Supabase dashboard for database usage
- API performance
- Error rates

### 12.2 Regular Tasks

- Monthly: Review Supabase usage
- Weekly: Check error logs
- Daily (first month): Monitor performance
- Quarterly: Update dependencies

### 12.3 Scaling

If usage grows:
- Upgrade Supabase plan ($25/month)
- Add caching layer (Redis)
- Implement pagination
- Optimize database queries

---

## Troubleshooting

### Form Won't Submit

```
Error: "Server action failed"

Solution:
1. Check browser console for errors
2. Check Vercel logs (if deployed)
3. Verify Supabase credentials in .env.local
4. Restart dev server: npm run dev
```

### QR Code Not Generated

```
Error: "Failed to upload QR code"

Solution:
1. Check Supabase Storage buckets exist
2. Verify bucket is PUBLIC
3. Check file size (usually < 100KB for QR)
4. Check error in server logs
```

### PDF Not Downloading

```
Error: "PDF download fails"

Solution:
1. Check Supabase Storage bucket permissions
2. Verify PDF exists in bucket
3. Check signed URL expiry (set to 30 days)
4. Try downloading again
```

### Dark Mode Not Working

```
Issue: Theme toggle doesn't work

Solution:
1. Clear browser cache
2. Check next-themes installed: npm list next-themes
3. Restart dev server
4. Check localStorage: localStorage.getItem('theme')
```

---

## Next Steps

After full deployment:
1. **Gather user feedback** - Test with real users
2. **Monitor analytics** - Check Vercel & Supabase dashboards
3. **Iterate** - Add features based on feedback
4. **Scale** - Plan for growth

---

For questions, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [README.md](./README.md) - Feature overview
