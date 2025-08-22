import { addFlag, defineConfigArgvMap } from './cfg-to-argv';
import { isArray, isBool, isString } from '../logic';

export const bunBuildConfigHandler = defineConfigArgvMap<Bun.BuildConfig>({
  // Positional args
  entrypoints: (v) => v,

  // Simple, documented mappings
  outdir: (v) => [addFlag('--outdir', v)],
  target: (v) => [addFlag('--target', v)],
  format: (v) => [addFlag('--format', v)],

  // naming can be string or object with chunk/entry/asset
  naming: (v) =>
    isString(v)
      ? [addFlag(`--entry-naming`, v)]
      : {
          entry: (x) => [addFlag(`--entry-naming`, x)],
          chunk: (x) => [addFlag(`--chunk-naming`, x)],
          asset: (x) => [addFlag(`--asset-naming`, x)]
        },

  root: (v) => [addFlag(`--root`, v)],
  splitting: (v) => [addFlag(`--splitting`, v)],

  plugins: (_v) => [], // No clear CLI mapping for programmatic plugins

  external: (v) => v.map((e) => addFlag(`--external`, e)),
  packages: (v) => [addFlag(`--packages`, v)],
  publicPath: (v) => [addFlag(`--public-path`, v)],

  define: (v) =>
    Object.entries(v).map(([k, val]) =>
      addFlag(`--define`, `'${k}=${JSON.stringify(val)}'`)
    ),
  loader: (v) =>
    Object.entries(v).map(([k, val]) => addFlag(`--loader`, `${k}:${val}`)),

  sourcemap: (v) => [
    addFlag('--sourcemap', isString(v) ? v : v ? 'inline' : 'none')
  ],

  conditions: (v) =>
    [...(isArray(v) ? v : [v])].map((c) => addFlag('--condition', c)),

  env: (v) => [addFlag('--env', v)],

  minify: (v) =>
    isBool(v)
      ? [addFlag('--minify', v)]
      : {
          whitespace: (x) => [addFlag(`--minify-whitespace`, x)],
          syntax: (x) => [addFlag(`--minify-syntax`, x)],
          identifiers: (x) => [addFlag(`--minify-identifiers`, x)]
        },

  ignoreDCEAnnotations: (v) => [addFlag('--ignore-dce-annotations', v)],
  emitDCEAnnotations: (_v) => [], // uncertain

  bytecode: (v) => [addFlag('--bytecode', v)], // only if supported; otherwise harmless to leave empty

  banner: (v) => [addFlag('--banner', v)],
  footer: (v) => [addFlag('--footer', v)],
  drop: (v) => v.map((d) => addFlag('--drop', d)),
  throw: (_v) => [], // execution-time behavior, not a CLI flag
  tsconfig: (v) => [addFlag(`--tsconfig-override`, v)]
});
