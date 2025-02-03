import * as cliffy from "https://deno.land/x/cliffy@v0.25.7/mod.ts";
import { Error as LogError, Log } from "../utils/Logger.ts";
import { PluginDownloadInfo } from "../types/api/Route.ts";
import api from "../mirror/api/API.ts";
import { parseDependencyTag } from "../utils/Dependency.ts";
import { PluginTable } from "../types/database/Tables.ts";
import { convertUint8ArrayToMB } from "../utils/FileSize.ts";
import { addAllBasePlugins } from "../mirror/database/PluginList.ts";

let ip = "127.0.0.1";
let port = 35826;

async function checkDependencies(file: string) {
  const cwd = Deno.cwd();
  const dependenciesFile = `${cwd}/${file}`;

  if (!await Deno.lstatSync(dependenciesFile)) {
    LogError("No dependencies.txt file found.", "CLI");
    return;
  }

  const content = await Deno.readTextFile(dependenciesFile);
  const dependencies = content.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  const parsedDependencies: Partial<PluginTable>[] = [];

  for (const dep of dependencies) {
    const regex = /^([\w-]+)@([\d.]+)~([\d.]+)?$/;
    const match = dep.match(regex);

    if (match) {
      const [, plugin_space, game_version, version] = match;
      parsedDependencies.push({ plugin_space: plugin_space || "", game_version: game_version || "", version: version || "" });
    } else {
      LogError(`Found invalid dependency in dependencies.txt.`, "CLI")
      LogError(` - ${dep}`, "CLI")
      LogError(`Expected format:`, "CLI")
      LogError(` - space@game_version~plugin_version`, "CLI")
      Deno.exit(0);
    }
  }

  return parsedDependencies;
}
async function downloadPlugin(pluginSpace: string, gameVersion: string, version: string): Promise<PluginDownloadInfo> {
  const url = `http://${ip}:${port}/download?space=${pluginSpace}&game_version=${gameVersion}&version=${version}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return { error: `Failed to download plugin: ${response.statusText}` };
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "plugin.jar";
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+)"/);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    const downloads = response.headers.get("X-Downloads") || "0";

    const pluginData = await response.arrayBuffer();

    return {
      filename,
      data: new Uint8Array(pluginData),
      downloads: parseFloat(downloads)
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    LogError(`Error downloading plugin: ${errorMessage}`);
    return { error: `Failed to download plugin.` };
  }
}

const runAPI = new cliffy.Command()
  .description("Run the API")
  .action(() => {
    Log(`Starting API...`, "CLI");
    const apiListen = api.listen();
    Log(apiListen, "API");
  })

const addBasePlugins = new cliffy.Command()
  .description("Add the base plugins")
  .action(async () => {
    const plugins = await addAllBasePlugins();
    console.log(plugins.join("\n"));
  })

const pmirror = new cliffy.Command()
  .name("pmirror")
  .version("1.0.0")
  .description("A CLI tool for downloading plugins from a mirror.")
  .option("-p, --path <dir:string>", "Path to the dependency download output.", { default: "./plugins" })
  .option("-d, --dependencies <file:string>", "Path to the dependency.txt file.", { default: "./dependencies.txt" })
  .option("-ip, --ip <ip:string>", "The IP to connect to.", { default: "127.0.0.1" })
  .option("-port, --port <port:integer>", "The IP to connect to.", { default: 35826 })
  .action(async (options) => {
    ip = options.ip;
    port = options.port;

    const depOutput = options.path;
    const depFile = options.dependencies;
    
    Log(`Checking dependencies...`, "CLI");
    const dependencies = await checkDependencies(depFile);
    Log(`Successfully parsed dependencies`, "CLI");
    
    Log(`Attempting to download all dependencies...`, "CLI");
    
    let downloadCount = 0;
    let failedDownloadCount = 0;
    
    const downloadPromises = dependencies?.map(async (dep) => {
      const startTime = Date.now();
      const output = await downloadPlugin(dep.plugin_space || "", dep.game_version || "", dep.version || "");
    
      const tag = parseDependencyTag(dep);
      if (output.error) {
        failedDownloadCount++;
        LogError(`Failed to download dependency ${tag}`, "CLI");
        return;
      }
    
      if (!output.data) {
        failedDownloadCount++;
        LogError(`Failed to get dependency data for ${tag}`, "CLI");
        return;
      }
    
      downloadCount++;
      Log(`📥 ${output.downloads} | Successfully downloaded dependency ${tag} in ${Date.now() - startTime}ms (${convertUint8ArrayToMB(output.data)}MB)`, "CLI");
    
      const depOutputPath = `./${depOutput}`;
      Deno.mkdirSync(depOutputPath, { recursive: true });
      Deno.writeFileSync(depOutputPath + "/" + output.filename, output.data);
    });
    
    if (downloadPromises) {
      await Promise.all(downloadPromises);
    }
    
    Log(`Downloaded ${downloadCount} dependencies and failed to download ${failedDownloadCount}.`, "CLI");
  })
  .command("api", runAPI)
  .command("baseplugins", addBasePlugins)

await pmirror.parse(Deno.args);
