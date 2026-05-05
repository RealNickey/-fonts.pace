import { NextResponse } from 'next/server'
import { discoverColorHunt } from '@/lib/discover/colorhunt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const palettes = await discoverColorHunt()
  return NextResponse.json({ palettes })
}
