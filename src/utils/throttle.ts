/**
 * Creates a throttled version of a function that will only execute once per specified time limit
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds between executions
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall: number | null = null;

  return function (this: unknown, ...args: Parameters<T>): void {
    const now = performance.now();
    if (lastCall === null || now - lastCall >= limit) {
      func.apply(this, args);
      lastCall = now;
    }
  };
}
