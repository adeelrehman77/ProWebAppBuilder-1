import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { createHash } from "crypto";
import { users } from "@db/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginUser = z.infer<typeof loginSchema>;
import { db } from "../db";
import { eq } from "drizzle-orm";

// Simple hash function for passwords
const crypto = {
  hash: (password: string, salt: string): string => {
    const hash = createHash('sha256').update(password).digest('hex');
    return `${hash}:${salt}`;
  },
  verify: (password: string, hashedPassword: string): boolean => {
    const [hash, salt] = hashedPassword.split(':');
    const calculatedHash = createHash('sha256').update(password).digest('hex');
    return hash === calculatedHash;
  }
};

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);

  const sessionConfig = {
    secret: process.env.REPL_ID || 'restaurant-management-system',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  if (process.env.NODE_ENV === 'development') {
    sessionConfig.cookie.secure = false;
  }

  app.use(session(sessionConfig));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      if (!username || !password) {
        return done(null, false, { message: "Username and password are required" });
      }

      console.log('Attempting login for username:', username);
      
      let user;
      try {
        [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);
      } catch (dbError) {
        console.error('Database error during authentication:', dbError);
        return done(null, false, { message: "Authentication service temporarily unavailable" });
      }

      if (!user) {
        console.log('User not found');
        return done(null, false, { message: "Invalid username or password" });
      }

      const isValid = crypto.verify(password, user.password);
      console.log('Password verification result:', isValid);
      
      if (!isValid) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, user);
    } catch (err) {
      console.error('Authentication error:', err);
      return done(null, false, { message: "Authentication failed" });
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        message: result.error.issues.map(i => i.message).join(", ")
      });
    }

    const validatedData = result.data;

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({
          error: "Internal server error",
          message: "An unexpected error occurred"
        });
      }

      if (!user) {
        return res.status(401).json({
          error: "Authentication failed",
          message: info?.message || "Invalid credentials"
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.status(500).json({
            error: "Login failed",
            message: "Failed to establish session"
          });
        }

        return res.json({
          message: "Login successful",
          user: { id: user.id, username: user.username }
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          error: "Logout failed",
          message: "Failed to end session"
        });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: "Not authenticated",
        message: "You must be logged in to access this resource"
      });
    }
    res.json(req.user);
  });
}
