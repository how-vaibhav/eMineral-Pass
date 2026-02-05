import { jsPDF } from "jspdf";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";
import fs from "fs";
import path from "path";

/* ================= CONFIG ================= */

const PAGE_MARGIN_X = 12;
const COLUMN_RIGHT_X = 110;
const LINE_HEIGHT = 5;

/* ================= TYPES ================= */

interface PDFGenerationOptions {
  qrCodeDataUrl?: string;
}

let cachedDevaFontBase64: string | null = null;

function getDevanagariFontBase64(): string | null {
  if (cachedDevaFontBase64) return cachedDevaFontBase64;

  try {
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "NotoSansDevanagari-Regular.ttf",
    );
    const fontBuffer = fs.readFileSync(fontPath);
    cachedDevaFontBase64 = fontBuffer.toString("base64");
    return cachedDevaFontBase64;
  } catch (error) {
    console.warn(
      "Devanagari font not found. Hindi text may not render.",
      error,
    );
    return null;
  }
}

function ensureDevanagariFont(pdf: jsPDF) {
  const base64 = getDevanagariFontBase64();
  if (!base64) return;

  // @ts-ignore - jsPDF VFS font registration
  pdf.addFileToVFS("NotoSansDevanagari-Regular.ttf", base64);
  // @ts-ignore - jsPDF font registration
  pdf.addFont("NotoSansDevanagari-Regular.ttf", "NotoSansDeva", "normal");
}

/* ================= CORE PDF ================= */

export async function generatePDF(
  recordId: string,
  data: Record<string, string>,
  generatedOn: Date,
  validUpto: Date,
  options: PDFGenerationOptions = {},
): Promise<Buffer> {
  const toText = (value: unknown, fallback = "-") => {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
  };

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.setFont("helvetica", "normal");
  ensureDevanagariFont(pdf);

  const commonData = {
    formNo: recordId,
    licenseeId: toText((data as any).licenseeId ?? (data as any).licensee_id),
    licenseeName: toText(
      (data as any).licenseeName ??
        (data as any).name_of_lessee ??
        (data as any).nameOfLicenseeOfLease,
    ),
    mobile: toText(
      (data as any).mobile ??
        (data as any).mobile_number_of_lessee ??
        (data as any).mobileNumberOfLicensee,
    ),
    address: toText(
      (data as any).address ??
        (data as any).licensee_details_address ??
        (data as any).licenseeDetailsAddress,
    ),
    tehsil: toText(
      (data as any).tehsil ??
        (data as any).tehsil_of_lessee ??
        (data as any).tehsilOfLicense,
    ),
    district: toText(
      (data as any).district ??
        (data as any).district_of_lessee ??
        (data as any).districtOfLicense,
    ),
    qty: toText(
      (data as any).qty ??
        (data as any).quantity_in_ton ??
        (data as any).quantityInTonnes,
    ),
    mineral: toText(
      (data as any).mineral ??
        (data as any).mineral_name ??
        (data as any).mineralName,
    ),
    loadingFrom: toText(
      (data as any).loadingFrom ??
        (data as any).loading_from ??
        (data as any).placeOfLoading,
    ),
    destination: toText(
      (data as any).destination ??
        (data as any).name_of_consignee ??
        (data as any).nameOfConsignee,
    ),
    distance: toText(
      (data as any).distance ??
        (data as any).distance_km ??
        (data as any).distanceInKm,
    ),
    generatedOn: format(generatedOn, "dd-MM-yyyy hh:mm:ss a"),
    validUpto: format(validUpto, "dd-MM-yyyy hh:mm:ss a"),
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

  renderCopy(pdf, 14, "प्रथम प्रति ( पट्टा धारक हेतु )", commonData);
  renderCopy(
    pdf,
    102,
    "द्वितीय प्रति ( परिवहनकर्ता / उपभोक्ता / भण्डारण / कार्यदायी संस्था हेतु )",
    commonData,
  );
  renderCopy(pdf, 190, "तृतीय प्रति ( जाँचकर्ता हेतु )", commonData);

  if (options.qrCodeDataUrl && options.qrCodeDataUrl.startsWith("data:image")) {
    pdf.addImage(options.qrCodeDataUrl, "PNG", 155, 245, 35, 35);
  }

  return Buffer.from(pdf.output("arraybuffer"));
}

/* ================= COPY RENDERER ================= */

function renderHindiTitle(pdf: jsPDF, text: string, x: number, y: number) {
  // Use Devanagari font only for Hindi text
  try {
    // @ts-ignore
    pdf.setFont("NotoSansDeva", "normal");
  } catch {
    // Fallback to default font if custom font is not registered
    pdf.setFont("helvetica", "normal");
  }
  pdf.setFontSize(10);
  pdf.text(text, x, y);
  pdf.setFont("helvetica", "normal");
}

function renderCopy(pdf: jsPDF, startY: number, title: string, d: any) {
  let y = startY;

  renderHindiTitle(pdf, title, PAGE_MARGIN_X, y);
  y += 6;

  pdf.setFontSize(9);

  row(pdf, y, `1. eForm-C No.: ${d.formNo}`, `2. Licensee Id: ${d.licenseeId}`);
  y += LINE_HEIGHT;

  pdf.text(`3. Name of Licensee:`, PAGE_MARGIN_X, y);
  y += LINE_HEIGHT;
  pdf.text(d.licenseeName, PAGE_MARGIN_X + 6, y);
  y += LINE_HEIGHT;

  pdf.text(`4. Mobile Number Of Licensee: ${d.mobile}`, PAGE_MARGIN_X, y);
  y += LINE_HEIGHT;

  pdf.text(
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

  pdf.text(
    `8. QTY Transported In (Cubic Meter/Ton for Silica sand/Diaspore/Pyrophylite): ${d.qty}`,
    PAGE_MARGIN_X,
    y,
  );
  y += LINE_HEIGHT;

  pdf.text(`9. Name Of Mineral:`, PAGE_MARGIN_X, y);
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

  pdf.text(`18. Serial Number: ${d.serialNo}`, PAGE_MARGIN_X, y);
}

/* ================= HELPERS ================= */

function row(pdf: jsPDF, y: number, left: string, right: string) {
  pdf.text(left, PAGE_MARGIN_X, y);
  pdf.text(right, COLUMN_RIGHT_X, y);
}

function manualWrap(pdf: jsPDF, text: string, x: number, y: number) {
  const safeText = text || "";
  const lines = safeText.split("\n");
  lines.forEach((line, i) => {
    pdf.text(line, x, y + i * LINE_HEIGHT);
  });
}

/* ================= STORAGE ================= */

export async function uploadPDF(
  recordId: string,
  userId: string,
  pdfBuffer: Buffer,
): Promise<string> {
  const path = `pdfs/${userId}/${recordId}.pdf`;

  const { data, error } = await supabaseAdmin.storage
    .from("pdfs")
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  const signed = await supabaseAdmin.storage
    .from("pdfs")
    .createSignedUrl(data.path, 2592000);

  if (!signed.data?.signedUrl) {
    throw new Error("Signed URL generation failed");
  }

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
    // Generate the PDF buffer
    const pdfBuffer = await generatePDF(
      recordId,
      formData,
      generatedOn,
      validUpto,
      options,
    );

    // Upload to storage and get signed URL
    const pdfUrl = await uploadPDF(recordId, userId, pdfBuffer);

    return pdfUrl;
  } catch (error) {
    console.error("Error generating and storing PDF:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
