import { window } from 'vscode'
import { Config } from './config'
import { tryPort, waitFor } from './utils'
import { ctx } from './Context'
import { ensureStatusBar, closeTerminal, executeCommand } from './terminal'

export async function start({
  mode = 'dev',
  searchPort = !ctx.active,
  waitForStart = true,
} = {}) {
  stop()
  if (mode !== ctx.currentMode)
    closePanel()

  ctx.currentMode = mode as any

  if (!ctx.port || searchPort)
    ctx.port = await tryPort(Config.port)
  ctx.url = `${Config.https ? 'https' : 'http'}://${Config.host}:${ctx.port}${Config.base}`

  if (mode === 'dev') {
    executeCommand(`npx vite --port=${ctx.port}`)
  }
  else {
    // TODO: read package.json
    executeCommand('npm run build')
    executeCommand(`npx live-server dist --port=${ctx.port} --no-browser`)
  }

  if (waitForStart) {
    if (!await waitFor(ctx.url, Config.pingInterval, Config.maximumTimeout)) {
      window.showErrorMessage('❗️ Failed to start the server')
      stop()
    }
    else {
      if (Config.notifyOnStarted) {
        window.showInformationMessage(
          mode === 'build'
            ? `📦 Vite build served at ${ctx.url}`
            : `⚡️ Vite started at ${ctx.url}`)
      }
    }
  }

  ctx.active = true

  ensureStatusBar()
  ctx.statusBar.text = mode === 'build' ? '$(symbol-event) Vite (Build)' : '$(symbol-event) Vite'
  ctx.statusBar.color = '#ebb549'
}

export function stop() {
  ctx.active = false
  closeTerminal()
  if (ctx.statusBar) {
    ctx.statusBar.text = '$(stop-circle) Vite'
    ctx.statusBar.color = undefined
  }
}

function closePanel() {
  ctx.panel?.dispose?.()
  ctx.panel = undefined
}
