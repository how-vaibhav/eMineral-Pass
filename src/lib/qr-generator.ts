import QRCode from 'qrcode'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface GenerateQROptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Generate QR code data URL
 * Used for client-side display and PDF embedding
 */
export async function generateQRCodeDataUrl(
  text: string,
  options: GenerateQROptions = {}
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    color = { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel = 'H',
  } = options

  return QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel,
  })
}

/**
 * Generate QR code buffer (for file storage)
 */
export async function generateQRCodeBuffer(
  text: string,
  options: GenerateQROptions = {}
): Promise<Buffer> {
  const {
    width = 300,
    margin = 2,
    color = { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel = 'H',
  } = options

  return QRCode.toBuffer(text, {
    width,
    margin,
    color,
    errorCorrectionLevel,
    type: 'image/png',
  })
}

/**
 * Upload QR code to Supabase Storage
 */
export async function uploadQRCode(
  recordId: string,
  userId: string,
  qrBuffer: Buffer
): Promise<string> {
  const filename = `${recordId}-${Date.now()}.png`
  const path = `qr-codes/${userId}/${filename}`

  const { data, error } = await supabaseAdmin.storage
    .from('qr-codes')
    .upload(path, qrBuffer, {
      contentType: 'image/png',
      cacheControl: '31536000', // 1 year
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload QR code: ${error.message}`)
  }

  // Return public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from('qr-codes').getPublicUrl(data.path)

  return publicUrl
}

/**
 * Get public record URL (what goes in QR code)
 */
export function getPublicRecordUrl(publicToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/records/${publicToken}`
}

/**
 * Generate and store QR code for a record
 */
export async function generateAndStoreQRCode(
  recordId: string,
  userId: string,
  publicToken: string
): Promise<string> {
  try {
    const publicUrl = getPublicRecordUrl(publicToken)
    const qrBuffer = await generateQRCodeBuffer(publicUrl)
    const qrCodeUrl = await uploadQRCode(recordId, userId, qrBuffer)
    return qrCodeUrl
  } catch (error) {
    console.error('QR code generation failed:', error)
    throw error
  }
}
