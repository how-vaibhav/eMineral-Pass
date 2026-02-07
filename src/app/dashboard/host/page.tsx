"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  Download,
  Eye,
  FileText,
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
  total_scans: number;
  pdf_url?: string;
  qr_code_url?: string;
}

export default function HostDashboard() {
  const { effectiveTheme } = useTheme();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<
    "All" | "active" | "expired" | "archived"
  >("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  const isDark = effectiveTheme === "dark";

  // Fetch all records (admin view)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all records
        const { data: recordsData, error: recordsError } = await supabase
          .from("records")
          .select("*")
          .order("created_at", { ascending: false });

        if (recordsError) throw recordsError;
        setRecords(recordsData || []);

        // Fetch total users count
        const { count, error: usersError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        if (usersError) throw usersError;
        setTotalUsers(count || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter records based on selected status
  const filteredRecords = records.filter((record) => {
    if (filterStatus !== "All" && record.status !== filterStatus) {
      return false;
    }

    const createdAt = new Date(record.created_at);

    if (dateFrom) {
      const fromDate = new Date(`${dateFrom}T00:00:00`);
      if (createdAt < fromDate) return false;
    }

    if (dateTo) {
      const toDate = new Date(`${dateTo}T23:59:59.999`);
      if (createdAt > toDate) return false;
    }

    return true;
  });

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
      color: "text-blue-500",
    },
    {
      label: "Active Passes",
      value: activeRecords,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-green-500",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: "text-purple-500",
    },
    {
      label: "This Month",
      value: thisMonthRecords,
      icon: <BarChart3 className="w-6 h-6" />,
      color: "text-orange-500",
    },
  ];

  return (
    <div
      className={`min-h-screen pt-20 transition-colors ${isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"}`}
    >
      {/* Header */}
      <div
        className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border-b transition-colors`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex justify-between items-start gap-4 mb-6 sm:mb-8 flex-col sm:flex-row">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                License Portal
              </h1>
              <p
                className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                View and manage mineral transportation passes
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href="/dashboard/settings"
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"} transition-colors`}
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border rounded-lg p-3 sm:p-4 transition-colors`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"} uppercase mb-1`}
                    >
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} shrink-0`}>{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Recent Passes Section */}
        <div>
          <div className="flex justify-between items-center gap-4 mb-6 flex-col sm:flex-row">
            <h2 className="text-xl sm:text-2xl font-bold">Recent Passes</h2>
            <Link
              href="/reports"
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-2 text-sm sm:text-base"
            >
              View All <Eye className="w-4 h-4" />
            </Link>
          </div>

          {/* Date Range Filter */}
          <div
            className={`mb-4 rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-end ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex-1">
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300"}`}
              />
            </div>
            <div className="flex-1">
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300"}`}
              />
            </div>
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-white text-slate-700 hover:bg-slate-100"}`}
            >
              Clear Dates
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
            {(["All", "active", "expired", "archived"] as const).map(
              (status) => (
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
              ),
            )}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-slate-400">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-20 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border rounded-lg`}
            >
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">No Passes Found</h2>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                No passes match your filter criteria
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {filteredRecords.map((record) => {
                const formData = record.form_data || {};
                const passNumber =
                  formData.serialNumber || record.id.slice(0, 8);
                const licensee = formData.nameOfLicenseeOfLease || "Unknown";
                const mineral = formData.mineralName || "N/A";
                const quantity = formData.quantityInTonnes || "0";

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"} border rounded-lg p-4 transition-all`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-mono text-cyan-400 text-sm mb-1">
                              EMP-{passNumber}
                            </p>
                            <p className="font-semibold">{licensee}</p>
                            <p
                              className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                            >
                              {mineral} • {quantity} Tonnes
                            </p>
                            <p
                              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} mt-1`}
                            >
                              Created:{" "}
                              {new Date(record.created_at).toLocaleDateString()}{" "}
                              | Scans: {record.total_scans || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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

                        <div className="flex gap-2">
                          <Link
                            href={`/records/${record.id}`}
                            className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"} transition-colors`}
                          >
                            <Eye className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
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
                              <Download className="w-4 h-4 text-cyan-400" />
                              <span className="hidden sm:inline">
                                Download PDF
                              </span>
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
                              <Download className="w-4 h-4 text-slate-400" />
                              <span className="hidden sm:inline">
                                PDF pending
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
