import { createClient } from '@vercel/kv'
import { env } from '@/lib/env'

export const kv = createClient({
  url: env.kvRestApiUrl,
  token: env.kvRestApiToken,
})
