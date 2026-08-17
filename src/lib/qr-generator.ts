import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

interface GenerateQROptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function isPrivateOrLocalhost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  ) {
    return true;
  }

  return (
    /^10\./.test(normalized) ||
    /^192\.168\./.test(normalized) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
}

function normalizeBaseUrl(candidate?: string): string | null {
  if (!candidate) return null;

  const raw = candidate.trim();
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname || isPrivateOrLocalhost(parsed.hostname)) {
      return null;
    }
    return trimTrailingSlash(parsed.origin);
  } catch {
    return null;
  }
}

function resolvePublicAppUrl(): string {
  const stableCandidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];

  for (const candidate of stableCandidates) {
    const resolved = normalizeBaseUrl(candidate);
    if (resolved) return resolved;
  }

  const deploymentCandidates = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of deploymentCandidates) {
    const resolved = normalizeBaseUrl(candidate);
    if (resolved) return resolved;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    console.warn(
      "[QR] No public app URL configured. Falling back to localhost. Set NEXT_PUBLIC_APP_URL to your stable production domain to avoid broken QR scans.",
    );
  }

  return "http://localhost:3000";
}

/**
 * Generate QR code data URL
 * Used for client-side display and PDF embedding
 */
export async function generateQRCodeDataUrl(
  text: string,
  options: GenerateQROptions = {},
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    color = { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel = "H",
  } = options;

  return QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel,
  });
}

/**
 * Generate QR code buffer (for file storage)
 */
export async function generateQRCodeBuffer(
  text: string,
  options: GenerateQROptions = {},
): Promise<Buffer> {
  const {
    width = 300,
    margin = 2,
    color = { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel = "H",
  } = options;

  return QRCode.toBuffer(text, {
    width,
    margin,
    color,
    errorCorrectionLevel,
    type: "image/png",
  });
}

/**
 * Upload QR code to Supabase Storage
 */
export async function uploadQRCode(
  recordId: string,
  userId: string,
  qrBuffer: Buffer,
): Promise<string> {
  const filename = `${recordId}-${Date.now()}.png`;
  const path = `qr-codes/${userId}/${filename}`;

  const { data, error } = await supabaseAdmin.storage
    .from("qr-codes")
    .upload(path, qrBuffer, {
      contentType: "image/png",
      cacheControl: "31536000", // 1 year
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload QR code: ${error.message}`);
  }

  // Return public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("qr-codes").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Get public record URL (what goes in QR code)
 */
export function getPublicRecordUrl(publicToken: string): string {
  const baseUrl = resolvePublicAppUrl();
  return `${baseUrl}/records/${publicToken}`;
}

/**
 * Generate and store QR code for a record
 */
export async function generateAndStoreQRCode(
  recordId: string,
  userId: string,
  publicToken: string,
): Promise<string> {
  try {
    const publicUrl = getPublicRecordUrl(publicToken);
    const qrBuffer = await generateQRCodeBuffer(publicUrl);
    const qrCodeUrl = await uploadQRCode(recordId, userId, qrBuffer);
    return qrCodeUrl;
  } catch (error) {
    console.error("QR code generation failed:", error);
    throw error;
  }
}
