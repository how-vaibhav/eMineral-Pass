'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { generatePublicToken } from '@/lib/utils'
import { generateAndStoreQRCode } from '@/lib/qr-generator'
import { generateAndStorePDF } from '@/lib/pdf-generator'
import { FormFieldDefinition, FormSubmissionData, Record } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { addHours } from 'date-fns'
import { formatTimestamp, calculateValidityExpiration } from '@/lib/timestamp-utils'

interface CreateRecordInput {
  userId: string
  formData: FormSubmissionData
  fields: FormFieldDefinition[]
  validityHours?: number
}

/**
 * Server action to create a new record with QR and PDF
 * Called after form validation on the server
 * 
 * Handles:
 * - Timestamp generation (server-side only)
 * - Record creation with auto-generated fields
 * - QR code generation and storage
 * - PDF generation and storage
 */
export async function createRecord({ userId, formData, fields, validityHours = 24 }: CreateRecordInput) {
  try {
    const recordId = uuidv4()
    const publicToken = generatePublicToken()
    
    // Generate timestamps using official format (DD-MM-YYYY HH:MM:SS AM/PM)
    const generatedOn = new Date()
    const generatedOnFormatted = formatTimestamp(generatedOn)
    const validUpto = addHours(generatedOn, validityHours)
    const validUptoFormatted = calculateValidityExpiration(generatedOnFormatted)

    // Include generated fields in form data
    const completeFormData: FormSubmissionData = {
      ...formData,
      generated_on: generatedOnFormatted,
      valid_upto: validUptoFormatted,
    }

    // 1. Create record in database
    const { data: record, error: recordError } = await supabaseAdmin
      .from('records')
      .insert({
        id: recordId,
        user_id: userId,
        form_data: completeFormData as any,
        generated_on: generatedOn.toISOString(), // Store actual date for filtering
        valid_upto: validUpto.toISOString(), // Store actual date for expiry checks
        public_token: publicToken,
        status: 'active',
      } as any)
      .select()
      .single()

    if (recordError) {
      throw new Error(`Failed to create record: ${recordError.message}`)
    }

    // 2. Generate and store QR code
    let qrCodeUrl = null
    try {
      qrCodeUrl = await generateAndStoreQRCode(recordId, userId, publicToken)
    } catch (qrError) {
      console.error('QR generation failed:', qrError)
      // Don't fail the entire operation if QR generation fails
    }

    // 3. Generate and store PDF
    let pdfUrl = null
    try {
      pdfUrl = await generateAndStorePDF(recordId, userId, completeFormData, generatedOn, validUpto, fields, qrCodeUrl || undefined)
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError)
      // Don't fail the entire operation if PDF generation fails
    }

    // 4. Update record with QR and PDF URLs
    const { error: updateError } = await (supabaseAdmin as any)
      .from('records')
      .update({
        qr_code_url: qrCodeUrl,
        pdf_url: pdfUrl,
      })
      .eq('id', recordId)

    if (updateError) {
      throw new Error(`Failed to update record with URLs: ${updateError.message}`)
    }

    // 5. Log audit event
    await (supabaseAdmin as any).from('audit_logs').insert({
      user_id: userId,
      action: 'create_record',
      entity_type: 'record',
      entity_id: recordId,
      new_values: { id: recordId, public_token: publicToken },
    })

    return {
      success: true,
      record: {
        ...(record as any),
        qr_code_url: qrCodeUrl,
        pdf_url: pdfUrl,
        generated_on: generatedOnFormatted,
        valid_upto: validUptoFormatted,
      },
      publicToken,
    }
  } catch (error) {
    console.error('Create record error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create record',
    }
  }
}

/**
 * Get single record for authenticated user
 */
export async function getRecord(userId: string, recordId: string) {
  try {
    const { data: record, error } = await (supabaseAdmin as any)
      .from('records')
      .select('id, user_id, form_data, generated_on, valid_upto, public_token, status, qr_code_url, pdf_url, total_scans, created_at')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single()

    if (error || !record) {
      throw new Error(`Record not found: ${error?.message || 'Unknown error'}`)
    }

    return { success: true, record: record as any }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch record',
    }
  }
}

/**
 * Get public record (no auth required, public_token validation)
 */
export async function getPublicRecord(publicToken: string) {
  try {
    const { data: record, error } = await (supabaseAdmin as any)
      .from('records')
      .select('id, form_data, generated_on, valid_upto, status, total_scans, qr_code_url, pdf_url')
      .eq('public_token', publicToken)
      .single()

    if (error || !record) {
      throw new Error(`Record not found: ${error?.message || 'Unknown error'}`)
    }

    return { success: true, record: record as any }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Record not found',
    }
  }
}

/**
 * List records for authenticated user with filters
 */
export async function listRecords(
  userId: string,
  filters: {
    status?: 'active' | 'expired' | 'archived'
    limit?: number
    offset?: number
  } = {}
) {
  try {
    const { status, limit = 50, offset = 0 } = filters

    let query = supabaseAdmin
      .from('records')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to list records: ${error.message}`)
    }

    return {
      success: true,
      records: data,
      total: count || 0,
      limit,
      offset,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list records',
    }
  }
}

/**
 * Delete record (only owner can delete)
 */
export async function deleteRecord(userId: string, recordId: string) {
  try {
    // Verify ownership
    const { data: record, error: recordError } = await (supabaseAdmin as any)
      .from('records')
      .select('user_id')
      .eq('id', recordId)
      .single()

    if (recordError || !record) {
      throw new Error('Record not found')
    }

    if ((record as any).user_id !== userId) {
      throw new Error('Unauthorized')
    }

    // TODO: Delete associated files from storage
    // - Delete QR code from storage
    // - Delete PDF from storage

    const { error } = await (supabaseAdmin as any).from('records').delete().eq('id', recordId)

    if (error) {
      throw new Error(`Failed to delete record: ${error.message}`)
    }

    // Log audit event
    await (supabaseAdmin as any).from('audit_logs').insert({
      user_id: userId,
      action: 'delete_record',
      entity_type: 'record',
      entity_id: recordId,
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete record',
    }
  }
}
