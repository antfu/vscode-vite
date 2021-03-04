import { window } from 'vscode'
import { Config } from './config'
import { ctx } from './Context'
import { stop } from './start'

export function ensureTerminal() {
  if (ctx.terminal)
    return

  ctx.terminal = window.createTerminal('Vite')
  window.onDidCloseTerminal((e) => {
    if (e === ctx.terminal) {
      stop()
      ctx.terminal = undefined!
    }
  })
  if (Config.showTerminal)
    ctx.terminal.show(false)
}

export function closeTerminal() {
  if (ctx.terminal) {
    ctx.terminal.sendText('\x03')
    ctx.terminal.dispose()
  }
}

export function endProcess() {
  ctx.terminal?.sendText('\x03')
}

export function executeCommand(cmd: string) {
  ensureTerminal()
  ctx.terminal.sendText(cmd)
}
