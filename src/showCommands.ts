import { QuickPickItem, window } from 'vscode'
import { ctx } from './Context'
import { open } from './open'
import { start, stop } from './start'
import { getName } from './utils'

interface CommandPickItem extends QuickPickItem {
  handler?: () => void
  if?: boolean
}

export async function showCommands() {
  const commands: CommandPickItem[] = [
    {
      label: ctx.command === 'vitepress'
        ? '$(repo) Start VitePress server'
        : '$(symbol-event) Start Vite server',
      handler() {
        start()
      },
      if: !ctx.active,
    },
    {
      label: '$(split-horizontal) Open in embedded browser',
      description: ctx.url,
      handler() {
        open({ autoStart: true, browser: 'embedded' })
      },
    },
    {
      label: '$(link-external) Open in system browser',
      description: ctx.url,
      handler() {
        open({ autoStart: true, browser: 'system' })
      },
    },
    {
      label: ctx.currentMode === 'dev'
        ? `$(refresh) Restart ${getName(ctx.command)} server`
        : '$(symbol-event) Switch to dev server',
      async handler() {
        const reopen = ctx.panel && ctx.active && ctx.currentMode !== 'dev'
        await start({ mode: 'dev', searchPort: ctx.currentMode !== 'dev' })
        if (reopen)
          await open({ browser: 'embedded' })
      },
      if: ctx.active,
    },
    {
      label: ctx.active && ctx.currentMode === 'serve'
        ? '$(package) Rebuild and Serve'
        : '$(package) Build and Serve',
      async handler() {
        const reopen = ctx.panel && ctx.active && ctx.currentMode !== 'serve'
        await start({ mode: 'serve', searchPort: ctx.currentMode !== 'serve' })
        if (reopen)
          await open({ browser: 'embedded' })
      },
    },
    {
      label: '$(terminal) Show Terminal',
      handler() {
        stop()
      },
      if: ctx.active,
    },
    {
      label: '$(close) Stop server',
      handler() {
        stop()
      },
      if: ctx.active,
    },
  ]

  const result = await window.showQuickPick<CommandPickItem>(
    commands.filter(i => i.if !== false),
  )

  if (result)
    result.handler?.()
}
