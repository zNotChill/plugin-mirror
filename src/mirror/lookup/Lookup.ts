import { PluginInfo } from "./Plugin.ts";

export class PluginLookup {
  static apiUrl: string = "https://api.modrinth.com/v3";

  static async getProjectInfo(projectId: string): Promise<PluginInfo | null> {
    const url = `${this.apiUrl}/project/${projectId}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      const data: PluginInfo = await response.json();
      return data;
    } catch (_) {
      return null;
    }
  }
}