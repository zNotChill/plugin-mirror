import db from "../../database/Database.ts";
import { Route } from "../../../types/api/Route.ts";

export default {
  method: "get",
  path: "/download",
  callback: (ctx) => {
    const space = ctx.request.url.searchParams.get("space");
    const game_version = ctx.request.url.searchParams.get("game_version");
    const version = ctx.request.url.searchParams.get("version");

    if (!space || !game_version || !version) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid request data" }
      return;
    }

    const plugin = db.getPlugin({
      plugin_space: space,
      game_version,
      version
    })

    if (!plugin) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Plugin not found" }
      return;
    }

    const jar = db.getPluginJar(plugin);

    if (!jar) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Plugin JAR not found" }
    }

    db.incrementDownloads(plugin);

    ctx.response.headers.set("X-Downloads", `${plugin.downloads + 1}`);
    ctx.response.headers.set("Content-Type", "application/java-archive");
    ctx.response.headers.set("Content-Disposition", `attachment; filename="${plugin.path}"`);
    ctx.response.body = jar;
  }
} as Route