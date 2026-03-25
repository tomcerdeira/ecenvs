import { create } from 'zustand';

/**
 * Reserved for UI-only client state. Theme is handled by `next-themes` in `App.tsx`
 * (`storageKey="ecenvs-theme"`) so it survives reloads and works with the native View menu.
 */
export const useUiStore = create(() => ({}));
