/** User-facing message from a caught value (Error or otherwise). */
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
