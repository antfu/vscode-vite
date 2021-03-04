import { StatusBarAlignment, window } from 'vscode'
import { ctx } from './Context'

export function ensureStatusBar() {
  if (!ctx.statusBar) {
    ctx.statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 1000)
    ctx.statusBar.command = 'vite.showCommands'
    ctx.statusBar.show()
  }
}
