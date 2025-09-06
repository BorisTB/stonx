import { format, parse } from 'node:path';

const normalizeExt = (ext: string): string =>
  `${ext.startsWith('.') ? '' : '.'}${ext}`.toLowerCase();

function matchExt(extA: string): (extB: string) => boolean;
function matchExt(extA: string, extB: string): boolean;
function matchExt(extA: string, extB?: string) {
  if (!extB) {
    return (extB: string) => matchExt(extA, extB);
  }

  return normalizeExt(extA) === normalizeExt(extB);
}

export function changeFilePathExtension(
  filePath: string,
  toExt: string,
  opts: { fromExt?: string | string[] } = {}
): string {
  const { fromExt } = opts;

  const isExtAllowedToChange = (ext: string) => {
    if (!fromExt) {
      return true;
    }
    const matcher = matchExt(ext);

    return Array.isArray(fromExt) ? fromExt.some(matcher) : matcher(fromExt);
  };

  const { ext, base, ...parsed } = parse(filePath);

  if (!ext || !isExtAllowedToChange(ext)) {
    return filePath;
  }

  return format({
    ...parsed,
    ext: toExt
  });
}
