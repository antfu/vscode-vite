import { join } from 'path'
import fs from 'fs'
import { commands, ExtensionContext, Terminal, window } from 'vscode'
import { Config } from './config'
import { tryPort, timeout } from './utils'

let terminal: Terminal

export async function activate(ctx: ExtensionContext) {
  if (!fs.existsSync(join(Config.root, 'vite.config.ts')) && !fs.existsSync(join(Config.root, 'vite.config.js')))
    return

  const port = await tryPort()
  const url = `http://localhost:${port}`
  window.showInformationMessage(`⚡️ Vite started at ${url}`)

  console.log('Vite Project')
  terminal = window.createTerminal('Vite')
  terminal.sendText(`npx vite --port ${port}`)
  terminal.show(false)
  await timeout(1000)
  commands.executeCommand('browser-preview.openPreview', url)
}

export async function deactivate() {
  if (terminal) {
    terminal.sendText('\x03')
    terminal.dispose()
  }
}
