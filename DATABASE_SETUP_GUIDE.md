# Complete Supabase Database Integration Guide - eMineral Pass 🚀

> Comprehensive step-by-step guide to set up and integrate Supabase PostgreSQL backend using SQL Editor. Complete database schema, storage, RLS policies, and full Next.js integration.

**Project:** eMineral Pass - Government Mineral Transport Authority System  
**Tech Stack:** Next.js 16.1.6 | Supabase PostgreSQL | TypeScript | TailwindCSS  
**Current Status:** ✅ Schema Designed | 🔄 SQL Editor Implementation | ⏳ Integration & Testing

---

## 📋 Complete Implementation Roadmap

### PHASE 1: Database Foundation ✅

1. **Supabase Project Setup** - Create account and get credentials
2. **SQL Editor Schema Creation** - Create 5 tables with indexes
3. **Storage Buckets** - PDFs, QR codes, documents storage
4. **Row Level Security (RLS)** - Security policies for data isolation
5. **Verification & Testing** - Test database and storage

### PHASE 2: Backend Integration 🔄

6. **Authentication System** - Sign up, login, session management
7. **API Routes** - CRUD operations for records, forms, templates
8. **Server Functions** - Database operations and validations

### PHASE 3: Frontend Integration ⏳

9. **Auth Context & Hooks** - User state management
10. **Protected Routes** - Middleware and route guards
11. **Dashboard Implementation** - User and admin dashboards

### PHASE 4: Advanced Features ⏳

12. **PDF & QR Code Generation** - Generate documents and codes
13. **Email Notifications** - Send confirmation and status emails
14. **Analytics & Monitoring** - Track usage and performance

### PHASE 5: Deployment ⏳

15. **Deployment Guide** - Deploy to Vercel
16. **Freelancer Handover** - Documentation and training

---

# PHASE 1: DATABASE FOUNDATION

## Phase 1: Supabase Project Setup

### Step 1.1: Create Supabase Account & Project

1. **Visit [supabase.com](https://supabase.com)**
2. **Click "Start your project"** and sign up with email/GitHub
3. **Create Organization** (name: `eMineral Pass`)
4. **Create New Project**:
   - Project Name: `emineral-pass-prod`
   - Database Password: **Store securely in password manager** ⚠️
   - Region: **Singapore** (closest to India, best latency)
   - Pricing: **Free Tier** (sufficient for development)

**Expected time:** 3-5 minutes while database initializes

### Step 1.2: Collect Connection Credentials

**After project is created:**

1. Wait for database initialization (2-3 minutes) - you'll see a green checkmark
2. Go to **Project Settings** (gear icon, bottom left of sidebar)
3. Click **API** tab
4. You'll see 4 credentials. Copy them one by one:

| Credential      | How to Find                 | Example                         |
| --------------- | --------------------------- | ------------------------------- |
| **Project URL** | Under "Project URL" heading | `https://xyzabc123.supabase.co` |
| **Anon Key**    | Under "anon public"         | `eyJhbGc...` (very long)        |
| **Service Key** | Under "service_role"        | `eyJhbGc...` (KEEP SECRET!)     |
| **JWT Secret**  | Just below Service Key      | `super-secret-string`           |

**Paste into `.env.local` (in your project root):**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # KEEP SECRET!
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-from-dashboard
```

⚠️ **CRITICAL:** Never commit `.env.local` to GitHub!

### Step 1.3: Verify Supabase Connection

Let's test the connection:

1. Go to **SQL Editor** (left sidebar, 2nd item)
2. Click **"New Query"** button (top right)
3. Paste this test query:

```sql
SELECT now();
```

4. Press **Ctrl+Enter** or click **▶ Run** button
5. ✅ You should see the current timestamp

If this works, your Supabase connection is live!

### Step 1.4: Enable Required PostgreSQL Extensions

These extensions add extra functionality to PostgreSQL.

**In SQL Editor, create new query:**

```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For generating UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For encryption functions
CREATE EXTENSION IF NOT EXISTS "http";           -- For HTTP requests (optional)

-- Verify extensions are enabled
SELECT extname FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'http')
ORDER BY extname;
```

**Run this query. You should see 2-3 extensions in the results.**

---

## Phase 2: SQL Editor - Complete Database Schema

Your project already has a detailed schema design. We'll implement it now using Supabase SQL Editor.

### Step 2.1: Create Users Table

**Purpose**: Store user profiles linked to Supabase Authentication

**In SQL Editor, create new query and paste:**

```sql
-- Step 1: Create Users table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  -- IMPORTANT: This id references Supabase Auth's users table
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info (synced from auth.users)
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Permissions
  is_admin BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for faster queries
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN public.users.id IS 'References auth.users(id) - cascades on delete';
```

**Execute:**

1. Click **▶ Run** button (or Ctrl+Enter)
2. You should see: "Success. No rows returned."

**Verify:**

1. Go to **Table Editor** (left sidebar, 1st item)
2. Refresh page or click reload icon
3. You should see `public.users` table listed ✅

### Step 2.2: Create Records Table

**Purpose**: Store all submitted eForm-C mineral transport documents

**Create new SQL query:**

```sql
-- Step 2: Records table - stores all submitted eForm-C documents
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Form data storage (stores entire form as JSON)
  form_data JSONB NOT NULL,

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  valid_upto TIMESTAMP WITH TIME ZONE NOT NULL,
  generated_on TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Unique identifiers
  public_token TEXT UNIQUE NOT NULL,  -- For public sharing without auth

  -- File references (URLs stored in Supabase Storage)
  qr_code_url TEXT,                   -- URL to QR code image
  pdf_url TEXT,                       -- URL to PDF document

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Denormalized for fast queries
  total_scans INTEGER DEFAULT 0,      -- How many times QR scanned
  last_scan_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for common queries
CREATE INDEX idx_records_user_id ON public.records(user_id);
CREATE INDEX idx_records_public_token ON public.records(public_token);
CREATE INDEX idx_records_created_at ON public.records(created_at DESC);
CREATE INDEX idx_records_valid_upto ON public.records(valid_upto);
CREATE INDEX idx_records_status ON public.records(status);

COMMENT ON TABLE public.records IS 'All submitted eForm-C transport documents';
COMMENT ON COLUMN public.records.form_data IS 'Complete form as JSONB for flexibility';
COMMENT ON COLUMN public.records.public_token IS 'For public sharing without authentication';
```

**Execute and verify in Table Editor.**

### Step 2.3: Create Scan Logs Table

**Purpose**: Track every QR code scan for audit and analytics

**Create new SQL query:**

```sql
-- Step 3: Scan logs - Track all QR code scans
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,

  -- Scan timestamp and session
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT,

  -- Device/Browser info (from User-Agent)
  user_agent TEXT,

  -- Network info (from request)
  ip_address TEXT,

  -- Referrer (how they accessed the link)
  referrer TEXT
);

-- Create indexes
CREATE INDEX idx_scan_logs_record_id ON public.scan_logs(record_id);
CREATE INDEX idx_scan_logs_scanned_at ON public.scan_logs(scanned_at DESC);
CREATE INDEX idx_scan_logs_session_id ON public.scan_logs(session_id);

COMMENT ON TABLE public.scan_logs IS 'Audit log of all QR code scans';
```

**Execute and verify.**

### Step 2.4: Create Form Templates Table

**Purpose**: Allow users to save and reuse form schemas

**Create new SQL query:**

```sql
-- Step 4: Form templates - Reusable form schemas
CREATE TABLE IF NOT EXISTS public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,

  -- The form schema itself
  schema JSONB NOT NULL,

  -- Mark as default for user
  is_default BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_form_templates_user_id ON public.form_templates(user_id);

COMMENT ON TABLE public.form_templates IS 'Reusable form templates for users';
```

**Execute and verify.**

### Step 2.5: Create Audit Logs Table

**Purpose**: Track all important actions for security and compliance

**Create new SQL query:**

```sql
-- Step 5: Audit logs - Complete audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- What action was performed
  action TEXT NOT NULL,  -- 'create_record', 'download_pdf', 'view_record', etc.

  -- What entity was affected
  entity_type TEXT NOT NULL,  -- 'record', 'user', 'form', etc.
  entity_id UUID,

  -- Before/after values
  old_values JSONB,
  new_values JSONB,

  -- Request context
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

COMMENT ON TABLE public.audit_logs IS 'Audit trail for security and compliance';
```

**Execute and verify.**

### Step 2.6: Verify All Tables Created

**Create verification query:**

```sql
-- Verify all tables exist
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected output (you should see these 5 tables):**

- `audit_logs`
- `form_templates`
- `records`
- `scan_logs`
- `users`

---

## Phase 3: Storage Buckets

Your app generates PDFs and QR codes. These need cloud storage (like AWS S3).

### Step 3.1: Create Storage Buckets

**In Supabase Dashboard:**

1. Click **Storage** (left sidebar, 4th item down)
2. Click **Create bucket** button (top right)

**Create first bucket: `pdfs`**

- Bucket name: `pdfs`
- Privacy: **PUBLIC** ✅ (users need to access PDFs)
- Click **Create bucket** button

**Create second bucket: `qr-codes`**

- Bucket name: `qr-codes`
- Privacy: **PUBLIC** ✅
- Click **Create bucket** button

**Create third bucket: `documents`**

- Bucket name: `documents`
- Privacy: **PUBLIC** ✅
- Click **Create bucket** button

**Verify:** You should see all 3 buckets listed in Storage sidebar.

### Step 3.2: Test Bucket Access

**To verify buckets work:**

1. Go to **Storage** → **pdfs** bucket
2. Click **Upload** button
3. Upload any test file (PDF or image)
4. After upload, click the file
5. Copy the **"Public URL"**
6. Open URL in new browser tab - file should display/download ✅

**Repeat for `qr-codes` bucket.**

**Note:** You now have these bucket paths for later:

- `pdfs/{uuid}.pdf`
- `qr-codes/{uuid}.png`
- `documents/{uuid}`

---

## Phase 4: Row Level Security (RLS) Policies

⚠️ **CRITICAL FOR SECURITY** ⚠️

RLS prevents users from accessing other users' data at the database level.

### Step 4.1: Enable RLS on All Tables

**In SQL Editor, create new query:**

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

**Execute this query.**

### Step 4.2: Create RLS Policies for Users Table

**Create new SQL query:**

```sql
-- Users can only see their own profile
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

**Execute this query.**

### Step 4.3: Create RLS Policies for Records Table

**Create new SQL query:**

```sql
-- Users can only see their own records
CREATE POLICY "Users can read own records" ON public.records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create records
CREATE POLICY "Users can insert own records" ON public.records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own records
CREATE POLICY "Users can update own records" ON public.records
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "Users can delete own records" ON public.records
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Execute this query.**

### Step 4.4: Create RLS Policies for Scan Logs

**Create new SQL query:**

```sql
-- Users can read scan logs for their own records
CREATE POLICY "Users can read scans of own records" ON public.scan_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.records
      WHERE records.id = scan_logs.record_id
      AND records.user_id = auth.uid()
    )
  );
```

**Execute this query.**

### Step 4.5: Create RLS Policies for Form Templates

**Create new SQL query:**

```sql
-- Users can read their own templates
CREATE POLICY "Users can read own templates" ON public.form_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create templates
CREATE POLICY "Users can insert own templates" ON public.form_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON public.form_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON public.form_templates
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Execute this query.**

### Step 4.6: Create RLS Policies for Audit Logs

**Create new SQL query:**

```sql
-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs" ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

**Execute this query.**

### Step 4.7: Verify RLS Policies

**Run verification query:**

```sql
-- List all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**You should see policies for all 5 tables (17 total policies).**

---

# PHASE 5: VERIFICATION & TESTING

## Phase 5: Verification & Testing

### Step 5.1: Create Test User via Supabase Auth

**In Supabase Dashboard:**

1. Go to **Authentication** tab (left sidebar)
2. Click **Users** tab
3. Click **"Invite"** button (top right)
4. Email: `test@example.com`
5. Click **Send invite**

**Alternative (if you want auto-confirmed):**

1. Click **Create new user** button
2. Email: `test@example.com`
3. Password: `TestPassword123!`
4. Toggle **Auto confirm user** ON
5. Click **Create user**

✅ You should see the user listed in Users tab

### Step 5.2: Create Test Record

**In SQL Editor, create new query:**

```sql
-- Get the test user's ID
SELECT id FROM public.users WHERE email = 'test@example.com';
```

**Run this and copy the UUID from the result.**

**Create another query (replace UUID with what you copied):**

```sql
INSERT INTO public.records (
  user_id,
  form_data,
  public_token,
  valid_upto,
  status
) VALUES (
  '12345678-1234-1234-1234-123456789012',  -- REPLACE WITH ACTUAL UUID
  '{"eform_c_number": "EFORM-C-2024-000001", "mineral_type": "Iron Ore"}'::jsonb,
  gen_random_uuid()::text,
  now() + interval '30 days',
  'active'
);
```

**Execute this query.**

**Verify:**

1. Go to **Table Editor**
2. Click **records** table
3. You should see 1 new record with test@example.com's UUID ✅

### Step 5.3: Test RLS (Basic)

**Create another test user:**

1. In Authentication, create user: `test2@example.com`
2. Note: test2 shouldn't be able to see test@example.com's records (RLS blocks it)
3. We'll verify this properly after setting up auth in Next.js

### Step 5.4: Complete Database Summary

**Run final verification query:**

```sql
-- Complete database summary
SELECT
  'Table' as type,
  tablename as name,
  (SELECT count(*) FROM information_schema.columns
   WHERE table_name = tablename) as "columns"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY name;
```

**Expected output:**

```
type   | name            | columns
-------|-----------------|----------
Table  | audit_logs      | 9
Table  | form_templates  | 6
Table  | records         | 15
Table  | scan_logs       | 6
Table  | users           | 8
```

---

## 📋 Completion Checklist - Phase 1

- [ ] Supabase project created
- [ ] Connection credentials stored in `.env.local`
- [ ] SQL Editor connection verified (SELECT now() worked)
- [ ] 5 tables created (`users`, `records`, `scan_logs`, `form_templates`, `audit_logs`)
- [ ] All indexes created (20+ indexes)
- [ ] 3 storage buckets created (`pdfs`, `qr-codes`, `documents`)
- [ ] Storage bucket public access verified (test file accessible)
- [ ] RLS enabled on all tables
- [ ] 17 RLS policies created and working
- [ ] Test user created in Authentication
- [ ] Test record created in records table
- [ ] All verification queries passed

✅ **Phase 1 is complete! Your Supabase database is ready.**

---

## Next Steps (Phases 2-5)

After completing Phase 1:

**Phase 2:** Implement authentication system in Next.js

- Create auth API routes (`/api/auth/register`, `/api/auth/login`)
- Create Supabase client helpers
- Store JWT tokens

**Phase 3:** Build dashboard and features

- Create protected routes
- Implement form submission
- Display records list

**Phase 4:** PDF and QR generation

- Generate QR codes from public tokens
- Generate PDFs from form data
- Upload to storage buckets

**Phase 5:** Deploy to production

- Deploy to Vercel
- Configure environment variables
- Set up monitoring

---

## 🆘 Troubleshooting

### Issue: "SQL Error: Cannot insert NULL into id"

**Solution:** Use `gen_random_uuid()` for UUID columns without default

### Issue: "permission denied for schema public"

**Solution:** Ensure you're using role with proper permissions (default should work)

### Issue: "RLS policy returns no rows even though user owns the record"

**Solution:** Check `auth.uid()` is not NULL - may need to sign in first

### Issue: "File not accessible from bucket URL"

**Solution:** Verify bucket is set to PUBLIC, not PRIVATE

---

## 📚 Project Files Reference

### Key database files:

- **Schema:** `supabase/migrations/001_init_schema.sql`
- **Types:** `src/types/database.ts`
- **Schema validation:** `src/lib/eform-schema.ts`

### Next files to create:

- **Supabase helpers:** `src/lib/supabase-server.ts`, `src/lib/supabase-client.ts`
- **Auth functions:** `src/lib/auth-server.ts`
- **Auth routes:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`
- **Auth context:** `src/context/AuthContext.tsx`

---

<div align="center">

**Database setup complete! Ready for Phase 2. 🎉**

For questions: Check Supabase docs → [supabase.com/docs](https://supabase.com/docs)

</div>
