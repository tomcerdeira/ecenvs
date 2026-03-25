import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dynamic import: Forge bundles the config with esbuild; @tailwindcss/vite is ESM-only.
export default defineConfig(async () => {
  const [{ default: tailwindcss }, { default: react }] = await Promise.all([
    import('@tailwindcss/vite'),
    import('@vitejs/plugin-react'),
  ]);
  return {
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@renderer': path.resolve(__dirname, 'src/renderer'),
      },
    },
  };
});
