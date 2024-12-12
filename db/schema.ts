import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type InferModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  active: boolean("active").default(true),
  orderIndex: integer("order_index").default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  brand: text("brand"),
  categoryId: integer("category_id").references(() => categories.id),
  price: integer("price").notNull(),
  active: boolean("active").default(true),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(0),
  unit: text("unit").notNull().default('units'),
  sku: text("sku").unique(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(), // Pending/Confirmed/Delivered/Cancelled
  totalAmount: integer("total_amount").notNull(),
  paymentStatus: text("payment_status").notNull().default('Pending'), // Pending/Partial/Paid/Refunded
  paymentMethod: text("payment_method"), // Cash/Card/UPI
  paidAmount: integer("paid_amount").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  zoneId: integer("zone_id").references(() => zones.id),
  areas: text("areas").notNull(), // Comma-separated areas covered
  estimatedTime: integer("estimated_time").notNull(), // In minutes
  maxDeliveries: integer("max_deliveries").notNull().default(20),
  active: boolean("active").default(true),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  licenseNumber: text("license_number").notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(50),
  active: boolean("active").default(true),
  status: text("status").notNull().default('available'), // available, on_delivery, off_duty
  currentLocation: text("current_location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(), 
  orderId: integer("order_id").references(() => orders.id),
  routeId: integer("route_id").references(() => routes.id),
  driverId: integer("driver_id").references(() => drivers.id),
  date: timestamp("date").notNull(),
  slot: text("slot").notNull(), // Lunch/Dinner
  status: text("status").notNull(), // Pending/Assigned/InProgress/Completed/Failed
  notes: text("notes"),
  assignedAt: timestamp("assigned_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertRouteSchema = createInsertSchema(routes);
export const selectRouteSchema = createSelectSchema(routes);

export const insertDriverSchema = createInsertSchema(drivers);
export const selectDriverSchema = createSelectSchema(drivers);

export const insertDeliverySchema = createInsertSchema(deliveries);
export const selectDeliverySchema = createSelectSchema(deliveries);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;

// Define relations
// Define relations
export const ordersRelations = relations(orders, ({ many }) => ({
  deliveries: many(deliveries),
  items: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  })
}));

export const routesRelations = relations(routes, ({ many }) => ({
  deliveries: many(deliveries)
}));

export const driversRelations = relations(drivers, ({ many }) => ({
  deliveries: many(deliveries)
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  route: one(routes, {
    fields: [deliveries.routeId],
    references: [routes.id],
  }),
  driver: one(drivers, {
    fields: [deliveries.driverId],
    references: [drivers.id],
  }),
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  })
}));

// Zones management
export const zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hub: text("hub").notNull(),
  areaPincode: text("area_pincode"),
  areaPolygons: text("area_polygons"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;

export const insertZoneSchema = createInsertSchema(zones);
export const selectZoneSchema = createSelectSchema(zones);

// Define relations after both tables exist
export const zonesRelations = relations(zones, ({ many }) => ({
  routes: many(routes)
}));
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactNumber: text("contact_number").notNull(),
  address: text("address").notNull(),
  location: text("location").notNull(),
  buildingName: text("building_name").notNull(),
  flatNumber: text("flat_number").notNull(),
  paymentMode: text("payment_mode").notNull(),
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionItems = pgTable("subscription_items", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type SubscriptionItem = typeof subscriptionItems.$inferSelect;
export type InsertSubscriptionItem = typeof subscriptionItems.$inferInsert;

// Customer management
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  balance: integer("balance").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  route: text("route"),
  registeredOn: timestamp("registered_on").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export const customersRelations = relations(customers, ({ many }) => ({
  subscriptions: many(subscriptions)
}));
