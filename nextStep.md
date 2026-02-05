# eMineral Pass - Complete Implementation Roadmap 🚀

> Comprehensive guide to build, integrate, test, and deploy the eMineral Pass application - Government Mineral Transport Authority System.

**Current Status:** Phase 1 (Database) - Active  
**Last Updated:** February 5, 2026  
**Tech Stack:** Next.js 16.1.6 | Supabase PostgreSQL | TypeScript | TailwindCSS

---

## 🎯 What You Need to Do TODAY

### Task: Complete Supabase Database Integration Using SQL Editor

**Duration:** 2-3 hours  
**Difficulty:** Medium (follow exact steps, no guessing)  
**Goal:** Set up PostgreSQL database with 5 tables, storage buckets, and RLS policies

---

## 📚 Complete Guide Location

### **👉 START HERE: [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)**

This document has:

- ✅ Step-by-step Supabase account setup
- ✅ Copy-paste SQL for 5 tables
- ✅ 20+ database indexes
- ✅ Storage bucket configuration
- ✅ Complete RLS policy setup (17 policies)
- ✅ Verification queries to test everything
- ✅ Troubleshooting guide

**Total steps:** 30+ actionable steps with code snippets

---

## 🚀 Implementation Phases Overview

### PHASE 1: Database Foundation ✅ (Current)

**Time: 2-3 hours | Status: In Progress**

- [x] Supabase account setup
- [x] API credentials collection
- [x] Environment variables (.env.local)
- [ ] **→ SQL Editor: 5 tables (START HERE)**
- [ ] **→ Storage: 3 buckets**
- [ ] **→ RLS: 17 policies**
- [ ] **→ Testing: Verification queries**

**→ [FULL GUIDE: DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)**

---

### PHASE 2: Backend Integration ⏳ (After Phase 1)

**Time: 3-4 hours | Status: Not Started**

- [ ] Authentication system
  - Sign up API route
  - Login API route
  - JWT token generation
  - Session management

- [ ] API Routes
  - Create record endpoint
  - Read records endpoint
  - Update record endpoint
  - Delete record endpoint
  - Get templates endpoint
  - Log scan endpoint

- [ ] Server Functions
  - User creation/update
  - Record CRUD operations
  - Form template management
  - Audit logging

**→ [IMPLEMENTATION.md](./IMPLEMENTATION.md) (When ready)**

---

### PHASE 3: Frontend Integration ✅ (COMPLETED)

**Time: 4-5 hours | Status: Completed**

- [x] Auth Context
  - User state management ✅
  - Login/signup logic ✅
  - Token persistence ✅
  - Auto-logout ✅

- [x] Protected Routes
  - Auth middleware ✅ (src/middleware.ts)
  - Route guards ✅ (Dashboard layout)
  - Public/private route separation ✅

- [x] Dashboard
  - User dashboard ✅ (Connected to Supabase)
  - Records list & details ✅
  - Form creation interface ✅
  - Record deletion ✅
  - Analytics display ✅ (Host dashboard with real stats)

**Implementation Files:**

- `src/middleware.ts` - Route protection
- `src/context/AuthContext.tsx` - Enhanced with auto-logout
- `src/app/(dashboard)/layout.tsx` - Auth guard
- `src/app/dashboard/host/page.tsx` - Admin view with Supabase
- `src/app/dashboard/user/page.tsx` - User view with Supabase

---

### PHASE 4: Advanced Features ⏳ (After Phase 3)

**Time: 3-4 hours | Status: Not Started**

- [ ] PDF & QR Generation
  - QR code from public token
  - PDF document creation
  - Upload to storage
  - Email sharing

- [ ] Email Notifications
  - Registration confirmation
  - Document ready notification
  - Status change updates
  - PDF download links

- [ ] Analytics & Monitoring
  - Dashboard metrics
  - Scan tracking
  - Usage reports
  - Performance monitoring

---

### PHASE 5: Deployment ⏳ (Last)

**Time: 1-2 hours | Status: Not Started**

- [ ] Vercel Deployment
  - Build configuration
  - Environment setup
  - Domain configuration
  - SSL certificates

- [ ] Freelancer Handover
  - Complete documentation
  - Video walkthroughs
  - Access credentials
  - Training session

---

## 📊 Project Analysis

### Current State

✅ **Completed:**

- Next.js 16.1.6 project scaffolded
- TypeScript configuration
- TailwindCSS setup
- Components created (Button, Card, Input, Navbar)
- eForm-C schema defined (393 lines, complete specification)
- Database schema designed (5 tables, 44 columns total)
- Types generated (database.ts - 219 lines)

⏳ **In Progress:**

- Supabase database creation (SQL Editor)
- Storage bucket setup
- RLS policy creation

❌ **Not Started:**

- Authentication system
- API routes
- Auth context
- Protected routes
- Dashboard implementation
- PDF/QR generation
- Email notifications
- Deployment

### Database Schema Summary

```
Users (8 columns)
├── id (UUID, PK)
├── email
├── full_name
├── avatar_url
├── is_admin
├── created_at
├── updated_at
└── last_login

Records (15 columns)
├── id (UUID, PK)
├── user_id (FK → users)
├── form_data (JSONB)
├── public_token (UNIQUE)
├── status (active|expired|archived)
├── valid_upto
├── qr_code_url
├── pdf_url
├── created_at
├── updated_at
├── total_scans
└── 3 more columns

Scan Logs (6 columns)
├── id (UUID, PK)
├── record_id (FK → records)
├── scanned_at
├── user_agent
├── ip_address
└── referrer

Form Templates (6 columns)
├── id (UUID, PK)
├── user_id (FK → users)
├── name
├── description
├── schema (JSONB)
└── created_at

Audit Logs (9 columns)
├── id (UUID, PK)
├── user_id (FK → users)
├── action
├── entity_type
├── entity_id
├── old_values
├── new_values
└── ip_address
```

### Storage Buckets Needed

- `pdfs` - Store generated PDF documents
- `qr-codes` - Store generated QR code images
- `documents` - General document storage

### RLS Policies (17 total)

- **Users table:** 3 policies (read own, update own, admin delete)
- **Records table:** 4 policies (read own, insert own, update own, delete own)
- **Scan logs table:** 1 policy (read scans of own records)
- **Form templates table:** 4 policies (read, insert, update, delete own)
- **Audit logs table:** 2 policies (read own, admin read all)

---

## 🔧 Your Project Files

### Key Files by Phase

**Phase 1 (Database) - YOU ARE HERE:**

```
DATABASE_SETUP_GUIDE.md ← Read this first!
EFORM_C_OFFICIAL_SPECIFICATION.md
FIELD_REFERENCE.md
.env.local ← Create this with credentials
```

**Phase 2 (Backend) - Coming Next:**

```
src/lib/
  ├── supabase-server.ts ← Create
  ├── supabase-client.ts ← Create
  ├── auth-server.ts ← Create
  └── eform-schema.ts ← Exists

src/app/api/auth/ ← Create routes
  ├── register/route.ts
  ├── login/route.ts
  ├── logout/route.ts
  └── me/route.ts
```

**Phase 3 (Frontend):**

```
src/context/AuthContext.tsx ← Update
src/app/(dashboard)/
  ├── layout.tsx ← Update
  ├── form/page.tsx ← Build
  └── records/page.tsx ← Build
```

**Phase 4 (Features):**

```
src/lib/
  ├── pdf-generator.ts ← Build
  ├── qr-generator.ts ← Build
  └── email-service.ts ← Build
```

---

## 📋 Step-by-Step Instructions for Phase 1

### Step 1: Supabase Account (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create project: `emineral-pass-prod`
5. Region: Singapore
6. Wait 2-3 minutes for setup

### Step 2: Get Credentials (2 minutes)

1. Click Settings (⚙️)
2. Click API tab
3. Copy 4 values:
   - Project URL
   - Anon Key
   - Service Role Key
   - JWT Secret

### Step 3: Create .env.local (1 minute)

**In project root, create file `.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_JWT_SECRET=...
```

### Step 4: Follow DATABASE_SETUP_GUIDE.md (2-3 hours)

**This has 30+ detailed steps including:**

- SQL Editor setup
- 5 CREATE TABLE statements
- 20+ CREATE INDEX statements
- 3 Storage bucket creation
- 17 RLS policy statements
- Multiple verification queries

**→ [OPEN DATABASE_SETUP_GUIDE.md NOW](./DATABASE_SETUP_GUIDE.md)**

---

## ✅ Phase 1 Completion Checklist

Before moving to Phase 2, verify:

**Supabase Setup:**

- [ ] Account created
- [ ] Project `emineral-pass-prod` created
- [ ] Region: Singapore
- [ ] `.env.local` created with 4 credentials
- [ ] SQL Editor test query passes

**Database Tables:**

- [ ] `users` table created (8 columns)
- [ ] `records` table created (15 columns)
- [ ] `scan_logs` table created (6 columns)
- [ ] `form_templates` table created (6 columns)
- [ ] `audit_logs` table created (9 columns)
- [ ] All 20+ indexes created
- [ ] Table verification query passed

**Storage:**

- [ ] `pdfs` bucket created and PUBLIC
- [ ] `qr-codes` bucket created and PUBLIC
- [ ] `documents` bucket created and PUBLIC
- [ ] Test file upload verified

**Security (RLS):**

- [ ] RLS enabled on all 5 tables
- [ ] 3 policies on users table
- [ ] 4 policies on records table
- [ ] 1 policy on scan_logs table
- [ ] 4 policies on form_templates table
- [ ] 2 policies on audit_logs table
- [ ] RLS policy verification query passed

**Testing:**

- [ ] Test user created in Authentication
- [ ] Test record inserted via SQL
- [ ] All verification queries passed
- [ ] No error messages in SQL Editor

---

## 🎓 Learning Resources

### For SQL/Database:

- **Supabase Documentation:** https://supabase.com/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs
- **SQL Tutorial:** https://www.w3schools.com/sql

### For Next.js:

- **Next.js Documentation:** https://nextjs.org/docs
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Next.js Authentication:** https://nextjs.org/docs/app/building-your-application/authentication

### For TypeScript:

- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **TypeScript in Next.js:** https://nextjs.org/docs/app/building-your-application/configuring/typescript

### For Government Forms:

- **eForm-C Specification:** See [EFORM_C_OFFICIAL_SPECIFICATION.md](./EFORM_C_OFFICIAL_SPECIFICATION.md)
- **Field Reference:** See [FIELD_REFERENCE.md](./FIELD_REFERENCE.md)

---

## ⚡ Quick Reference

### Important URLs

| Resource           | URL                                                        |
| ------------------ | ---------------------------------------------------------- |
| Supabase Dashboard | https://app.supabase.com                                   |
| Project Settings   | https://app.supabase.com/project/[project-id]/settings/api |
| SQL Editor         | https://app.supabase.com/project/[project-id]/sql          |
| Table Editor       | https://app.supabase.com/project/[project-id]/editor       |
| Storage            | https://app.supabase.com/project/[project-id]/storage      |

### SQL Commands Reference

```sql
-- View all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- View all indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- View all RLS policies
SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';

-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Disable RLS on table
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- View table structure
\d public.table_name

-- Count rows in table
SELECT COUNT(*) FROM public.table_name;
```

---

## 🚨 Common Issues & Solutions

### Issue: "SQL Error: Cannot insert NULL into column id"

**Solution:** UUIDs should use `DEFAULT gen_random_uuid()` not be NULL

### Issue: "RLS policy denies access"

**Solution:** Make sure user is authenticated (signed in). Check `auth.uid()` is not NULL

### Issue: "File not found in storage bucket"

**Solution:** Verify bucket is PUBLIC not PRIVATE. Check CORS settings.

### Issue: "permission denied for schema public"

**Solution:** Make sure you're using the correct Supabase role. Default should work.

### Issue: "Function uuid-ossp doesn't exist"

**Solution:** Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

---

## 💡 Tips for Success

1. **Take your time with SQL** - Copy-paste exact SQL from guide
2. **Verify each step** - Don't skip verification queries
3. **Read error messages** - They usually tell you what's wrong
4. **Use Table Editor** - Visually verify tables were created
5. **Test storage** - Actually upload a file to verify buckets work
6. **Document issues** - Note any errors for troubleshooting

---

## 📞 Getting Help

### Stuck on Database Setup?

1. Check [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) troubleshooting section
2. Review SQL syntax carefully
3. Check Supabase status: https://status.supabase.com

### Stuck on Next.js Integration?

1. Check [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed examples
2. Review Next.js docs: https://nextjs.org/docs
3. Check TypeScript errors: `npm run build`

### Database Questions?

- Supabase Discord: https://discord.supabase.io
- PostgreSQL Docs: https://www.postgresql.org/docs
- Stack Overflow: Tag with `supabase` and `postgresql`

---

## 🎯 Next Steps After Phase 1

Once database is complete:

1. **Review:** Verify all tables, indexes, and policies
2. **Document:** Note any deviations from spec
3. **Start Phase 2:** Create auth API routes
4. **Build:** Implement sign up and login
5. **Test:** Manually test authentication flow
6. **Repeat:** Move through remaining phases

---

<div align="center">

## 🚀 Ready to Begin?

**→ [OPEN DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)**

### What to do right now:

1. ✅ Read this file (you're done!)
2. ⏭️ Open DATABASE_SETUP_GUIDE.md
3. 🔨 Follow Step 1.1: Create Supabase Account
4. 🎯 Complete all 5 phases of Phase 1

**Estimated Time: 2-3 hours | Status: Ready to Start**

Good luck! 🎉

</div>
