export const isNil = (value: any): value is undefined | null => value == null;
export const isString = (v: unknown): v is string => typeof v === 'string';
export const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
export const isArray = Array.isArray;
export const isFunction = (
  v: unknown
): v is (...args: unknown[]) => unknown => {
  return typeof v === 'function';
};
export function isPlainObject(value: unknown): value is Record<any, any> {
  return typeof value === 'object' && !isArray(value) && !isNil(value);
}
