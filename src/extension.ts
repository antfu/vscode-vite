import { join } from 'path'
import fs from 'fs'
import { commands, env, ExtensionContext, QuickPickItem, StatusBarAlignment, StatusBarItem, Terminal, Uri, window } from 'vscode'
import { Config } from './config'
import { tryPort, waitFor } from './utils'

let terminal: Terminal
let statusBar: StatusBarItem
let currentMode: 'dev' | 'serve' = 'dev'
let active = false
let port: number
let url: string | undefined
let panel: any

function stop() {
  active = false
  terminal?.sendText('\x03')
  if (statusBar) {
    statusBar.text = '$(stop-circle) Vite'
    statusBar.color = undefined
  }
}

function closePanel() {
  panel?.dispose?.()
  panel = undefined
}

async function start({
  mode = 'dev',
  searchPort = !active,
  waitForStart = true,
} = {}) {
  stop()
  if (mode !== currentMode)
    closePanel()

  currentMode = mode as any

  if (!port || searchPort)
    port = await tryPort(Config.port)
  url = `${Config.https ? 'https' : 'http'}://${Config.host}:${port}${Config.base}`

  ensureTerminal()
  if (mode === 'dev') {
    terminal.sendText(`npx vite --port=${port}`)
  }
  else {
    // TODO: read package.json
    terminal.sendText('npm run build')
    terminal.sendText(`npx live-server dist --port=${port} --no-browser`)
  }

  if (Config.showTerminal)
    terminal.show(false)

  if (waitForStart) {
    if (!await waitFor(url, Config.pingInterval, Config.maximumTimeout)) {
      window.showErrorMessage('❗️ Failed to start the server')
      stop()
      return { url, port }
    }
    else {
      if (Config.notifyOnStarted) {
        window.showInformationMessage(
          mode === 'build'
            ? `📦 Vite build served at ${url}`
            : `⚡️ Vite started at ${url}`)
      }
    }
  }

  active = true

  ensureStatusBar()
  statusBar.text = mode === 'build' ? '$(symbol-event) Vite (Build)' : '$(symbol-event) Vite'
  statusBar.color = '#ebb549'

  return { url, port }
}

function ensureTerminal() {
  if (!terminal) {
    terminal = window.createTerminal('Vite')
    window.onDidCloseTerminal((e) => {
      if (e === terminal) {
        stop()
        terminal = undefined!
      }
    })
  }
}

function ensureStatusBar() {
  if (!statusBar) {
    statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 1000)
    statusBar.command = 'vite.showCommands'
    statusBar.show()
  }
}

async function open({
  autoStart = false,
  browser = Config.browser,
} = {}) {
  let _url = url
  if (!active && autoStart)
    _url = (await start()).url

  if (active && _url) {
    if (browser === 'system') {
      env.openExternal(Uri.parse(_url))
    }
    else {
      // all the hard work are done in:
      // https://github.com/antfu/vscode-browse-lite
      panel = await commands.executeCommand('browse-lite.open', _url)
    }
  }
}

function isViteProject() {
  return fs.existsSync(join(Config.root, 'vite.config.ts'))
  || fs.existsSync(join(Config.root, 'vite.config.js'))
}

interface CommandPickItem extends QuickPickItem {
  handler?: () => void
  if?: boolean
}

async function showCommands() {
  const commands: CommandPickItem[] = [
    {
      label: '$(symbol-event) Start Vite server',
      handler() {
        start()
      },
      if: !active,
    },
    {
      label: '$(split-horizontal) Open in embedded browser',
      description: url,
      handler() {
        open({ autoStart: true, browser: 'embedded' })
      },
    },
    {
      label: '$(link-external) Open in system browser',
      description: url,
      handler() {
        open({ autoStart: true, browser: 'system' })
      },
    },
    {
      label: currentMode === 'dev' ? '$(refresh) Restart Vite server' : '$(symbol-event) Switch to dev server',
      async handler() {
        const reopen = panel && active && currentMode !== 'dev'
        await start({ mode: 'dev', searchPort: currentMode !== 'dev' })
        if (reopen)
          await open({ browser: 'embedded' })
      },
      if: active,
    },
    {
      label: active && currentMode === 'serve' ? '$(package) Rebuild and Serve' : '$(package) Build and Serve',
      async handler() {
        const reopen = panel && active && currentMode !== 'serve'
        await start({ mode: 'serve', searchPort: currentMode !== 'serve' })
        if (reopen)
          await open({ browser: 'embedded' })
      },
    },
    {
      label: '$(close) Stop server',
      handler() {
        stop()
      },
      if: active,
    },
  ]

  const result = await window.showQuickPick<CommandPickItem>(
    commands.filter(i => i.if !== false),
  )

  if (result)
    result.handler?.()
}

export function activate(ctx: ExtensionContext) {
  commands.registerCommand('vite.stop', stop)
  commands.registerCommand('vite.restart', start)
  commands.registerCommand('vite.open', () => open())
  commands.registerCommand('vite.showCommands', showCommands)

  if (!isViteProject())
    return

  ensureStatusBar()

  if (Config.autoStart)
    open({ autoStart: true })
}

export async function deactivate() {
  if (terminal) {
    terminal.sendText('\x03')
    terminal.dispose()
  }
}
