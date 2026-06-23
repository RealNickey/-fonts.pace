import https from 'node:https'

/**
 * A custom fetch wrapper specifically for graph.facebook.com.
 * Node.js 18+ undici (global fetch) has a known issue where it attempts IPv6 first,
 * which fails with ConnectTimeoutError on networks with broken IPv6 routing.
 * This wrapper uses https.request with `family: 4` to force IPv4 and bypass the issue.
 */
export async function fetchFb(urlStr: string, options: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr)
      const req = https.request(url, {
        method: options.method || 'GET',
        headers: options.headers,
        family: 4, // Force IPv4
      }, (res) => {
        let body = ''
        res.on('data', chunk => body += chunk)
        res.on('end', () => {
          resolve({
            ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => JSON.parse(body || '{}'),
            text: async () => body
          })
        })
      })
      
      req.on('error', reject)
      req.setTimeout(15000, () => {
        req.destroy(new Error('Request Timeout'))
      })
      
      if (options.body) req.write(options.body)
      req.end()
    } catch (err) {
      reject(err)
    }
  })
}
