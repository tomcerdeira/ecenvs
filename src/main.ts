import { BrowserWindow, app } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import { initAutoUpdate } from './main/auto-update';
import { registerIpcHandlers } from './main/ipc/handlers';
import { rebuildAppMenu } from './main/menu';
import { appStore } from './main/store';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let saveBoundsTimer: ReturnType<typeof setTimeout> | null = null;

function persistWindowBounds(win: BrowserWindow): void {
  const b = win.getBounds();
  appStore.set('windowState', {
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height,
    isMaximized: win.isMaximized(),
  });
}

function schedulePersistBounds(win: BrowserWindow): void {
  if (saveBoundsTimer) clearTimeout(saveBoundsTimer);
  saveBoundsTimer = setTimeout(() => {
    saveBoundsTimer = null;
    persistWindowBounds(win);
  }, 500);
}

const createWindow = () => {
  const saved = appStore.get('windowState');
  const opts: Electron.BrowserWindowConstructorOptions = {
    width: saved?.width ?? 800,
    height: saved?.height ?? 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };
  if (saved && !saved.isMaximized) {
    opts.x = saved.x;
    opts.y = saved.y;
  }

  const mainWindow = new BrowserWindow(opts);

  if (saved?.isMaximized) {
    mainWindow.maximize();
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('resize', () => schedulePersistBounds(mainWindow));
  mainWindow.on('move', () => schedulePersistBounds(mainWindow));
  mainWindow.on('close', () => {
    if (saveBoundsTimer) clearTimeout(saveBoundsTimer);
    persistWindowBounds(mainWindow);
  });

  return mainWindow;
};

void app.whenReady().then(() => {
  initAutoUpdate();
  registerIpcHandlers();
  createWindow();
  rebuildAppMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    rebuildAppMenu();
  }
});
