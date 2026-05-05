import { kv } from '@/lib/kv'

export async function isSeen(type: 'fonts' | 'palettes', key: string): Promise<boolean> {
  const result = await kv.sismember(`seen:${type}`, key)
  return result === 1
}

export async function addSeen(type: 'fonts' | 'palettes', key: string): Promise<void> {
  await kv.sadd(`seen:${type}`, key)
}
