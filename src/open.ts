import { commands, env, Uri } from 'vscode'
import { Config } from './config'
import { ctx } from './Context'
import { start } from './start'

export async function open({
  autoStart = false,
  browser = Config.browser,
  stopPrevious = true,
} = {}) {
  if (!ctx.active && autoStart)
    await start({ stopPrevious })

  if (!ctx.active || !ctx.url)
    return

  if (browser === 'system') {
    env.openExternal(Uri.parse(ctx.url))
  }
  else if (browser === 'embedded') {
    if (!ctx.panel || ctx.panel?.disposed) {
      // all the hard work are done in:
      // https://github.com/antfu/vscode-browse-lite
      ctx.panel = await commands.executeCommand('browse-lite.open', ctx.url)
    }
    try {
      ctx.panel?.show?.()
    }
    catch { }
  }
}

export function closePanel() {
  ctx.panel?.dispose?.()
  ctx.panel = undefined
}
