/** Human-readable tail of a cluster ARN (e.g. `cluster/my-app`). */
export function shortClusterArn(arn: string): string {
  if (!arn) return '';
  const slash = arn.lastIndexOf('/');
  return slash >= 0 ? arn.slice(slash + 1) : arn;
}
