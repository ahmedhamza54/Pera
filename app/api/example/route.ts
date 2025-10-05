import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Here's how to create a GET endpoint in Next.js"
  });
}
