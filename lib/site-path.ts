export const SITE_BASE_PATH = '/ong_ong';

export function sitePath(path: string): string;
export function sitePath(path: string | null | undefined): string | undefined;
export function sitePath(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return path.startsWith('/') && !path.startsWith('//')
    ? `${SITE_BASE_PATH}${path}`
    : path;
}
