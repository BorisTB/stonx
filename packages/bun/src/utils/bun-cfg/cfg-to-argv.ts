import { isArray, isFunction, isNil, isPlainObject } from '../logic';
import { BUN_FLAG_ARG_SEPARATOR } from './constants';

export type Config = {
  [K in keyof PropertyKey]: unknown;
};

export type ConfigValueMapper<T> = (
  val: Exclude<T, undefined>
) => T extends any[]
  ? string[]
  : T extends object
    ? ConfigArgvMap<T>
    : string[];

export type ConfigArgvMap<TConfig> = {
  [K in keyof TConfig]-?: ConfigValueMapper<TConfig[K]>;
};

export function isConfigLike(value: unknown): value is Config {
  return isPlainObject(value);
}

export function isConfigArgvMapLike<TConfig extends Config>(
  value: unknown
): value is ConfigArgvMap<TConfig> {
  return typeof value === 'object' && !isArray(value) && !isNil(value);
}

export function defineConfigArgvMap<TConfig extends Config>(
  argvMap: ConfigArgvMap<TConfig>
): ConfigArgvMap<TConfig> {
  return argvMap;
}

export const normalizeFlag = (flag: string): string =>
  flag.startsWith('-')
    ? flag.startsWith('--')
      ? flag
      : `-${flag}`
    : `--${flag}`;

export function addFlag<TValue extends string | boolean>(
  flag: string,
  value?: TValue
): string {
  if (value === false || isNil(value)) {
    return '';
  }

  const flg = normalizeFlag(flag);

  if (value === true) {
    return flg;
  }

  return `${flg}${BUN_FLAG_ARG_SEPARATOR}${value}`;
}

export function cfgToArgv<TConfig extends Config>(
  cfg: TConfig,
  argvMap: ConfigArgvMap<TConfig>
): string[] {
  const argv: string[] = [];

  for (const key in cfg) {
    const value = cfg[key];

    if (isNil(value)) continue;

    const handler: ConfigValueMapper<typeof value> = argvMap[key];
    if (!isFunction(handler)) {
      console.error(`Handler for ${key} is not a function`);
      continue;
    }

    const out = handler(value);
    if (!out) continue;

    if (isArray(out)) {
      argv.push(...out);
      continue;
    }

    if (!isConfigLike(value) || !isConfigArgvMapLike(out)) {
      continue;
    }

    argv.push(...cfgToArgv(value, out));
  }

  return argv;
}
