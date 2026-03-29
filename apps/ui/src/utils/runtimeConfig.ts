import type { MaintainerrRuntimeConfig } from '@maintainerr/contracts'

const normalizeBasePath = (basePath?: string) => {
  if (!basePath || basePath === '/') {
    return ''
  }

  let normalized = basePath

  while (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`
}

const getRuntimeConfig = (): MaintainerrRuntimeConfig => {
  if (typeof window === 'undefined') {
    return {}
  }

  return window.__MAINTAINERR_RUNTIME_CONFIG__ ?? {}
}

export const getRuntimeBasePath = () => {
  return normalizeBasePath(getRuntimeConfig().basePath)
}

export const withBasePath = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${getRuntimeBasePath()}${normalizedPath}`
}