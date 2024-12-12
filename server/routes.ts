import { type Express } from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { db } from "../db";
import { 
  categories, products, deliveries, orders, orderItems, 
  routes, drivers, zones 
} from "@db/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs";

// Ensure uploads directory exists with absolute path
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: uploadsDir,
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

  // Zones Management
  app.get("/api/zones", async (req, res) => {
    try {
      const result = await db
        .select({
          id: zones.id,
          name: zones.name,
          description: zones.description,
          active: zones.active,
          color: zones.color,
          createdAt: zones.createdAt,
          updatedAt: zones.updatedAt,
          routes: {
            id: routes.id,
            name: routes.name,
          },
        })
        .from(zones)
        .leftJoin(routes, eq(routes.zoneId, zones.id))
        .orderBy(zones.name);

      // Group routes by zone
      const zonesWithRoutes = result.reduce((acc: any[], curr) => {
        const existingZone = acc.find(z => z.id === curr.id);
        if (existingZone) {
          if (curr.routes?.id) {
            existingZone.routes.push(curr.routes);
          }
        } else {
          acc.push({
            id: curr.id,
            name: curr.name,
            description: curr.description,
            active: curr.active,
            color: curr.color,
            createdAt: curr.createdAt,
            updatedAt: curr.updatedAt,
            routes: curr.routes?.id ? [curr.routes] : [],
          });
        }
        return acc;
      }, []);

      res.json(zonesWithRoutes);
    } catch (error) {
      console.error('Error fetching zones:', error);
      res.status(500).json({ error: 'Failed to fetch zones' });
    }
  });

  app.post("/api/zones", async (req, res) => {
    try {
      const result = await db.insert(zones).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error creating zone:', error);
      res.status(500).json({ error: 'Failed to create zone' });
    }
  });

  app.put("/api/zones/:id", async (req, res) => {
    try {
      const result = await db
        .update(zones)
        .set(req.body)
        .where(eq(zones.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error updating zone:', error);
      res.status(500).json({ error: 'Failed to update zone' });
    }
  });

  app.delete("/api/zones/:id", async (req, res) => {
    try {
      const result = await db
        .delete(zones)
        .where(eq(zones.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error deleting zone:', error);
      res.status(500).json({ error: 'Failed to delete zone' });
    }
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

      type OrderWithDetails = {
        id: number;
        status: string;
        totalAmount: number;
        createdAt: Date | null;
        items: Array<{
          id: number;
          productId: number | null;
          quantity: number;
          price: number;
        }>;
        deliveries: Array<{
          id: number;
          date: Date;
          slot: string;
          status: string;
        }>;
      };

      const ordersWithDetails = result.reduce<OrderWithDetails[]>((acc, curr) => {
        const existingOrder = acc.find(o => o.id === curr.id);
        if (existingOrder) {
          if (curr.items && !existingOrder.items.some(i => i.id === curr.items.id)) {
            existingOrder.items.push(curr.items);
          }
          if (curr.deliveries && !existingOrder.deliveries.some(d => d.id === curr.deliveries.id)) {
            existingOrder.deliveries.push(curr.deliveries);
          }
        } else {
          acc.push({
            id: curr.id,
            status: curr.status,
            totalAmount: curr.totalAmount,
            createdAt: curr.createdAt,
            items: curr.items ? [curr.items] : [],
            deliveries: curr.deliveries ? [curr.deliveries] : []
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
    try {
      const { isRecurring, startDate, endDate, items, totalAmount, delivery } = req.body;

      if (isRecurring && !startDate) {
        return res.status(400).json({ error: "Start date is required for recurring orders" });
      }

      const createOrder = async (tx: any, deliveryDate: Date) => {
        try {
          // Create order
          const [order] = await tx
            .insert(orders)
            .values({
              status: "Pending",
              totalAmount,
            })
            .returning();

          // Create order items
          const createdItems = await Promise.all(
            items.map(async (item: any) => {
              const [createdItem] = await tx
                .insert(orderItems)
                .values({
                  orderId: order.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                })
                .returning();
              return createdItem;
            })
          );

          // Create delivery
          if (delivery) {
            await tx
              .insert(deliveries)
              .values({
                orderId: order.id,
                date: deliveryDate,
                slot: delivery.slot,
                status: "Pending",
              });
          }

          return { order, items: createdItems };
        } catch (err) {
          console.error('Error in createOrder:', err);
          throw err;
        }
      };

      const result = await db.transaction(async (tx) => {
        if (!isRecurring) {
          return createOrder(tx, new Date(startDate));
        }

        // For recurring orders, create orders for each day until end date (max 30 days)
        const start = new Date(startDate);
        const end = new Date(endDate || new Date(start.getTime() + 29 * 24 * 60 * 60 * 1000));
        const createdOrders = [];
        
        let currentDate = new Date(start);
        while (currentDate <= end) {
          createdOrders.push(await createOrder(tx, new Date(currentDate)));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return createdOrders;
      });

      res.json(result);
    } catch (error) {
      console.error('Error creating order(s):', error);
      res.status(500).json({ error: 'Failed to create order(s)' });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    const result = await db
      .update(orders)
      .set(req.body)
      .where(eq(orders.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  });

  app.put("/api/deliveries/:id", async (req, res) => {
    try {
      const { routeId, driverId, status } = req.body;
      const updateData: any = { ...req.body };

      // If assigning a route or driver, update assigned_at
      if (routeId || driverId) {
        updateData.assignedAt = new Date();
      }

      // Update status timestamps
      if (status === 'InProgress') {
        updateData.startedAt = new Date();
      } else if (status === 'Completed') {
        updateData.completedAt = new Date();
      }

      const result = await db
        .update(deliveries)
        .set(updateData)
        .where(eq(deliveries.id, parseInt(req.params.id)))
        .returning();

      // Update driver status if necessary
      if (driverId) {
        await db
          .update(drivers)
          .set({ 
            status: status === 'Completed' ? 'available' : 'on_delivery',
            currentLocation: status === 'Completed' ? null : req.body.currentLocation
          })
          .where(eq(drivers.id, driverId));
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating delivery:', error);
      res.status(500).json({ error: 'Failed to update delivery' });
    }
  });

  // Subscriptions
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const { products: items, ...subscriptionData } = req.body;

      const result = await db.transaction(async (tx) => {
        // Create subscription with properly formatted dates
        const [subscription] = await tx
          .insert(subscriptions)
          .values({
            ...subscriptionData,
            startDate: new Date(subscriptionData.startDate),
            endDate: new Date(subscriptionData.endDate),
            status: "pending",
          })
          .returning();

        // Create subscription items
        await Promise.all(
          items.map(async (item: { id: number; quantity: number }) => {
            await tx
              .insert(subscriptionItems)
              .values({
                subscriptionId: subscription.id,
                productId: item.id,
                quantity: item.quantity,
              });
          })
        );

        return subscription;
      });

      res.json(result);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  const httpServer = createServer(app);
  // Routes management
  app.get("/api/routes", async (req, res) => {
    try {
      const result = await db.select().from(routes).orderBy(routes.name);
      res.json(result);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const result = await db.insert(routes).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error creating route:', error);
      res.status(500).json({ error: 'Failed to create route' });
    }
  });

  app.put("/api/routes/:id", async (req, res) => {
    try {
      const result = await db
        .update(routes)
        .set(req.body)
        .where(eq(routes.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error updating route:', error);
      res.status(500).json({ error: 'Failed to update route' });
    }
  });

  // Drivers management
  app.get("/api/drivers", async (req, res) => {
    try {
      const result = await db.select().from(drivers).orderBy(drivers.name);
      res.json(result);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({ error: 'Failed to fetch drivers' });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const result = await db.insert(drivers).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error creating driver:', error);
      res.status(500).json({ error: 'Failed to create driver' });
    }
  });

  app.put("/api/drivers/:id", async (req, res) => {
    try {
      const result = await db
        .update(drivers)
        .set(req.body)
        .where(eq(drivers.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error updating driver:', error);
      res.status(500).json({ error: 'Failed to update driver' });
    }
  });

  // Enhanced delivery management
  app.get("/api/deliveries", async (req, res) => {
    try {
      const result = await db
        .select({
          id: deliveries.id,
          orderId: deliveries.orderId,
          routeId: deliveries.routeId,
          driverId: deliveries.driverId,
          date: deliveries.date,
          slot: deliveries.slot,
          status: deliveries.status,
          assignedAt: deliveries.assignedAt,
          startedAt: deliveries.startedAt,
          completedAt: deliveries.completedAt,
          route: {
            id: routes.id,
            name: routes.name,
            areas: routes.areas,
            estimatedTime: routes.estimatedTime,
            maxDeliveries: routes.maxDeliveries,
            startLocation: routes.startLocation,
            endLocation: routes.endLocation
          },
          driver: {
            id: drivers.id,
            name: drivers.name,
            phone: drivers.phone,
            vehicleType: drivers.vehicleType,
            vehicleNumber: drivers.vehicleNumber,
            status: drivers.status,
            currentLocation: drivers.currentLocation
          },
          order: {
            id: orders.id,
            status: orders.status,
            totalAmount: orders.totalAmount
          }
        })
        .from(deliveries)
        .leftJoin(routes, eq(deliveries.routeId, routes.id))
        .leftJoin(drivers, eq(deliveries.driverId, drivers.id))
        .leftJoin(orders, eq(deliveries.orderId, orders.id))
        .orderBy(deliveries.date);
      
      const formattedResult = result.map(delivery => {
        const formattedDelivery = {
          ...delivery,
          date: delivery.date ? new Date(delivery.date).toISOString() : null,
          assignedAt: delivery.assignedAt ? new Date(delivery.assignedAt).toISOString() : null,
          startedAt: delivery.startedAt ? new Date(delivery.startedAt).toISOString() : null,
          completedAt: delivery.completedAt ? new Date(delivery.completedAt).toISOString() : null,
        };
        
        // Clean up null relations
        if (!formattedDelivery.route?.id) {
          formattedDelivery.route = null;
        }
        if (!formattedDelivery.driver?.id) {
          formattedDelivery.driver = null;
        }
        if (!formattedDelivery.order?.id) {
          formattedDelivery.order = null;
        }
        
        return formattedDelivery;
      });

      res.json(formattedResult);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  });

  // Add endpoint to update delivery status
  app.put("/api/deliveries/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const deliveryId = parseInt(req.params.id);
      
      type DeliveryStatus = 'Assigned' | 'InProgress' | 'Completed';
      const statusToTimestamp: Record<DeliveryStatus, keyof typeof deliveries.$inferSelect> = {
        'Assigned': 'assignedAt',
        'InProgress': 'startedAt',
        'Completed': 'completedAt'
      };

      const updateData = {
        status,
        ...(status in statusToTimestamp && { [statusToTimestamp[status as DeliveryStatus]]: new Date() })
      };

      const result = await db
        .update(deliveries)
        .set(updateData)
        .where(eq(deliveries.id, deliveryId))
        .returning();

      // Update driver status if delivery status changes
      if (result[0].driverId) {
        const driverStatus = status === 'Completed' ? 'available' : 'on_delivery';
        await db
          .update(drivers)
          .set({ status: driverStatus })
          .where(eq(drivers.id, result[0].driverId));
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({ error: 'Failed to update delivery status' });
    }
  });

  return httpServer;
}
