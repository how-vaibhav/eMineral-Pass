/**
 * Font Loading Utility
 * Handles Devanagari font loading with multiple strategies
 */

import fs from "fs";
import path from "path";

interface FontLoadResult {
  data: string; // base64 encoded
  source: "filesystem" | "cdn" | "embedded";
  size: number; // KB
}

let cachedFont: FontLoadResult | null = null;

/**
 * Strategy 1: Load from local filesystem (Development)
 */
function loadFromFilesystem(): FontLoadResult | null {
  try {
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "NotoSansDevanagari-Regular.ttf",
    );

    if (!fs.existsSync(fontPath)) {
      console.log("[Font-Loader] Filesystem: Font file not found at", fontPath);
      return null;
    }

    const fontBuffer = fs.readFileSync(fontPath);
    const base64 = fontBuffer.toString("base64");
    const sizeKB = Math.round(fontBuffer.length / 1024);

    console.log(
      `[Font-Loader] ✓ Loaded from filesystem (${sizeKB}KB) at ${fontPath}`,
    );
    return {
      data: base64,
      source: "filesystem",
      size: sizeKB,
    };
  } catch (error) {
    console.warn("[Font-Loader] Filesystem loading failed:", error);
    return null;
  }
}

/**
 * Strategy 2: Fetch from Google Fonts CDN (Production/Vercel)
 */
async function loadFromCDN(): Promise<FontLoadResult | null> {
  try {
    console.log("[Font-Loader] Attempting CDN fetch...");

    // Try multiple CDN sources in order of preference
    const cdnUrls = [
      // Google Fonts - TTF format (most compatible with jsPDF)
      // This URL is for Noto Sans Devanagari regular weight
      {
        url: "https://fonts.gstatic.com/s/notosansdevanagari/v26/ga-ei_CFd6WTpBXYVewdKp2_EzcPO05EnoZoNlWlMFOa.woff2",
        format: "WOFF2",
      },
      // Alternative: jsDelivr CDN (faster in some regions)
      {
        url: "https://cdn.jsdelivr.net/npm/google-fonts/fonts/NotoSansDevanagari-Regular.ttf",
        format: "TTF",
      },
      // RAW GitHub - NotoSansDevanagari from Google Fonts repo
      {
        url: "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansdevanagari/NotoSansDevanagari-Regular.ttf",
        format: "TTF",
      },
    ];

    for (const { url, format: fmt } of cdnUrls) {
      try {
        console.log(
          `[Font-Loader] Trying ${fmt} from: ${url.substring(0, 60)}...`,
        );

        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Compatible) eMineral-Pass/1.0 (+http://emineral-pass.vercel.app)",
          },
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const fontBuffer = Buffer.from(arrayBuffer);

          // Validate minimum font file size (TTF should be > 500KB, WOFF2 > 300KB)
          if (fontBuffer.length < 100000) {
            console.warn(
              `[Font-Loader] Font too small (${fontBuffer.length} bytes), likely corrupt`,
            );
            continue;
          }

          const base64 = fontBuffer.toString("base64");
          const sizeKB = Math.round(fontBuffer.length / 1024);

          console.log(`[Font-Loader] ✓ Loaded ${fmt} from CDN (${sizeKB}KB)`);
          return {
            data: base64,
            source: "cdn",
            size: sizeKB,
          };
        }
      } catch (urlError) {
        console.warn(
          `[Font-Loader] Failed to load from ${fmt}:`,
          urlError instanceof Error ? urlError.message : urlError,
        );
        continue;
      }
    }

    throw new Error("All CDN URLs exhausted");
  } catch (error) {
    console.warn("[Font-Loader] CDN loading failed:", error);
    return null;
  }
}

/**
 * Load Devanagari font with multi-strategy fallback
 */
export async function loadDevanagariFont(): Promise<FontLoadResult | null> {
  // Return cached if available
  if (cachedFont) {
    console.log(
      `[Font-Loader] Returning cached font (${cachedFont.source}, ${cachedFont.size}KB)`,
    );
    return cachedFont;
  }

  // Strategy 1: Try filesystem (fast for local dev)
  const fileSystemResult = loadFromFilesystem();
  if (fileSystemResult) {
    cachedFont = fileSystemResult;
    return cachedFont;
  }

  // Strategy 2: Try CDN (works on Vercel)
  const cdnResult = await loadFromCDN();
  if (cdnResult) {
    cachedFont = cdnResult;
    return cachedFont;
  }

  // All strategies failed
  console.error(
    "[Font-Loader] ❌ All font loading strategies failed - Hindi text may not render in PDF",
  );
  return null;
}

/**
 * Get cached font (no reload)
 */
export function getCachedFont(): FontLoadResult | null {
  return cachedFont;
}

/**
 * Clear cache (useful for testing)
 */
export function clearFontCache(): void {
  cachedFont = null;
  console.log("[Font-Loader] Font cache cleared");
}
