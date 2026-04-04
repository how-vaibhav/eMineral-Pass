import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

interface RecordRow {
  pdf_url: string | null;
  created_at: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  try {
    const { recordId } = await params;

    // Get the record to verify pdf_url exists
    const { data: record, error: fetchError } = await supabaseAdmin
      .from("records")
      .select("pdf_url, created_at")
      .eq("id", recordId)
      .single();

    if (fetchError || !record || !(record as RecordRow).pdf_url) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const typedRecord = record as RecordRow;

    // Ensure pdf_url exists and is a string
    if (!typedRecord.pdf_url || typeof typedRecord.pdf_url !== "string") {
      return NextResponse.json(
        { error: "PDF URL is invalid" },
        { status: 400 },
      );
    }

    // Fetch the PDF from Supabase signed URL
    const pdfResponse = await fetch(typedRecord.pdf_url);
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PDF from storage" },
        { status: 500 },
      );
    }

    // Get the PDF as a blob/buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Format filename: pass - DD-MM-YYYY.pdf
    const createdAt = typedRecord.created_at || new Date().toISOString();
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const filename = `pass - ${day}-${month}-${year}.pdf`;

    // Return with proper headers to force download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("PDF download error:", error);
    return NextResponse.json(
      { error: "Failed to download PDF" },
      { status: 500 },
    );
  }
}
