import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_ROUNDS = 12;

export class CryptoUtil {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param text Plain text to encrypt
   * @param key Encryption key in hex format (64 characters = 32 bytes)
   * @returns Encrypted string in format: iv:authTag:encrypted
   */
  static encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(key, 'hex'),
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   * @param encryptedData Encrypted string in format: iv:authTag:encrypted
   * @param key Encryption key in hex format (64 characters = 32 bytes)
   * @returns Decrypted plain text
   */
  static decrypt(encryptedData: string, key: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(key, 'hex'),
      iv,
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a random token (for email verification, password reset, etc.)
   * @param length Token length in bytes (default: 32)
   * @returns Random hex string
   */
  static generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string
   * @param length String length
   * @param charset Characters to use
   * @returns Random string
   */
  static generateRandomString(
    length: number,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  ): string {
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset[randomBytes[i] % charset.length];
    }

    return result;
  }
}
