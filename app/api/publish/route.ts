import { NextRequest, NextResponse } from 'next/server'
import { getPosts, updatePost } from '@/lib/store'
import { uploadSlideToIG, createCarousel, publishCarousel } from '@/lib/instagram'
import { del } from '@vercel/blob'

export const maxDuration = 60
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { postId } = await req.json()

  const posts = await getPosts('pending')
  const post = posts.find(p => p.id === postId)
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Upload each slide to Instagram
  const childIds: string[] = []
  for (const url of post.slideUrls) {
    const id = await uploadSlideToIG(url)
    childIds.push(id)
  }

  // Create carousel container
  const containerId = await createCarousel(childIds, post.caption)

  // Publish
  const igMediaId = await publishCarousel(containerId)

  // Update post status
  await updatePost(postId, {
    status: 'published',
    igMediaId,
    publishedAt: new Date().toISOString(),
  })

  if (post.slideUrls.length > 0) {
    await del(post.slideUrls)
  }

  return NextResponse.json({ ok: true, igMediaId })
}
