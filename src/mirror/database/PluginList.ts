import { PluginTable } from "../../types/database/Tables.ts";
import { parseDependencyTag } from "../../utils/Dependency.ts";
import db from "./Database.ts";

export const basePluginList: PluginTable[] = [
  {
    plugin_space: "biosphere2",
    version: "1.0.2",
    game_version: "1.21.4",
    path: "biosphere2-1.0.2.jar",
    downloads: 0
  },
  {
    plugin_space: "FastAyncWorldEdit",
    version: "2.12.3",
    game_version: "1.21.4",
    path: "FastAsyncWorldEdit-Paper-2.12.3.jar",
    downloads: 0
  },
  {
    plugin_space: "LuckPerms",
    version: "5.4.153",
    game_version: "1.21.4",
    path: "LuckPerms-Bukkit-5.4.153.jar",
    downloads: 0
  },
  {
    plugin_space: "MongoSK",
    version: "2.3.0",
    game_version: "1.21.4",
    path: "MongoSK-2.3.0-all.jar",
    downloads: 0
  },
  {
    plugin_space: "multiverse-core",
    version: "4.3.14",
    game_version: "1.21.4",
    path: "multiverse-core-4.3.14.jar",
    downloads: 0
  },
  {
    plugin_space: "reqn",
    version: "1.2.3",
    game_version: "1.21.4",
    path: "SkBee-3.8.2.jar",
    downloads: 0
  },
  {
    plugin_space: "SkBee",
    version: "3.8.2",
    game_version: "1.21.4",
    path: "SkBee-3.8.2.jar",
    downloads: 0
  },
  {
    plugin_space: "SkCheese",
    version: "1.5",
    game_version: "1.21.4",
    path: "SkCheese-1.5.jar",
    downloads: 0
  },
  {
    plugin_space: "Skript",
    version: "2.10.1",
    game_version: "1.21.4",
    path: "Skript-2.10.1.jar",
    downloads: 0
  },
  {
    plugin_space: "skript-gui",
    version: "1.3",
    game_version: "1.21.4",
    path: "skript-gui-1.3.jar",
    downloads: 0
  },
  {
    plugin_space: "skript-json",
    version: "1.1.0",
    game_version: "1.21.4",
    path: "skript-json-1.1.0.jar",
    downloads: 0
  },
  {
    plugin_space: "skript-reflect",
    version: "2.6",
    game_version: "1.21.4",
    path: "skript-reflect-2.6.jar",
    downloads: 0
  },
  {
    plugin_space: "Vault",
    version: "1.7.3",
    game_version: "1.21.4",
    path: "Vault.jar",
    downloads: 0
  },
  {
    plugin_space: "ViaVersion",
    version: "5.2.1",
    game_version: "1.21.4",
    path: "ViaVersion-5.2.1.jar",
    downloads: 0
  },
  {
    plugin_space: "VoidGen",
    version: "2.2.1",
    game_version: "1.21.4",
    path: "VoidGen-2.2.1.jar",
    downloads: 0
  },
]

export async function addAllBasePlugins() {
  const tags: (string | undefined)[] = [];
  await Promise.all(basePluginList.map(async (plugin) => {
    await db.addPlugin(plugin);
    tags.push(parseDependencyTag(plugin));
  }));

  return tags;
}
