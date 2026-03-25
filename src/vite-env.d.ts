/// <reference types="vite/client" />

import type { EcEnvsApi } from './preload';

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
  const MAIN_WINDOW_VITE_NAME: string;

  interface Window {
    api: EcEnvsApi;
  }
}

export {};
