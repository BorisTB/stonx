export function firstValueFrom<T>(it: AsyncIterable<T>): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    try {
      for await (const v of it) {
        return resolve(v);
      }
      reject(new Error('Iterator completed without a value'));
    } catch (e) {
      reject(e);
    }
  });
}
