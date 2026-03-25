import { ThemeProvider } from 'next-themes';

import { ConnectionPanel } from '@renderer/components/connection/ConnectionPanel';
import { Header } from '@renderer/components/layout/Header';
import { MainPanel } from '@renderer/components/layout/MainPanel';
import { Sidebar } from '@renderer/components/layout/Sidebar';
import { Toaster } from '@renderer/components/ui/sonner';
import { TooltipProvider } from '@renderer/components/ui/tooltip';

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-25%,oklch(0.55_0.14_275/0.14),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_0%,oklch(0.45_0.12_265/0.08),transparent_50%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]"
          />

          <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <Header
                description="Connect to an ECS cluster and service. Env editing comes in a later step."
                title="Connection"
              />
              <MainPanel>
                <ConnectionPanel />
              </MainPanel>
            </div>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
