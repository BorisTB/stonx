export function firstValueFrom<T>(it: AsyncIterableIterator<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    (async () => {
      try {
        let event = await it.next();
        resolve(event.value as T);

        while (!event.done) {
          event = await it.next();
        }
      } catch (err) {
        reject(err);
      }
    })();
  });
}
