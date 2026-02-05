"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  QrCode,
  Download,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  Filter,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Record {
  id: string;
  form_data: any;
  status: string;
  created_at: string;
  valid_upto: string;
  pdf_url?: string;
  qr_code_url?: string;
}

export default function UserDashboard() {
  const { effectiveTheme } = useTheme();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<
    "All" | "active" | "expired" | "archived"
  >("All");
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = effectiveTheme === "dark";

  // Fetch user's records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("records")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  // Filter records based on selected status
  const filteredRecords =
    filterStatus === "All"
      ? records
      : records.filter((r) => r.status === filterStatus);

  // Calculate stats
  const activeRecords = records.filter((r) => r.status === "active").length;
  const thisMonthRecords = records.filter((r) => {
    const recordDate = new Date(r.created_at);
    const now = new Date();
    return (
      recordDate.getMonth() === now.getMonth() &&
      recordDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const stats = [
    {
      label: "Total Passes",
      value: records.length,
      icon: <FileText className="w-6 h-6" />,
    },
    {
      label: "Active Passes",
      value: activeRecords,
      icon: <QrCode className="w-6 h-6" />,
    },
    {
      label: "This Month",
      value: thisMonthRecords,
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this pass?")) return;

    try {
      const { error } = await supabase
        .from("records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      // Remove from local state
      setRecords(records.filter((r) => r.id !== recordId));
      alert("Pass deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete pass");
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors ${isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"}`}
    >
      {/* Header */}
      <div
        className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border-b transition-colors`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex justify-between items-start gap-4 mb-6 sm:mb-8 flex-col sm:flex-row">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Passes</h1>
              <p
                className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Manage your mineral transportation passes
              </p>
            </div>
            <Link
              href="/form"
              className="flex-1 sm:flex-none px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg transition-all w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span>New Pass</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border rounded-lg p-3 sm:p-4 transition-colors`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-cyan-500 flex-shrink-0">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {(["All", "active", "expired", "archived"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                filterStatus === status
                  ? "bg-cyan-500 text-white"
                  : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Loading your passes...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-20 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border rounded-lg`}
          >
            <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No Passes Found</h2>
            <p
              className={`${isDark ? "text-slate-400" : "text-slate-600"} mb-6`}
            >
              {filterStatus === "All"
                ? "Create your first pass to get started"
                : "No passes match your filter criteria"}
            </p>
            {filterStatus !== "All" ? (
              <button
                onClick={() => setFilterStatus("All")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Clear Filter
              </button>
            ) : (
              <Link
                href="/form"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create New Pass
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredRecords.map((record) => {
              const formData = record.form_data || {};
              const passNumber = formData.serialNumber || record.id.slice(0, 8);
              const mineral = formData.mineralName || "N/A";
              const quantity = formData.quantityInTonnes || "0";
              const destination = formData.nameOfConsignee || "Unknown";

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"} border rounded-lg p-6 transition-all`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start mb-4">
                    {/* Pass Info */}
                    <div className="md:col-span-2">
                      <div className="text-sm font-mono text-cyan-400 mb-1">
                        EMP-{passNumber}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{mineral}</h3>
                      <p
                        className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {quantity} Tonnes
                      </p>
                    </div>

                    {/* Destination */}
                    <div>
                      <p
                        className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"} mb-1`}
                      >
                        DESTINATION
                      </p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                        <span className="font-medium">{destination}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p
                        className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"} mb-1`}
                      >
                        STATUS
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          record.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : record.status === "expired"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() +
                          record.status.slice(1)}
                      </span>
                    </div>

                    {/* Date */}
                    <div>
                      <p
                        className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"} mb-1`}
                      >
                        VALID UPTO
                      </p>
                      <p className="font-medium">
                        {new Date(record.valid_upto).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/records/${record.id}`}
                        className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"} transition-colors`}
                        title="View details"
                      >
                        <Eye className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
                      </Link>
                      {record.pdf_url ? (
                        <a
                          href={record.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                            isDark
                              ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          } transition-colors`}
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5 text-cyan-400" />
                          <span className="hidden sm:inline">Download PDF</span>
                        </a>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                            isDark
                              ? "bg-slate-800 text-slate-400"
                              : "bg-slate-100 text-slate-500"
                          }`}
                          title="PDF is generating"
                        >
                          <Download className="w-5 h-5 text-slate-400" />
                          <span className="hidden sm:inline">PDF pending</span>
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(record.id)}
                        className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"} transition-colors`}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
