import bcrypt from "bcryptjs";
import crypto from "crypto";

const TOKEN_PREFIX = "local";
const VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function issueAccessToken(userId: number) {
  return `${TOKEN_PREFIX}.${userId}`;
}

export function parseAccessToken(token: string | null | undefined) {
  if (!token) return null;
  const [prefix, rawId] = token.split(".");
  if (prefix !== TOKEN_PREFIX) return null;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function makeVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function verificationExpiryDate() {
  return new Date(Date.now() + VERIFICATION_TTL_MS);
}
