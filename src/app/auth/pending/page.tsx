'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Suspense } from 'react';

function PendingRequestContent() {
	const searchParams = useSearchParams();
	const { effectiveTheme } = useTheme();
	const email = searchParams.get('email');
	const isDark = effectiveTheme === 'dark';

	return (
		<div
			className={`min-h-screen pt-20 ${
				isDark
					? 'bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white'
					: 'bg-linear-to-br from-white via-slate-50 to-white text-slate-900'
			}`}
		>
			<div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
				<motion.div
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					className={`w-full max-w-lg ${
						isDark
							? 'bg-slate-900 border-slate-800'
							: 'bg-white border-slate-200'
					} border rounded-2xl shadow-xl p-6 sm:p-8`}
				>
					<Link
						href="/"
						className="inline-flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Home
					</Link>

					<div className="flex items-center gap-3 mb-4">
						<div className="p-3 rounded-full bg-cyan-500/15 text-cyan-400">
							<MailCheck className="w-6 h-6" />
						</div>
						<h1 className="text-2xl sm:text-3xl font-bold">
							Your Host status will be verified shortly!
						</h1>
					</div>

					<p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
						Please wait while we review your submission.
					</p>

					{email && (
						<p className="mt-4 text-sm font-semibold text-cyan-400 break-all">
							{email}
						</p>
					)}

					<div className="mt-6 space-y-2 text-sm">
						<p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
							After authorization, return and sign in to access your dashboard.
						</p>
						<Link
							href="/auth/signin"
							className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
						>
							Go to Sign In
						</Link>
					</div>
				</motion.div>
			</div>
		</div>
	);
}

export default function PendingRequest() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
			<PendingRequestContent />
		</Suspense>
	);
}
