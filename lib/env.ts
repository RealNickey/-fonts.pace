function pick(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === 'string' && value.length > 0)
}

function required(name: string, ...fallbacks: string[]): string {
  const value = pick(process.env[name], ...fallbacks.map((key) => process.env[key]))
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  get googleFontsApiKey() {
    return required('GOOGLE_FONTS_API_KEY')
  },
  get igAccessToken() {
    return pick(process.env.IG_ACCESS_TOKEN)
  },
  get igUserId() {
    return pick(process.env.IG_USER_ID)
  },
  get cronSecret() {
    return required('CRON_SECRET')
  },
  get brandHandle() {
    return pick(process.env.NEXT_PUBLIC_BRAND_HANDLE) ?? '@fontspace'
  },
  get vercelUrl() {
    return pick(process.env.VERCEL_URL)
  },
  get kvUrl() {
    return required('KV_URL', 'REDIS_URL')
  },
  get kvRestApiUrl() {
    return required('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL')
  },
  get kvRestApiToken() {
    return required('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN')
  },
  get kvRestApiReadOnlyToken() {
    return required('KV_REST_API_READ_ONLY_TOKEN', 'UPSTASH_REDIS_REST_READ_ONLY_TOKEN')
  },
} as const
