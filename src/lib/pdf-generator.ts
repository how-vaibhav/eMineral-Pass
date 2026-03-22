import { jsPDF } from "jspdf";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
import { loadDevanagariFont } from "@/lib/font-loader";

/* ================= CONFIG & CONSTANTS ================= */

const PAGE_MARGIN_X = 10; // Left/right margins (10-12 mm)
const TOP_MARGIN = 15; // Top margin (12-15 mm)
const COPY_HEIGHT = 95; // Each section height (optimized for 3 equal sections)
const COPY_GAP = 0; // Gap between sections on same page
const HEADER_HEIGHT = 38; // Header area within each section (35-40 mm)
const ROW_SPACING = 5; // Vertical spacing between data rows (4-5 mm)
const BORDER_WIDTH = 0.5; // Thin border for sections

// QR Code positioning
const QR_SIZE = 15; // QR code size in mm (reduced)
const QR_OFFSET = 14; // Offset from top-right corner (moved down more)

// 3-Column Grid System (Tightened spacing between columns)
const COL_1_X = 12;
const COL_1_WIDTH = 61;

const COL_2_X = 75;
const COL_2_WIDTH = 61;

const COL_3_X = 138;
const COL_3_WIDTH = 61;

const FONT_SIZE_BODY = 7.5;
const FONT_SIZE_TITLE_HINDI = 10;
const FONT_SIZE_TITLE_ENG = 8.5;

/* ================= TYPES ================= */

interface PDFGenerationOptions {
  qrCodeDataUrl?: string;
}

/* ================= FILE LOADERS ================= */

let cachedDevanagariBase64: string | null = null;
let devanagariLoadAttempted = false;
let cachedLogoBase64: string | null = null;

// Cache for heading images (1, 2, 3)
let cachedHeadingImage1: string | null = null;
let cachedHeadingImage2: string | null = null;
let cachedHeadingImage3: string | null = null;

// Cache for rendered Hindi canvas images (avoid re-rendering per PDF)
const hindiCanvasCache = new Map<string, string>();

/**
 * Register Devanagari font with jsPDF
 * Loads from filesystem or CDN as needed
 */
async function registerDevanagariFont(pdf: jsPDF) {
  try {
    console.log("[PDF-Font] Starting Devanagari font registration...");

    // Use new font-loader utility
    const fontResult = await loadDevanagariFont();
    if (!fontResult) {
      console.warn(
        "[PDF-Font] ⚠️ No Devanagari font data available, Hindi text may not render",
      );
      return;
    }

    console.log(
      `[PDF-Font] Using font from ${fontResult.source} (${fontResult.size}KB)`,
    );

    console.log("[PDF-Font] Adding font to jsPDF VFS...");
    // @ts-ignore
    pdf.addFileToVFS("NotoSansDevanagari.ttf", fontResult.data);

    console.log("[PDF-Font] Registering normal weight...");
    // @ts-ignore
    pdf.addFont("NotoSansDevanagari.ttf", "DevanagariFont", "normal");

    console.log("[PDF-Font] Registering bold weight...");
    // @ts-ignore
    pdf.addFont("NotoSansDevanagari.ttf", "DevanagariFont", "bold");

    console.log("[PDF-Font] ✓ Devanagari font successfully registered!");
  } catch (error) {
    console.error("[PDF-Font] ❌ Failed to register Devanagari font:", error);
  }
}

/**
 * Check if text contains Hindi/Devanagari characters
 */
function hasDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Set font based on text content
 */
function setFontForText(pdf: jsPDF, text: string, bold = false) {
  const weight = bold ? "bold" : "normal";

  if (hasDevanagari(text)) {
    try {
      // @ts-ignore
      pdf.setFont("DevanagariFont", weight);
      console.log("[PDF-Font] Using DevanagariFont for Hindi text");
      return;
    } catch (err) {
      console.warn(
        "[PDF-Font] Could not use DevanagariFont:",
        err,
        "- falling back to helvetica",
      );
    }
  }

  pdf.setFont("helvetica", weight);
}

function getLogoBase64(): string | null {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    cachedLogoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    return cachedLogoBase64;
  } catch (error) {
    console.warn("[PDF-Logo] ⚠️ logo.png not found in public folder.", error);
    return null;
  }
}

/**
 * Load heading images (1.jpg.jpeg, 2.jpg.jpeg, 3.jpg.jpeg)
 */
function getHeadingImageBase64(imageNumber: 1 | 2 | 3): string | null {
  const cacheVar = `cachedHeadingImage${imageNumber}` as const;
  const cached = eval(cacheVar);

  if (cached) return cached;

  try {
    const imagePath = path.join(
      process.cwd(),
      "public",
      `${imageNumber}.jpg.jpeg`,
    );
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    if (imageNumber === 1) cachedHeadingImage1 = base64Image;
    else if (imageNumber === 2) cachedHeadingImage2 = base64Image;
    else if (imageNumber === 3) cachedHeadingImage3 = base64Image;

    return base64Image;
  } catch (error) {
    console.warn(
      `[PDF-Image] ⚠️ ${imageNumber}.jpg.jpeg not found in public folder.`,
      error,
    );
    return null;
  }
}

/**
 * Render Hindi text directly using jsPDF's registered Devanagari font
 * No canvas needed - works on all environments (local + Vercel)
 */
function renderHindiTextToPDF(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize: number = 10,
  isBold: boolean = true,
  color: number[] = [0, 0, 0],
): void {
  try {
    console.log(
      `[PDF-Hindi] Rendering directly: "${text.substring(0, 30)}..."`,
    );

    // Set text color
    pdf.setTextColor(color[0], color[1], color[2]);

    // Set font to DevanagariFont (already registered)
    setFontForText(pdf, text, isBold);
    pdf.setFontSize(fontSize);

    // Draw text directly to PDF
    pdf.text(text, x, y, { align: "center" });

    // Reset text color to black
    pdf.setTextColor(0, 0, 0);

    console.log("[PDF-Hindi] ✓ Direct PDF rendering successful");
  } catch (error) {
    console.error("[PDF-Hindi] ❌ Failed to render Hindi text:", error);
    // Fallback: try with helvetica
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    pdf.text("[Hindi Text]", x, y, { align: "center" });
  }
}

/**
 * Render Hindi copy title directly using jsPDF
 * No canvas needed - works on all environments
 */
function renderHindiCopyTitleToPDF(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize: number = 7.5,
  color: number[] = [0, 0, 0],
): void {
  try {
    console.log(`[PDF-CopyTitle] Rendering: "${text.substring(0, 30)}..."`);

    // Set text color
    pdf.setTextColor(color[0], color[1], color[2]);

    // Set font to DevanagariFont
    setFontForText(pdf, text, true);
    pdf.setFontSize(fontSize);

    // Draw text directly to PDF
    pdf.text(text, x, y, { align: "center" });

    // Reset text color to black
    pdf.setTextColor(0, 0, 0);

    console.log("[PDF-CopyTitle] ✓ Direct PDF rendering successful");
  } catch (error) {
    console.error("[PDF-CopyTitle] ❌ Failed to render copy title:", error);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text("[Hindi Title]", x, y, { align: "center" });
    pdf.setTextColor(0, 0, 0);
  }
}

/* ================= UTILS ================= */

function generate19DigitNumber(): string {
  // Generate number starting with "31" (Uttar Pradesh state code)
  let result = "31";
  for (let i = 2; i < 19; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/* ================= DRAWING HELPERS ================= */

function drawCombinedField(
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  const safeValue = value || "-";

  // Ensure label ends with colon for professional look
  const formattedLabel = label.endsWith(":") ? label : label + ":";

  // Set font for label
  setFontForText(pdf, formattedLabel, true);
  pdf.setFontSize(FONT_SIZE_BODY);

  // Calculate label width to position value appropriately
  const labelWidth = pdf.getTextWidth(formattedLabel);

  // Draw label
  pdf.text(formattedLabel, x, y);

  // Add gap of 2mm after label, then draw value
  const gapSize = 2;
  const valueX = x + labelWidth + gapSize;

  // Set font for value (use bold weight for values)
  setFontForText(pdf, safeValue, true);
  pdf.setFontSize(FONT_SIZE_BODY);

  // Draw value with wrapping if needed
  const remainingWidth = maxWidth - labelWidth - gapSize;
  if (remainingWidth > 10) {
    const valueLines = pdf.splitTextToSize(safeValue, remainingWidth);
    pdf.text(valueLines, valueX, y);
  } else {
    // If space too tight, wrap to next line
    const valueLines = pdf.splitTextToSize(safeValue, maxWidth - 5);
    pdf.text(valueLines, x + 5, y + 5);
  }
}

function renderCenteredText(
  pdf: jsPDF,
  text: string,
  y: number,
  color?: number[],
) {
  const safeText = text || "";

  console.log(
    "[PDF-Text] Rendering centered text:",
    safeText.substring(0, 50),
    "hasDevanagari:",
    hasDevanagari(safeText),
  );

  // Set font FIRST before any other text operations
  setFontForText(pdf, safeText, true);
  console.log("[PDF-Text] Font set");

  if (color) pdf.setTextColor(color[0], color[1], color[2]);
  else pdf.setTextColor(0, 0, 0);

  const pageWidth = 210;

  // For Devanagari text, use splitTextToSize for better rendering
  let textWidth: number;
  let centeredX: number;

  if (hasDevanagari(safeText)) {
    // Devanagari text may have different metrics
    const lines = pdf.splitTextToSize(safeText, pageWidth - PAGE_MARGIN_X * 2);
    if (lines.length > 0) {
      textWidth = pdf.getTextWidth(lines[0]);
    } else {
      textWidth = 0;
    }
  } else {
    textWidth = pdf.getTextWidth(safeText);
  }

  centeredX = (pageWidth - textWidth) / 2;
  console.log(
    "[PDF-Text] Position:",
    centeredX,
    y,
    "Width:",
    textWidth,
    "Text width from PDF:",
    pdf.getTextWidth(safeText),
  );

  pdf.text(safeText, centeredX, y);
  console.log("[PDF-Text] ✓ Text rendered");

  pdf.setTextColor(0, 0, 0);
}

function drawTopBar(pdf: jsPDF) {
  // Print/Back box removed - no longer needed
}

/* ================= COPY RENDERER ================= */

function renderCopy(
  pdf: jsPDF,
  startY: number,
  copyTitle: string,
  d: any,
  options: PDFGenerationOptions,
  headingImageNumber?: 1 | 2 | 3,
) {
  const boxWidth = 210 - PAGE_MARGIN_X * 2;

  // Black border removed

  let y = startY;

  // 3. Header Section (QR Code only - positioned at top-right)
  if (options.qrCodeDataUrl) {
    const qrX = 210 - PAGE_MARGIN_X - QR_SIZE - QR_OFFSET;
    const qrY = startY + QR_OFFSET;
    pdf.addImage(options.qrCodeDataUrl, "PNG", qrX, qrY, QR_SIZE, QR_SIZE);
  }

  // 4. Grid Data Section starts after header
  pdf.setFontSize(FONT_SIZE_BODY);
  y = startY + HEADER_HEIGHT;

  // Render heading image positioned above first field
  if (headingImageNumber) {
    const headingImage = getHeadingImageBase64(headingImageNumber);
    if (headingImage) {
      // Reduced image dimensions for compact look
      const imageWidth = 70; // Reduced from 90mm
      // Only image 1 is shorter (6mm), images 2 and 3 keep original size (8mm)
      const imageHeight = headingImageNumber === 1 ? 6 : 8;
      const imageX = (210 - imageWidth) / 2; // Center horizontally
      // Position just above the first field with small gap
      const imageY = y - imageHeight - 1; // 1mm gap between image and field

      try {
        pdf.addImage(
          headingImage,
          "JPEG",
          imageX,
          imageY,
          imageWidth,
          imageHeight,
        );
        console.log(
          `[PDF-Image] Heading image ${headingImageNumber} rendered successfully`,
        );
      } catch (err) {
        console.error(
          `[PDF-Image] Failed to render heading image ${headingImageNumber}:`,
          err,
        );
      }
    } else {
      console.warn(
        `[PDF-Image] Heading image ${headingImageNumber} not available, skipping`,
      );
    }
  }

  // Row 1 (Fields 1-2)
  drawCombinedField(pdf, "1. eForm-C No.", d.formNo, COL_2_X, y, COL_2_WIDTH);
  drawCombinedField(
    pdf,
    "2. Licensee Id:",
    d.licenseeId,
    COL_3_X,
    y,
    COL_3_WIDTH,
  );

  // Row 2 (Fields 3-5)
  y += ROW_SPACING;
  drawCombinedField(
    pdf,
    "3. Name of Licensee:",
    d.licenseeName,
    COL_1_X,
    y,
    COL_1_WIDTH,
  );
  drawCombinedField(
    pdf,
    "4. Mobile Number Of Licensee:",
    d.mobile,
    COL_2_X,
    y,
    COL_2_WIDTH,
  );
  drawCombinedField(
    pdf,
    "5. Licensee Details:",
    d.address,
    COL_3_X,
    y,
    COL_3_WIDTH,
  );

  // Row 3 (Fields 6-8)
  y += ROW_SPACING;
  drawCombinedField(
    pdf,
    "6. Tehsil Of License:",
    d.tehsil,
    COL_1_X,
    y,
    COL_1_WIDTH,
  );
  drawCombinedField(
    pdf,
    "7. District Of License:",
    d.district,
    COL_2_X,
    y,
    COL_2_WIDTH,
  );
  drawCombinedField(
    pdf,
    "8. QTY Transported In:",
    d.qty,
    COL_3_X,
    y,
    COL_3_WIDTH,
  );

  // Row 4 (Fields 9-11)
  y += ROW_SPACING;
  drawCombinedField(
    pdf,
    "9. Name Of Mineral:",
    d.mineral,
    COL_1_X,
    y,
    COL_1_WIDTH,
  );
  drawCombinedField(
    pdf,
    "10. Loading From:",
    d.loadingFrom,
    COL_2_X,
    y,
    COL_2_WIDTH,
  );
  drawCombinedField(
    pdf,
    "11. Destination (Delivery Address):",
    d.destination,
    COL_3_X,
    y,
    COL_3_WIDTH,
  );

  // Row 5 (Fields 12-14)
  y += ROW_SPACING;
  drawCombinedField(
    pdf,
    "12. Distance(Approx in K.M.):",
    d.distance,
    COL_1_X,
    y,
    COL_1_WIDTH,
  );
  drawCombinedField(
    pdf,
    "13. eForm-C Generated On:",
    d.generatedOn,
    COL_2_X,
    y,
    COL_2_WIDTH,
  );
  drawCombinedField(
    pdf,
    "14. eForm-C Valid Upto:",
    d.validUpto,
    COL_3_X,
    y,
    COL_3_WIDTH,
  );

  // Row 6 (Fields 15-16)
  y += ROW_SPACING + 2; // Extra space between field 13 and 16
  drawCombinedField(
    pdf,
    "15. Destination District:",
    d.district,
    COL_1_X,
    y,
    COL_1_WIDTH,
  );
  drawCombinedField(
    pdf,
    "16. Traveling Duration:",
    d.travelingDuration,
    COL_2_X,
    y,
    COL_2_WIDTH,
  );

  // Row 7 (Fields 17-18)
  y += ROW_SPACING;
  drawCombinedField(
    pdf,
    "17. Selling Price (Rs per Cubic Meter Ton for Silica sand/Diaspore/Pyrophylite):",
    d.sellingPrice,
    COL_1_X,
    y,
    COL_1_WIDTH + COL_2_WIDTH,
  );
  drawCombinedField(
    pdf,
    "18. Serial Number:",
    d.serialNo,
    COL_3_X,
    y,
    COL_3_WIDTH,
  );

  // 5. Vehicle Details Section
  y += ROW_SPACING + 2; // Extra space before vehicle section
  pdf.setFontSize(8);
  renderCenteredText(pdf, "Details Of Registered Vehicle", y);

  pdf.setFontSize(FONT_SIZE_BODY);
  y += 5;
  drawCombinedField(
    pdf,
    "1. Registration Number:",
    d.registrationNumber,
    COL_1_X + 5,
    y,
    COL_1_WIDTH,
  );
  drawCombinedField(
    pdf,
    "2. Type Of Vehicle:",
    d.vehicleType,
    COL_2_X + 5,
    y,
    COL_2_WIDTH,
  );
  drawCombinedField(
    pdf,
    "3. Name Of Driver:",
    d.driverName,
    COL_3_X,
    y,
    COL_3_WIDTH,
  );

  y += 5;
  drawCombinedField(
    pdf,
    "4. Mobile Number Of Driver:",
    d.driverMobile,
    COL_1_X + 5,
    y,
    COL_1_WIDTH,
  );
  drawCombinedField(
    pdf,
    "5. DL Number Of Driver:",
    d.dlNumber,
    COL_2_X + 5,
    y,
    COL_2_WIDTH,
  );
}

/* ================= CORE PDF ================= */

export async function generatePDF(
  recordId: string,
  data: Record<string, string>,
  generatedOn: Date,
  validUpto: Date,
  options: PDFGenerationOptions = {},
): Promise<Buffer> {
  try {
    console.log("[PDF] Starting PDF generation");
    const toText = (value: unknown, fallback = "-") => {
      if (value === null || value === undefined || value === "")
        return fallback;
      return String(value);
    };

    console.log("[PDF] Creating jsPDF instance");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set default font to Helvetica for fast rendering
    pdf.setFont("helvetica", "normal");

    console.log("[PDF] Registering Devanagari font for Hindi text");
    await registerDevanagariFont(pdf);

    // Added broader fallback checks for vehicleType and dlNumber to catch missing data
    const commonData = {
      formNo: toText(
        (data as any).eform_c_no ??
          (data as any).formNo ??
          generate19DigitNumber(),
      ),
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
      generatedOn: toText(
        (data as any).eform_c_generated_on ??
          (data as any).generated_on ??
          format(generatedOn, "dd-MM-yyyy hh:mm:ss a"),
      ),
      validUpto: toText(
        (data as any).eform_c_valid_upto ??
          (data as any).valid_upto ??
          format(validUpto, "dd-MM-yyyy hh:mm:ss a"),
      ),
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
      registrationNumber: toText(
        (data as any).registrationNumber ??
          (data as any).registration_number ??
          (data as any).vehicleRegistrationNumber,
      ),
      vehicleType: toText(
        (data as any).type_of_vehicle ??
          (data as any).vehicleType ??
          (data as any).typeOfVehicle,
      ),
      driverName: toText(
        (data as any).name_of_driver ??
          (data as any).driverName ??
          (data as any).nameOfDriver,
      ),
      driverMobile: toText(
        (data as any).mobile_number_of_driver ??
          (data as any).driverMobile ??
          (data as any).mobileNumberOfDriver,
      ),
      dlNumber: toText(
        (data as any).dl_number_of_driver ??
          (data as any).dlNumber ??
          (data as any).dlNumberOfDriver,
      ),
      travelingDuration: toText(
        (data as any).traveling_duration ??
          (data as any).travelingDuration ??
          (data as any).journeyDuration,
      ),
    };

    // Draw Top Actions Bar
    drawTopBar(pdf);

    // Adjusted starting Y positions - 3 equal sections with proper spacing
    const START_Y_1 = TOP_MARGIN;
    const START_Y_2 = START_Y_1 + COPY_HEIGHT + COPY_GAP;
    const START_Y_3 = START_Y_2 + COPY_HEIGHT + COPY_GAP;

    renderCopy(
      pdf,
      START_Y_1,
      "प्रथम प्रति ( पट्टा धारक हेतु )",
      commonData,
      options,
      1,
    );
    renderCopy(
      pdf,
      START_Y_2,
      "द्वितीय प्रति ( परिवहनकर्ता/उपभोक्ता/भण्डारण/कार्यदायी संस्था हेतु )",
      commonData,
      options,
      2,
    );
    renderCopy(
      pdf,
      START_Y_3,
      "तृतीय प्रति ( जाँचकर्ता हेतु )",
      commonData,
      options,
      3,
    );

    console.log("[PDF] Creating buffer from PDF");
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
    console.log("[PDF] ✓ PDF generated successfully");
    return pdfBuffer;
  } catch (error) {
    console.error("[PDF] ❌ PDF generation error:", error);
    throw error;
  }
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
    console.log("[PDF] generateAndStorePDF started for recordId:", recordId);

    // Set a 30-second timeout for PDF generation (canvas rendering can be slow with large scales)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("PDF generation timeout: exceeded 30 seconds")),
        30000,
      ),
    );

    const pdfBuffer = await Promise.race([
      generatePDF(recordId, formData, generatedOn, validUpto, options),
      timeoutPromise,
    ]);

    console.log("[PDF] PDF buffer generated, uploading...");
    const pdfUrl = await uploadPDF(recordId, userId, pdfBuffer);
    console.log("[PDF] ✓ PDF stored successfully");
    return pdfUrl;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[PDF] ❌ PDF generation/storage failed:", errorMsg);
    throw new Error(`Failed to generate PDF: ${errorMsg}`);
  }
}
