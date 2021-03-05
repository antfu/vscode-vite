
import { commands, ExtensionContext, window } from 'vscode'
import { Config } from './config'
import { getNi, hasNodeModules, isViteProject, timeout } from './utils'
import { ctx } from './Context'
import { closeTerminal, executeCommand } from './terminal'
import { tryRecoverState } from './recover'
import { updateStatusBar } from './statusBar'
import { showCommands } from './showCommands'
import { start, stop } from './start'
import { open } from './open'

export async function activate(ext: ExtensionContext) {
  ctx.ext = ext
  commands.registerCommand('vite.stop', stop)
  commands.registerCommand('vite.restart', start)
  commands.registerCommand('vite.open', () => open())
  commands.registerCommand('vite.showCommands', showCommands)

  window.onDidCloseTerminal((e) => {
    if (e === ctx.terminal) {
      stop()
      ctx.terminal = undefined!
    }
  })

  if (!isViteProject())
    return

  await tryRecoverState()

  updateStatusBar()

  if (Config.autoStart) {
    if (!hasNodeModules()) {
      const ni = getNi()
      const result = await window.showWarningMessage(
        'Vite: It seems like you didn\'t have node modules installed, would you like to install it now?',
        `Install (${ni})`,
        'Cancel',
      )
      if (result && result !== 'Cancel') {
        executeCommand(ni)
        await timeout(5000)
      }
      else {
        return
      }
    }
    open({ autoStart: true })
  }
}

export async function deactivate() {
  closeTerminal()
}
