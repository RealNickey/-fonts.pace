import { NextRequest, NextResponse } from 'next/server'
import { getPosts, updatePost } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const status = (url.searchParams.get('status') ?? 'pending') as 'pending' | 'published' | 'rejected'
  const posts = await getPosts(status)
  return NextResponse.json({ posts })
}

export async function PATCH(req: NextRequest) {
  const { id, status, ...updates } = await req.json()
  await updatePost(id, { status, ...updates })
  return NextResponse.json({ ok: true })
}
