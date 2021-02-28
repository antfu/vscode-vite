import { createServer } from 'http'

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
