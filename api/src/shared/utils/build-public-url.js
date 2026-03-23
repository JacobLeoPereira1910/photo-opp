export function buildPublicUrl(baseUrl, pathname) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(normalizedPath, normalizedBaseUrl).toString();
}
