/**
 * Traverse an object using dot-notation path.
 * e.g. getNestedValue({ a: { b: 1 } }, "a.b") => 1
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Simple glob matching supporting "*" wildcards.
 * Converts a glob pattern to a regex:
 *   "*" matches any sequence of non-"/" characters
 *   "**" is not specially handled (treated as two *)
 *   All other regex-special characters are escaped.
 */
export function globMatch(pattern: string, value: string): boolean {
  // Escape regex special chars except *, then replace * with .*
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regexStr = "^" + escaped.replace(/\*/g, ".*") + "$";

  try {
    const regex = new RegExp(regexStr);
    return regex.test(value);
  } catch {
    return false;
  }
}

/**
 * Generate a UUIDv7-like ID (timestamp-prefixed random UUID).
 * Uses crypto.randomUUID() for the random part and prepends a
 * hex-encoded timestamp for time-sortability.
 */
export function generateId(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const uuid = crypto.randomUUID();
  // Replace the first 12 chars (time_low + time_mid) with our timestamp
  return timeHex.slice(0, 8) + "-" + timeHex.slice(8, 12) + "-" + uuid.slice(14);
}
