/**
 * Low-level freeze helper used by the internal freeze policy.
 * It performs a shallow Object.freeze for plain objects and arrays.
 * It leaves runtime values like Map, Set, Date, primitives, and null unchanged.
 */
export function freezeValue<T>(value: T): T {
  if (value === null) return value;

  const type = typeof value;

  if (type !== 'object' && type !== 'function') {
    return value;
  }

  if (
    value instanceof Map ||
    value instanceof Set ||
    value instanceof Date
  ) {
    return value;
  }

  return Object.freeze(value);
}
