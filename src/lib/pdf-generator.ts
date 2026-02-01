import { jsPDF } from 'jspdf'
import { supabaseAdmin } from '@/lib/supabase'
import { FormFieldDefinition, FormSubmissionData } from '@/types'
import { format } from 'date-fns'

interface PDFGenerationOptions {
  title?: string
  includeQRCode?: boolean
  qrCodeDataUrl?: string
  headerImageUrl?: string
  footerText?: string
}

/**
 * Generate PDF document from form data
 * Designed for A4 print-ready output with professional styling
 */
export async function generatePDF(
  recordId: string,
  formData: FormSubmissionData,
  generatedOn: Date,
  validUpto: Date,
  fields: FormFieldDefinition[],
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const {
    title = 'Form Record',
    includeQRCode = true,
    qrCodeDataUrl,
    footerText,
  } = options

  // Create PDF in A4 format (210 x 297 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 12
  const contentWidth = pageWidth - margin * 2

  let yPosition = margin

  // Helper function to add a line break
  const addLineBreak = (space = 5) => {
    yPosition += space
  }

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredHeight = 30) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // 1. Header with title
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, margin, yPosition)
  yPosition += 15

  // 2. Status badge and key information
  checkPageBreak(15)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')

  const isExpired = new Date() > validUpto
  const status = isExpired ? 'EXPIRED' : 'ACTIVE'
  const statusColor = isExpired ? [220, 38, 38] : [34, 197, 94]

  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2])
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Status: ${status}`, margin, yPosition)
  pdf.setTextColor(0, 0, 0)
  pdf.setFont('helvetica', 'normal')
  yPosition += 8

  // Key metadata
  const generatedOnStr = format(new Date(generatedOn), 'PPP p')
  const validUptoStr = format(new Date(validUpto), 'PPP p')

  pdf.text(`Record ID: ${recordId}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Generated: ${generatedOnStr}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Valid Until: ${validUptoStr}`, margin, yPosition)
  yPosition += 12

  // 3. Divider line
  checkPageBreak(20)
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 8

  // 4. Form data table
  checkPageBreak(30)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Form Data', margin, yPosition)
  yPosition += 8

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)

  // Table configuration
  const tableColumnWidth = contentWidth / 2
  const rowHeight = 8

  for (const field of fields) {
    checkPageBreak(rowHeight + 2)

    const value = formData[field.name] ?? '-'
    const displayValue = String(value)

    // Field label (bold)
    pdf.setFont('helvetica', 'bold')
    pdf.text(field.label + ':', margin, yPosition)

    // Field value (normal)
    pdf.setFont('helvetica', 'normal')
    const labelWidth = pdf.getTextWidth(field.label + ': ')
    const valueX = margin + labelWidth + 2
    const maxValueWidth = contentWidth - labelWidth - 2

    // Use text with word wrap for long values
    const wrappedValue = pdf.splitTextToSize(displayValue, maxValueWidth)
    pdf.text(wrappedValue, valueX, yPosition)

    yPosition += rowHeight + (wrappedValue.length > 1 ? (wrappedValue.length - 1) * 4 : 0)
  }

  yPosition += 8

  // 5. QR Code (if provided)
  if (includeQRCode && qrCodeDataUrl) {
    checkPageBreak(60)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('Verification QR Code', margin, yPosition)
    yPosition += 8

    // Add QR code image (40mm x 40mm)
    try {
      pdf.addImage(qrCodeDataUrl, 'PNG', margin, yPosition, 40, 40)
      yPosition += 45
    } catch (error) {
      console.error('Failed to embed QR code in PDF:', error)
      yPosition += 5
    }
  }

  // 6. Footer
  checkPageBreak(15)
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.setFont('helvetica', 'normal')

  const pageCount = pdf.internal.pages.length - 1
  if (pageCount > 1) {
    pdf.text(`Page 1 of ${pageCount}`, pageWidth - margin - 20, pageHeight - margin)
  }

  if (footerText) {
    pdf.text(footerText, margin, pageHeight - margin)
  }

  // Return as buffer
  return Buffer.from(pdf.output('arraybuffer'))
}

/**
 * Upload PDF to Supabase Storage
 */
export async function uploadPDF(
  recordId: string,
  userId: string,
  pdfBuffer: Buffer,
  filename: string = `${recordId}.pdf`
): Promise<string> {
  const path = `pdfs/${userId}/${filename}`

  const { data, error } = await supabaseAdmin.storage
    .from('pdfs')
    .upload(path, pdfBuffer, {
      contentType: 'application/pdf',
      cacheControl: '31536000', // 1 year
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`)
  }

  // Generate signed URL (1 month expiry)
  const signedRes = await supabaseAdmin.storage.from('pdfs').createSignedUrl(data.path, 2592000) // 30 days

  if (signedRes.error) {
    throw new Error(`Failed to create signed URL: ${signedRes.error.message}`)
  }

  const signedUrl = signedRes.data?.signedUrl
  if (!signedUrl) {
    throw new Error('Failed to create signed URL: no URL returned')
  }

  return signedUrl
}

/**
 * Generate and store PDF for a record
 */
export async function generateAndStorePDF(
  recordId: string,
  userId: string,
  formData: FormSubmissionData,
  generatedOn: Date,
  validUpto: Date,
  fields: FormFieldDefinition[],
  qrCodeDataUrl?: string
): Promise<string> {
  try {
    const pdfBuffer = await generatePDF(
      recordId,
      formData,
      generatedOn,
      validUpto,
      fields,
      {
        title: 'Form Submission Record',
        includeQRCode: true,
        qrCodeDataUrl,
        footerText: `Generated on ${format(new Date(), 'PPP')}`,
      }
    )

    const timestamp = Date.now()
    const pdfUrl = await uploadPDF(recordId, userId, pdfBuffer, `record-${timestamp}.pdf`)
    return pdfUrl
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw error
  }
}
