# Next Steps: Complete Supabase Integration & Deployment Guide 🚀

> A comprehensive step-by-step guide to integrate Supabase backend, implement authentication, build dashboards, deploy the application, and hand over to freelancers.

---

## 📋 Table of Contents

1. [Supabase Project Setup](#supabase-project-setup)
2. [Database Schema Creation](#database-schema-creation)
3. [Authentication System Implementation](#authentication-system-implementation)
4. [Integration with Next.js](#integration-with-nextjs)
5. [Dashboard Backend Logic](#dashboard-backend-logic)
6. [Google OAuth Configuration](#google-oauth-configuration)
7. [PDF & QR Code Generation](#pdf--qr-code-generation)
8. [Deployment Guide](#deployment-guide)
9. [Freelancer Handover Checklist](#freelancer-handover-checklist)

---

## 1. Supabase Project Setup

### Step 1.1: Create Supabase Account & Project

1. **Visit [supabase.com](https://supabase.com)**
2. **Click "Start your project"** and sign up with email/GitHub
3. **Create Organization** (e.g., "eMineral Pass")
4. **Create New Project**:
   - Project Name: `emineral-pass-db`
   - Database Password: **Store securely** (you'll need it later)
   - Region: Select closest to India (or Singapore for Asia)
   - Pricing: Free tier is sufficient for development

### Step 1.2: Get Connection Credentials

After project creation, navigate to **Project Settings** → **API**:

```
You'll see four keys:
1. Project URL: https://your-project-id.supabase.co
2. Anon (Public) Key: eyJhbGc... (safe to expose in frontend)
3. Service Role Key: eyJhbGc... (KEEP SECRET - backend only)
4. JWT Secret: (for token verification)
```

**Store these in `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret
```

### Step 1.3: Connect to Supabase Studio

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"Create new query"** or use **Database** → **Tables**
3. You're now ready to create tables

---

## 2. Database Schema Creation

### Step 2.1: Create Users Table

**Purpose**: Store authentication data and user profiles

**Via Supabase UI:**
1. Go to **Table Editor**
2. Click **Create a new table**
3. Table Name: `users`
4. Set up columns:

| Column | Type | Settings |
|--------|------|----------|
| id | uuid | Primary Key, Auto-generate (gen_random_uuid) |
| email | text | Unique, Not null |
| password_hash | text | Not null |
| role | text | ENUM: 'host', 'user' |
| full_name | text | Nullable |
| phone | text | Nullable |
| organization | text | Nullable (for hosts) |
| verified | boolean | Default: false |
| created_at | timestamptz | Default: now() |
| updated_at | timestamptz | Default: now() |

**Or via SQL (paste in SQL Editor):**
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'user')),
  full_name TEXT,
  phone TEXT,
  organization TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
```

### Step 2.2: Create Passes Table

**Purpose**: Store transportation permits/passes

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  eform_c_no TEXT NOT NULL UNIQUE,
  mineral_type TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('MT', 'KG', 'Ton')),
  destination_location TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  source_location TEXT NOT NULL,
  source_state TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  transporter_name TEXT NOT NULL,
  transporter_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Pending', 'Completed')),
  qr_code TEXT,
  qr_data JSONB,
  pdf_url TEXT,
  public_token TEXT UNIQUE,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  valid_upto TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_passes_user_id ON passes(user_id);
CREATE INDEX idx_passes_status ON passes(status);
CREATE INDEX idx_passes_eform_c_no ON passes(eform_c_no);
CREATE INDEX idx_passes_public_token ON passes(public_token);
```

### Step 2.3: Create Scan Logs Table

**Purpose**: Track every time a QR code is scanned

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID NOT NULL REFERENCES passes(id) ON DELETE CASCADE,
  scanned_by TEXT,
  scan_location TEXT,
  scan_latitude DECIMAL(10, 8),
  scan_longitude DECIMAL(11, 8),
  device_info TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scan_logs_pass_id ON scan_logs(pass_id);
CREATE INDEX idx_scan_logs_scanned_at ON scan_logs(scanned_at);
```

### Step 2.4: Create Analytics Table

**Purpose**: Track dashboard metrics and statistics

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_passes_issued INTEGER DEFAULT 0,
  active_passes INTEGER DEFAULT 0,
  expired_passes INTEGER DEFAULT 0,
  total_quantity DECIMAL(12, 2) DEFAULT 0,
  month_year DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_month_year ON analytics(month_year);
```

### Step 2.5: Enable Row Level Security (RLS)

**CRITICAL for security!**

**For users table:**
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own data
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update own data
CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth.uid() = id);
```

**For passes table:**
```sql
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own passes
CREATE POLICY "Users can view own passes" ON passes
FOR SELECT USING (auth.uid() = user_id OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'host');

-- Users can only insert their own passes
CREATE POLICY "Users can create passes" ON passes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Hosts can only update pass status
CREATE POLICY "Hosts can update passes" ON passes
FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'host')
WITH CHECK (status != 'Completed');
```

---

## 3. Authentication System Implementation

### Step 3.1: Supabase Auth Configuration

1. **Go to Authentication** → **Providers** in Supabase Dashboard
2. **Email/Password**: Already enabled by default
3. **Enable Email Confirmations**:
   - Go to **Auth** → **Email Templates**
   - Customize confirmation email (it's already templated)
4. **Store JWT Secret** (found in **Project Settings** → **API**)

### Step 3.2: Create Authentication Service

**File**: `src/lib/auth.server.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseKey)

// Sign up new user
export async function signUp(email: string, password: string, role: 'host' | 'user') {
  try {
    // Create Supabase auth user
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for demo
    })

    if (authError) throw authError

    // Create user profile
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        role,
        verified: true,
      })
      .select()

    if (userError) throw userError

    return { success: true, user: userData[0] }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string) {
  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Get user profile with role
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', data.user.id)
      .single()

    if (userError) throw userError

    return {
      success: true,
      user: userData,
      session: data.session,
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}
```

### Step 3.3: Create Auth Context

**File**: `src/context/AuthContext.tsx`

```typescript
'use client'

import React, { createContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: 'host' | 'user'
  full_name?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, role: 'host' | 'user') => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user already logged in (on mount)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          // Verify token and get user data
          const res = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const userData = await res.json()
            setUser(userData)
          } else {
            localStorage.removeItem('auth_token')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Login failed')
      }

      const { user, token } = await res.json()
      localStorage.setItem('auth_token', token)
      setUser(user)
      
      // Redirect to dashboard
      router.push(user.role === 'host' ? '/dashboard/host' : '/dashboard/user')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, role: 'host' | 'user') => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Signup failed')
      }

      const { user, token } = await res.json()
      localStorage.setItem('auth_token', token)
      setUser(user)
      
      router.push(role === 'host' ? '/dashboard/host' : '/dashboard/user')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Step 3.4: Create Auth API Routes

**File**: `src/app/api/auth/signin/route.ts`

```typescript
import { signUp, verifyCredentials } from '@/lib/auth.server'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password, isSignup, role } = await request.json()

    let result

    if (isSignup) {
      result = await signUp(email, password, role)
    } else {
      result = await verifyCredentials(email, password)
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role },
      process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: result.user,
      token,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}
```

**File**: `src/app/api/auth/verify/route.ts`

```typescript
import { getUserById } from '@/lib/auth.server'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1]

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
    ) as any

    // Get user data
    const user = await getUserById(decoded.userId)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Token verification failed' },
      { status: 401 }
    )
  }
}
```

---

## 4. Integration with Next.js

### Step 4.1: Create Supabase Client

**File**: `src/lib/supabase.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 4.2: Create Pass Service Functions

**File**: `src/lib/passes.server.ts`

```typescript
import { supabaseServer } from './auth.server'
import { v4 as uuidv4 } from 'uuid'

// Create new pass
export async function createPass(userId: string, passData: any) {
  try {
    const publicToken = uuidv4()

    const { data, error } = await supabaseServer
      .from('passes')
      .insert({
        user_id: userId,
        ...passData,
        public_token: publicToken,
        status: 'Active',
      })
      .select()

    if (error) throw error

    return { success: true, pass: data[0] }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Get user's passes
export async function getUserPasses(userId: string, status?: string) {
  try {
    let query = supabaseServer
      .from('passes')
      .select('*')
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, passes: data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Get all passes (for host/admin)
export async function getAllPasses(status?: string) {
  try {
    let query = supabaseServer.from('passes').select('*')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, passes: data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Update pass status
export async function updatePassStatus(passId: string, status: string) {
  try {
    const { data, error } = await supabaseServer
      .from('passes')
      .update({ status, updated_at: new Date() })
      .eq('id', passId)
      .select()

    if (error) throw error

    return { success: true, pass: data[0] }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Get pass by public token (for verification)
export async function getPassByPublicToken(publicToken: string) {
  try {
    const { data, error } = await supabaseServer
      .from('passes')
      .select('*')
      .eq('public_token', publicToken)
      .single()

    if (error) throw error

    return { success: true, pass: data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Log QR scan
export async function logQRScan(passId: string, scanData: any) {
  try {
    const { data, error } = await supabaseServer
      .from('scan_logs')
      .insert({
        pass_id: passId,
        ...scanData,
      })
      .select()

    if (error) throw error

    return { success: true, log: data[0] }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
```

---

## 5. Dashboard Backend Logic

### Step 5.1: User Dashboard Query

**File**: `src/app/api/dashboard/user/route.ts`

```typescript
import { getUserPasses } from '@/lib/passes.server'
import { supabaseServer } from '@/lib/auth.server'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Verify token
    const token = request.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) throw new Error('No token')

    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
    ) as any

    const userId = decoded.userId
    const status = request.nextUrl.searchParams.get('status')

    // Get user's passes
    const result = await getUserPasses(userId, status || undefined)

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 })
    }

    // Calculate statistics
    const allPasses = await getUserPasses(userId)
    const stats = {
      total: allPasses.passes?.length || 0,
      active: allPasses.passes?.filter(p => p.status === 'Active').length || 0,
      expired: allPasses.passes?.filter(p => p.status === 'Expired').length || 0,
      pending: allPasses.passes?.filter(p => p.status === 'Pending').length || 0,
    }

    return NextResponse.json({
      passes: result.passes,
      stats,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch dashboard' },
      { status: 500 }
    )
  }
}
```

### Step 5.2: Host Dashboard Query

**File**: `src/app/api/dashboard/host/route.ts`

```typescript
import { getAllPasses } from '@/lib/passes.server'
import { supabaseServer } from '@/lib/auth.server'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Verify token
    const token = request.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) throw new Error('No token')

    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
    ) as any

    // Check if user is host
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (user?.role !== 'host') {
      return NextResponse.json(
        { message: 'Unauthorized: Only hosts can access' },
        { status: 403 }
      )
    }

    const status = request.nextUrl.searchParams.get('status')

    // Get all passes
    const result = await getAllPasses(status || undefined)

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 })
    }

    // Calculate analytics
    const allPasses = result.passes

    // Monthly breakdown
    const monthlyData = new Map()
    allPasses.forEach(pass => {
      const month = new Date(pass.created_at).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      })
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1)
    })

    const analytics = {
      totalPasses: allPasses.length,
      activePasses: allPasses.filter(p => p.status === 'Active').length,
      expiredPasses: allPasses.filter(p => p.status === 'Expired').length,
      totalQuantity: allPasses.reduce((sum, p) => sum + (p.quantity || 0), 0),
      mineralBreakdown: Object.entries(
        allPasses.reduce((acc: any, p) => {
          acc[p.mineral_type] = (acc[p.mineral_type] || 0) + 1
          return acc
        }, {})
      ),
      monthlyTrend: Array.from(monthlyData.entries()),
    }

    return NextResponse.json({
      passes: result.passes,
      analytics,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch host dashboard' },
      { status: 500 }
    )
  }
}
```

### Step 5.3: Connect Dashboard Component to API

**File**: `src/app/dashboard/user/page.tsx`

```typescript
'use client'

import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'

export default function UserDashboard() {
  const { user } = useAuth()
  const [passes, setPasses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    fetchDashboard()
  }, [filterStatus])

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const query = filterStatus === 'All' ? '' : `?status=${filterStatus}`

      const res = await fetch(`/api/dashboard/user${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setPasses(data.passes)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Transportation Passes</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-sm text-gray-600">Total Passes</p>
          <p className="text-2xl font-bold">{stats?.total}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold">{stats?.active}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-sm text-gray-600">Expired</p>
          <p className="text-2xl font-bold">{stats?.expired}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold">{stats?.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['All', 'Active', 'Expired'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded ${
              filterStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Passes List */}
      <div className="space-y-4">
        {passes.map(pass => (
          <div key={pass.id} className="border p-4 rounded">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{pass.eform_c_no}</p>
                <p className="text-sm text-gray-600">{pass.mineral_type}</p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  pass.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pass.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 6. Google OAuth Configuration

### Step 6.1: Setup Google OAuth Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create New Project**:
   - Project Name: `eMineral Pass`
3. **Enable Google+ API**:
   - Search "Google+ API" → Click → Enable
4. **Create OAuth 2.0 Credentials**:
   - Click **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Application Type: **Web Application**
   - Name: `eMineral Pass Web`
   - Authorized Redirect URIs:
     ```
     http://localhost:3000/auth/callback/google
     https://yourdomain.com/auth/callback/google
     ```
   - Copy **Client ID** and **Client Secret**

### Step 6.2: Add Google OAuth to Environment

**`.env.local`:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback/google
```

### Step 6.3: Create Google OAuth Sign-In Handler

**File**: `src/app/api/auth/google/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/auth.server'
import jwt from 'jsonwebtoken'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  expires_in: number
  token_type: string
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      }),
    })

    const tokenData: GoogleTokenResponse = await tokenRes.json()

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const googleUser = await userRes.json()

    // Check if user exists in database
    let { data: existingUser, error: queryError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', googleUser.email)
      .single()

    let userId = existingUser?.id

    // If not exists, create new user
    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabaseServer
        .from('users')
        .insert({
          email: googleUser.email,
          full_name: googleUser.name,
          role: 'user', // Default role
          verified: true,
          password_hash: '', // OAuth users don't have passwords
        })
        .select()
        .single()

      if (insertError) throw insertError
      userId = newUser.id
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId, 
        email: googleUser.email, 
        role: existingUser?.role || 'user' 
      },
      process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email: googleUser.email,
        full_name: googleUser.name,
        role: existingUser?.role || 'user',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 400 }
    )
  }
}
```

### Step 6.4: Update Sign-In Page with Google Button

**File**: `src/app/(auth)/signin/page.tsx` (Add to existing code)

```typescript
'use client'

import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: response.code }),
        })

        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('auth_token', data.token)
          // Redirect to dashboard
          window.location.href = `/dashboard/${data.user.role}`
        }
      } finally {
        setLoading(false)
      }
    },
    flow: 'auth-code',
  })

  return (
    <div>
      {/* Your existing form */}
      
      {/* Google Sign-In Button */}
      <button
        onClick={() => handleGoogleLogin()}
        disabled={loading}
        className="w-full mt-4 bg-white border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-50"
      >
        <img src="/google-icon.svg" className="inline mr-2 w-4 h-4" />
        Sign in with Google
      </button>
    </div>
  )
}
```

### Step 6.5: Wrap App with GoogleOAuthProvider

**File**: `src/app/root-provider.tsx`

```typescript
'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}
```

---

## 7. PDF & QR Code Generation

### Step 7.1: Setup PDF Generation

**Install**: `npm install jspdf qrcode.react`

**File**: `src/lib/pdf-generator.ts`

```typescript
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

export async function generatePassPDF(passData: any) {
  try {
    const doc = new jsPDF()

    // Add header
    doc.setFontSize(20)
    doc.text('eMineral Pass', 20, 20)

    // Add pass details
    doc.setFontSize(12)
    const details = [
      [`Pass Number: ${passData.eform_c_no}`],
      [`Mineral: ${passData.mineral_type}`],
      [`Quantity: ${passData.quantity} ${passData.unit}`],
      [`Destination: ${passData.destination_location}`],
      [`Status: ${passData.status}`],
      [`Valid Until: ${new Date(passData.valid_upto).toLocaleDateString()}`],
    ]

    let yPosition = 40
    details.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, yPosition)
      yPosition += 10
    })

    // Generate and add QR code
    const qrDataUrl = await QRCode.toDataURL(passData.public_token)
    doc.addImage(qrDataUrl, 'PNG', 20, yPosition + 10, 60, 60)

    // Save PDF
    return doc.output('arraybuffer')
  } catch (error) {
    throw new Error(`PDF generation failed: ${(error as Error).message}`)
  }
}
```

### Step 7.2: Upload PDF to Supabase Storage

**File**: `src/lib/storage.server.ts`

```typescript
import { supabaseServer } from './auth.server'

export async function uploadPassPDF(userId: string, passId: string, pdfBuffer: ArrayBuffer) {
  try {
    const fileName = `passes/${userId}/${passId}.pdf`

    const { data, error } = await supabaseServer.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: publicUrl } = supabaseServer.storage
      .from('documents')
      .getPublicUrl(fileName)

    return publicUrl.publicUrl
  } catch (error) {
    throw new Error(`PDF upload failed: ${(error as Error).message}`)
  }
}
```

---

## 8. Deployment Guide

### Step 8.1: Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Auth system tested thoroughly
- [ ] Google OAuth credentials valid
- [ ] PDF generation tested
- [ ] Supabase RLS policies enabled
- [ ] All API routes tested
- [ ] Frontend components compiled without errors
- [ ] SSL certificate configured
- [ ] Database backups scheduled

### Step 8.2: Deploy to Vercel

**Method 1: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Method 2: Using GitHub Integration**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project" → Select GitHub repo
4. Configure project settings
5. Add environment variables (paste from `.env.local`)
6. Click "Deploy"

### Step 8.3: Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### Step 8.4: Configure Supabase for Production

1. **Enable HTTPS Redirect**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Add authorized redirect URL: `https://yourdomain.com/auth/callback`

2. **Update Email Settings** (Optional):
   - Use custom SMTP for sending emails
   - Go to Authentication → Email Templates → SMTP Settings

3. **Setup Database Backups**:
   - Go to Settings → Backups
   - Enable automatic daily backups

### Step 8.5: Deploy to Docker (Alternative)

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

**Build & Run:**
```bash
docker build -t emineral-pass .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  emineral-pass
```

---

## 9. Freelancer Handover Checklist

### Step 9.1: Documentation Preparation

**Create following documents:**
- [ ] `README.md` ✅ (Already created)
- [ ] `nextStep.md` ✅ (This document)
- [ ] `DEPLOYMENT.md` - Deployment procedures
- [ ] `API_DOCS.md` - Complete API documentation
- [ ] `DATABASE.md` - Database schema and queries
- [ ] `ARCHITECTURE.md` - System architecture overview

### Step 9.2: Code Preparation

**Ensure proper code organization:**
- [ ] Remove all sensitive data from repository
- [ ] Create `.env.example` with placeholder values
- [ ] Add `.gitignore` entries:
  ```
  .env.local
  .env.production
  node_modules/
  .next/
  dist/
  build/
  ```
- [ ] Create issue templates in `.github/ISSUE_TEMPLATE/`
- [ ] Create PR template in `.github/PULL_REQUEST_TEMPLATE.md`

### Step 9.3: Project Handover Document

**Create `HANDOVER.md`:**

```markdown
# Project Handover Guide - eMineral Pass

## Project Overview
[Brief description]

## Tech Stack
- Frontend: Next.js 16.1.6, TailwindCSS, Framer Motion
- Backend: Supabase PostgreSQL, Next.js API Routes
- Auth: JWT + Google OAuth
- Deployment: Vercel

## Critical Information

### Access Credentials
- Supabase Project: [URL]
- Supabase Email: [Email]
- Google Cloud Project: [Project ID]
- Vercel Project: [Project URL]
- GitHub Repository: [URL]

### Environment Variables (Keep Secure)
- Store in `.env.local` (never commit)
- Template in `.env.example`

### Key Contacts
- Original Developer: [Your Name]
- Email: [Your Email]
- Phone: [Your Phone]

## Getting Started

1. Clone repository
2. Copy `.env.example` to `.env.local`
3. Get credentials from project owner
4. Run `npm install && npm run dev`
5. Visit http://localhost:3000

## Important URLs

- Production: [yourdomain.com]
- Staging: [staging.yourdomain.com]
- Supabase Dashboard: [supabase-url]
- Vercel Dashboard: [vercel-url]

## Monthly Maintenance Tasks

- [ ] Review security logs
- [ ] Update dependencies
- [ ] Check database backups
- [ ] Monitor error logs
- [ ] Performance analysis

## Common Issues & Solutions

[Document any known issues and how to fix them]
```

### Step 9.4: Video Walkthrough Guide

**Record videos demonstrating:**
1. How to set up development environment
2. How to deploy updates to production
3. How to add new features (e.g., new form fields)
4. How to troubleshoot common errors
5. How to handle database migrations

**Upload to**: YouTube (private) or Loom

### Step 9.5: Knowledge Transfer Meeting

**Schedule 2-3 hours meeting with freelancer:**

**Agenda:**
1. **Architecture Overview** (30 min)
   - System flow
   - Data models
   - Authentication logic

2. **Frontend Deep Dive** (30 min)
   - Components structure
   - State management
   - Theme system

3. **Backend Integration** (30 min)
   - Supabase setup
   - API routes
   - Database queries

4. **Deployment Process** (20 min)
   - Vercel workflow
   - Environment variables
   - Rollback procedures

5. **Q&A & Common Tasks** (20 min)
   - Troubleshooting
   - Adding features
   - Performance optimization

### Step 9.6: Create Maintenance Guide

**File**: `MAINTENANCE.md`

```markdown
# Maintenance & Operations Guide

## Weekly Tasks
- [ ] Check error logs in Sentry (if configured)
- [ ] Monitor Vercel deployment logs
- [ ] Test all major user flows

## Monthly Tasks
- [ ] Review database performance
- [ ] Update dependencies (npm audit)
- [ ] Check SSL certificate expiration
- [ ] Verify backup integrity
- [ ] Performance analysis

## Quarterly Tasks
- [ ] Security audit
- [ ] Database optimization
- [ ] Cost analysis (Supabase, Vercel)
- [ ] Update documentation

## Emergency Procedures

### Database Down
1. Check Supabase status page
2. Verify connection strings
3. Check database quota
4. Restart server if needed

### Deployment Failed
1. Check Vercel logs
2. Verify environment variables
3. Roll back to previous version
4. Fix and redeploy

### High Traffic/Errors
1. Check rate limits
2. Verify database connections
3. Increase Supabase compute
4. Optimize queries
```

### Step 9.7: Provide Access & Permissions

**Grant freelancer access to:**
- [ ] GitHub repository (Collaborator)
- [ ] Vercel project (Team member)
- [ ] Supabase account (Team member)
- [ ] Google Cloud project (Editor)
- [ ] Domain registrar account (Email access)
- [ ] Email management (Forwarding for support)

### Step 9.8: Final Verification

**Before handing over, verify:**
- [ ] All links in documentation are correct
- [ ] No hardcoded secrets in repository
- [ ] No console.log() statements left in production code
- [ ] All environment variables documented
- [ ] Database backups verified
- [ ] SSL certificate valid
- [ ] Monitoring tools configured (Sentry, DataDog, etc.)
- [ ] Support email/chat configured
- [ ] Status page setup

---

## 🎓 Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx supabase migration up    # Run migrations
npx supabase db reset        # Reset database

# Deployment
vercel deploy               # Deploy to preview
vercel deploy --prod        # Deploy to production
```

### Useful Supabase Queries

```sql
-- Check active users
SELECT COUNT(*) as active_users FROM users WHERE verified = true;

-- Recent passes
SELECT * FROM passes ORDER BY created_at DESC LIMIT 10;

-- Monthly statistics
SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
FROM passes GROUP BY month ORDER BY month DESC;
```

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion
- **Government Forms**: https://minerals.gov.in

---

## ✅ Completion Checklist

- [ ] Supabase project created and configured
- [ ] All database tables created
- [ ] Authentication system implemented
- [ ] Google OAuth integrated
- [ ] Dashboard backend working
- [ ] PDF/QR generation working
- [ ] All API routes tested
- [ ] Deployed to production
- [ ] All documentation created
- [ ] Freelancer trained and handed over
- [ ] Support contact established

---

<div align="center">

**Ready to scale? You're all set! 🎉**

For questions, contact: support@emineral-pass.gov.in

</div>
