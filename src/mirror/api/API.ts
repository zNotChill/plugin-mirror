import { Application, Router } from "jsr:@oak/oak";
import Download from "./routes/Download.ts";
import { Route } from "../../types/api/Route.ts";
import { Error, Log } from "../../utils/Logger.ts";

class API {
  private router: Router;
  private app: Application;

  constructor() {
    this.router = new Router();
    this.app = new Application();
  }

  addRoutes() {
    this.addRoute(Download)
  }

  addRoute(route: Route) {
    if (!route.method || !route.path || !route.callback) {
      Error(`Invalid route configuration: ${JSON.stringify(route)}`, "API");
      return;
    }

    const method = route.method.toLowerCase() as keyof Router;

    if (typeof this.router[method] !== "function") {
      Error(`Invalid HTTP method: ${route.method}`, "API");
      return;
    }

    (this.router[method] as Function)(route.path, route.callback);
    Log(`Registered ${route.method.toUpperCase()} ${route.path}`, "API");
}

  listen() {
    this.addRoutes();
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
    this.app.listen({
      port: 35826
    });

    return "Listening on port 35826"
  }
}

const api = new API();
export default api;