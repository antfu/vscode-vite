import { createServer } from 'http'
import http = require('http')
import https = require('https')

function isPortFree(port: number) {
  return new Promise((resolve) => {
    const server = createServer()
      .listen(port, () => {
        server.close()
        resolve(true)
      })
      .on('error', () => {
        resolve(false)
      })
  })
}

export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function tryPort(start = 4000): Promise<number> {
  if (await isPortFree(start))
    return start
  return tryPort(start + 1)
}

export function ping(url: string) {
  const promise = new Promise<boolean>((resolve) => {
    const useHttps = url.indexOf('https') === 0
    const mod = useHttps ? https.request : http.request

    const pingRequest = mod(url, () => {
      resolve(true)
      pingRequest.destroy()
    })

    pingRequest.on('error', () => {
      resolve(false)
      pingRequest.destroy()
    })

    pingRequest.write('')
    pingRequest.end()
  })
  return promise
}

export async function waitFor(url: string, interval = 200, max = 30_000) {
  let times = Math.ceil(max / interval)

  while (times > 0) {
    times -= 1
    if (await ping(url))
      return true
    await timeout(interval)
  }

  return false
}
