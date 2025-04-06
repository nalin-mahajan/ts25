import express, { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import path from "path";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage-db";
import { registerRoutes } from "./routes-db";
import dotenv from "dotenv";
import session from "express-session";
import { randomBytes } from "crypto";

// Load environment variables
dotenv.config();

// Generate a session secret if one doesn't exist (in production this should be set as an environment variable)
const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString("hex");

// Store the secret for future use
process.env.SESSION_SECRET = SESSION_SECRET;

async function main() {
  const app: Express = express();
  
  // Parse JSON and URL-encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Set up session middleware
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );
  
  // Register API routes
  const httpServer = await registerRoutes(app);
  
  // Development: Set up Vite middleware for HMR
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, httpServer);
  } else {
    // Production: Serve static files
    serveStatic(app);
    
    // Catch-all route to serve the frontend
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../dist/client/index.html"));
    });
  }
  
  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`Server listening on http://0.0.0.0:${PORT}`);
  });
  
  return httpServer;
}

// Self-invoking function to start the server
(async () => {
  try {
    await main();
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();

export { main };