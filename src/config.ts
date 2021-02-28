import { workspace } from 'vscode'

export function getConfig<T>(key: string) {
  return workspace.getConfiguration().get<T>(`vite.${key}`)
}

export const Config = {
  get root() {
    return workspace.workspaceFolders?.[0]?.uri?.fsPath || ''
  },

  get browser() {
    return getConfig<'system' | 'embedded'>('browser')
  },
}
