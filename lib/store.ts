import { kv } from '@/lib/kv'
import { Post } from '@/types'

export async function getPosts(status: Post['status']): Promise<Post[]> {
  const posts = await kv.get<Post[]>(`posts:${status}`)
  return posts ?? []
}

export async function addPost(post: Post): Promise<void> {
  const posts = await getPosts(post.status)
  posts.push(post)
  await kv.set(`posts:${post.status}`, posts)
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<void> {
  const statuses: Post['status'][] = ['pending', 'published', 'rejected']
  for (const status of statuses) {
    const posts = await getPosts(status)
    const idx = posts.findIndex(p => p.id === id)
    if (idx === -1) continue

    const updated = { ...posts[idx], ...updates }
    const newStatus = updates.status ?? status

    if (newStatus !== status) {
      // Remove from original status
      posts.splice(idx, 1)
      await kv.set(`posts:${status}`, posts)
      // Add to new status
      const targetPosts = await getPosts(newStatus)
      targetPosts.push(updated)
      await kv.set(`posts:${newStatus}`, targetPosts)
    } else {
      // Update in place within same status
      posts.splice(idx, 1, updated)
      await kv.set(`posts:${status}`, posts)
    }
    return
  }
}

export async function addSeen(type: 'fonts' | 'palettes' | 'duotone', key: string): Promise<void> {
  await kv.sadd(`seen:${type}`, key)
}

export async function isSeen(type: 'fonts' | 'palettes' | 'duotone', key: string): Promise<boolean> {
  const result = await kv.sismember(`seen:${type}`, key)
  return result === 1
}
