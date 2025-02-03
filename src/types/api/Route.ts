import { Context } from "jsr:@oak/oak";

export type Route = {
  method: "get" | "post" | "patch" | "delete"
  path: string
  callback: (ctx: Context) => void
}

export type PluginDownloadInfo = {
  error?: string
  filename?: string
  data?: Uint8Array,
  downloads?: number,
}