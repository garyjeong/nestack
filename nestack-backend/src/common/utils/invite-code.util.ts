import { CryptoUtil } from './crypto.util';
import { DEFAULTS } from '../constants';

// Exclude similar-looking characters: 0/O, 1/I/L
const INVITE_CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export class InviteCodeUtil {
  /**
   * Generate a 12-character invite code
   * Uses a character set that excludes confusing characters (0/O, 1/I/L)
   * @returns 12-character invite code (e.g., "A3B4C5D6E7F8")
   */
  static generate(): string {
    return CryptoUtil.generateRandomString(
      DEFAULTS.INVITE_CODE_LENGTH,
      INVITE_CODE_CHARSET,
    );
  }

  /**
   * Validate invite code format
   * @param code Invite code to validate
   * @returns true if valid format
   */
  static isValidFormat(code: string): boolean {
    if (!code || code.length !== DEFAULTS.INVITE_CODE_LENGTH) {
      return false;
    }

    const validPattern = new RegExp(`^[${INVITE_CODE_CHARSET}]+$`);
    return validPattern.test(code);
  }

  /**
   * Normalize invite code (uppercase, trim)
   * @param code Invite code to normalize
   * @returns Normalized invite code
   */
  static normalize(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Format invite code for display (add dashes for readability)
   * @param code 12-character invite code
   * @returns Formatted code (e.g., "A3B4-C5D6-E7F8")
   */
  static formatForDisplay(code: string): string {
    if (code.length !== DEFAULTS.INVITE_CODE_LENGTH) {
      return code;
    }
    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
  }

  /**
   * Parse formatted invite code (remove dashes)
   * @param formattedCode Formatted invite code (may contain dashes)
   * @returns Raw 12-character invite code
   */
  static parseFormattedCode(formattedCode: string): string {
    return formattedCode.replace(/-/g, '').toUpperCase();
  }
}
