'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
	Settings,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { parseTimestampFlexible } from '@/lib/timestamp-utils';

interface UserRecord {
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
		'All' | 'active' | 'expired' | 'archived'
	>('All');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [records, setRecords] = useState<UserRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [notification, setNotification] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);
	const [now, setNow] = useState(() => new Date());

	const isDark = effectiveTheme === 'dark';

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 10000);
		return () => clearInterval(interval);
	}, []);

	const getValidUptoDate = (record: UserRecord) => {
		const formValidUpto = record.form_data?.eform_c_valid_upto;
		if (typeof formValidUpto === 'string' && formValidUpto.trim()) {
			const parsedForm = parseTimestampFlexible(formValidUpto);
			if (parsedForm) return parsedForm;
		}

		if (record.valid_upto) {
			const parsedDb = new Date(record.valid_upto);
			if (!Number.isNaN(parsedDb.getTime())) return parsedDb;
		}

		return null;
	};

	const getEffectiveStatus = (record: UserRecord) => {
		if (record.status === 'archived') return 'archived';
		if (!record.valid_upto && !record.form_data?.eform_c_valid_upto) {
			return record.status;
		}

		const validUntil = getValidUptoDate(record);
		if (!validUntil) return 'expired';

		return now > validUntil ? 'expired' : 'active';
	};

	const formatDateInput = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const setRangeDays = (days: number) => {
		const today = new Date();
		const start = new Date();
		start.setDate(today.getDate() - (days - 1));
		setDateFrom(formatDateInput(start));
		setDateTo(formatDateInput(today));
	};

	const setThisMonth = () => {
		const today = new Date();
		const start = new Date(today.getFullYear(), today.getMonth(), 1);
		setDateFrom(formatDateInput(start));
		setDateTo(formatDateInput(today));
	};

	const handleDateFromChange = (value: string) => {
		setDateFrom(value);
		if (dateTo && value && new Date(value) > new Date(dateTo)) {
			setDateTo(value);
		}
	};

	const handleDateToChange = (value: string) => {
		setDateTo(value);
		if (dateFrom && value && new Date(value) < new Date(dateFrom)) {
			setDateFrom(value);
		}
	};

	const getFormValue = (
		formData: Record<string, any>,
		keys: string[],
		fallback = '-',
	) => {
		for (const key of keys) {
			const value = formData[key];
			if (
				value !== undefined &&
				value !== null &&
				String(value).trim() !== ''
			) {
				return String(value);
			}
		}
		return fallback;
	};

	// Fetch user's records
	useEffect(() => {
		const fetchRecords = async () => {
			if (!user) return;

			try {
				setLoading(true);
				const { data, error } = await supabase
					.from('records')
					.select('*')
					.eq('user_id', user.id)
					.order('created_at', { ascending: false });

				if (error) throw error;
				setRecords(data || []);
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: typeof error === 'object'
							? JSON.stringify(error)
							: String(error);
				console.error('Error fetching records:', message, error);
			} finally {
				setLoading(false);
			}
		};

		fetchRecords();
	}, [user]);

	// Filter records based on selected status
	const filteredRecords = records.filter((record) => {
		const effectiveStatus = getEffectiveStatus(record);
		if (filterStatus !== 'All' && effectiveStatus !== filterStatus) {
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
	const activeRecords = records.filter(
		(record) => getEffectiveStatus(record) === 'active',
	).length;
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
			label: 'Total Passes',
			value: records.length,
			icon: <FileText className="w-6 h-6" />,
		},
		{
			label: 'Active Passes',
			value: activeRecords,
			icon: <QrCode className="w-6 h-6" />,
		},
		{
			label: 'This Month',
			value: thisMonthRecords,
			icon: <Calendar className="w-6 h-6" />,
		},
	];

	const handleDelete = async (recordId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this pass? This action cannot be undone.',
			)
		)
			return;

		setDeletingId(recordId);
		try {
			const { error } = await supabase
				.from('records')
				.delete()
				.eq('id', recordId);

			if (error) throw error;

			// Remove from local state
			setRecords(records.filter((r) => r.id !== recordId));

			// Show success notification
			setNotification({
				type: 'success',
				message: 'Pass deleted successfully',
			});

			// Auto-hide notification after 3 seconds
			setTimeout(() => setNotification(null), 3000);
		} catch (error) {
			console.error('Error deleting record:', error);

			// Show error notification
			setNotification({
				type: 'error',
				message: 'Failed to delete pass. Please try again.',
			});

			// Auto-hide notification after 5 seconds
			setTimeout(() => setNotification(null), 5000);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div
			className={`min-h-screen pt-20 transition-colors ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}
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

			{/* Header */}
			<div
				className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b transition-colors`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
					<div className="flex justify-between items-start gap-4 mb-6 sm:mb-8 flex-col sm:flex-row">
						<div className="flex-1">
							<h1 className="text-2xl sm:text-3xl font-bold mb-1">My Passes</h1>
							<p
								className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
							>
								Manage your mineral transportation passes
							</p>
						</div>
						<div className="flex gap-2 w-full sm:w-auto">
							<Link
								href="/form"
								className="flex-1 sm:flex-none px-4 py-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg transition-all"
							>
								<Plus className="w-5 h-5" />
								<span>New Pass</span>
							</Link>
							<Link
								href="/dashboard/settings"
								className={`flex-1 sm:flex-none px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
							>
								<Settings className="w-5 h-5" />
								<span className="hidden sm:inline">Settings</span>
							</Link>
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
						{stats.map((stat, i) => (
							<div
								key={i}
								className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg p-3 sm:p-4 transition-colors`}
							>
								<div className="flex items-center justify-between gap-2">
									<div>
										<p
											className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
										>
											{stat.label}
										</p>
										<p className="text-2xl sm:text-3xl font-bold mt-1">
											{stat.value}
										</p>
									</div>
									<div className="text-cyan-500 shrink-0">{stat.icon}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
				{/* Date Range Filter */}
				<div
					className={`mb-4 rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-end ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
				>
					<div className="flex-1">
						<label
							className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
						>
							From
						</label>
						<input
							type="date"
							value={dateFrom}
							onChange={(e) => handleDateFromChange(e.target.value)}
							className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'}`}
						/>
					</div>
					<div className="flex-1">
						<label
							className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
						>
							To
						</label>
						<input
							type="date"
							value={dateTo}
							onChange={(e) => handleDateToChange(e.target.value)}
							className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'}`}
						/>
					</div>
					<button
						onClick={() => {
							setDateFrom('');
							setDateTo('');
						}}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
					>
						Clear Dates
					</button>
				</div>

				<div className="mb-6 flex flex-wrap items-center gap-2">
					<span
						className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
					>
						Quick Range
					</span>
					{[
						{ label: 'Today', action: () => setRangeDays(1) },
						{ label: 'Last 7 Days', action: () => setRangeDays(7) },
						{ label: 'Last 30 Days', action: () => setRangeDays(30) },
						{ label: 'This Month', action: setThisMonth },
					].map((preset) => (
						<button
							key={preset.label}
							onClick={preset.action}
							className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
						>
							{preset.label}
						</button>
					))}
					{(dateFrom || dateTo) && (
						<span
							className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}
						>
							Range: {dateFrom || '...'} to {dateTo || '...'}
						</span>
					)}
				</div>

				{/* Filter Buttons */}
				<div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
					{(['All', 'active', 'expired', 'archived'] as const).map((status) => (
						<button
							key={status}
							onClick={() => setFilterStatus(status)}
							className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
								filterStatus === status
									? 'bg-cyan-500 text-white'
									: isDark
										? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
										: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
							}`}
						>
							<Filter className="w-4 h-4" />
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</button>
					))}
				</div>

				{loading ? (
					<div className="text-center py-20">
						<p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
							Loading your passes...
						</p>
					</div>
				) : filteredRecords.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className={`text-center py-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-lg`}
					>
						<QrCode className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
						<h2 className="text-2xl font-bold mb-2">No Passes Found</h2>
						<p
							className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}
						>
							{filterStatus === 'All'
								? 'Create your first pass to get started'
								: 'No passes match your filter criteria'}
						</p>
						{filterStatus !== 'All' ? (
							<button
								onClick={() => setFilterStatus('All')}
								className="text-cyan-400 hover:text-cyan-300 font-semibold"
							>
								Clear Filter
							</button>
						) : (
							<Link
								href="/form"
								className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg"
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
							const passNumber = getFormValue(
								formData,
								['eform_c_no', 'serial_number', 'serialNumber'],
								record.id.slice(0, 8),
							);
							const mineral = getFormValue(
								formData,
								['name_of_mineral', 'mineral_name', 'mineralName'],
								'N/A',
							);
							const quantity = getFormValue(
								formData,
								['quantity_transported', 'quantityInTonnes'],
								'0',
							);
							const destination = getFormValue(
								formData,
								[
									'destination_delivery_address',
									'destination_district',
									'nameOfConsignee',
								],
								'Unknown',
							);
							const effectiveStatus = getEffectiveStatus(record);
							const validUptoDate = getValidUptoDate(record);

							return (
								<motion.div
									key={record.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'} border rounded-lg p-6 transition-all`}
								>
									<div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start mb-4">
										{/* Pass Info */}
										<div className="md:col-span-2">
											<div className="text-sm font-mono text-cyan-400 mb-1">
												EMP-{passNumber}
											</div>
											<h3 className="font-semibold text-lg mb-1">{mineral}</h3>
											<p
												className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
											>
												{quantity} Tonnes
											</p>
										</div>

										{/* Destination */}
										<div>
											<p
												className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}
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
												className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}
											>
												STATUS
											</p>
											<span
												className={`px-3 py-1 rounded-full text-sm font-semibold ${
													effectiveStatus === 'active'
														? 'bg-green-500/20 text-green-400'
														: effectiveStatus === 'expired'
															? 'bg-red-500/20 text-red-400'
															: 'bg-gray-500/20 text-gray-400'
												}`}
											>
												{effectiveStatus.charAt(0).toUpperCase() +
													effectiveStatus.slice(1)}
											</span>
										</div>

										{/* Date */}
										<div>
											<p
												className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}
											>
												VALID UPTO
											</p>
											<p className="font-medium">
												{validUptoDate ? validUptoDate.toLocaleString() : '-'}
											</p>
										</div>

										{/* Actions */}
										<div className="flex flex-wrap gap-2 justify-start md:justify-end">
											<Link
												href={`/records/${record.id}`}
												className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}
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
															? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
															: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
															? 'bg-slate-800 text-slate-400'
															: 'bg-slate-100 text-slate-500'
													}`}
													title="PDF is generating"
												>
													<Download className="w-5 h-5 text-slate-400" />
													<span className="hidden sm:inline">PDF pending</span>
												</span>
											)}
											<button
												onClick={() => handleDelete(record.id)}
												disabled={deletingId === record.id}
												className={`p-2 rounded-lg transition-all ${
													deletingId === record.id
														? 'opacity-50 cursor-not-allowed'
														: isDark
															? 'hover:bg-red-900/30'
															: 'hover:bg-red-100'
												}`}
												title={
													deletingId === record.id ? 'Deleting...' : 'Delete'
												}
											>
												{deletingId === record.id ? (
													<div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
												) : (
													<Trash2 className="w-5 h-5 text-slate-400 hover:text-red-400" />
												)}
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
