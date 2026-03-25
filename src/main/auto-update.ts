import { app } from 'electron';
import { updateElectronApp } from 'update-electron-app';

/**
 * Uses https://update.electronjs.org with the `repository` field in package.json.
 * macOS updates require a signed, notarized app for a smooth experience.
 */
export function initAutoUpdate(): void {
  if (!app.isPackaged) {
    return;
  }
  updateElectronApp();
}
