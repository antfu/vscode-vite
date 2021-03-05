import { StatusBarAlignment, window } from 'vscode'
import { ctx } from './Context'

export function ensureStatusBar() {
  if (!ctx.statusBar) {
    ctx.statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 1000)
    ctx.statusBar.command = 'vite.showCommands'
    ctx.statusBar.show()
  }
}

export function updateStatusBar() {
  ensureStatusBar()
  if (ctx.active) {
    ctx.statusBar.text = ctx.currentMode === 'serve'
      ? '$(symbol-event) Vite (Build)'
      : '$(symbol-event) Vite'
    ctx.statusBar.color = '#ebb549'
  }
  else {
    ctx.statusBar.text = '$(stop-circle) Vite'
    ctx.statusBar.color = undefined
  }
}
