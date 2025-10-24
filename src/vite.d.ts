/// <reference types="vite/client" />

interface ImportMetaEnv {
 readonly BASE_PATH: string;
}

interface ImportMeta {
 readonly env: ImportMetaEnv;
}