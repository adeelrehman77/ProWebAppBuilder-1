import { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "../db";
import { categories, products, deliveries } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  // Deliveries
  app.get("/api/deliveries", async (req, res) => {
    const result = await db.select().from(deliveries);
    res.json(result);
  });

  app.post("/api/deliveries", async (req, res) => {
    const result = await db.insert(deliveries).values(req.body).returning();
    res.json(result[0]);
  });

  app.put("/api/deliveries/:id", async (req, res) => {
    const result = await db
      .update(deliveries)
      .set(req.body)
      .where(eq(deliveries.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    const result = await db
      .select()
      .from(orders)
      .orderBy(orders.createdAt);
    res.json(result);
  });

  app.post("/api/orders", async (req, res) => {
    const result = await db
      .transaction(async (tx) => {
        // Create order
        const [order] = await tx
          .insert(orders)
          .values({
            userId: req.user?.id,
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
              date: req.body.delivery.date,
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
