import { ThemeProvider } from 'next-themes';

import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select';
import { Separator } from '@renderer/components/ui/separator';
import { Toaster } from '@renderer/components/ui/sonner';
import { TooltipProvider } from '@renderer/components/ui/tooltip';

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
          {/* Linear-style ambient: soft violet glow + subtle grid */}
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

          <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8 sm:px-8 sm:py-10">
            <header className="shrink-0">
              <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                Design system
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                Component smoke
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Dark canvas with subtle grid and glow — shadcn primitives on a Linear-inspired
                surface.
              </p>
            </header>

            <main className="mt-10 flex flex-1 flex-col gap-8">
              <section className="rounded-xl border border-border/80 bg-card/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_24px_48px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Controls
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Inputs, select, and actions — check focus rings against the dark canvas.
                  </p>
                </div>

                <Separator className="my-6 bg-border/70" />

                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground" htmlFor="demo-input">
                      Label
                    </Label>
                    <Input
                      className="h-10 border-border/90 bg-background/60"
                      id="demo-input"
                      placeholder="Search or type…"
                    />
                  </div>

                  <div className="flex flex-wrap items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground" htmlFor="demo-select">
                        Select
                      </Label>
                      <Select defaultValue="a">
                        <SelectTrigger
                          className="h-10 w-[200px] border-border/90 bg-background/60"
                          id="demo-select"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">Production</SelectItem>
                          <SelectItem value="b">Staging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="h-10 px-5" type="button">
                      Primary
                    </Button>
                    <Button className="h-10" type="button" variant="secondary">
                      Secondary
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-2 text-xs text-muted-foreground">Badges</span>
                    <Badge variant="default">Default</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border/60 bg-card/30 px-4 py-3">
                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  Monospace
                </p>
                <p className="mt-2 font-mono text-[13px] leading-relaxed text-muted-foreground">
                  <span className="text-foreground/90">ECS_ENV</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-primary">production</span>
                </p>
              </section>
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
