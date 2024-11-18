/// <reference types="astro/client" />

interface Locals {
  user: {
    id?: string;
    email?: string;
    username?: string;
  } | null;
}

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly DATABASE_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 