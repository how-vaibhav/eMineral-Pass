// Database types generated from schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
      records: {
        Row: {
          id: string
          user_id: string
          form_data: Json
          generated_on: string
          valid_upto: string
          status: string
          public_token: string
          qr_code_url: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
          archived_at: string | null
          total_scans: number
          last_scan_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          form_data: Json
          generated_on?: string
          valid_upto: string
          status?: string
          public_token: string
          qr_code_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
          total_scans?: number
          last_scan_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          form_data?: Json
          generated_on?: string
          valid_upto?: string
          status?: string
          public_token?: string
          qr_code_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
          total_scans?: number
          last_scan_at?: string | null
        }
      }
      scan_logs: {
        Row: {
          id: string
          record_id: string
          scanned_at: string
          user_agent: string | null
          ip_address: string | null
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          record_id: string
          scanned_at?: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          record_id?: string
          scanned_at?: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
        }
      }
      form_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          schema: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          schema: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          schema?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      record_analytics: {
        Row: {
          created_date: string | null
          records_created: number | null
          user_id: string | null
        }
      }
      scan_analytics: {
        Row: {
          scanned_date: string | null
          total_scans: number | null
          record_id: string | null
        }
      }
    }
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
