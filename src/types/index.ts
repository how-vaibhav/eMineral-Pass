// Domain types for forms, records, and API responses
import { Database } from './database'

export type Record = Database['public']['Tables']['records']['Row']
export type RecordInsert = Database['public']['Tables']['records']['Insert']
export type ScanLog = Database['public']['Tables']['scan_logs']['Row']
export type FormTemplate = Database['public']['Tables']['form_templates']['Row']
export type User = Database['public']['Tables']['users']['Row']

// Form field definitions
export interface FormFieldDefinition {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'phone'
  placeholder?: string
  required: boolean
  readOnly?: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  options?: Array<{ label: string; value: string }>
}

export interface FormSchema {
  id: string
  title: string
  description?: string
  fields: FormFieldDefinition[]
  validityHours: number
}

// Form submission data
export interface FormSubmissionData {
  [key: string]: string | number | boolean | null | Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Dashboard analytics
export interface DashboardStats {
  totalRecords: number
  totalScans: number
  recordsToday: number
  recordsThisWeek: number
  avgScansPerRecord: number
  activeRecords: number
  expiredRecords: number
}

export interface RecordsPerDay {
  date: string
  count: number
}

export interface ScansPerDay {
  date: string
  count: number
}

// Filter options
export interface RecordFilters {
  dateFrom?: string
  dateTo?: string
  status?: 'active' | 'expired' | 'archived'
  sortBy?: 'created_at' | 'valid_upto' | 'total_scans'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: AuthUser
}
