import { NextResponse } from 'next/server';

// API routes for PIP templates have been disabled
export async function GET(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  return NextResponse.json(
    { error: 'Custom PIP templates feature has been disabled' },
    { status: 403 }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  return NextResponse.json(
    { error: 'Custom PIP templates feature has been disabled' },
    { status: 403 }
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  return NextResponse.json(
    { error: 'Custom PIP templates feature has been disabled' },
    { status: 403 }
  );
}