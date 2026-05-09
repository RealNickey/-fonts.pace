import { getPosts, updatePost } from '@/lib/store'
import { uploadSlideToIG, createCarousel, publishCarousel } from '@/lib/instagram'
import { Post } from '@/types'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { env } from '@/lib/env'
import { DashboardUI } from './client'
import { del } from '@vercel/blob'
import { kv } from '@/lib/kv'

export const dynamic = 'force-dynamic'

async function flushDatabaseAction() {
  'use server'
  await kv.flushall()
  revalidatePath('/dashboard')
}

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

  // Delete blobs after publishing since IG downloads them
  for (const url of post.slideUrls) {
    try {
      await del(url)
    } catch (e) {
      console.error(`Failed to delete published blob: ${url}`, e)
    }
  }

  revalidatePath('/dashboard')
}

async function rejectPostAction(postId: string, formData: FormData) {
  'use server'
  const posts = await getPosts('pending')
  const post = posts.find(p => p.id === postId)

  await updatePost(postId, { status: 'rejected' })

  if (post && post.slideUrls) {
    for (const url of post.slideUrls) {
      try {
        await del(url)
      } catch (e) {
        console.error(`Failed to delete rejected blob: ${url}`, e)
      }
    }
  }

  revalidatePath('/dashboard')
}

async function deleteSlideAction(postId: string, slideIndex: number) {
  'use server'
  const posts = await getPosts('pending')
  const post = posts.find(p => p.id === postId)
  if (!post) {
    console.error(`deleteSlideAction: post not found for id=${postId}`)
    return { error: 'Post not found' }
  }

  if (post.slideUrls.length <= 4) {
    return { error: 'Cannot delete slide. Minimum 4 slides required.' }
  }

  const urlToDelete = post.slideUrls[slideIndex]
  if (!urlToDelete) {
    return { error: 'Slide not found at index' }
  }

  try {
    await del(urlToDelete)
  } catch (error) {
    console.error('Failed to delete blob from Vercel:', error)
    // Continue even if blob deletion fails, maybe it was already deleted
  }

  const newSlideUrls = [...post.slideUrls]
  newSlideUrls.splice(slideIndex, 1)

  await updatePost(postId, { slideUrls: newSlideUrls })
  revalidatePath('/dashboard')
  return { success: true }
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
      deleteSlideAction={deleteSlideAction}
      flushDatabaseAction={flushDatabaseAction}
    />
  )
}
