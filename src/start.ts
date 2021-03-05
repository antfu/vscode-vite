import { window } from 'vscode'
import { composeUrl, Config } from './config'
import { tryPort, waitFor } from './utils'
import { ctx } from './Context'
import { endProcess, executeCommand } from './terminal'
import { updateStatusBar } from './statusBar'
import { closePanel } from './open'

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
  ctx.url = composeUrl(ctx.port)

  ctx.ext.globalState.update('port', ctx.port)

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

  updateStatusBar()
}

export function stop() {
  ctx.active = false
  endProcess()
  updateStatusBar()
}
