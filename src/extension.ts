import { join } from 'path'
import fs from 'fs'
import { commands, env, ExtensionContext, QuickPickItem, StatusBarAlignment, StatusBarItem, Terminal, Uri, window } from 'vscode'
import { Config } from './config'
import { tryPort, timeout } from './utils'

let terminal: Terminal
let statusBar: StatusBarItem
let active = false
let port: number
let url: string | undefined

function stop() {
  active = false
  terminal?.sendText('\x03')
  if (statusBar) {
    statusBar.text = '$(stop-circle) Vite'
    statusBar.color = undefined
  }
}

async function start(searchPort = false) {
  stop()

  if (!port || searchPort)
    port = await tryPort(Config.port)
  url = `${Config.https ? 'https' : 'http'}://${Config.host}:${port}${Config.base}`
  window.showInformationMessage(`⚡️ Vite started at ${url}`)

  ensureTerminal()
  terminal.sendText(`npx vite --port ${port}`)
  terminal.show(false)
  active = true

  ensureStatusBar()

  statusBar.text = '$(symbol-event) Vite'
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

async function open(ensureActive = false, browser = Config.browser) {
  if (ensureActive && !active) {
    await start()
    await timeout(Config.delay)
  }
  if (active && url) {
    if (browser === 'system')
      env.openExternal(Uri.parse(url))
    else
      commands.executeCommand('browse-lite.open', url)
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
      label: '$(refresh) Restart Vite server',
      handler() {
        start()
      },
      if: active,
    },
    {
      label: '$(split-horizontal) Open in embedded browser',
      description: url,
      handler() {
        open(true, 'embedded')
      },
    },
    {
      label: '$(link-external) Open in system browser',
      description: url,
      handler() {
        open(true, 'system')
      },
    },
    {
      label: '$(close) Stop Vite server',
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
    open(true)
}

export async function deactivate() {
  if (terminal) {
    terminal.sendText('\x03')
    terminal.dispose()
  }
}
