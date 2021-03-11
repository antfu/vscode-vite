import { window } from 'vscode'
import { composeUrl } from './config'
import { ctx } from './Context'
import { ping } from './utils'

export async function tryRecoverTerminal() {
  if (ctx.terminal)
    return

  const pid = ctx.ext.globalState.get('pid')
  if (!pid)
    return

  const terminals = await Promise.all(
    window.terminals
      .map(async i => pid === await i.processId ? i : undefined),
  )

  const terminal = terminals.find(i => i)

  // console.log('terminal!!')

  if (terminal) {
    ctx.terminal = terminal
    return true
  }
}

export async function tryRecoverState() {
  if (!await tryRecoverTerminal())
    return
  const port = +(ctx.ext.globalState.get<number>('port') || 0)
  if (!port)
    return

  const url = composeUrl(port)

  // console.log('port!!', port, url)

  if (!await ping(url))
    return

  // console.log('active!!')

  ctx.active = true
  ctx.url = url
  ctx.port = port
  ctx.currentMode = ctx.ext.globalState.get('mode') || 'dev'

  return true
}
