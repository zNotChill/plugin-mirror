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
        downloads INTEGER,
        is_modrinth BOOLEAN,
        modrinth_slug TEXT
      )
    `)
  }

  addPlugin(plugin: PluginTable) {
    if (this.getPartialPlugin(plugin)) {
      Error(`Failed to add plugin ${plugin.plugin_space} ${plugin.version} (MC ${plugin.game_version}), already exists`, "Database")
      return;
    }
    
    this.db.query(`
      INSERT INTO plugins (plugin_space, version, game_version, path, downloads, is_modrinth, modrinth_slug)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      plugin.plugin_space,
      plugin.version,
      plugin.game_version,
      plugin.path,
      plugin.downloads,
      plugin.is_modrinth,
      plugin.modrinth_slug || null
    ])

    Log(`Added plugin ${plugin.plugin_space} ${plugin.version} (MC ${plugin.game_version}) | ${parseDependencyTag(plugin)}`, "Database")

    return true;
  }

  getPartialPlugin(plugin: Partial<PluginTable>) {
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
      is_modrinth: result[0][5],
      modrinth_slug: result[0][6],
    } as PluginTable : null;
  }

  getPlugin(space: string, version: string, gameVersion: string) {
    const plugin: Partial<PluginTable> = {
      plugin_space: space,
      version: version,
      game_version: gameVersion
    };
    return this.getPartialPlugin(plugin);
  }

  getPluginJar(plugin: PluginTable) {
    const pluginData = this.getPartialPlugin(plugin);
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