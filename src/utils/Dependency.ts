import { PluginTable } from "../types/database/Tables.ts";

export function parseDependencyTag(plugin: Partial<PluginTable>) {
  if (!(plugin.plugin_space && plugin.game_version && plugin.version)) return;

  return `${plugin.plugin_space}@${plugin.game_version}~${plugin.version}`;
}