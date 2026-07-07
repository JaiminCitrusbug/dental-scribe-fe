// Ambient declarations for side-effect asset/font imports (handled by Vite at build).
declare module '*.css'
declare module '@fontsource-variable/inter'
declare module '@fontsource-variable/plus-jakarta-sans'

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
