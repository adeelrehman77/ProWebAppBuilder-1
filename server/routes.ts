import { type Express } from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { db } from "../db";
import { categories, products, deliveries, orders, orderItems, subscriptions, subscriptionItems, routes, drivers, zones } from "@db/schema";
import { eq, sql } from "drizzle-orm";
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

      type OrderItem = {
        id: number;
        productId: number | null;
        quantity: number;
        price: number;
      };

      type OrderDelivery = {
        id: number;
        date: Date;
        slot: string;
        status: string;
      };

      type OrderWithDetails = {
        id: number;
        status: string;
        totalAmount: number;
        createdAt: Date | null;
        items: OrderItem[];
        deliveries: OrderDelivery[];
      };

      const ordersWithDetails = result.reduce<OrderWithDetails[]>((acc, curr) => {
        const existingOrder = acc.find(o => o.id === curr.id);
        if (existingOrder) {
          if (curr.items?.id && !existingOrder.items.find(i => i.id === curr.items.id)) {
            existingOrder.items.push(curr.items as OrderItem);
          }
          if (curr.deliveries?.id && !existingOrder.deliveries.find(d => d.id === curr.deliveries.id)) {
            existingOrder.deliveries.push(curr.deliveries as OrderDelivery);
          }
        } else {
          acc.push({
            id: curr.id,
            status: curr.status,
            totalAmount: curr.totalAmount,
            createdAt: curr.createdAt,
            items: curr.items?.id ? [curr.items as OrderItem] : [],
            deliveries: curr.deliveries?.id ? [curr.deliveries as OrderDelivery] : []
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
      const result = await db
        .update(deliveries)
        .set(req.body)
        .where(eq(deliveries.id, parseInt(req.params.id)))
        .returning();
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

  // Zones management
  app.get("/api/zones", async (req, res) => {
    try {
      const result = await db.select().from(zones).orderBy(zones.name);
      res.json(result);
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
  const httpServer = createServer(app);
  // Routes management
  app.get("/api/routes", async (req, res) => {
    try {
      const result = await db
        .select({
          id: routes.id,
          name: routes.name,
          description: routes.description,
          areas: routes.areas,
          estimatedTime: routes.estimatedTime,
          maxDeliveries: routes.maxDeliveries,
          active: routes.active,
          startLocation: routes.startLocation,
          endLocation: routes.endLocation,
          zone: {
            id: zones.id,
            name: zones.name,
            hub: zones.hub,
          }
        })
        .from(routes)
        .leftJoin(zones, eq(routes.zoneId, zones.id))
        .orderBy(routes.name);
      res.json(result);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const { zoneId, ...routeData } = req.body;
      
      if (!zoneId) {
        return res.status(400).json({ error: 'Zone ID is required' });
      }

      // Verify zone exists
      const zone = await db.select().from(zones).where(eq(zones.id, zoneId)).limit(1);
      if (!zone.length) {
        return res.status(404).json({ error: 'Zone not found' });
      }

      const result = await db.insert(routes)
        .values({
          ...routeData,
          zoneId: zoneId,
        })
        .returning();
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
      const result = await db.insert(drivers).values({
        ...req.body,
        status: req.body.status || 'available',
        currentLocation: req.body.currentLocation || null
      }).returning();
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

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const result = await db
        .select()
        .from(drivers)
        .where(eq(drivers.id, parseInt(req.params.id)))
        .limit(1);
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Driver not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error fetching driver:', error);
      res.status(500).json({ error: 'Failed to fetch driver' });
    }
  });

  // Enhanced delivery management
  app.get("/api/deliveries", async (req, res) => {
    try {
      const result = await db
        .select({
          id: deliveries.id,
          orderId: deliveries.orderId,
          date: deliveries.date,
          slot: deliveries.slot,
          status: deliveries.status,
          notes: deliveries.notes,
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
      
      const formattedResult = result.map(delivery => ({
        ...delivery,
        date: delivery.date ? new Date(delivery.date).toISOString() : null,
        assignedAt: delivery.assignedAt ? new Date(delivery.assignedAt).toISOString() : null,
        startedAt: delivery.startedAt ? new Date(delivery.startedAt).toISOString() : null,
        completedAt: delivery.completedAt ? new Date(delivery.completedAt).toISOString() : null
      }));

      res.json(formattedResult);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  });

  // Add endpoint to update delivery status with enhanced tracking
  app.put("/api/deliveries/:id/status", async (req, res) => {
    try {
      const { status, notes, currentLocation } = req.body;
      const deliveryId = parseInt(req.params.id);
      
      const statusToTimestamp = {
        'Assigned': 'assignedAt',
        'PickedUp': 'startedAt',
        'InTransit': 'inTransitAt',
        'NearDestination': 'nearDestinationAt',
        'Delivered': 'completedAt',
        'Failed': 'failedAt',
        'Cancelled': 'cancelledAt'
      };

      const updateData: any = {
        status,
        notes: notes || null,
        ...(currentLocation && { currentLocation }),
        ...(statusToTimestamp[status] && { [statusToTimestamp[status]]: new Date() })
      };

      const result = await db
        .update(deliveries)
        .set(updateData)
        .where(eq(deliveries.id, deliveryId))
        .returning();

      // Update driver status and location if delivery status changes
      if (result[0].driverId) {
        const driverStatusMap = {
          'Assigned': 'assigned',
          'PickedUp': 'on_delivery',
          'InTransit': 'on_delivery',
          'NearDestination': 'on_delivery',
          'Delivered': 'available',
          'Failed': 'available',
          'Cancelled': 'available'
        };

        await db
          .update(drivers)
          .set({ 
            status: driverStatusMap[status] || 'available',
            currentLocation: currentLocation || null,
            lastUpdated: new Date()
          })
          .where(eq(drivers.id, result[0].driverId));
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({ error: 'Failed to update delivery status' });
    }
  });

  // Add endpoint to assign driver to delivery
  app.put("/api/deliveries/:id/assign", async (req, res) => {
    try {
      const { driverId } = req.body;
      const deliveryId = parseInt(req.params.id);

      // Check if driver exists and is available
      const driver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.id, driverId))
        .limit(1);

      if (!driver.length) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      if (driver[0].status !== 'available') {
        return res.status(400).json({ error: 'Driver is not available' });
      }

      const result = await db.transaction(async (tx) => {
        // Update delivery with driver assignment
        const [updatedDelivery] = await tx
          .update(deliveries)
          .set({
            driverId,
            status: 'Assigned',
            assignedAt: new Date()
          })
          .where(eq(deliveries.id, deliveryId))
          .returning();

        // Update driver status
        await tx
          .update(drivers)
          .set({ 
            status: 'assigned',
            lastUpdated: new Date()
          })
          .where(eq(drivers.id, driverId));

        return updatedDelivery;
      });

      res.json(result);
    } catch (error) {
      console.error('Error assigning driver:', error);
      res.status(500).json({ error: 'Failed to assign driver' });
    }
  });

  // Settings management
  app.get("/api/settings", async (req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT key, value FROM settings`
      );
      const settings = result.rows.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const { key, value } = req.body;
      const result = await db.execute(
        sql`UPDATE settings SET value = ${value}, updated_at = CURRENT_TIMESTAMP WHERE key = ${key} RETURNING *`
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  return httpServer;
}
