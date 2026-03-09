import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ message: "Content API works" });
}

export async function GET(request: Request) {
  return NextResponse.json({ message: "Content API works" });
}
