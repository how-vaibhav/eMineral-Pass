'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { getPublicRecord } from '@/lib/records.server'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface PublicRecordPageProps {
  params: {
    recordId: string
  }
}

export default function PublicRecordPage({ params }: PublicRecordPageProps) {
  const [record, setRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const result = await getPublicRecord(params.recordId)

        if (!result.success) {
          setError(result.error || 'Record not found')
          return
        }

        setRecord(result.record)
      } catch (err) {
        setError('Failed to load record')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecord()
  }, [params.recordId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive mb-4">❌ {error || 'Record not found'}</p>
            <p className="text-center text-muted-foreground text-sm">
              The record you're looking for doesn't exist or may have expired.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = new Date() > new Date(record.valid_upto)
  const status = isExpired ? 'EXPIRED' : 'ACTIVE'
  const statusColor = isExpired ? 'text-destructive' : 'text-accent'

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Status Badge */}
        <div className="mb-6 text-center">
          <span className={`text-sm font-semibold ${statusColor}`}>● {status}</span>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
            <CardDescription>Generated on {format(new Date(record.generated_on), 'PPP p')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Record ID</p>
                <p className="font-mono text-sm break-all">{record.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scan Count</p>
                <p className="text-lg font-semibold">{record.total_scans || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Generated</p>
                <p className="text-sm">{format(new Date(record.generated_on), 'PPP p')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="text-sm">{format(new Date(record.valid_upto), 'PPP p')}</p>
              </div>
            </div>

            {/* Form Data */}
            <div>
              <h3 className="font-semibold mb-4">Submitted Data</h3>
              <div className="space-y-3">
                {typeof record.form_data === 'object' &&
                  Object.entries(record.form_data).map(([key, value]) => (
                    <div key={key} className="border-b pb-3 last:border-b-0">
                      <p className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="font-medium">{String(value) || '-'}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* QR Code */}
            {record.qr_code_url && (
              <div className="text-center pt-6 border-t">
                <p className="text-sm font-medium mb-4">Verification QR Code</p>
                <img src={record.qr_code_url} alt="QR Code" className="w-32 h-32 mx-auto rounded-lg" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-center pt-6 border-t">
              {record.pdf_url && (
                <a
                  href={record.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  📥 Download PDF
                </a>
              )}
              <Button variant="outline" onClick={() => window.print()}>
                🖨️ Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground text-center"
        >
          <p>This is a public record. No login required to view.</p>
          <p className="mt-2 text-xs">Record ID: {record.id}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
