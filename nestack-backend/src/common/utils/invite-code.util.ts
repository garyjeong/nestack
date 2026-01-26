const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters

export function generateInviteCode(length = 8): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}

export function formatInviteCode(code: string): string {
  // Format as XXXX-XXXX
  if (code.length === 8) {
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  }
  return code;
}

export function normalizeInviteCode(code: string): string {
  // Remove dashes and convert to uppercase
  return code.replace(/-/g, '').toUpperCase();
}
