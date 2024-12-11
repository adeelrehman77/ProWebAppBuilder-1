import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type User as SelectUser } from "@db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

const crypto = {
  hash: async (password: string) => {
    try {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = buf.toString("hex");
      console.log('Generated hash:', { hashedPassword, salt });
      return `${hashedPassword}.${salt}`;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    try {
      console.log('Comparing passwords:', { suppliedPassword, storedPassword });
      
      if (!storedPassword || !storedPassword.includes('.')) {
        console.error('Invalid stored password format');
        return false;
      }

      const [hashedPassword, salt] = storedPassword.split(".");
      if (!hashedPassword || !salt) {
        console.error('Missing hash or salt components');
        return false;
      }

      const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
      const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
      
      const result = timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
      console.log('Password comparison result:', result);
      return result;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }
};

declare global {
  namespace Express {
    interface User extends SelectUser { }
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "fun-adventure-kitchen",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'username' },
      async (username, password, done) => {
        try {
          console.log('Login attempt:', { username });
          
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

          if (!user) {
            console.log('User not found');
            return done(null, false, { message: "Invalid username." });
          }

          console.log('User found, verifying password');
          const isMatch = await crypto.compare(password, user.password);
          
          if (!isMatch) {
            console.log('Password verification failed');
            return done(null, false, { message: "Incorrect password." });
          }

          console.log('Login successful');
          return done(null, user);
        } catch (err) {
          console.error('Login error:', err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
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

  app.post("/api/login", async (req, res, next) => {
    try {
      console.log('Login request received:', req.body);
      
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        console.error('Invalid input:', result.error.issues);
        return res
          .status(400)
          .json({
            error: "Invalid input",
            details: result.error.issues.map(i => i.message)
          });
      }

      passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
        if (err) {
          console.error('Authentication error:', err);
          return res.status(500).json({
            error: "Internal server error during authentication",
            message: err.message
          });
        }
        
        if (!user) {
          console.log('Authentication failed:', info.message);
          return res.status(401).json({
            error: "Authentication failed",
            message: info.message ?? "Invalid credentials"
          });
        }

        req.logIn(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({
              error: "Internal server error during login",
              message: err.message
            });
          }
          
          console.log('Login successful for user:', user.id);
          return res.json({
            message: "Login successful",
            user: { id: user.id, username: user.username }
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error('Unexpected error during login:', error);
      return res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred during login"
      });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).send("Logout failed");
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Not logged in");
  });
}
