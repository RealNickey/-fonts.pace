import { kv } from '@vercel/kv'

export async function isSeen(type: 'fonts' | 'palettes', key: string): Promise<boolean> {
  const seen = await kv.smembers(`seen:${type}`) as string[]
  return seen.includes(key)
}

export async function addSeen(type: 'fonts' | 'palettes', key: string): Promise<void> {
  await kv.sadd(`seen:${type}`, key)
}
