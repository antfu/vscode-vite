import { ExtensionContext, StatusBarItem, Terminal } from 'vscode'
import type { PackageJson } from 'types-package-json'

export interface Context {
  ext: ExtensionContext
  terminal: Terminal
  statusBar: StatusBarItem
  currentMode: 'dev' | 'serve'
  active: boolean
  port?: number
  url?: string
  panel?: any
  command: 'vite' | 'vitepress'
  packageJSON?: Partial<PackageJson>
}

export const ctx = {
  active: false,
  currentMode: 'dev',
  command: 'vite',
} as Context
