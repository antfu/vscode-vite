import { relative, join } from 'path'
import { window } from 'vscode'
import { composeUrl, Config } from './config'
import { ctx } from './Context'

export function enableVitepressAutoRouting() {
  window.onDidChangeActiveTextEditor((e) => {
    const doc = e?.document

    const root = Config.vitepressBase
      ? join(Config.root, Config.vitepressBase)
      : Config.root

    if (!doc?.uri.path.endsWith('.md'))
      return

    const path = relative(root, doc?.uri.fsPath)
      .replace(/\\/g, '/')
      .replace(/\.md$/, '')
      .replace(/\/index$/, '/')

    if (path.startsWith('..'))
      return

    const url = `${composeUrl(ctx.port!)}/${path}`
    // console.log('vp', path, url)

    try {
      ctx.panel?.navigateTo(url)
    }
    catch (e) {
      console.error(e)
    }
  })
}
