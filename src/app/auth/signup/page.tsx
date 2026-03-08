'use client';

import { useState, useEffect, Suspense } from 'react'; // Added Suspense
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';

// 1. All your logic moves into this internal component
function SignUpForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { effectiveTheme } = useTheme();
	const { signUp } = useAuth();

	const initialRole = (searchParams.get('role') as UserRole) || null;
	const [role, setRole] = useState<UserRole | null>(initialRole);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [fullName, setFullName] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

	const isDark = effectiveTheme === 'dark';

	useEffect(() => {
		if (initialRole) {
			setRole(initialRole);
		}
	}, [initialRole]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!role) {
			setError('Please select your role');
			return;
		}
		if (!email || !password || !confirmPassword || !fullName) {
			setError('Please fill in all required fields');
			return;
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}
		if (password.length < 8) {
			setError('Password must be at least 8 characters');
			return;
		}

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const result = await signUp(email, password, fullName, role);
			if (!result.session) {
				setSuccess('Account created! Please verify your email to continue.');
				setTimeout(() => {
					router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
				}, 1200);
				return;
			}

			setSuccess(`Account created successfully! Redirecting...`);
			setTimeout(() => {
				router.push(role === 'host' ? '/dashboard/host' : '/dashboard/user');
			}, 1500);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to create account.',
			);
			setLoading(false);
		}
	};

	return (
		<div
			className={`min-h-screen pt-20 ${isDark ? 'bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white' : 'bg-linear-to-br from-white via-slate-50 to-white text-slate-900'}`}
		>
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div
					className={`absolute top-20 left-10 w-96 h-96 ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`}
				></div>
			</div>

			<div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className={`w-full max-md ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl p-6 sm:p-8`}
				>
					<Link
						href="/"
						className="inline-flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors"
					>
						<ArrowLeft className="w-5 h-5" /> Back to Home
					</Link>

					<div className="mb-8">
						<h1 className="text-2xl sm:text-3xl font-bold mb-2">
							Create Account
						</h1>
						<p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
							Join eMineral Pass today
						</p>
					</div>

					{!role ? (
						<div className="space-y-3">
							<button
								onClick={() => setRole('host')}
								className={`w-full p-4 border-2 rounded-lg transition-all text-left ${isDark ? 'hover:border-cyan-400 hover:bg-slate-800' : 'hover:border-cyan-400 hover:bg-slate-50'} border-slate-700`}
							>
								<div className="font-semibold">🏢 License Host</div>
								<p className="text-sm opacity-70">Manage mineral passes</p>
							</button>
							<button
								onClick={() => setRole('user')}
								className={`w-full p-4 border-2 rounded-lg transition-all text-left ${isDark ? 'hover:border-cyan-400 hover:bg-slate-800' : 'hover:border-cyan-400 hover:bg-slate-50'} border-slate-700`}
							>
								<div className="font-semibold">👤 Transport User</div>
								<p className="text-sm opacity-70">Submit transport forms</p>
							</button>
						</div>
					) : (
						<form
							onSubmit={handleSubmit}
							className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
						>
							<div className="flex items-center justify-between mb-6">
								<span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
									{role === 'host' ? '🏢 License Host' : '👤 Transport User'}
								</span>
								<button
									type="button"
									onClick={() => setRole(null)}
									className="text-sm text-slate-400 hover:text-slate-200"
								>
									Change
								</button>
							</div>

							<input
								type="text"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
								placeholder="Full Name"
							/>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
								placeholder="Email"
							/>

							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
									placeholder="Password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>

							<div className="relative">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
									placeholder="Confirm Password"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2"
								>
									{showConfirmPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>

							{error && (
								<div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
									{error}
								</div>
							)}
							{success && (
								<div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">
									{success}
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white disabled:opacity-50"
							>
								{loading ? 'Creating account...' : 'Create Account'}
							</button>
						</form>
					)}
				</motion.div>
			</div>
		</div>
	);
}

// 2. The default export is now the "Wrapper"
export default function SignUpPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
					Loading...
				</div>
			}
		>
			<SignUpForm />
		</Suspense>
	);
}
