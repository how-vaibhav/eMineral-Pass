# eMineral Pass - Digital Mineral Transportation Authorization System 🇮🇳

> Official digital pass system for mineral transportation under the Uttar Pradesh Minerals Rules, 2018. A comprehensive government-compliant platform for managing mineral transportation permits, QR-based verification, and real-time tracking.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen.svg)
![Node](https://img.shields.io/badge/Node-18+-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [UI Screenshots](#ui-screenshots)
- [Advanced Features](#advanced-features)
- [API Documentation](#api-documentation)
- [Authentication System](#authentication-system)
- [Database Schema](#database-schema)
- [Environment Configuration](#environment-configuration)
- [Deployment Guide](#deployment-guide)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**eMineral Pass** is a sophisticated digital platform designed to streamline mineral transportation authorization in India. The system combines government compliance, QR-based verification, real-time analytics, and secure PDF generation to create an efficient, transparent, and secure transportation permit ecosystem.

This project was delivered as a freelance engagement.

### Core Objectives

- **Regulatory Compliance**: Adheres to UP Minerals Rules 2018
- **Digital Transformation**: Replace paper-based permits with digital passes
- **Real-time Tracking**: Monitor mineral transportation with QR code verification
- **Public Transparency**: Enable public verification of authentic passes
- **Security**: Bank-grade encryption and authentication

---

## ✨ Key Features

### For Transport Users

- 📝 **Government Form Compliance**: Official eForm-C template with validation
- 🆔 **Auto-Generated QR Codes**: Unique QR pass for every submission
- 📄 **PDF Generation**: Government-standard documentation with digital signatures
- 📊 **Pass Management**: Create, track, and manage transportation permits
- 🔍 **Status Tracking**: Real-time pass validity and expiration tracking
- 📱 **Mobile Responsive**: Full functionality on all devices
- 🌙 **Dark/Light Mode**: Theme toggle with persistent storage

### For License Hosts (Admin)

- 🏢 **Portal Dashboard**: Centralized management system
- 📈 **Analytics**: Track issued passes, active permits, monthly trends
- 🔐 **Role-Based Access**: View and download pass PDFs only (no creation)
- 🔎 **Advanced Filtering**: Filter passes by status (Active/Expired)
- 📋 **Pass Verification**: Verify and manage transportation records
- 🎛️ **Settings Management**: Configure portal preferences

### Universal Features

- 🎨 **Professional UI/UX**: Smooth animations and transitions
- 🌍 **Multi-Role Support**: Host and User authentication flows
- 🔐 **Secure Authentication**: Role-based access control (RBAC)
- 💾 **Database Persistence**: Supabase PostgreSQL integration
- 🔔 **User Feedback**: Real-time alerts (success, errors, warnings)
- 🎬 **Page Animations**: Professional staggered entrance effects
- 🔐 **Password Recovery**: Forgot password with email reset
- 🔑 **Social Auth**: Google OAuth integration ready

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Home Page  │  │  Auth Pages   │  │  Dashboard   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Next.js App Router Layer                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Route Handlers │ API Routes │ Server Components  │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│           Global Context & State Management              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Theme Ctx  │  │   Auth Ctx   │  │  Form State  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│           Business Logic & Data Processing               │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │ PDF Generation │  │ QR Code Gen    │                  │
│  └────────────────┘  └────────────────┘                  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Supabase Backend Services                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  PostgreSQL  │  Auth  │  Storage  │  Real-time │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.1.6](https://nextjs.org) - React-based framework with SSR/SSG
- **UI/Styling**: [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- **Animations**: [Framer Motion](https://www.framer.com/motion) - Production-quality animations
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful icon library
- **Form Handling**: Native React with validation
- **State Management**: React Context API + Hooks
- **Type Safety**: TypeScript with strict mode

### Backend

- **Database**: [Supabase](https://supabase.com) - PostgreSQL with real-time features
- **Authentication**: Supabase Auth + JWT tokens + Google OAuth
- **File Storage**: Supabase Storage for PDF files
- **API Layer**: Next.js API routes with edge computing

### Development & DevOps

- **Package Manager**: npm (v9+)
- **Build Tool**: Turbopack (Next.js 16)
- **Linting**: ESLint with TypeScript support
- **Code Formatting**: Prettier (configured)
- **Environment Management**: .env.local for secrets

---

## 🚀 Quick Start

### Prerequisites

```bash
- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Supabase account (free tier available)
- Google OAuth credentials (optional)
```

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/form-qr-pdf-app.git
cd form-qr-pdf-app
```

2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure Environment Variables**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run Development Server**

```bash
npm run dev
```

Server runs at **[http://localhost:3000](http://localhost:3000)**

5. **Build for Production**

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
form-qr-pdf-app/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Auth routes group
│   │   │   ├── signin/page.tsx     # Enhanced sign-in with animations
│   │   │   └── signup/page.tsx     # User registration
│   │   ├── (dashboard)/            # Dashboard routes group
│   │   │   ├── form/page.tsx       # eForm-C submission
│   │   │   └── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── user/page.tsx       # User dashboard with filters
│   │   │   └── host/page.tsx       # Host portal with analytics
│   │   ├── api/                    # Next.js API routes
│   │   │   ├── health/route.ts     # Health check endpoint
│   │   │   └── public/records/     # Public verification routes
│   │   ├── layout.tsx              # Root layout with GlobalNavbar
│   │   ├── page.tsx                # Landing page with animations
│   │   ├── globals.css             # Global TailwindCSS styles
│   │   └── root-provider.tsx       # Root context providers
│   │
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── GlobalNavbar.tsx        # Global navigation bar
│   │   └── DashboardNavbar.tsx     # Dashboard-specific navbar
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.tsx         # Authentication state & RBAC
│   │   ├── ThemeContext.tsx        # Dark/Light mode management
│   │   └── index.ts
│   │
│   ├── lib/                        # Business logic & utilities
│   │   ├── pdf-generator.ts        # PDF generation with jsPDF
│   │   ├── qr-generator.ts         # QR code generation
│   │   ├── records.server.ts       # Server-side record operations
│   │   ├── scan-logs.server.ts     # QR scan logging
│   │   ├── supabase.ts             # Supabase client setup
│   │   ├── utils.ts                # Helper functions
│   │   ├── validation.ts           # Form validation schemas
│   │   └── eform-c-official.ts     # Government form schema
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── database.ts             # DB schema types
│   │   ├── index.ts                # General types
│   │   ├── auth.ts                 # Authentication types
│   │   └── qrcode.d.ts             # QR library types
│   │
│   └── supabase/
│       └── migrations/             # Database migrations
│           └── 001_init_schema.sql # Initial schema setup
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 🖼️ UI Screenshots

Screenshots are stored in the [Screenshots](Screenshots) folder.

![UI Screenshot 1](<Screenshots/eMineral%20(1).png>)
![UI Screenshot 2](<Screenshots/eMineral%20(2).png>)
![UI Screenshot 3](<Screenshots/eMineral%20(3).png>)
![UI Screenshot 4](<Screenshots/eMineral%20(4).png>)
![UI Screenshot 5](<Screenshots/eMineral%20(5).png>)
![UI Screenshot 6](<Screenshots/eMineral%20(6).png>)
![UI Screenshot 7](<Screenshots/eMineral%20(7).png>)

---

## 🎨 Advanced Features

### 1. **Responsive Design**

- Mobile-first approach with breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Flexible grid layouts adapting to screen size
- Touch-friendly buttons and inputs
- Optimized for all device sizes

### 2. **Theme System**

```typescript
// Automatic detection of system preference
// Options: 'light' | 'dark' | 'system'
// Persisted to localStorage for consistency
const { effectiveTheme, toggleTheme } = useTheme();
```

### 3. **Professional Animations**

- **Page entrance**: Staggered animations with Framer Motion
- **Button interactions**: Scale and tap animations
- **Loading states**: Spinning loaders with visual feedback
- **Transitions**: Smooth page switches with AnimatePresence

### 4. **Form Validation**

```typescript
// Multi-level validation strategy
1. Client-side: Real-time validation as user types
2. Field-level: Individual field error tracking
3. Form-level: Complete submission validation
4. Server-side: Additional security validation
```

### 5. **QR Code System**

- Unique QR generation for each pass
- Encoded with pass metadata
- Public verification endpoint
- Scan logging and analytics

### 6. **PDF Generation**

- Government-compliant document format
- Official eForm-C template
- Dynamic data insertion
- Digital watermarking support
- Ready for printing and archival

### 7. **Authentication Flow**

```
User Registration/Login
         ↓
Role Selection (Host/User)
         ↓
Email + Password Verification
         ↓
JWT Token Generation
         ↓
Context Update + Local Storage
         ↓
Dashboard Access (Role-based)
```

---

## 📡 API Documentation

### Health Check

```bash
GET /api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-02-01T10:30:00Z",
  "version": "1.0.0"
}
```

### Public Record Verification

```bash
GET /api/public/records/[publicToken]
```

**Parameters:**

- `publicToken` (string): Public verification token

**Response:**

```json
{
  "id": "pass-id",
  "passnumber": "EMP-2026-001",
  "mineral": "Limestone",
  "status": "Active",
  "validUpto": "2026-02-02T23:59:59Z",
  "licensee": "ABC Mining Co.",
  "verified": true
}
```

### Error Responses

```json
{
  "error": "Pass not found or expired",
  "code": "PASS_NOT_FOUND",
  "timestamp": "2026-02-01T10:30:00Z"
}
```

---

## 🔐 Authentication System

### User Roles & Permissions

**Transport User**

- ✅ Create and submit eForm-C
- ✅ Generate QR passes
- ✅ Download own PDFs
- ✅ Track pass status
- ❌ Cannot approve passes
- ❌ Cannot view host analytics

**License Host**

- ✅ View all transportation passes
- ✅ Download pass PDFs
- ✅ Filter and search passes
- ✅ View analytics dashboard
- ❌ Cannot create new passes
- ❌ Cannot modify submitted data

### Security Measures

- JWT token-based authentication
- Secure password hashing with bcrypt
- CORS protection on API routes
- Rate limiting on sensitive endpoints
- Secure session management
- HTTPS enforcement in production

---

## 📊 Database Schema

### Core Tables

**users**

```sql
id: UUID (Primary Key)
email: VARCHAR (Unique)
password_hash: VARCHAR
role: ENUM ('host', 'user')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**passes**

```sql
id: UUID (Primary Key)
user_id: UUID (Foreign Key)
eform_c_no: VARCHAR (Unique)
mineral: VARCHAR
quantity: DECIMAL
destination: VARCHAR
status: ENUM ('Active', 'Expired', 'Pending')
qr_code: TEXT (JSON)
created_at: TIMESTAMP
valid_upto: TIMESTAMP
```

**scan_logs**

```sql
id: UUID (Primary Key)
pass_id: UUID (Foreign Key)
scanned_by: VARCHAR
scan_location: POINT (Geolocation)
scanned_at: TIMESTAMP
```

---

## 🌍 Environment Configuration

### Development (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Debug
DEBUG=true
```

### Production (.env.production)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key

# API
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Security
DEBUG=false
SENTRY_DSN=your-sentry-dsn
```

---

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Server Deployment

```bash
# Build
npm run build

# Start production server
npm start

# Use PM2 for process management
pm2 start "npm start" --name "eMineral-Pass"
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript strict mode
- Use ESLint rules
- Write meaningful commit messages
- Include documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

For issues, questions, or suggestions:

- 📧 **Email**: support@emineral-pass.gov.in
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/form-qr-pdf-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/form-qr-pdf-app/discussions)

---

## 🎓 Additional Resources

- [Government eForm-C Official Template](https://minerals.gov.in)
- [UP Minerals Rules 2018](https://upforest.gov.in)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

<div align="center">

**Built with ❤️ for transparent mineral transportation in India**

⭐ Please star this repository if you find it helpful!

</div>
