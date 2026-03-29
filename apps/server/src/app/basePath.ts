// BASE_PATH is path-only configuration, not a full URL.
export const normalizeBasePath = (basePath?: string): string | undefined => {
  const trimmed = basePath?.trim();

  if (!trimmed || trimmed === '/') {
    return undefined;
  }

  let start = 0;
  let end = trimmed.length;

  while (start < end && trimmed[start] === '/') {
    start += 1;
  }

  while (end > start && trimmed[end - 1] === '/') {
    end -= 1;
  }

  if (start === end) {
    return undefined;
  }

  return `/${trimmed.slice(start, end)}`;
};

export const normalizeGlobalPrefix = (basePath?: string): string | undefined => {
  const normalizedBasePath = normalizeBasePath(basePath);

  return normalizedBasePath ? normalizedBasePath.slice(1) : undefined;
};