import { BrowserWindow, app, screen } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import type { WindowState } from './main/store';

import { initAutoUpdate } from './main/auto-update';
import { registerIpcHandlers } from './main/ipc/handlers';
import { rebuildAppMenu } from './main/menu';
import { appStore } from './main/store';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let saveBoundsTimer: ReturnType<typeof setTimeout> | null = null;

/** Default size tuned for connection grid + env table + toolbar (not full-screen on typical laptops). */
const DEFAULT_WINDOW = { width: 1280, height: 820 } as const;
const MIN_WINDOW = { width: 720, height: 520 } as const;

/**
 * Fit width/height within the primary display work area, enforce minimums, and return a centered
 * or clamped position so restored windows are never off-screen after display changes.
 */
function getInitialWindowBounds(saved: WindowState | null): {
  width: number;
  height: number;
  x: number;
  y: number;
} {
  const { workArea } = screen.getPrimaryDisplay();
  const { x: wx, y: wy, width: sw, height: sh } = workArea;

  const rawW = saved?.width ?? DEFAULT_WINDOW.width;
  const rawH = saved?.height ?? DEFAULT_WINDOW.height;
  const w = Math.max(MIN_WINDOW.width, Math.min(rawW, sw));
  const h = Math.max(MIN_WINDOW.height, Math.min(rawH, sh));

  if (saved && !saved.isMaximized) {
    const x = Math.min(Math.max(saved.x, wx), wx + sw - w);
    const y = Math.min(Math.max(saved.y, wy), wy + sh - h);
    return { width: w, height: h, x, y };
  }

  const x = Math.round(wx + (sw - w) / 2);
  const y = Math.round(wy + (sh - h) / 2);
  return { width: w, height: h, x, y };
}

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
  const bounds = getInitialWindowBounds(saved);
  const opts: Electron.BrowserWindowConstructorOptions = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: MIN_WINDOW.width,
    minHeight: MIN_WINDOW.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

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
