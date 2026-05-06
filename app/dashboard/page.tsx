import { getPosts, updatePost } from '@/lib/store'
import { uploadSlideToIG, createCarousel, publishCarousel } from '@/lib/instagram'
import { Post } from '@/types'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { env } from '@/lib/env'
import { DashboardUI } from './client'

export const dynamic = 'force-dynamic'

async function publishPostAction(postId: string, formData: FormData) {
  'use server'
  const posts = await getPosts('pending')
  const post = posts.find(p => p.id === postId)
  if (!post) {
    console.error(`publishPost: post not found for id=${postId}`)
    return
  }

  const childIds = await Promise.all(post.slideUrls.map(url => uploadSlideToIG(url)))
  const containerId = await createCarousel(childIds, post.caption)
  const igMediaId = await publishCarousel(containerId)
  await updatePost(postId, {
    status: 'published',
    igMediaId,
    publishedAt: new Date().toISOString(),
  })
  revalidatePath('/dashboard')
}

async function rejectPostAction(postId: string, formData: FormData) {
  'use server'
  await updatePost(postId, { status: 'rejected' })
  revalidatePath('/dashboard')
}

async function runPipelineAction(template: string) {
  'use server'
  const headersList = await headers()
  // x-forwarded-host / host are always present on Vercel; VERCEL_URL is the auto-injected fallback
  const host =
    headersList.get('x-forwarded-host') ??
    headersList.get('host') ??
    env.vercelUrl ??
    'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  await fetch(`${proto}://${host}/api/cron?template=${template}`, {
    headers: {
      Authorization: `Bearer ${env.cronSecret}`,
    },
  })
  revalidatePath('/dashboard')
}

export default async function DashboardPage() {
  const [pending, published] = await Promise.all([
    getPosts('pending'),
    getPosts('published'),
  ])

  return (
    <DashboardUI 
      initialPending={pending} 
      initialPublished={published} 
      runPipelineAction={runPipelineAction}
      publishPostAction={publishPostAction}
      rejectPostAction={rejectPostAction}
    />
  )
}
