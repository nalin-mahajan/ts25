import express, { Express, Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes-new";
import { setupVite, serveStatic, log } from "./vite";

async function main() {
  const app: Express = express();

  app.use(express.json());

  // Sets a session secret for cookies (required by passport)
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'trustfund-dev-secret-key';
  }

  // register app routes
  const server = await registerRoutes(app);

  // Setup vite middleware
  await setupVite(app, server);

  // If we're not in development, serve the static files
  if (process.env.NODE_ENV !== "development") {
    serveStatic(app);
  }

  // Error handler middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    log(`Error: ${err.message}`, "express");
    return res.status(500).json({ error: err.message });
  });

  // Get port from environment variable or use 5000 as default
  const port = process.env.PORT || 5000;

  server.listen(port, () => {
    log(`serving on port ${port}`, "express");
  });
}

main().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
