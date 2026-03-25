import { BrowserWindow, Menu, app, dialog, shell } from 'electron';

import { MAIN_TO_RENDERER } from '@shared/channels';
import type { RecentConnection } from '@shared/types';

import { listRecentConnections } from './store';

const GITHUB_REPO_URL = 'https://github.com/tomcerdeira/ecenvs';

function sendTheme(mode: 'toggle' | 'light' | 'dark' | 'system'): void {
  const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  win?.webContents.send(MAIN_TO_RENDERER.THEME, mode);
}

export function buildAppMenu(): Menu {
  const isMac = process.platform === 'darwin';
  const recents = listRecentConnections();

  const recentItems: Electron.MenuItemConstructorOptions[] =
    recents.length === 0
      ? [{ label: 'No recent connections', enabled: false }]
      : recents.map((r) => ({
          label: `${r.profile} · ${r.region} · ${r.serviceName}${r.containerName ? ` · ${r.containerName}` : ''}`,
          click: () => {
            const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
            const payload: RecentConnection = r;
            win?.webContents.send(MAIN_TO_RENDERER.APPLY_RECENT, payload);
          },
        }));

  const template: Electron.MenuItemConstructorOptions[] = [];

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        {
          label: `About ${app.name}`,
          click: async () => {
            await dialog.showMessageBox({
              message: app.name,
              detail: `Version ${app.getVersion()}\n\nDesktop app for editing ECS task environment variables.`,
            });
          },
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  template.push({
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' },
      { type: 'separator' },
      { label: 'Open Recent', submenu: recentItems },
    ],
  });

  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  });

  template.push({
    label: 'View',
    submenu: [
      {
        label: 'Toggle theme',
        accelerator: 'CmdOrCtrl+Shift+L',
        click: () => sendTheme('toggle'),
      },
      { label: 'Light', click: () => sendTheme('light') },
      { label: 'Dark', click: () => sendTheme('dark') },
      { label: 'System', click: () => sendTheme('system') },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  });

  template.push({
    label: 'Help',
    submenu: [
      ...(!isMac
        ? [
            {
              label: 'About',
              click: async () => {
                await dialog.showMessageBox({
                  message: app.name,
                  detail: `Version ${app.getVersion()}`,
                });
              },
            } as Electron.MenuItemConstructorOptions,
          ]
        : []),
      {
        label: 'GitHub repository',
        click: () => void shell.openExternal(GITHUB_REPO_URL),
      },
    ],
  });

  return Menu.buildFromTemplate(template);
}

export function rebuildAppMenu(): void {
  Menu.setApplicationMenu(buildAppMenu());
}
