import { type Express } from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { db } from "../db";
import { categories, products, deliveries, orders, orderItems } from "@db/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs";

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // File upload endpoint
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const url = `/uploads/${req.file.filename}`;
    console.log('File uploaded successfully:', url);
    res.json({ url });
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const result = await db.select().from(categories).orderBy(categories.orderIndex);
    res.json(result);
  });

  app.post("/api/categories", async (req, res) => {
    const result = await db.insert(categories).values(req.body).returning();
    res.json(result[0]);
  });

  app.put("/api/categories/:id", async (req, res) => {
    const result = await db
      .update(categories)
      .set(req.body)
      .where(eq(categories.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const result = await db
        .delete(categories)
        .where(eq(categories.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const result = await db.select().from(products);
    res.json(result);
  });

  app.post("/api/products", async (req, res) => {
    const result = await db.insert(products).values(req.body).returning();
    res.json(result[0]);
  });

  app.put("/api/products/:id", async (req, res) => {
    const result = await db
      .update(products)
      .set(req.body)
      .where(eq(products.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const result = await db
        .delete(products)
        .where(eq(products.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const result = await db
        .select({
          id: orders.id,
          status: orders.status,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt,
          items: {
            id: orderItems.id,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
          },
          deliveries: {
            id: deliveries.id,
            date: deliveries.date,
            slot: deliveries.slot,
            status: deliveries.status,
          }
        })
        .from(orders)
        .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
        .leftJoin(deliveries, eq(deliveries.orderId, orders.id))
        .orderBy(orders.createdAt);

      const ordersWithDetails = result.reduce((acc, curr) => {
        const existingOrder = acc.find(o => o.id === curr.id);
        if (existingOrder) {
          if (curr.items?.id && !existingOrder.items.find(i => i.id === curr.items.id)) {
            existingOrder.items.push(curr.items);
          }
          if (curr.deliveries?.id && !existingOrder.deliveries.find(d => d.id === curr.deliveries.id)) {
            existingOrder.deliveries.push(curr.deliveries);
          }
        } else {
          acc.push({
            ...curr,
            items: curr.items?.id ? [curr.items] : [],
            deliveries: curr.deliveries?.id ? [curr.deliveries] : []
          });
        }
        return acc;
      }, []);

      res.json(ordersWithDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const result = await db
      .transaction(async (tx) => {
        // Create order
        const [order] = await tx
          .insert(orders)
          .values({
            status: "Pending",
            totalAmount: req.body.totalAmount,
          })
          .returning();

        // Create order items
        const items = await Promise.all(
          req.body.items.map((item: any) =>
            tx
              .insert(orderItems)
              .values({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })
              .returning()
          )
        );

        // Create delivery
        if (req.body.delivery) {
          await tx
            .insert(deliveries)
            .values({
              orderId: order.id,
              date: new Date(req.body.delivery.date),
              slot: req.body.delivery.slot,
              status: "Pending",
            });
        }

        return { order, items: items.map((i) => i[0]) };
      });
    res.json(result);
  });

  app.put("/api/orders/:id", async (req, res) => {
    const result = await db
      .update(orders)
      .set(req.body)
      .where(eq(orders.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
