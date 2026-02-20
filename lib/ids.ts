export function createId(prefix: string): string {
  const safePrefix = prefix.trim() || "id";
  const random = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  return `${safePrefix}_${ts}${random}`;
}
