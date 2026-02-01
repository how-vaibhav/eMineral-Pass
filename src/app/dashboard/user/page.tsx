'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, FileText, QrCode, Download, Eye, Trash2, Calendar, MapPin, Filter } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function UserDashboard() {
  const { effectiveTheme } = useTheme()
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Expired'>('All')
  const [records, setRecords] = useState([
    {
      id: '1',
      passnumber: 'EMP-2026-001',
      mineral: 'Limestone',
      quantity: '50',
      destination: 'Delhi',
      status: 'Active',
      date: '2026-02-01',
      validUpto: '2026-02-02'
    },
    {
      id: '2',
      passnumber: 'EMP-2026-002',
      mineral: 'Sand',
      quantity: '100',
      destination: 'Noida',
      status: 'Expired',
      date: '2026-01-28',
      validUpto: '2026-01-29'
    }
  ])

  const isDark = effectiveTheme === 'dark'

  // Filter records based on selected status
  const filteredRecords = filterStatus === 'All' 
    ? records 
    : records.filter(r => r.status === filterStatus)

  const stats = [
    { label: 'Total Passes', value: records.length, icon: <FileText className="w-6 h-6" /> },
    { label: 'Active Passes', value: records.filter(r => r.status === 'Active').length, icon: <QrCode className="w-6 h-6" /> },
    { label: 'This Month', value: records.length, icon: <Calendar className="w-6 h-6" /> },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Passes</h1>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Manage your mineral transportation passes</p>
            </div>
            <Link href="/form" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center gap-2 hover:shadow-lg">
              <Plus className="w-5 h-5" />
              New Pass
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="text-cyan-500">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['All', 'Active', 'Expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filterStatus === status
                  ? 'bg-cyan-500 text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {status}
            </button>
          ))}
        </div>

        {filteredRecords.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`text-center py-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-lg`}>
            <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No Passes Found</h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>No passes match your filter criteria</p>
            {filterStatus !== 'All' && (
              <button onClick={() => setFilterStatus('All')} className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Clear Filter
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {filteredRecords.map((record) => (
              <motion.div key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'} border rounded-lg p-6 transition-all`}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start mb-4">
                  {/* Pass Info */}
                  <div className="md:col-span-2">
                    <div className="text-sm font-mono text-cyan-400 mb-1">{record.passnumber}</div>
                    <h3 className="font-semibold text-lg mb-1">{record.mineral}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{record.quantity} Tonnes</p>
                  </div>

                  {/* Destination */}
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>DESTINATION</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-500" />
                      <span className="font-medium">{record.destination}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>STATUS</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${record.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {record.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>VALID UPTO</p>
                    <p className="font-medium">{new Date(record.validUpto).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`} title="View details">
                      <Eye className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`} title="Download PDF">
                      <Download className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`} title="Delete">
                      <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
