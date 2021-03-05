import { window } from 'vscode'
import { Config } from './config'
import { ctx } from './Context'
import { timeout } from './utils'

export function ensureTerminal() {
  if (isTerminalActive())
    return

  ctx.terminal = window.createTerminal('Vite')
}

export function isTerminalActive() {
  return ctx.terminal && ctx.terminal.exitStatus == null
}

export function closeTerminal() {
  if (isTerminalActive()) {
    ctx.terminal.sendText('\x03')
    ctx.terminal.dispose()
    ctx.terminal = undefined!
  }
}

export function endProcess() {
  if (isTerminalActive())
    ctx.terminal.sendText('\x03')
  ctx.ext.globalState.update('pid', undefined)
}

export async function executeCommand(cmd: string) {
  ensureTerminal()
  ctx.terminal.sendText(cmd)
  if (Config.showTerminal)
    ctx.terminal.show(false)
  await timeout(2000)
  const pid = await ctx.terminal.processId
  if (pid)
    ctx.ext.globalState.update('pid', pid)
}
