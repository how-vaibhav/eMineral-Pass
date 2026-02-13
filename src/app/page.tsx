'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	ArrowRight,
	CheckCircle2,
	QrCode,
	FileText,
	BarChart3,
	Lock,
	Zap,
	Users,
	Shield,
	Clock,
	BookOpen,
	Layers,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
	const { effectiveTheme } = useTheme();
	const { isAuthenticated, user, isLoading } = useAuth();

	console.log(isAuthenticated, user, isLoading);

	const isDark = effectiveTheme === 'dark';
	const showDashboardCta = !isLoading && isAuthenticated && !!user;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.2, delayChildren: 0.3 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
	};

	const features = [
		{
			icon: <FileText className="w-8 h-8" />,
			title: 'Government Forms',
			description: 'Compliant with official regulations',
			color: 'bg-blue-500',
		},
		{
			icon: <QrCode className="w-8 h-8" />,
			title: 'QR Pass System',
			description: 'Auto-generated for every submission',
			color: 'bg-purple-500',
		},
		{
			icon: <FileText className="w-8 h-8" />,
			title: 'Official PDFs',
			description: 'Government-standard documentation',
			color: 'bg-orange-500',
		},
		{
			icon: <BarChart3 className="w-8 h-8" />,
			title: 'Digital Records',
			description: 'Real-time tracking & verification',
			color: 'bg-green-500',
		},
		{
			icon: <Users className="w-8 h-8" />,
			title: 'Public Verification',
			description: 'Secure record access',
			color: 'bg-indigo-500',
		},
		{
			icon: <Lock className="w-8 h-8" />,
			title: 'Government Security',
			description: 'Bank-grade encryption',
			color: 'bg-rose-500',
		},
	];

	return (
		<div
			className={`min-h-screen ${isDark ? 'bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white' : 'bg-linear-to-b from-white via-slate-50 to-white text-slate-900'}`}
		>
			<section
				className={`relative min-h-screen flex items-center justify-center px-6 ${isDark ? 'bg-linear-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-linear-to-b from-white to-slate-50'}`}
			>
				<div className="absolute inset-0 overflow-hidden">
					<div
						className={`absolute top-20 left-10 w-96 h-96 ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse`}
					></div>
					<div
						className={`absolute top-40 right-10 w-96 h-96 ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse`}
						style={{ animationDelay: '2s' }}
					></div>
				</div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="relative z-10 text-center max-w-4xl"
				>
					<motion.div variants={itemVariants}>
						<div
							className={`inline-block mb-6 px-4 py-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-full`}
						>
							<span className="text-cyan-400 font-semibold">
								🇮🇳 Government Digital Pass System
							</span>
						</div>
					</motion.div>

					<motion.h1
						variants={itemVariants}
						className={`text-4xl sm:text-6xl md:text-8xl font-black mb-6 bg-linear-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent`}
					>
						eMineral Pass
					</motion.h1>

					<motion.p
						variants={itemVariants}
						className={`text-lg sm:text-xl ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-12 max-w-2xl mx-auto`}
					>
						Official digital pass system for mineral transportation under the
						Uttar Pradesh Minerals Rules, 2018
					</motion.p>

					{showDashboardCta && (
						<motion.div
							variants={itemVariants}
							className="flex gap-4 justify-center flex-wrap sm:flex-nowrap"
						>
							<Link
								href="/dashboard/user"
								className="px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-base sm:text-lg text-white flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all"
							>
								Go to Dashboard <ArrowRight className="w-5 h-5" />
							</Link>
						</motion.div>
					)}
					{!showDashboardCta && (
						<motion.div
							variants={itemVariants}
							className="flex gap-4 justify-center flex-wrap sm:flex-nowrap"
						>
							<Link
								href="/auth/signup"
								className="px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-base sm:text-lg text-white flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all"
							>
								Get ePass <ArrowRight className="w-5 h-5" />
							</Link>
							<Link
								href="/auth/signin"
								className={`px-6 sm:px-8 py-3 sm:py-4 ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-600' : 'bg-slate-200 hover:bg-slate-300 border-slate-400'} border rounded-lg font-bold text-base sm:text-lg transition-all`}
							>
								Sign In
							</Link>
						</motion.div>
					)}

					<motion.div
						variants={itemVariants}
						className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20`}
					>
						{[
							{ num: 'ISO Compliant', label: 'Standards' },
							{ num: 'Bank-Grade', label: 'Security' },
							{ num: '24/7', label: 'Availability' },
						].map((s, i) => (
							<div
								key={i}
								className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-300'} border rounded-lg p-6`}
							>
								<div className="text-2xl font-bold text-cyan-400 mb-2">
									{s.num}
								</div>
								<div
									className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
								>
									{s.label}
								</div>
							</div>
						))}
					</motion.div>
				</motion.div>
			</section>

			<section
				className={`relative py-24 px-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl font-bold mb-6">
							Secure Digital Pass System
						</h2>
						<p
							className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
						>
							Complete mineral transportation authorization system
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((f, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								className={`group ${isDark ? 'bg-linear-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl p-8 hover:border-cyan-400 hover:shadow-lg transition-all`}
							>
								<div
									className={`w-14 h-14 ${f.color} rounded-lg flex items-center justify-center mb-6 text-white`}
								>
									{f.icon}
								</div>
								<h3 className="text-xl font-bold mb-4">{f.title}</h3>
								<p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
									{f.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section
				className={`relative py-24 px-6 ${isDark ? 'bg-slate-950' : 'bg-white'}`}
			>
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-4xl font-bold mb-8">Why eMineral Pass?</h2>
							<div className="space-y-4">
								{[
									{
										icon: <Shield className="w-6 h-6" />,
										text: 'Government-compliant & secure',
									},
									{
										icon: <Zap className="w-6 h-6" />,
										text: 'Instant QR code generation',
									},
									{
										icon: <BookOpen className="w-6 h-6" />,
										text: 'Official documentation',
									},
									{
										icon: <CheckCircle2 className="w-6 h-6" />,
										text: 'Real-time verification',
									},
								].map((b, i) => (
									<div key={i} className="flex items-center gap-4">
										<div className="w-10 h-10 bg-linear-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
											{b.icon}
										</div>
										<p className="text-lg font-semibold">{b.text}</p>
									</div>
								))}
							</div>
						</div>
						<div
							className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'} border rounded-2xl p-12`}
						>
							<div className="space-y-4">
								{[
									{ t: 'Follows Uttar Pradesh Minerals Rules, 2018' },
									{ t: 'End-to-end encrypted data transfer' },
									{ t: 'Compliance-ready for government agencies' },
									{ t: 'Unlimited mineral transportation passes' },
								].map((c, i) => (
									<div key={i} className="flex items-center gap-3">
										<CheckCircle2 className="w-5 h-5 text-green-500" />
										<span
											className={isDark ? 'text-slate-100' : 'text-slate-900'}
										>
											{c.t}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			<section
				className={`relative py-24 px-6 text-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
			>
				<div className="max-w-5xl mx-auto">
					<h2 className="text-4xl font-bold mb-12">For Every Role</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						<div
							className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} border rounded-2xl p-12 hover:shadow-lg hover:${isDark ? 'shadow-blue-500/20' : 'shadow-blue-200'} transition-all`}
						>
							<div className="text-5xl mb-6">🏢</div>
							<h3 className="text-2xl font-bold mb-4">License Hosts</h3>
							<p
								className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-8`}
							>
								Manage mineral transportation passes, track vehicles, and
								generate compliance reports
							</p>
							<ul
								className={`text-left space-y-2 mb-8 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
							>
								<li>✓ Generate eMineral Passes</li>
								<li>✓ Manage fleet & drivers</li>
								<li>✓ Real-time analytics</li>
							</ul>
							<Link
								href="/auth/signup?role=host"
								className="w-full inline-block py-3 bg-linear-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-white hover:shadow-lg"
							>
								Access Portal
							</Link>
						</div>
						<div
							className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} border rounded-2xl p-12 hover:shadow-lg hover:${isDark ? 'shadow-pink-500/20' : 'shadow-pink-200'} transition-all`}
						>
							<div className="text-5xl mb-6">👤</div>
							<h3 className="text-2xl font-bold mb-4">Transport Users</h3>
							<p
								className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-8`}
							>
								Submit mineral transportation requests, get instant passes with
								QR codes
							</p>
							<ul
								className={`text-left space-y-2 mb-8 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
							>
								<li>✓ Submit transport forms</li>
								<li>✓ Instant digital passes</li>
								<li>✓ QR code verification</li>
							</ul>
							<Link
								href="/auth/signup?role=user"
								className="w-full inline-block py-3 bg-linear-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white hover:shadow-lg"
							>
								Get Started
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
