import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { setupAuth } from "./auth";
import path from "path";
import { fileURLToPath } from 'url';
import { db } from "../db";
import { sql } from "drizzle-orm";
import { mkdir } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
}

async function initializeServer() {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('Uploads directory ready:', uploadsDir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error('Error creating uploads directory:', err);
        throw err;
      }
    }

    // Check database connection first
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Could not connect to database');
    }

    // Create Express app and server
    const app = express();
    const server = createServer(app);

    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Request logging
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      });
      next();
    });

    // Setup authentication
    setupAuth(app);

    // Development setup (must be before API routes for HMR to work)
    if (app.get("env") === "development") {
      console.log('Setting up Vite in development mode...');
      await setupVite(app, server);
    }

    // Register API routes after Vite middleware in dev mode
    registerRoutes(app);

    // API 404 handler (must be after routes but before final handler)
    app.use('/api/*', (req, res) => {
      res.status(404).json({ message: 'API endpoint not found' });
    });

    // Error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({
        status,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Static file serving and client routing (production only)
    if (app.get("env") === "production") {
      console.log('Setting up static serving in production mode...');
      const staticPath = path.join(__dirname, "../client/dist");
      app.use(express.static(staticPath));

      // Client-side routing fallback (must be last)
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(staticPath, 'index.html'));
        }
      });
    }

    // Start server
    const PORT = parseInt(process.env.PORT || "5000", 10);
    server.listen(PORT, "0.0.0.0", () => {
      console.log('=================================');
      console.log(`Server running on port ${PORT}`);
      console.log(`Mode: ${app.get("env")}`);
      console.log('Database: Connected');
      console.log('=================================');
    });

    return server;
  } catch (error) {
    console.error('Server initialization failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Start the server
initializeServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
