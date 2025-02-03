import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { PluginTable } from "../../types/database/Tables.ts";
import { __dirname } from "../../Exports.ts";
import path from "npm:path";
import { Error, Log } from "../../utils/Logger.ts";
import { parseDependencyTag } from "../../utils/Dependency.ts";

class Database {
  private db: DB;

  constructor() {
    this.db = new DB("database.db");

    this.initialize();
  }

  private initialize() {
    this.db.execute(`
      CREATE TABLE IF NOT EXISTS plugins (
        plugin_space TEXT,
        version TEXT,
        game_version TEXT,
        path TEXT,
        downloads INTEGER
      )
    `)
  }

  addPlugin(plugin: PluginTable) {
    if (this.getPlugin(plugin)) {
      Error(`Failed to add plugin ${plugin.plugin_space} ${plugin.version} (MC ${plugin.game_version}), already exists`, "Database")
      return;
    }
    
    this.db.query(`
      INSERT INTO plugins (plugin_space, version, game_version, path, downloads)
      VALUES (?, ?, ?, ?, ?)
    `, [
      plugin.plugin_space,
      plugin.version,
      plugin.game_version,
      plugin.path,
      plugin.downloads
    ])

    Log(`Added plugin ${plugin.plugin_space} ${plugin.version} (MC ${plugin.game_version}) | ${parseDependencyTag(plugin)}`, "Database")

    return true;
  }

  getPlugin(plugin: Partial<PluginTable>) {
    if (!plugin.plugin_space || !plugin.version || !plugin.game_version) {
      return;
    }

    const result = this.db.query(
      `SELECT * FROM plugins WHERE plugin_space = ? AND version = ? AND game_version = ? LIMIT 1`,
      [plugin.plugin_space, plugin.version, plugin.game_version]
    );

    return result.length > 0 ? {
      plugin_space: result[0][0],
      version: result[0][1],
      game_version: result[0][2],
      path: result[0][3],
      downloads: result[0][4],
    } as PluginTable : null;
  }

  getPluginJar(plugin: PluginTable) {
    const pluginData = this.getPlugin(plugin);
    if (!pluginData) return;
    if (!pluginData.path) return;

    const dirname = path.join(__dirname, "../", "data/plugins");
    const protectedPath = this.protectPath(path.join(dirname, pluginData.path));

    const file = Deno.readFileSync(protectedPath);
    if (!file) return;

    return file;
  }

  incrementDownloads(plugin: PluginTable, amount: number = 1) {
    this.db.query(`
      UPDATE plugins
      SET downloads = downloads + ?
      WHERE plugin_space = ? AND version = ? AND game_version = ?
    `, [
      amount, 
      plugin.plugin_space, 
      plugin.version, 
      plugin.game_version
    ]);
  }

  // prevent directory traversal
  protectPath(path: string) {
    return path
      .replaceAll("..", "")
      .replace("/", "") // prevent absolute paths
  }
}

const db = new Database();
export default db;