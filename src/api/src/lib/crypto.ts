import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.SSO_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("SSO_ENCRYPTION_KEY environment variable is required");
  }
  // Accept hex-encoded 32-byte key or raw 32-char string
  if (key.length === 64) return Buffer.from(key, "hex");
  if (key.length === 32) return Buffer.from(key, "utf-8");
  throw new Error("SSO_ENCRYPTION_KEY must be 32 bytes (64 hex chars or 32 raw chars)");
}

function getJwtSecret(): string {
  const secret = process.env.SSO_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SSO_JWT_SECRET environment variable is required in production");
    }
    return "dev-sso-jwt-secret-do-not-use-in-prod";
  }
  return secret;
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv:tag:ciphertext (all hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = Buffer.from(parts[2], "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export interface SessionTokenPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
  provider: string;
  iat?: number;
  exp?: number;
}

export function signSessionToken(payload: Omit<SessionTokenPayload, "iat" | "exp">): string {
  const ttl = parseInt(process.env.SSO_SESSION_TTL ?? "28800", 10);
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ttl });
}

export function verifySessionToken(token: string): SessionTokenPayload {
  return jwt.verify(token, getJwtSecret()) as SessionTokenPayload;
}

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
