import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertNewsletterSubscriberSchema = z.object({
  email: z.string().trim().email(),
});

export type InsertNewsletterSubscriber = z.infer<
  typeof insertNewsletterSubscriberSchema
>;

export type NewsletterSubscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export const insertNewsletterInboxItemSchema = z.object({
  subject: z.string().trim().min(3).max(180),
  content: z.string().trim().min(10).max(20000),
});

export type InsertNewsletterInboxItem = z.infer<
  typeof insertNewsletterInboxItemSchema
>;

export type NewsletterInboxItem = {
  id: string;
  subject: string;
  content: string;
  status: "draft" | "sent";
  createdAt: string;
  sentAt: string | null;
};

export const insertNewsItemSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(800),
  imageUrl: z.string().trim().min(5).max(2000),
  status: z.enum(["draft", "published"]).optional(),
});

export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;

export type NewsItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: "draft" | "published";
  createdAt: string;
};
