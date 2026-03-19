import {
  type User,
  type InsertUser,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  type NewsletterInboxItem,
  type InsertNewsletterInboxItem,
  type NewsItem,
  type InsertNewsItem,
} from "@shared/schema";
import {
  randomUUID,
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";
import { promises as fs } from "fs";
import path from "path";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getNewsletterSubscriberByEmail(
    email: string,
  ): Promise<NewsletterSubscriber | undefined>;
  createNewsletterSubscriber(
    subscriber: InsertNewsletterSubscriber,
  ): Promise<NewsletterSubscriber>;
  listNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  createNewsletterInboxItem(
    input: InsertNewsletterInboxItem,
  ): Promise<NewsletterInboxItem>;
  listNewsletterInboxItems(): Promise<NewsletterInboxItem[]>;
  markNewsletterInboxItemSent(id: string): Promise<NewsletterInboxItem | null>;
  listNewsItems(): Promise<NewsItem[]>;
  createNewsItem(input: InsertNewsItem): Promise<NewsItem>;
  updateNewsItemStatus(id: string, status: NewsItem["status"]): Promise<NewsItem | null>;
  deleteNewsItem(id: string): Promise<boolean>;
}

type StoredNewsletterSubscriber = {
  id: string;
  emailHash: string;
  emailEncrypted: string;
  createdAt: string;
};

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private newsletterSubscribers: Map<string, StoredNewsletterSubscriber>;
  private newsletterInboxItems: Map<string, NewsletterInboxItem>;
  private newsItems: Map<string, NewsItem>;
  private newsletterLoaded: boolean;
  private newsletterInboxLoaded: boolean;
  private newsLoaded: boolean;
  private newsletterFilePath: string;
  private newsletterInboxFilePath: string;
  private newsFilePath: string;

  constructor() {
    this.users = new Map();
    this.newsletterSubscribers = new Map();
    this.newsletterInboxItems = new Map();
    this.newsItems = new Map();
    this.newsletterLoaded = false;
    this.newsletterInboxLoaded = false;
    this.newsLoaded = false;
    this.newsletterFilePath = path.resolve(
      process.cwd(),
      "server/data/newsletter-subscribers.secure.json",
    );
    this.newsletterInboxFilePath = path.resolve(
      process.cwd(),
      "server/data/newsletter-inbox.json",
    );
    this.newsFilePath = path.resolve(
      process.cwd(),
      "server/data/news-items.json",
    );
  }

  private getNewsletterEncryptionKey(): Buffer {
    const secret = process.env.NEWSLETTER_ENCRYPTION_KEY;
    if (!secret) {
      throw new Error(
        "NEWSLETTER_ENCRYPTION_KEY is required for newsletter subscription storage.",
      );
    }

    return createHash("sha256").update(secret).digest();
  }

  private getEmailHash(email: string): string {
    return createHash("sha256").update(email).digest("hex");
  }

  private encryptEmail(email: string): string {
    const key = this.getNewsletterEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(email, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${ciphertext.toString("hex")}`;
  }

  private decryptEmail(payload: string): string {
    const key = this.getNewsletterEncryptionKey();
    const [ivHex, tagHex, ciphertextHex] = payload.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return plaintext.toString("utf8");
  }

  private async ensureNewsletterLoaded() {
    if (this.newsletterLoaded) return;

    await fs.mkdir(path.dirname(this.newsletterFilePath), { recursive: true });

    try {
      const raw = await fs.readFile(this.newsletterFilePath, "utf8");
      const parsed = JSON.parse(raw) as
        | StoredNewsletterSubscriber[]
        | Array<NewsletterSubscriber>;

      let migrated = false;
      for (const subscriber of parsed) {
        if ("emailEncrypted" in subscriber && "emailHash" in subscriber) {
          this.newsletterSubscribers.set(subscriber.emailHash, subscriber);
          continue;
        }

        const normalizedEmail = subscriber.email.trim().toLowerCase();
        const converted: StoredNewsletterSubscriber = {
          id: subscriber.id,
          emailHash: this.getEmailHash(normalizedEmail),
          emailEncrypted: this.encryptEmail(normalizedEmail),
          createdAt: subscriber.createdAt,
        };
        this.newsletterSubscribers.set(converted.emailHash, converted);
        migrated = true;
      }

      if (migrated) await this.persistNewsletterSubscribers();
    } catch (error: unknown) {
      const fileMissing =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ENOENT";

      if (!fileMissing) throw error;

      await this.persistNewsletterSubscribers();
    }

    this.newsletterLoaded = true;
  }

  private async persistNewsletterSubscribers() {
    const data = JSON.stringify(
      Array.from(this.newsletterSubscribers.values()),
      null,
      2,
    );

    await fs.writeFile(this.newsletterFilePath, data, "utf8");
  }

  private async ensureNewsletterInboxLoaded() {
    if (this.newsletterInboxLoaded) return;

    await fs.mkdir(path.dirname(this.newsletterInboxFilePath), {
      recursive: true,
    });

    try {
      const raw = await fs.readFile(this.newsletterInboxFilePath, "utf8");
      const parsed = JSON.parse(raw) as NewsletterInboxItem[];
      for (const item of parsed) {
        this.newsletterInboxItems.set(item.id, item);
      }
    } catch (error: unknown) {
      const fileMissing =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ENOENT";

      if (!fileMissing) throw error;
      await this.persistNewsletterInboxItems();
    }

    this.newsletterInboxLoaded = true;
  }

  private async ensureNewsLoaded() {
    if (this.newsLoaded) return;

    await fs.mkdir(path.dirname(this.newsFilePath), { recursive: true });

    try {
      const raw = await fs.readFile(this.newsFilePath, "utf8");
      const parsed = JSON.parse(raw) as NewsItem[];
      for (const item of parsed) {
        this.newsItems.set(item.id, item);
      }
    } catch (error: unknown) {
      const fileMissing =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ENOENT";

      if (!fileMissing) throw error;
      await this.persistNewsItems();
    }

    this.newsLoaded = true;
  }

  private async persistNewsletterInboxItems() {
    const data = JSON.stringify(
      Array.from(this.newsletterInboxItems.values()),
      null,
      2,
    );

    await fs.writeFile(this.newsletterInboxFilePath, data, "utf8");
  }

  private async persistNewsItems() {
    const data = JSON.stringify(Array.from(this.newsItems.values()), null, 2);
    await fs.writeFile(this.newsFilePath, data, "utf8");
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getNewsletterSubscriberByEmail(
    email: string,
  ): Promise<NewsletterSubscriber | undefined> {
    await this.ensureNewsletterLoaded();
    const normalizedEmail = email.trim().toLowerCase();
    const emailHash = this.getEmailHash(normalizedEmail);
    const found = this.newsletterSubscribers.get(emailHash);
    if (!found) return undefined;

    return {
      id: found.id,
      email: normalizedEmail,
      createdAt: found.createdAt,
    };
  }

  async createNewsletterSubscriber(
    insertSubscriber: InsertNewsletterSubscriber,
  ): Promise<NewsletterSubscriber> {
    await this.ensureNewsletterLoaded();

    const normalizedEmail = insertSubscriber.email.trim().toLowerCase();
    const emailHash = this.getEmailHash(normalizedEmail);
    const existing = this.newsletterSubscribers.get(emailHash);
    if (existing) {
      return {
        id: existing.id,
        email: normalizedEmail,
        createdAt: existing.createdAt,
      };
    }

    const subscriber: NewsletterSubscriber = {
      id: randomUUID(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };

    this.newsletterSubscribers.set(emailHash, {
      id: subscriber.id,
      emailHash,
      emailEncrypted: this.encryptEmail(normalizedEmail),
      createdAt: subscriber.createdAt,
    });
    await this.persistNewsletterSubscribers();

    return subscriber;
  }

  async listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    await this.ensureNewsletterLoaded();

    return Array.from(this.newsletterSubscribers.values())
      .map((subscriber) => ({
        id: subscriber.id,
        email: this.decryptEmail(subscriber.emailEncrypted),
        createdAt: subscriber.createdAt,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNewsletterInboxItem(
    input: InsertNewsletterInboxItem,
  ): Promise<NewsletterInboxItem> {
    await this.ensureNewsletterInboxLoaded();

    const item: NewsletterInboxItem = {
      id: randomUUID(),
      subject: input.subject.trim(),
      content: input.content.trim(),
      status: "draft",
      createdAt: new Date().toISOString(),
      sentAt: null,
    };

    this.newsletterInboxItems.set(item.id, item);
    await this.persistNewsletterInboxItems();
    return item;
  }

  async listNewsletterInboxItems(): Promise<NewsletterInboxItem[]> {
    await this.ensureNewsletterInboxLoaded();
    return Array.from(this.newsletterInboxItems.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async markNewsletterInboxItemSent(
    id: string,
  ): Promise<NewsletterInboxItem | null> {
    await this.ensureNewsletterInboxLoaded();
    const existing = this.newsletterInboxItems.get(id);
    if (!existing) return null;

    if (existing.status === "sent") return existing;

    const updated: NewsletterInboxItem = {
      ...existing,
      status: "sent",
      sentAt: new Date().toISOString(),
    };

    this.newsletterInboxItems.set(updated.id, updated);
    await this.persistNewsletterInboxItems();
    return updated;
  }

  async listNewsItems(): Promise<NewsItem[]> {
    await this.ensureNewsLoaded();
    return Array.from(this.newsItems.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async createNewsItem(input: InsertNewsItem): Promise<NewsItem> {
    await this.ensureNewsLoaded();
    const item: NewsItem = {
      id: randomUUID(),
      title: input.title.trim(),
      description: input.description.trim(),
      imageUrl: input.imageUrl.trim(),
      status: input.status ?? "draft",
      createdAt: new Date().toISOString(),
    };
    this.newsItems.set(item.id, item);
    await this.persistNewsItems();
    return item;
  }

  async updateNewsItemStatus(
    id: string,
    status: NewsItem["status"],
  ): Promise<NewsItem | null> {
    await this.ensureNewsLoaded();
    const existing = this.newsItems.get(id);
    if (!existing) return null;
    const updated: NewsItem = { ...existing, status };
    this.newsItems.set(id, updated);
    await this.persistNewsItems();
    return updated;
  }

  async deleteNewsItem(id: string): Promise<boolean> {
    await this.ensureNewsLoaded();
    const exists = this.newsItems.has(id);
    if (!exists) return false;
    this.newsItems.delete(id);
    await this.persistNewsItems();
    return true;
  }
}

export const storage = new MemStorage();
