import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Note: Supabase stores sessions in localStorage (client-side), not cookies
  // So we only use middleware for basic protection
  // The real auth check happens in the dashboard layout component
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
