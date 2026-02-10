'use client';

import { use, useEffect, useState } from 'react';
import { getPublicRecord, getRecordById } from '@/lib/records.server';
import { format } from 'date-fns';
import Link from 'next/link';
import { EFORM_C_HEADER, VEHICLE_SECTION_HEADER } from '@/lib/eform-c-official';

interface PublicRecordPageProps {
	params: Promise<{
		recordId: string;
	}>;
}

export default function PublicRecordPage({ params }: PublicRecordPageProps) {
	// Unwrap the params Promise using React.use()
	const { recordId } = use(params);
	const [record, setRecord] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const fetchRecord = async () => {
			try {
				// Try to fetch by ID first (UUID format), otherwise by public token
				let result;

				// Check if it's a UUID (has dashes) - likely a record ID
				if (recordId.includes('-')) {
					result = await getRecordById(recordId);
				} else {
					// Otherwise treat as public token
					result = await getPublicRecord(recordId);
				}

				if (!result.success) {
					setError(result.error || 'Record not found');
					return;
				}

				setRecord(result.record);
			} catch (err) {
				setError('Failed to load record');
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecord();
	}, [recordId]);

	if (!mounted) return null;

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="flex flex-col items-center gap-4">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-emerald-700"></div>
					<p className="text-sm text-slate-600">Loading record...</p>
				</div>
			</div>
		);
	}

	if (error || !record) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-white">
				<div className="max-w-md w-full border border-slate-200 rounded-lg p-6">
					<p className="text-center text-red-600 mb-4 text-lg font-semibold">
						❌ {error || 'Record not found'}
					</p>
					<p className="text-center text-sm text-slate-600 mb-6">
						The record you're looking for doesn't exist or may have expired.
					</p>
					<Link
						href="/"
						className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-center transition-colors"
					>
						Go Back Home
					</Link>
				</div>
			</div>
		);
	}

	const formData = record.form_data || {};

	const getValue = (keys: string[], fallback = '-') => {
		for (const key of keys) {
			const value = (formData as Record<string, any>)[key];
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

	const formatDateTime = (value: any) => {
		if (!value) return '-';
		try {
			return format(new Date(value), 'dd-MM-yyyy hh:mm:ss a');
		} catch {
			return String(value);
		}
	};

	const licenseeDetails =
		getValue(['licensee_details_address'], '') ||
		[
			(formData as Record<string, any>).licensee_address,
			(formData as Record<string, any>).licensee_village,
			(formData as Record<string, any>).licensee_gata_khand,
			(formData as Record<string, any>).licensee_area,
		]
			.filter(Boolean)
			.join(', ') ||
		'-';

	const eformNo = getValue(
		['eform_c_no', 'eform_c_number'],
		record.public_token || record.id,
	);
	const licenseeId = getValue(['licensee_id']);
	const licenseeName = getValue(['name_of_licensee', 'licensee_name']);
	const licenseeMobile = getValue([
		'mobile_number_of_licensee',
		'licensee_mobile',
	]);
	const destinationDistrict = getValue(['destination_district']);
	const tehsilOfLicense = getValue(['tehsil_of_license']);
	const districtOfLicense = getValue(['district_of_license']);
	const quantityTransported = getValue(['quantity_transported']);
	const nameOfMineral = getValue(['name_of_mineral', 'mineral_name']);
	const loadingFrom = getValue(['loading_from']);
	const destinationAddress = getValue(
		['destination_delivery_address', 'destination_address'],
		'-',
	);
	const distanceApprox = getValue(['distance_approx']);
	const travelingDuration = getValue(['traveling_duration']);
	const generatedOn = formatDateTime(
		getValue(['eform_c_generated_on'], record.generated_on),
	);
	const validUpto = formatDateTime(
		getValue(['eform_c_valid_upto'], record.valid_upto),
	);
	const sellingPrice = getValue(['selling_price']);
	const serialNumber = getValue(['serial_number', 'serialNumber']);
	const vehicleRegistration = getValue([
		'registration_number',
		'vehicle_registration',
	]);
	const driverName = getValue(['name_of_driver', 'driver_name']);
	const grossVehicleWeight = getValue(['gross_vehicle_weight']);
	const carryingCapacity = getValue(['carrying_capacity']);
	const driverMobile = getValue(['mobile_number_of_driver']);

	return (
		<div className="emineral-page">
			<div className="page-wrap">
				<div className="section">
					<table className="main-form-table">
						<tbody>
							<tr>
								<td colSpan={4} className="no-border">
									<Link href="/" className="back-link">
										Back
									</Link>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div className="body-content text-center">
					<fieldset className="fieldset">
						<table className="main-form-table">
							<tbody>
								<tr>
									<td className="imp-header" colSpan={4}>
										<h2>{EFORM_C_HEADER.line1}</h2>
										<h4>
											{EFORM_C_HEADER.line2}
											<br />
											{EFORM_C_HEADER.line3}
										</h4>
										<hr />
										<h3>{EFORM_C_HEADER.title}</h3>
									</td>
								</tr>
								<tr>
									<td className="tdrow" colSpan={4}>
										{EFORM_C_HEADER.subtitle}
									</td>
								</tr>
								<tr>
									<td className="stytd label">1. eForm C No.:</td>
									<td className="stytd">{eformNo}</td>
									<td className="stytd label">2. Licensee Id:</td>
									<td className="stytd">{licenseeId}</td>
								</tr>
								<tr>
									<td className="stytd label">3. Name of Licensee:</td>
									<td className="stytd" colSpan={3}>
										{licenseeName}
									</td>
								</tr>
								<tr>
									<td className="stytd label">4. Mobile No:</td>
									<td className="stytd">{licenseeMobile}</td>
									<td className="stytd label">5. Destination District :</td>
									<td className="stytd">{destinationDistrict}</td>
								</tr>
								<tr>
									<td className="stytd label">
										6. Licensee Details [Address, Village, (Gata/Khand), Area]:
									</td>
									<td className="stytd" colSpan={3}>
										{licenseeDetails}
									</td>
								</tr>
								<tr>
									<td className="stytd label">7. Tehsil Of License:</td>
									<td className="stytd">{tehsilOfLicense}</td>
									<td className="stytd label">8. District Of License:</td>
									<td className="stytd">{districtOfLicense}</td>
								</tr>
								<tr>
									<td className="stytd label">9. Quantity Transported:</td>
									<td className="stytd">{quantityTransported}</td>
									<td className="stytd label">10. Name Of Mineral:</td>
									<td className="stytd">{nameOfMineral}</td>
								</tr>
								<tr>
									<td className="stytd label">11. Loading From:</td>
									<td className="stytd">{loadingFrom}</td>
									<td className="stytd label">
										12. Destination (Delivery Address):
									</td>
									<td className="stytd">{destinationAddress}</td>
								</tr>
								<tr>
									<td className="stytd label">13. Distance(Approx):</td>
									<td className="stytd">{distanceApprox}</td>
									<td className="stytd label">14. Traveling Duration :</td>
									<td className="stytd">{travelingDuration}</td>
								</tr>
								<tr>
									<td className="stytd label">15. eForm-C Generated On:</td>
									<td className="stytd">{generatedOn}</td>
									<td className="stytd label">16. eForm-C Valid Upto:</td>
									<td className="stytd">{validUpto}</td>
								</tr>
								<tr>
									<td className="stytd label">
										17. Selling Price(Rs per tonne):
									</td>
									<td className="stytd">{sellingPrice}</td>
									<td className="stytd label">18. Serial Number:</td>
									<td className="stytd">{serialNumber}</td>
								</tr>
							</tbody>
						</table>
					</fieldset>

					<fieldset className="fieldset">
						<table className="main-form-table">
							<tbody>
								<tr>
									<td className="tdrow" colSpan={4}>
										{VEHICLE_SECTION_HEADER}
									</td>
								</tr>
								<tr>
									<td className="stytd label">1. Registration Number :</td>
									<td className="stytd">{vehicleRegistration}</td>
									<td className="stytd label">2. Name Of Driver :</td>
									<td className="stytd">{driverName}</td>
								</tr>
								<tr>
									<td className="stytd label">
										3. Gross Vehicle Weight in Tonne:
									</td>
									<td className="stytd">{grossVehicleWeight}</td>
									<td className="stytd label">
										4. Carrying capacity of vehicle in Tonne :
									</td>
									<td className="stytd">{carryingCapacity}</td>
								</tr>
								<tr>
									<td className="stytd label">5. Mobile Number Of Driver:</td>
									<td className="stytd" colSpan={3}>
										{driverMobile}
									</td>
								</tr>
							</tbody>
						</table>
					</fieldset>

					<div className="bigHeading">
						This eForm-c is valid up to <span>{validUpto}</span>
					</div>
				</div>
			</div>

			<style jsx>{`
				.emineral-page {
					background: #ffffff;
					color: #000000;
					min-height: 100vh;
					font-family: 'Open Sans', Arial, sans-serif;
					font-size: 1.05rem;
				}
				.page-wrap {
					padding: 16px;
				}
				.main-form-table {
					width: 100%;
					border-collapse: collapse;
				}
				.main-form-table td {
					font-size: 11px;
					font-family: 'Open Sans', Arial, sans-serif;
					padding: 6px 10px;
					border: 1px solid #c2b9b9;
					vertical-align: top;
				}
				.no-border {
					border: none !important;
					padding: 0 0 10px 0;
				}
				.back-link {
					color: #0b6e4f;
					text-decoration: underline;
					font-size: 12px;
				}
				.imp-header {
					text-align: center;
					font-weight: bold;
					padding: 6px;
					background-color: #f2f2f2;
				}
				.imp-header h2,
				.imp-header h3,
				.imp-header h4 {
					margin: 4px 0;
				}
				.tdrow {
					font-weight: bold;
					background-color: #f64446;
					padding: 4px;
					color: #ffffff;
					font-variant: petite-caps;
					text-align: center;
				}
				.stytd.label {
					font-weight: bold;
					width: 220px;
				}
				.fieldset {
					width: 100%;
					max-width: 980px;
					border: 1px solid maroon;
					border-radius: 4px 4px 0 0;
					padding: 5px 0;
					margin: 0 auto 16px;
				}
				.bigHeading {
					font-weight: bold;
					font-size: 20px;
					color: maroon;
					text-align: center;
					margin: 20px 0;
				}
				@media (max-width: 640px) {
					.main-form-table td {
						font-size: 11px;
						padding: 6px 8px;
					}
					.stytd.label {
						width: auto;
					}
				}
			`}</style>
			<style jsx global>{`
				nav {
					display: none !important;
				}
				footer {
					display: none !important;
				}
			`}</style>
		</div>
	);
}
