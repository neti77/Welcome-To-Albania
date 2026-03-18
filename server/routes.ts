import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertNewsletterSubscriberSchema,
  insertNewsletterInboxItemSchema,
  insertNewsItemSchema,
} from "@shared/schema";

const newsletterRateLimit = new Map<string, number[]>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  const requireAdminToken = (providedToken?: string) => {
    const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
    if (!configuredToken) {
      return { ok: false as const, status: 503, message: "Admin dashboard is not configured." };
    }

    if (!providedToken || providedToken.trim() !== configuredToken) {
      return { ok: false as const, status: 401, message: "Unauthorized." };
    }

    return { ok: true as const };
  };

  app.post("/api/admin/login", (req, res) => {
    const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
    if (!configuredToken) {
      return res.status(503).json({
        message: "Admin dashboard is not configured.",
      });
    }

    const providedToken = String(req.body?.token ?? "").trim();
    if (!providedToken || providedToken !== configuredToken) {
      return res.status(401).json({ message: "Invalid admin key." });
    }

    return res.status(200).json({ message: "Access granted." });
  });

  app.post("/api/newsletter/subscribe", async (req, res, next) => {
    try {
      const honeypot = String(req.body?.website ?? "").trim();
      if (honeypot) {
        return res.status(200).json({ message: "Subscription saved successfully." });
      }

      const submittedAfterMs = Number(req.body?.submittedAfterMs ?? 0);
      if (!Number.isFinite(submittedAfterMs) || submittedAfterMs < 1200) {
        return res.status(400).json({
          message: "Please try again.",
        });
      }

      const rawIp =
        ((req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] ??
          req.ip ??
          "unknown").trim();
      const now = Date.now();
      const windowMs = 10 * 60 * 1000;
      const maxRequestsPerWindow = 6;
      const existingRequests = newsletterRateLimit.get(rawIp) ?? [];
      const recent = existingRequests.filter((ts) => now - ts < windowMs);
      if (recent.length >= maxRequestsPerWindow) {
        return res.status(429).json({
          message: "Too many requests. Please try again later.",
        });
      }
      recent.push(now);
      newsletterRateLimit.set(rawIp, recent);

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
      const auth = requireAdminToken(req.headers["x-admin-token"] as string | undefined);
      if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

      const subscribers = await storage.listNewsletterSubscribers();
      return res.status(200).json({
        count: subscribers.length,
        subscribers,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/newsletter/inbox", async (req, res, next) => {
    try {
      const auth = requireAdminToken(req.headers["x-admin-token"] as string | undefined);
      if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

      const items = await storage.listNewsletterInboxItems();
      return res.status(200).json({ count: items.length, items });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/admin/newsletter/inbox", async (req, res, next) => {
    try {
      const auth = requireAdminToken(req.headers["x-admin-token"] as string | undefined);
      if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

      const parsed = insertNewsletterInboxItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Subject and content are required." });
      }

      const item = await storage.createNewsletterInboxItem(parsed.data);
      return res.status(201).json({ message: "Draft created.", item });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/admin/newsletter/inbox/:id/send", async (req, res, next) => {
    try {
      const auth = requireAdminToken(req.headers["x-admin-token"] as string | undefined);
      if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

      const item = await storage.markNewsletterInboxItemSent(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Newsletter draft not found." });
      }

      const subscribers = await storage.listNewsletterSubscribers();
      const recipients = subscribers.map((subscriber) => subscriber.email);

      return res.status(200).json({
        message: "Newsletter marked as sent. Use recipient list for manual delivery.",
        item,
        recipientCount: recipients.length,
        recipients,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/news", async (req, res, next) => {
    try {
      const items = await storage.listNewsItems();
      return res.status(200).json({ count: items.length, items });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/news", async (req, res, next) => {
    try {
      const auth = requireAdminToken(req.headers["x-admin-token"] as string | undefined);
      if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

      const items = await storage.listNewsItems();
      return res.status(200).json({ count: items.length, items });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/admin/news", async (req, res, next) => {
    try {
      const auth = requireAdminToken(req.headers["x-admin-token"] as string | undefined);
      if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

      const parsed = insertNewsItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Title, description, and image URL are required." });
      }

      const item = await storage.createNewsItem(parsed.data);
      return res.status(201).json({ message: "News published.", item });
    } catch (error) {
      return next(error);
    }
  });

  return httpServer;
}
