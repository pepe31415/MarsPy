/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // añade aquí cualquier otra variable VITE_ que uses
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}