import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriberSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  app.post("/api/newsletter/subscribe", async (req, res, next) => {
    try {
      const parsed = insertNewsletterSubscriberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Please provide a valid email address.",
        });
      }

      const normalizedEmail = parsed.data.email.trim().toLowerCase();
      const existing = await storage.getNewsletterSubscriberByEmail(
        normalizedEmail,
      );

      if (existing) {
        return res.status(200).json({
          message: "You're already subscribed.",
        });
      }

      await storage.createNewsletterSubscriber({
        email: normalizedEmail,
      });

      return res.status(201).json({
        message: "Subscription saved successfully.",
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/newsletter/subscribers", async (req, res, next) => {
    try {
      const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
      if (!configuredToken) {
        return res.status(503).json({
          message: "Admin dashboard is not configured.",
        });
      }

      const providedToken = (req.headers["x-admin-token"] as string | undefined)
        ?.trim();
      if (!providedToken || providedToken !== configuredToken) {
        return res.status(401).json({
          message: "Unauthorized.",
        });
      }

      const subscribers = await storage.listNewsletterSubscribers();
      return res.status(200).json({
        count: subscribers.length,
        subscribers,
      });
    } catch (error) {
      return next(error);
    }
  });

  return httpServer;
}
