/**
 * Debounce function that delays the execution of a function until a specific
 * number of milliseconds have passed since the last time it was invoked
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T, 
  delay: number
): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  } as T;
}