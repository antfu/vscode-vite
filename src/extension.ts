
import { commands, ExtensionContext, window } from 'vscode'
import { Config } from './config'
import { getNi, hasDependencies, hasNodeModules, isViteProject, loadPackageJSON, timeout } from './utils'
import { ctx } from './Context'
import { closeTerminal, executeCommand } from './terminal'
import { tryRecoverState } from './recover'
import { updateStatusBar } from './statusBar'
import { showCommands } from './showCommands'
import { start, stop } from './start'
import { open } from './open'
import { enableVitepressAutoRouting } from './vitepressAutoRouting'

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

  ctx.packageJSON = loadPackageJSON()

  if (!isViteProject())
    return

  if (Config.vitepress && hasDependencies('vitepress')) {
    ctx.command = 'vitepress'
    if (Config.vitepressAutoRouting)
      enableVitepressAutoRouting()
  }

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
    if (Config.open)
      open({ autoStart: true, stopPrevious: false })
  }
}

export async function deactivate() {
  closeTerminal()
}
