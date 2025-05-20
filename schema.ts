import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  joinedAt: timestamp("joined_at").defaultNow(),
  isCreator: boolean("is_creator").default(false),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  iconName: text("icon_name").notNull(), // Refers to Remix icon class names
  assetCount: integer("asset_count").default(0),
});

// Assets table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  previewUrl: text("preview_url").notNull(),
  price: real("price").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
  thumbnails: text("thumbnails").array(),
  downloadCount: integer("download_count").default(0),
  rating: real("rating").default(0),
  // Adding S3 file storage fields
  fileUrl: text("file_url"),             // S3 key for the main asset file
  fileType: text("file_type"),           // File type/extension (e.g., pdf, zip, mp3)
  fileSize: integer("file_size"),        // File size in bytes
  s3ObjectKey: text("s3_object_key"),    // Original S3 object key
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, joinedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true, downloadCount: true, rating: true });

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Extended asset type with creator and category info for frontend
// Cart Items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  addedAt: timestamp("added_at").defaultNow(),
  quantity: integer("quantity").default(1).notNull(),
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  amount: real("amount").notNull(),
  paymentIntentId: text("payment_intent_id"),
  status: text("status").default("completed"),
  downloadCount: integer("download_count").default(0),
  lastDownloadDate: timestamp("last_download_date"),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Define insert schemas for new tables
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, addedAt: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, purchaseDate: true, downloadCount: true, lastDownloadDate: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true, updatedAt: true });

// Define types for new tables
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

export type AssetWithDetails = Asset & {
  creator: {
    id: number;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  category: {
    id: number;
    name: string;
    iconName: string;
  };
};

export type CartItemWithDetails = CartItem & {
  asset: AssetWithDetails;
};
