// src/app/api/auth/google/login/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const redirectUrl = `${backendUrl}/api/auth/google/login/`;
  
  return NextResponse.redirect(redirectUrl);
}