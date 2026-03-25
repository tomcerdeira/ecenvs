import { create } from 'zustand';

/**
 * UI-only client state. Theme is handled by `next-themes` in `App.tsx`
 * (`storageKey="ecenvs-theme"`) so it survives reloads and works with the native View menu.
 */
export const useUiStore = create<{
  connectionPanelOpen: boolean;
  setConnectionPanelOpen: (open: boolean) => void;
  toggleConnectionPanel: () => void;
}>((set) => ({
  connectionPanelOpen: true,
  setConnectionPanelOpen: (open) => set({ connectionPanelOpen: open }),
  toggleConnectionPanel: () => set((s) => ({ connectionPanelOpen: !s.connectionPanelOpen })),
}));
