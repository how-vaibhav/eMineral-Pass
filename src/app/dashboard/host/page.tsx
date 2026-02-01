'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3, Users, TrendingUp, Settings, Download, Eye, FileText, Filter } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function HostDashboard() {
  const { effectiveTheme } = useTheme()
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Expired'>('All')
  const [passes, setPasses] = useState([
    {
      id: '1',
      passnumber: 'EMP-2026-001',
      licensee: 'ABC Mining Co.',
      mineral: 'Limestone',
      quantity: '50',
      status: 'Active',
      created: '2026-02-01'
    },
    {
      id: '2',
      passnumber: 'EMP-2026-002',
      licensee: 'XYZ Transport',
      mineral: 'Sand',
      quantity: '100',
      status: 'Expired',
      created: '2026-01-28'
    }
  ])

  const isDark = effectiveTheme === 'dark'

  // Filter passes based on selected status
  const filteredPasses = filterStatus === 'All' 
    ? passes 
    : passes.filter(p => p.status === filterStatus)

  const stats = [
    { label: 'Total Passes', value: passes.length, icon: <FileText className="w-6 h-6" />, color: 'text-blue-500' },
    { label: 'Active Passes', value: passes.filter(p => p.status === 'Active').length, icon: <TrendingUp className="w-6 h-6" />, color: 'text-green-500' },
    { label: 'Total Users', value: '24', icon: <Users className="w-6 h-6" />, color: 'text-purple-500' },
    { label: 'This Month', value: passes.length, icon: <BarChart3 className="w-6 h-6" />, color: 'text-orange-500' },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">License Portal</h1>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>View and manage mineral transportation passes</p>
            </div>
            <div className="flex gap-3">
              <Link href="/settings" className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase mb-1`}>{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Recent Passes Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Passes</h2>
            <Link href="/reports" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-2">
              View All <Eye className="w-4 h-4" />
            </Link>
          </div>

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

          {filteredPasses.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`text-center py-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-lg`}>
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">No Passes Found</h2>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No passes match your filter criteria</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filteredPasses.map((pass) => (
                <motion.div key={pass.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'} border rounded-lg p-4 transition-all`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-mono text-cyan-400 text-sm mb-1">{pass.passnumber}</p>
                          <p className="font-semibold">{pass.licensee}</p>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{pass.mineral} • {pass.quantity} Tonnes</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pass.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pass.status}
                      </span>
                      
                      <div className="flex gap-2">
                        <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
                          <Eye className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                        </button>
                        <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}>
                          <Download className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
