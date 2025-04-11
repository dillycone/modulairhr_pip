import { NextResponse } from 'next/server';

// API routes for PIP templates have been disabled
export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Custom PIP templates feature has been disabled' },
    { status: 403 }
  );
}

export async function GET(request: Request) {
  return NextResponse.json(
    { error: 'Custom PIP templates feature has been disabled' },
    { status: 403 }
  );
}