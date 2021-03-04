import { ExtensionContext, StatusBarItem, Terminal } from 'vscode'

export interface Context {
  ext: ExtensionContext
  terminal: Terminal
  statusBar: StatusBarItem
  currentMode: 'dev' | 'serve'
  active: boolean
  port?: number
  url?: string
  panel?: any
}

export const ctx = {
  active: false,
  currentMode: 'dev',
} as Context
