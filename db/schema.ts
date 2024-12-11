import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  mobile: text("mobile").unique().notNull(),
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
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(), 
  date: timestamp("date").notNull(),
  slot: text("slot").notNull(), // Lunch/Dinner
  status: text("status").notNull(), // Pending/Completed
});

// Schema validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertDeliverySchema = createInsertSchema(deliveries);
export const selectDeliverySchema = createSelectSchema(deliveries);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;
