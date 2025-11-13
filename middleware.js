import { NextResponse } from 'next/server';

export function middleware(request) {
  const { searchParams } = new URL(request.url);
  const refCode = searchParams.get('ref');
  
  const response = NextResponse.next();
  
  // Jika ada parameter ref, simpan di cookie
  if (refCode) {
    // Cookie akan bertahan 30 hari
    response.cookies.set('referral_code', refCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }
  
  return response;
}

// Jalankan middleware untuk semua route
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};