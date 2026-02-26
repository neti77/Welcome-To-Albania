import {
  type User,
  type InsertUser,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
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
  private newsletterLoaded: boolean;
  private newsletterFilePath: string;

  constructor() {
    this.users = new Map();
    this.newsletterSubscribers = new Map();
    this.newsletterLoaded = false;
    this.newsletterFilePath = path.resolve(
      process.cwd(),
      "server/data/newsletter-subscribers.secure.json",
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
}

export const storage = new MemStorage();
