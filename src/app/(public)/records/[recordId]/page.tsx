"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { getPublicRecord, getRecordById } from "@/lib/records.server";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

interface PublicRecordPageProps {
  params: Promise<{
    recordId: string;
  }>;
}

export default function PublicRecordPage({ params }: PublicRecordPageProps) {
  // Unwrap the params Promise using React.use()
  const { recordId } = use(params);
  const { effectiveTheme } = useTheme();

  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const isDark = effectiveTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        // Try to fetch by ID first (UUID format), otherwise by public token
        let result;

        // Check if it's a UUID (has dashes) - likely a record ID
        if (recordId.includes("-")) {
          result = await getRecordById(recordId);
        } else {
          // Otherwise treat as public token
          result = await getPublicRecord(recordId);
        }

        if (!result.success) {
          setError(result.error || "Record not found");
          return;
        }

        setRecord(result.record);
      } catch (err) {
        setError("Failed to load record");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors ${isDark ? "bg-slate-950" : "bg-white"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-blue-600"></div>
          <p
            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
          >
            Loading record...
          </p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors ${isDark ? "bg-slate-950" : "bg-white"}`}
      >
        <div
          className={`max-w-md w-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-lg p-6`}
        >
          <p className="text-center text-red-500 mb-4 text-lg font-semibold">
            ❌ {error || "Record not found"}
          </p>
          <p
            className={`text-center text-sm ${isDark ? "text-slate-400" : "text-slate-600"} mb-6`}
          >
            The record you're looking for doesn't exist or may have expired.
          </p>
          <Link
            href="/"
            className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium text-center transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(record.valid_upto);
  const status = isExpired ? "EXPIRED" : "ACTIVE";
  const statusColor = isExpired ? "text-red-500" : "text-green-500";

  return (
    <div
      className={`min-h-screen p-4 sm:p-8 transition-colors ${isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Status Badge */}
        <div className="mb-6 text-center">
          <span className={`text-sm font-semibold ${statusColor}`}>
            ● {status}
          </span>
        </div>

        {/* Main Card */}
        <div
          className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-lg overflow-hidden`}
        >
          <div
            className={`${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"} border-b px-6 py-6`}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Record Information
            </h1>
            <p
              className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              Generated on {format(new Date(record.generated_on), "PPP p")}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Info */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 ${isDark ? "border-slate-800" : "border-slate-200"} border-b`}
            >
              <div>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  Record ID
                </p>
                <p className="font-mono text-sm break-all font-semibold">
                  {record.id}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  Scan Count
                </p>
                <p className="text-lg font-semibold">
                  {record.total_scans || 0}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  Generated
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(record.generated_on), "PPP p")}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  Valid Until
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(record.valid_upto), "PPP p")}
                </p>
              </div>
            </div>

            {/* Form Data */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Submitted Data</h3>
              <div className="space-y-3">
                {typeof record.form_data === "object" &&
                  Object.entries(record.form_data).map(([key, value]) => (
                    <div
                      key={key}
                      className={`${isDark ? "border-slate-800" : "border-slate-200"} border-b pb-3 last:border-b-0`}
                    >
                      <p
                        className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} capitalize`}
                      >
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-medium text-white">
                        {String(value) || "-"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* QR Code */}
            {record.qr_code_url && (
              <div
                className={`text-center py-6 ${isDark ? "border-slate-800" : "border-slate-200"} border-t`}
              >
                <p className="text-sm font-medium mb-4">Verification QR Code</p>
                <img
                  src={record.qr_code_url}
                  alt="QR Code"
                  className="w-32 h-32 mx-auto rounded-lg"
                />
              </div>
            )}

            {/* Actions */}
            <div
              className={`flex gap-2 justify-center flex-wrap py-6 ${isDark ? "border-slate-800" : "border-slate-200"} border-t`}
            >
              {record.pdf_url && (
                <a
                  href={record.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDark
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white"
                  }`}
                >
                  📥 Download PDF
                </a>
              )}
              <button
                onClick={() => window.print()}
                className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300"
                }`}
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 p-4 rounded-lg text-sm text-center ${
            isDark
              ? "bg-slate-800/50 text-slate-400"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <p>This is a public record. No login required to view.</p>
          <p className="mt-2 text-xs">Record ID: {record.id}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
