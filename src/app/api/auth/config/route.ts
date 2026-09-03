import { NextResponse } from 'next/server';
import { isLocalAuthMode, isGoogleAuthEnabled, isEmailVerificationRequired } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    localAuthMode: isLocalAuthMode(),
    showGoogleAuth: isGoogleAuthEnabled(),
    requireEmailVerification: isEmailVerificationRequired(),
  });
}
