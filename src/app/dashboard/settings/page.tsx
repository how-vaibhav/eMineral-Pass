'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	User,
	Lock,
	Bell,
	Download,
	Eye,
	EyeOff,
	Copy,
	Check,
	LogOut,
	Trash2,
	FileText,
	Moon,
	Sun,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
	const router = useRouter();
	const { user, signOut } = useAuth();
	const { effectiveTheme, toggleTheme } = useTheme();
	const [activeTab, setActiveTab] = useState('account');
	const [showPassword, setShowPassword] = useState(false);
	const [copied, setCopied] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [notification, setNotification] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);
	const [formData, setFormData] = useState({
		fullName: user?.user_metadata?.full_name || '',
		email: user?.email || '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	interface HostRecord {
		id: string;
	}

	const isDark = effectiveTheme === 'dark';

	const handleCopyUserId = () => {
		if (user?.id) {
			navigator.clipboard.writeText(user.id);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleUpdateProfile = async () => {
		if (!formData.fullName) {
			setNotification({
				type: 'error',
				message: 'Full name is required',
			});
			return;
		}

		setLoading(true);
		try {
			const { error } = await supabase.auth.updateUser({
				data: { full_name: formData.fullName },
			});

			if (error) throw error;

			setNotification({
				type: 'success',
				message: 'Profile updated successfully',
			});
			setTimeout(() => setNotification(null), 3000);
		} catch (error) {
			console.error('Error updating profile:', error);
			setNotification({
				type: 'error',
				message: 'Failed to update profile',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleChangePassword = async () => {
		if (
			!formData.currentPassword ||
			!formData.newPassword ||
			!formData.confirmPassword
		) {
			setNotification({
				type: 'error',
				message: 'Please fill in all password fields',
			});
			return;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			setNotification({
				type: 'error',
				message: 'Passwords do not match',
			});
			return;
		}

		if (formData.newPassword.length < 6) {
			setNotification({
				type: 'error',
				message: 'Password must be at least 6 characters long',
			});
			return;
		}

		if (!user?.email) {
			setNotification({
				type: 'error',
				message: 'Missing user email. Please sign in again.',
			});
			return;
		}

		setLoading(true);
		try {
			const { error: reauthError } = await supabase.auth.signInWithPassword({
				email: user.email,
				password: formData.currentPassword,
			});

			if (reauthError) throw reauthError;

			const { error } = await supabase.auth.updateUser({
				password: formData.newPassword,
			});

			if (error) throw error;

			setNotification({
				type: 'success',
				message: 'Password changed successfully',
			});
			setFormData({
				...formData,
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
			setTimeout(() => setNotification(null), 3000);
		} catch (error) {
			console.error('Error changing password:', error);
			setNotification({
				type: 'error',
				message: 'Failed to change password. Check current password.',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSignOut = async () => {
		if (!confirm('Are you sure you want to sign out?')) return;

		try {
			await signOut();
		} catch (error) {
			console.error('Error signing out:', error);
			setNotification({
				type: 'error',
				message: 'Failed to sign out',
			});
		} finally {
			window.location.href = '/';
		}
	};

	const handleDeleteAccount = async () => {
		if (
			!confirm(
				'Are you sure you want to delete your account? This action cannot be undone and will delete all your records.',
			)
		)
			return;

		if (!confirm('Are you absolutely sure? This is permanent.')) return;

		setLoading(true);
		try {
			// Delete user account
			const { error } = await supabase.auth.admin.deleteUser(user?.id || '');

			if (error) throw error;

			setNotification({
				type: 'success',
				message: 'Account deleted successfully',
			});

			setTimeout(() => {
				router.push('/');
			}, 2000);
		} catch (error) {
			console.error('Error deleting account:', error);
			setNotification({
				type: 'error',
				message: 'Failed to delete account',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleExportData = async () => {
		if (!user) {
			setNotification({
				type: 'error',
				message: 'You must be signed in to export data.',
			});
			return;
		}

		const chunkArray = <T,>(items: T[], size: number) => {
			const chunks: T[][] = [];
			for (let i = 0; i < items.length; i += size) {
				chunks.push(items.slice(i, i + size));
			}
			return chunks;
		};

		setIsExporting(true);
		try {
			const exportPayload: Record<string, unknown> = {
				exported_at: new Date().toISOString(),
				user: {
					id: user.id,
					email: user.email,
					metadata: user.user_metadata || {},
				},
			};

			const { data: profileData, error: profileError } = await supabase
				.from('users')
				.select('*')
				.eq('id', user.id)
				.maybeSingle();

			if (profileError) {
				exportPayload.profile_error = profileError.message;
			} else {
				exportPayload.profile = profileData;
			}

			const { data: recordsData, error: recordsError } = await supabase
				.from('records')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (recordsError) throw recordsError;

			const records = (recordsData as HostRecord[]) || [];
			exportPayload.records = records;

			const recordIds = records.map((record) => record.id);
			const scanLogs: unknown[] = [];

			if (recordIds.length > 0) {
				const chunks = chunkArray(recordIds, 100);
				for (const chunk of chunks) {
					const { data: scanData, error: scanError } = await supabase
						.from('scan_logs')
						.select('*')
						.in('record_id', chunk)
						.order('scanned_at', { ascending: false });

					if (scanError) throw scanError;
					scanLogs.push(...(scanData || []));
				}
			}

			exportPayload.scan_logs = scanLogs;

			const { data: templatesData, error: templatesError } = await supabase
				.from('form_templates')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (templatesError) {
				exportPayload.form_templates_error = templatesError.message;
			} else {
				exportPayload.form_templates = templatesData || [];
			}

			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const fileName = `emineral-pass-export-${user.id}-${timestamp}.json`;
			const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
				type: 'application/json',
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			link.click();
			URL.revokeObjectURL(url);

			setNotification({
				type: 'success',
				message: 'Your data export is ready and downloading.',
			});
			setTimeout(() => setNotification(null), 3000);
		} catch (error) {
			console.error('Error exporting data:', error);
			setNotification({
				type: 'error',
				message: 'Failed to export data. Please try again.',
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div
			className={`min-h-screen pt-20 px-4 pb-8 md:px-8 transition-colors ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}
		>
			{/* Notification Toast */}
			{notification && (
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -50 }}
					className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-lg shadow-lg border-2 ${
						notification.type === 'success'
							? 'bg-green-50 dark:bg-green-950/90 border-green-500 text-green-700 dark:text-green-300'
							: 'bg-red-50 dark:bg-red-950/90 border-red-500 text-red-700 dark:text-red-300'
					}`}
				>
					<div className="flex items-center gap-3">
						<span className="text-2xl">
							{notification.type === 'success' ? '✓' : '⚠'}
						</span>
						<span className="font-semibold">{notification.message}</span>
					</div>
				</motion.div>
			)}

			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center gap-4 mb-8"
				>
					<Link
						href="/dashboard/user"
						className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
					>
						<ArrowLeft className="w-5 h-5" />
					</Link>
					<div>
						<h1 className="text-3xl font-bold">Settings</h1>
						<p
							className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
						>
							Manage your account and preferences
						</p>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar Navigation */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className={`lg:col-span-1 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-lg p-4 h-fit`}
					>
						<nav className="space-y-2">
							{[
								{ id: 'account', label: 'Account', icon: User },
								{ id: 'security', label: 'Security', icon: Lock },
								{ id: 'appearance', label: 'Appearance', icon: Moon },
								{ id: 'notifications', label: 'Notifications', icon: Bell },
								{ id: 'privacy', label: 'Privacy & Data', icon: Lock },
							].map(({ id, label, icon: Icon }) => (
								<button
									key={id}
									onClick={() => setActiveTab(id)}
									className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
										activeTab === id
											? isDark
												? 'bg-cyan-500/20 border-l-2 border-cyan-500 text-cyan-400'
												: 'bg-cyan-100 border-l-2 border-cyan-500 text-cyan-600'
											: isDark
												? 'hover:bg-slate-800 text-slate-400'
												: 'hover:bg-slate-100 text-slate-600'
									}`}
								>
									<Icon className="w-5 h-5" />
									<span className="font-medium">{label}</span>
								</button>
							))}
						</nav>
					</motion.div>

					{/* Content Area */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="lg:col-span-3 space-y-6"
					>
						{/* Account Tab */}
						{activeTab === 'account' && (
							<div
								className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-lg p-6 space-y-6`}
							>
								<div>
									<h2 className="text-xl font-bold mb-4">
										Account Information
									</h2>
									<div className="space-y-4">
										{/* User ID */}
										<div>
											<label
												className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												User ID
											</label>
											<div className="flex items-center gap-2">
												<input
													type="text"
													value={user?.id || ''}
													disabled
													className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} cursor-not-allowed`}
												/>
												<button
													onClick={handleCopyUserId}
													className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
													title="Copy User ID"
												>
													{copied ? (
														<Check className="w-5 h-5 text-green-500" />
													) : (
														<Copy className="w-5 h-5 text-slate-400" />
													)}
												</button>
											</div>
										</div>

										{/* Email */}
										<div>
											<label
												className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												Email Address
											</label>
											<input
												type="email"
												value={formData.email}
												disabled
												className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} cursor-not-allowed`}
											/>
										</div>

										{/* Full Name */}
										<div>
											<label
												className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												Full Name
											</label>
											<input
												type="text"
												value={formData.fullName}
												onChange={(e) =>
													setFormData({ ...formData, fullName: e.target.value })
												}
												className={`w-full px-4 py-2 rounded-lg border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 focus:border-cyan-500' : 'bg-white border-slate-300 focus:border-cyan-500'} outline-none focus:ring-2 focus:ring-cyan-500/20`}
											/>
										</div>

										<button
											onClick={handleUpdateProfile}
											disabled={loading}
											className="w-full px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg disabled:opacity-50 transition-all"
										>
											{loading ? 'Updating...' : 'Update Profile'}
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Security Tab */}
						{activeTab === 'security' && (
							<div
								className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-lg p-6 space-y-6`}
							>
								<div>
									<h2 className="text-xl font-bold mb-4">Change Password</h2>
									<div className="space-y-4">
										<div>
											<label
												className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												Current Password
											</label>
											<input
												type={showPassword ? 'text' : 'password'}
												value={formData.currentPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														currentPassword: e.target.value,
													})
												}
												className={`w-full px-4 py-2 rounded-lg border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 focus:border-cyan-500' : 'bg-white border-slate-300 focus:border-cyan-500'} outline-none focus:ring-2 focus:ring-cyan-500/20`}
											/>
										</div>

										<div>
											<label
												className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												New Password
											</label>
											<div className="relative">
												<input
													type={showPassword ? 'text' : 'password'}
													value={formData.newPassword}
													onChange={(e) =>
														setFormData({
															...formData,
															newPassword: e.target.value,
														})
													}
													className={`w-full px-4 py-2 rounded-lg border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 focus:border-cyan-500' : 'bg-white border-slate-300 focus:border-cyan-500'} outline-none focus:ring-2 focus:ring-cyan-500/20`}
												/>
												<button
													onClick={() => setShowPassword(!showPassword)}
													className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
												>
													{showPassword ? (
														<EyeOff className="w-5 h-5" />
													) : (
														<Eye className="w-5 h-5" />
													)}
												</button>
											</div>
										</div>

										<div>
											<label
												className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												Confirm Password
											</label>
											<input
												type={showPassword ? 'text' : 'password'}
												value={formData.confirmPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														confirmPassword: e.target.value,
													})
												}
												className={`w-full px-4 py-2 rounded-lg border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 focus:border-cyan-500' : 'bg-white border-slate-300 focus:border-cyan-500'} outline-none focus:ring-2 focus:ring-cyan-500/20`}
											/>
										</div>

										<button
											onClick={handleChangePassword}
											disabled={loading}
											className="w-full px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg disabled:opacity-50 transition-all"
										>
											{loading ? 'Updating...' : 'Update Password'}
										</button>
									</div>
								</div>

								<div
									className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} pt-6`}
								>
									<h3 className="text-lg font-bold mb-4">Danger Zone</h3>
									<div className="space-y-3">
										<button
											onClick={handleSignOut}
											className={`w-full px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-center gap-2 ${isDark ? 'border-yellow-600 text-yellow-500 hover:bg-yellow-600/10' : 'border-yellow-500 text-yellow-600 hover:bg-yellow-100'}`}
										>
											<LogOut className="w-5 h-5" />
											Sign Out
										</button>
										<button
											onClick={handleDeleteAccount}
											disabled={loading}
											className={`w-full px-6 py-3 rounded-lg font-semibold transition-all border-2 flex items-center justify-center gap-2 disabled:opacity-50 ${isDark ? 'border-red-600 text-red-500 hover:bg-red-600/10' : 'border-red-500 text-red-600 hover:bg-red-100'}`}
										>
											<Trash2 className="w-5 h-5" />
											Delete Account Permanently
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Appearance Tab */}
						{activeTab === 'appearance' && (
							<div
								className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-lg p-6 space-y-6`}
							>
								<div>
									<h2 className="text-xl font-bold mb-4">Theme Settings</h2>
									<div
										className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border ${
											isDark
												? 'bg-slate-800 border-slate-700 text-slate-100'
												: 'bg-white border-slate-200 text-slate-900'
										}`}
									>
										<div className="flex items-center gap-4">
											{effectiveTheme === 'dark' ? (
												<Moon className="w-6 h-6 text-yellow-500" />
											) : (
												<Sun className="w-6 h-6 text-yellow-500" />
											)}
											<div>
												<p className="font-semibold">
													{effectiveTheme === 'dark'
														? 'Dark Mode'
														: 'Light Mode'}
												</p>
												<p
													className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
												>
													Current theme preference
												</p>
											</div>
										</div>
										<button
											onClick={toggleTheme}
											className="px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
										>
											Toggle Theme
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Notifications Tab */}
						{activeTab === 'notifications' && (
							<div
								className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-lg p-6 space-y-6`}
							>
								<div>
									<h2 className="text-xl font-bold mb-4">
										Notification Preferences
									</h2>
									<div
										className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'}`}
									>
										<p
											className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
										>
											📧 Email notifications will be sent for important events
											such as:
										</p>
										<ul
											className={`mt-3 space-y-2 text-sm list-disc list-inside ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
										>
											<li>Pass creation and expiration</li>
											<li>Password changes</li>
											<li>Account security updates</li>
											<li>Pass access and scans</li>
										</ul>
									</div>
								</div>
							</div>
						)}

						{/* Privacy & Data Tab */}
						{activeTab === 'privacy' && (
							<div
								className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-lg p-6 space-y-6`}
							>
								<div>
									<h2 className="text-xl font-bold mb-4">Privacy & Data</h2>
									<div className="space-y-4">
										<div
											className={`p-4 rounded-lg border-2 ${isDark ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-cyan-400 bg-cyan-50'}`}
										>
											<h3 className="font-semibold mb-2 flex items-center gap-2">
												<FileText className="w-5 h-5" />
												Data Collection
											</h3>
											<p
												className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												We collect minimal personal data necessary to provide
												our services. Your data is encrypted and never shared
												with third parties.
											</p>
										</div>

										<div
											className={`p-4 rounded-lg border-2 ${isDark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-400 bg-blue-50'}`}
										>
											<h3 className="font-semibold mb-2 flex items-center gap-2">
												<Download className="w-5 h-5" />
												Download Your Data
											</h3>
											<p
												className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
											>
												You can request a copy of all your data in JSON format.
											</p>
											<button
												onClick={handleExportData}
												disabled={isExporting}
												className={`px-6 py-2 rounded-lg font-semibold transition-all border-2 disabled:opacity-60 ${isDark ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' : 'border-blue-500 text-blue-600 hover:bg-blue-100'}`}
											>
												{isExporting ? 'Exporting...' : 'Export Data'}
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
