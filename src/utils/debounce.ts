/**
 * Debounces a function to prevent it from being called too frequently
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to wait before calling the function
 * @param immediate - Whether to call the function immediately
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return (...args: Parameters<T>): void => {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout !== null) clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}
