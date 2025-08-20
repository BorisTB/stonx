export function isRelativePathDefinition(pathDefinition: string) {
  return pathDefinition.startsWith('./') || pathDefinition.startsWith('../');
}
