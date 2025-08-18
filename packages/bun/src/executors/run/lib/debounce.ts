export function debounce<T>(
  fn: () => Promise<T>,
  wait: number
): () => Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  let pendingPromise: Promise<T> | null = null;

  return () => {
    if (!pendingPromise) {
      pendingPromise = new Promise<T>((resolve, reject) => {
        timeoutId = setTimeout(() => {
          fn()
            .then(resolve)
            .catch(reject)
            .finally(() => {
              pendingPromise = null;
              clearTimeout(timeoutId);
            });
        }, wait);
      });
    }

    return pendingPromise;
  };
}
