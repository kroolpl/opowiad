/// <reference path="../.astro/types.d.ts" />

/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string
  readonly DATABASE_AUTH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}