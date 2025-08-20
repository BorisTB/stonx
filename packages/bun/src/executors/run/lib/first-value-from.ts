export function firstValueFrom<T>(it: AsyncIterableIterator<T>): Promise<T> {
  return new Promise<T>(async (resolve) => {
    let event = await it.next();
    // Resolve after first event
    resolve(event.value as T);

    // Continue iterating
    while (!event.done) {
      event = await it.next();
    }
  });
}
