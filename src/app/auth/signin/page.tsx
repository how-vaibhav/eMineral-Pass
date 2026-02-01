'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import type { UserRole } from '@/types/auth'

export default function SignInPage() {
  const router = useRouter()
  const { effectiveTheme } = useTheme()
  const [role, setRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  const isDark = effectiveTheme === 'dark'

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!role) {
      setError('Please select your role')
      return
    }

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Implement Supabase authentication
      console.log('Sign in attempt:', { email, role })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show welcome message
      setSuccess(`Welcome back! Redirecting to your ${role === 'host' ? 'License Portal' : 'Dashboard'}...`)
      
      // Redirect to dashboard based on role
      setTimeout(() => {
        if (role === 'host') {
          router.push('/dashboard/host')
        } else {
          router.push('/dashboard/user')
        }
      }, 1500)
    } catch (err) {
      setError('Failed to sign in. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!forgotEmail) {
      setError('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Implement Supabase password reset
      console.log('Password reset request for:', forgotEmail)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Password reset link sent to your email. Please check your inbox.')
      setForgotEmail('')
      setTimeout(() => setShowForgotPassword(false), 2000)
    } catch (err) {
      setError('Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      // TODO: Implement Google OAuth
      console.log('Google sign in attempt')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Google sign in successful! Redirecting...')
      setTimeout(() => router.push('/dashboard/user'), 1500)
    } catch (err) {
      setError('Google sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white' : 'bg-gradient-to-br from-white via-slate-50 to-white text-slate-900'}`}>
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`} style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {!showForgotPassword ? (
            <motion.div key="signin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`w-full max-w-md ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl p-8`}>
              {/* Back button */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Link href="/" className="inline-flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Home
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Sign In</h1>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Access your eMineral Pass account</p>
              </motion.div>

              {/* Role Selection */}
              {!role && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8">
                  <label className="block text-sm font-semibold mb-4">Select Your Role</label>
                  <div className="space-y-3">
                    <motion.button
                      variants={itemVariants}
                      onClick={() => setRole('host')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 border-2 rounded-lg transition-all text-left ${isDark ? 'hover:border-cyan-400 hover:bg-slate-800' : 'hover:border-cyan-400 hover:bg-slate-50'} border-slate-700`}
                    >
                      <div className="font-semibold">🏢 License Host</div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage mineral passes & transport records</p>
                    </motion.button>
                    <motion.button
                      variants={itemVariants}
                      onClick={() => setRole('user')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 border-2 rounded-lg transition-all text-left ${isDark ? 'hover:border-cyan-400 hover:bg-slate-800' : 'hover:border-cyan-400 hover:bg-slate-50'} border-slate-700`}
                    >
                      <div className="font-semibold">👤 Transport User</div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Submit transport forms & get passes</p>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Sign In Form */}
              {role && (
                <motion.form onSubmit={handleSubmit} variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                  {/* Role badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm">
                      <span className={`px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm`}>
                        {role === 'host' ? '🏢 License Host' : '👤 Transport User'}
                      </span>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => { setRole(null); setEmail(''); setPassword(''); setError(''); }}
                      whileHover={{ scale: 1.05 }}
                      className={`text-sm ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Change
                    </motion.button>
                  </div>

                  {/* Email */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg transition-colors ${isDark ? 'bg-slate-800 border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border-slate-300 focus:border-cyan-500 text-slate-900'} focus:outline-none`}
                      placeholder="you@example.com"
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg transition-colors ${isDark ? 'bg-slate-800 border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border-slate-300 focus:border-cyan-500 text-slate-900'} focus:outline-none pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Forgot Password Link */}
                  <motion.div variants={itemVariants} className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </motion.div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <motion.div variants={itemVariants} className="relative">
                    <div className={`absolute inset-0 flex items-center ${isDark ? 'border-slate-700' : 'border-slate-300'} border-t`}></div>
                    <div className="relative flex justify-center text-sm">
                      <span className={`px-2 ${isDark ? 'bg-slate-900' : 'bg-white'} ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Or continue with</span>
                    </div>
                  </motion.div>

                  {/* Google Sign In */}
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2.5 border rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-50'} disabled:opacity-50`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </motion.button>

                  {/* Sign up link */}
                  <motion.p variants={itemVariants} className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Don't have an account?{' '}
                    <Link href={`/auth/signup?role=${role}`} className="text-cyan-400 hover:text-cyan-300 font-semibold">
                      Sign up
                    </Link>
                  </motion.p>
                </motion.form>
              )}
            </motion.div>
          ) : (
            <motion.div key="forgot" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`w-full max-w-md ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl p-8`}>
              <motion.button
                onClick={() => setShowForgotPassword(false)}
                className="inline-flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Sign In
              </motion.button>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Enter your email to receive a password reset link</p>
              </motion.div>

              <motion.form onSubmit={handleForgotPassword} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg transition-colors ${isDark ? 'bg-slate-800 border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border-slate-300 focus:border-cyan-500 text-slate-900'} focus:outline-none`}
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
