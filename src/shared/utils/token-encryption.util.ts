import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class TokenEncryptionUtil {
  private readonly algorithm = "aes-256-cbc";
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    this.key = crypto.createHash("sha256").update(String(secret)).digest();
  }

  encrypt(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Combine IV and encrypted token, then encode as URL-safe base64
    const combined = `${iv.toString("hex")}:${encrypted}`;
    return Buffer.from(combined).toString("base64url");
  }

  decrypt(encryptedToken: string): string {
    try {
      // Decode from URL-safe base64
      const combined = Buffer.from(encryptedToken, "base64url").toString("utf8");
      const [ivHex, encrypted] = combined.split(":");

      if (!ivHex || !encrypted) {
        throw new Error("Invalid encrypted token format");
      }

      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      // Handle potential errors during decryption (e.g., malformed token)
      throw new Error("Decryption failed");
    }
  }
}
