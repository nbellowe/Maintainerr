/// <reference types="vite/client" />

import type { MaintainerrRuntimeConfig } from '@maintainerr/contracts'

interface Window {
  __MAINTAINERR_RUNTIME_CONFIG__?: MaintainerrRuntimeConfig
}
