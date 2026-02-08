import { jsPDF } from 'jspdf';
import { supabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

/* ================= CONFIG ================= */

const PAGE_MARGIN_X = 12;
const COLUMN_RIGHT_X = 110;
const LINE_HEIGHT = 5;
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

/* ================= TYPES ================= */

interface PDFGenerationOptions {
	qrCodeDataUrl?: string;
}

let cachedDevaFontBase64: string | null = null;

function getDevanagariFontBase64(): string | null {
	if (cachedDevaFontBase64) return cachedDevaFontBase64;

	try {
		// Use Noto Sans Devanagari font (locally available)
		const localFontPath = path.join(
			process.cwd(),
			'public',
			'fonts',
			'NotoSansDevanagari-Regular.ttf',
		);

		console.log('[PDF-Font] Loading Noto Sans Devanagari font:', localFontPath);
		const fontBuffer = fs.readFileSync(localFontPath);
		console.log(
			'[PDF-Font] ✓ Font loaded successfully, size:',
			fontBuffer.length,
			'bytes',
		);

		cachedDevaFontBase64 = fontBuffer.toString('base64');
		console.log(
			'[PDF-Font] Font base64 encoded, length:',
			cachedDevaFontBase64.length,
		);
		return cachedDevaFontBase64;
	} catch (error) {
		console.error(
			'[PDF-Font] ❌ Noto Sans Devanagari font not found. Hindi text may not render correctly.',
			error,
		);
		return null;
	}
}

function ensureDevanagariFont(pdf: jsPDF) {
	const base64 = getDevanagariFontBase64();
	if (!base64) {
		console.log('[PDF-Font] No font loaded, using default Helvetica');
		return;
	}

	try {
		// @ts-ignore - jsPDF VFS font registration
		pdf.addFileToVFS('NotoSansDevanagari-Regular.ttf', base64);
		// @ts-ignore - jsPDF font registration
		pdf.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDeva', 'normal');
		console.log('[PDF-Font] ✓ Noto Sans Devanagari font registered with jsPDF');
	} catch (err) {
		console.error('[PDF-Font] ❌ Failed to register font:', err);
	}
}

/* ================= CORE PDF ================= */

export async function generatePDF(
	recordId: string,
	data: Record<string, string>,
	generatedOn: Date,
	validUpto: Date,
	options: PDFGenerationOptions = {},
): Promise<Buffer> {
	console.log('[PDF] generatePDF called for recordId:', recordId);
	const toText = (value: unknown, fallback = '-') => {
		if (value === null || value === undefined || value === '') return fallback;
		return String(value);
	};

	const pdf = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4',
	});
	console.log('[PDF] jsPDF instance created');

	pdf.setFont('helvetica', 'normal');
	ensureDevanagariFont(pdf);
	console.log('[PDF] Fonts configured');

	console.log(data);

	const commonData = {
		formNo: recordId,
		licenseeId: toText((data as any).licenseeId ?? (data as any).licensee_id),
		licenseeName: toText(
			(data as any).licenseeName ??
				(data as any).name_of_licensee ??
				(data as any).nameOfLicenseeOfLease,
		),
		mobile: toText(
			(data as any).mobile ??
				(data as any).mobile_number_of_licensee ??
				(data as any).mobileNumberOfLicensee,
		),
		address: toText(
			(data as any).address ??
				(data as any).licensee_details_address ??
				(data as any).licenseeDetailsAddress,
		),
		tehsil: toText(
			(data as any).tehsil ??
				(data as any).tehsil_of_license ??
				(data as any).tehsilOfLicense,
		),
		district: toText(
			(data as any).district ??
				(data as any).district_of_license ??
				(data as any).districtOfLicense,
		),
		qty: toText(
			(data as any).quantity_transported ??
				(data as any).quantity_in_ton ??
				(data as any).quantityInTonnes,
		),
		mineral: toText(
			(data as any).mineral ??
				(data as any).name_of_mineral ??
				(data as any).mineralName,
		),
		loadingFrom: toText(
			(data as any).loadingFrom ??
				(data as any).loading_from ??
				(data as any).placeOfLoading,
		),
		destination: toText(
			(data as any).destination_delivery_address ??
				(data as any).name_of_consignee ??
				(data as any).nameOfConsignee,
		),
		distance: toText(
			(data as any).distance_approx ??
				(data as any).distance_km ??
				(data as any).distanceInKm,
		),
		generatedOn: format(generatedOn, 'dd-MM-yyyy hh:mm:ss a'),
		validUpto: format(validUpto, 'dd-MM-yyyy hh:mm:ss a'),
		sellingPrice: toText(
			(data as any).sellingPrice ??
				(data as any).selling_price ??
				(data as any).sellingPriceRs,
		),
		serialNo: toText(
			(data as any).serialNo ??
				(data as any).serial_number ??
				(data as any).serialNumber,
		),
	};

	renderCopy(
		pdf,
		14,
		'प्रथम प्रति ( पट्टा धारक हेतु )',
		commonData,
		options.qrCodeDataUrl,
	);
	renderCopy(
		pdf,
		102,
		'द्वितीय प्रति ( परिवहनकर्ता / उपभोक्ता / भण्डारण / कार्यदायी संस्था हेतु )',
		commonData,
		options.qrCodeDataUrl,
	);
	renderCopy(
		pdf,
		190,
		'तृतीय प्रति ( जाँचकर्ता हेतु )',
		commonData,
		options.qrCodeDataUrl,
	);

	console.log('[PDF] All copies rendered successfully');
	const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
	console.log('[PDF] PDF buffer created, size:', pdfBuffer.length, 'bytes');
	return pdfBuffer;
}

/* ================= COPY RENDERER ================= */

function setFontForText(pdf: jsPDF, text: string) {
	if (DEVANAGARI_REGEX.test(text)) {
		try {
			// @ts-ignore
			pdf.setFont('NotoSansDeva', 'normal');
			return;
		} catch (err) {
			// Fall through to default font if custom font is not registered
			console.log(
				'[PDF-Font] Could not set NotoSansDeva font, using Helvetica:',
				err,
			);
		}
	}
	pdf.setFont('helvetica', 'normal');
}

function drawText(pdf: jsPDF, text: string, x: number, y: number) {
	setFontForText(pdf, text);
	pdf.text(text, x, y);
}

function renderHindiTitle(pdf: jsPDF, text: string, x: number, y: number) {
	pdf.setFontSize(10);
	drawText(pdf, text, x, y);
}

function renderCopy(
	pdf: jsPDF,
	startY: number,
	title: string,
	d: any,
	qrCodeDataUrl?: string,
) {
	let y = startY;

	renderHindiTitle(pdf, title, PAGE_MARGIN_X, y);

	// Add QR code at top-right near header if available
	if (qrCodeDataUrl && qrCodeDataUrl.startsWith('data:image')) {
		pdf.addImage(qrCodeDataUrl, 'PNG', 165, y - 3, 30, 30);
	}

	y += 6;

	pdf.setFontSize(9);

	row(pdf, y, `1. eForm-C No.: ${d.formNo}`, `2. Licensee Id: ${d.licenseeId}`);
	y += LINE_HEIGHT;

	drawText(pdf, `3. Name of Licensee:`, PAGE_MARGIN_X, y);
	y += LINE_HEIGHT;
	drawText(pdf, d.licenseeName, PAGE_MARGIN_X + 6, y);
	y += LINE_HEIGHT;

	drawText(pdf, `4. Mobile Number Of Licensee: ${d.mobile}`, PAGE_MARGIN_X, y);
	y += LINE_HEIGHT;

	drawText(
		pdf,
		`5. Licensee Details [Address, Village, (Gata/Khand), Area]:`,
		PAGE_MARGIN_X,
		y,
	);
	y += LINE_HEIGHT;
	manualWrap(pdf, d.address, PAGE_MARGIN_X + 6, y);
	y += LINE_HEIGHT * 2;

	row(
		pdf,
		y,
		`6. Tehsil Of License: ${d.tehsil}`,
		`7. District Of License: ${d.district}`,
	);
	y += LINE_HEIGHT;

	drawText(
		pdf,
		`8. QTY Transported In (Cubic Meter/Ton for Silica sand/Diaspore/Pyrophylite): ${d.qty}`,
		PAGE_MARGIN_X,
		y,
	);
	y += LINE_HEIGHT;

	drawText(pdf, `9. Name Of Mineral:`, PAGE_MARGIN_X, y);
	y += LINE_HEIGHT;
	manualWrap(pdf, d.mineral, PAGE_MARGIN_X + 6, y);
	y += LINE_HEIGHT;

	row(
		pdf,
		y,
		`10. Loading From: ${d.loadingFrom}`,
		`11. Destination: ${d.destination}`,
	);
	y += LINE_HEIGHT;

	row(
		pdf,
		y,
		`12. Distance (Approx in K.M.): ${d.distance}`,
		`13. eForm-C Generated On: ${d.generatedOn}`,
	);
	y += LINE_HEIGHT;

	row(
		pdf,
		y,
		`14. eForm-C Valid Upto: ${d.validUpto}`,
		`15. Destination District: ${d.district}`,
	);
	y += LINE_HEIGHT;

	row(
		pdf,
		y,
		`16. Traveling Duration: 7`,
		`17. Selling Price (Rs): ${d.sellingPrice}`,
	);
	y += LINE_HEIGHT;

	drawText(pdf, `18. Serial Number: ${d.serialNo}`, PAGE_MARGIN_X, y);
}

/* ================= HELPERS ================= */

function row(pdf: jsPDF, y: number, left: string, right: string) {
	drawText(pdf, left, PAGE_MARGIN_X, y);
	drawText(pdf, right, COLUMN_RIGHT_X, y);
}

function manualWrap(pdf: jsPDF, text: string, x: number, y: number) {
	const safeText = text || '';
	const lines = safeText.split('\n');
	lines.forEach((line, i) => {
		drawText(pdf, line, x, y + i * LINE_HEIGHT);
	});
}

/* ================= STORAGE ================= */

export async function uploadPDF(
	recordId: string,
	userId: string,
	pdfBuffer: Buffer,
): Promise<string> {
	console.log('[PDF-Upload] Starting upload for record:', recordId);
	const path = `pdfs/${userId}/${recordId}.pdf`;
	console.log('[PDF-Upload] Storage path:', path);

	const { data, error } = await supabaseAdmin.storage
		.from('pdfs')
		.upload(path, pdfBuffer, {
			contentType: 'application/pdf',
			upsert: false,
		});

	if (error) {
		console.error('[PDF-Upload] ❌ Upload failed:', error);
		throw error;
	}

	console.log('[PDF-Upload] File uploaded successfully:', data.path);

	const signed = await supabaseAdmin.storage
		.from('pdfs')
		.createSignedUrl(data.path, 2592000);

	if (!signed.data?.signedUrl) {
		console.error('[PDF-Upload] ❌ Signed URL generation failed');
		throw new Error('Signed URL generation failed');
	}

	console.log('[PDF-Upload] ✓ Signed URL created successfully');
	return signed.data.signedUrl;
}

export async function generateAndStorePDF(
	recordId: string,
	userId: string,
	formData: Record<string, string>,
	generatedOn: Date,
	validUpto: Date,
	options: PDFGenerationOptions = {},
): Promise<string> {
	try {
		console.log('[PDF-Main] Starting PDF generation and storage');
		// Generate the PDF buffer
		const pdfBuffer = await generatePDF(
			recordId,
			formData,
			generatedOn,
			validUpto,
			options,
		);

		console.log('[PDF-Main] PDF generated, uploading to storage...');
		// Upload to storage and get signed URL
		const pdfUrl = await uploadPDF(recordId, userId, pdfBuffer);

		console.log('[PDF-Main] ✓ PDF generation and storage complete');
		return pdfUrl;
	} catch (error) {
		console.error('[PDF-Main] ❌ Error generating and storing PDF:', error);
		throw new Error(
			`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	}
}
