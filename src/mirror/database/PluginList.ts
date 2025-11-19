import { PluginTable } from "../../types/database/Tables.ts";
import { parseDependencyTag } from "../../utils/Dependency.ts";
import { Error } from "../../utils/Logger.ts";
import { Log } from "../../utils/Logger.ts";
import { getLatestGameVersion } from "../../versions/Versions.ts";
import { PluginLookup } from "../lookup/Lookup.ts";
import { PluginInfo, PluginVersion } from "../lookup/Plugin.ts";
import db from "./Database.ts";

// export const basePluginList: PluginTable[] = [
//   {
//     plugin_space: "biosphere2",
//     version: "1.0.2",
//     game_version: "1.21.4",
//     path: "biosphere2-1.0.2.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "FastAyncWorldEdit",
//     version: "2.12.3",
//     game_version: "1.21.4",
//     path: "FastAsyncWorldEdit-Paper-2.12.3.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "LuckPerms",
//     version: "5.4.153",
//     game_version: "1.21.4",
//     path: "LuckPerms-Bukkit-5.4.153.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "MongoSK",
//     version: "2.3.0",
//     game_version: "1.21.4",
//     path: "MongoSK-2.3.0-all.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "multiverse-core",
//     version: "4.3.14",
//     game_version: "1.21.4",
//     path: "multiverse-core-4.3.14.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "reqn",
//     version: "1.2.3",
//     game_version: "1.21.4",
//     path: "SkBee-3.8.2.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "SkBee",
//     version: "3.8.2",
//     game_version: "1.21.4",
//     path: "SkBee-3.8.2.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "SkCheese",
//     version: "1.5",
//     game_version: "1.21.4",
//     path: "SkCheese-1.5.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "Skript",
//     version: "2.10.1",
//     game_version: "1.21.4",
//     path: "Skript-2.10.1.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "skript-gui",
//     version: "1.3",
//     game_version: "1.21.4",
//     path: "skript-gui-1.3.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "skript-json",
//     version: "1.1.0",
//     game_version: "1.21.4",
//     path: "skript-json-1.1.0.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "skript-reflect",
//     version: "2.6",
//     game_version: "1.21.4",
//     path: "skript-reflect-2.6.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "Vault",
//     version: "1.7.3",
//     game_version: "1.21.4",
//     path: "Vault.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "ViaVersion",
//     version: "5.2.1",
//     game_version: "1.21.4",
//     path: "ViaVersion-5.2.1.jar",
//     downloads: 0
//   },
//   {
//     plugin_space: "VoidGen",
//     version: "2.2.1",
//     game_version: "1.21.4",
//     path: "VoidGen-2.2.1.jar",
//     downloads: 0
//   },
// ]

export async function addAllBasePlugins() {
  const tags: (string | undefined)[] = [];

  const file = await Deno.readTextFile(import.meta.dirname + "../../../base/plugin_list.txt");
  
  file.split("\n").forEach(async (line) => {
    if (line.startsWith("#") || line.trim().length === 0) {
      return;
    }
    
    const slug = line.trim();
    
    Log(`Fetching Modrinth project '${slug}'...`, "CLI");

    const projectRes = await PluginLookup.getProjectInfo(slug);
    if (projectRes === null) {
      Error(`Modrinth project not found: ${slug}`, "CLI");
      return;
    }

    await installPlugin(projectRes);
  });

  return tags;
}

async function installPlugin(project: PluginInfo) {
  const slug = project.slug;
  const versionUrl = `https://api.modrinth.com/v2/project/${slug}/version`;

  const versionsRes = await fetch(versionUrl);
  const versions = await versionsRes.json();

  const latest = versions[0];

  const gameVersionList = [] as {
    version: string,
    game_version: string,
    files: any[]
  }[];
  versions.forEach((version: PluginVersion) => {
    const latestVersion = getLatestGameVersion(version.game_versions);

    gameVersionList.push({
      version: version.version_number,
      game_version: latestVersion,
      files: version.files
    });
  });

  // filter version list to get most recent version
  gameVersionList.sort((a: any, b: any) => {
    const aParts = a.game_version.split(".").map((n: string) => Number(n));
    const bParts = b.game_version.split(".").map((n: string) => Number(n));
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const diff = (bParts[i] || 0) - (aParts[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });
  const selectedVersion = gameVersionList[0];
  const file = selectedVersion.files[0];
  const usedGameVersion = selectedVersion.game_version;
  const fullSpace = `${project.slug}@${usedGameVersion}~${selectedVersion.version}`;

  if (await db.getPlugin(project.slug, selectedVersion.version, usedGameVersion)) {
    Error(`Plugin ${fullSpace} already exists in database, skipping...`, "CLI");
    return;
  }

  Log(`Found file: ${fullSpace} (${file.size} bytes)`, "CLI");

  const fileRes = await fetch(file.url);
  const data = new Uint8Array(await fileRes.arrayBuffer());

  const outPath = `./data/plugins/${file.filename}`;
  Deno.writeFileSync(outPath, data);

  Log(`Downloaded: ${outPath}`, "CLI");
  Log(`Adding to database...`, "CLI");

  const pluginInfo = {
    plugin_space: project.slug,
    version: latest.version_number,
    game_version: usedGameVersion,
    path: file.filename,
    downloads: 0,
    is_modrinth: true,
    modrinth_slug: project.slug
  } as PluginTable;

  await db.addPlugin(pluginInfo);
}