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
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    if (!storedPassword || !storedPassword.includes('.')) {
      return false;
    }
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
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
          console.log('Attempting login for username:', username);
          
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

  app.post("/api/login", (req, res, next) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
    }

    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.log('Authentication failed:', info.message);
        return res.status(400).send(info.message ?? "Login failed");
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        
        console.log('Login successful for user:', user.id);
        return res.json({
          message: "Login successful",
          user: { id: user.id, mobile: user.mobile }
        });
      });
    })(req, res, next);
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
