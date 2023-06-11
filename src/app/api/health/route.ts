import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      received: true,
      ts: Date.now(),
    },
    { status: 200 }
  )
}
