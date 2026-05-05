import { getPosts, updatePost } from '@/lib/store'
import { uploadSlideToIG, createCarousel, publishCarousel } from '@/lib/instagram'
import { Post } from '@/types'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

async function publishPost(formData: FormData) {
  'use server'
  const postId = formData.get('postId') as string
  const posts = await getPosts('pending')
  const post = posts.find(p => p.id === postId)
  if (!post) return

  const childIds: string[] = []
  for (const url of post.slideUrls) {
    const id = await uploadSlideToIG(url)
    childIds.push(id)
  }
  const containerId = await createCarousel(childIds, post.caption)
  const igMediaId = await publishCarousel(containerId)
  await updatePost(postId, {
    status: 'published',
    igMediaId,
    publishedAt: new Date().toISOString(),
  })
  revalidatePath('/dashboard')
}

async function rejectPost(formData: FormData) {
  'use server'
  const postId = formData.get('postId') as string
  await updatePost(postId, { status: 'rejected' })
  revalidatePath('/dashboard')
}

async function runPipeline(_formData: FormData) {
  'use server'
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  await fetch(`${proto}://${host}/api/cron`, {
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Fonts.pace Dashboard</h1>
        <form action={runPipeline}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Run Pipeline
          </button>
        </form>
      </div>

      <p style={{ color: '#666', marginBottom: 32 }}>
        {pending.length} posts pending · {published.length} published
      </p>

      {pending.length === 0 && (
        <p style={{ color: '#999', textAlign: 'center', padding: '48px 0' }}>
          No pending posts. Run the pipeline to generate new content.
        </p>
      )}

      {pending.map((post: Post) => (
        <div
          key={post.id}
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span
              style={{
                padding: '4px 12px',
                backgroundColor: post.type === 'fonts' ? '#ede9fe' : '#fce7f3',
                color: post.type === 'fonts' ? '#7c3aed' : '#be185d',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {post.type}
            </span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{post.title}</h2>
          </div>

          {/* Slide previews */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 12,
              marginBottom: 16,
            }}
          >
            {post.slideUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Slide ${i + 1}`}
                width={160}
                height={160}
                style={{
                  borderRadius: 8,
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid #e5e7eb',
                }}
              />
            ))}
          </div>

          {/* Caption */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 8 }}>
              Caption
            </label>
            <textarea
              name="caption"
              defaultValue={post.caption}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 13,
                fontFamily: 'monospace',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <form action={publishPost}>
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Publish now
              </button>
            </form>

            <form action={rejectPost}>
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#fff',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Reject
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
