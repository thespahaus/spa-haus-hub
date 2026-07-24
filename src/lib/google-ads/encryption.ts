import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM. GOOGLE_ADS_TOKEN_ENCRYPTION_KEY must be a 32-byte value,
// hex-encoded (64 hex chars) — generate with `openssl rand -hex 32`.
function getKey(): Buffer {
  const hex = process.env.GOOGLE_ADS_TOKEN_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error("GOOGLE_ADS_TOKEN_ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error(
      "GOOGLE_ADS_TOKEN_ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars)",
    );
  }
  return key;
}

// Packs iv + authTag + ciphertext into one base64 string so only a single
// DB column is needed.
export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptToken(packed: string): string {
  const buf = Buffer.from(packed, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8",
  );
}
