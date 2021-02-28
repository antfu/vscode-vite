import { resolve } from 'path'
import { workspace } from 'vscode'

export const Config = {
  get root() {
    return workspace.workspaceFolders?.[0]?.uri?.fsPath || ''
  },

  get path() {
    return resolve(this.root, workspace.getConfiguration().get<string>('as-fs.path')!)
  },
}
