import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * - Strips all HTML tags
 * - Removes potentially dangerous characters
 * - Enforces maximum length
 */
export function sanitizeInput(
  input: string | null | undefined,
  maxLength: number = 500
): string {
  if (!input) return '';

  // Strip all HTML tags
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  // Trim whitespace
  const trimmed = cleaned.trim();

  // Enforce max length
  if (trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength);
  }

  return trimmed;
}

/**
 * Sanitizes mood note input
 * Max 500 characters
 */
export function sanitizeMoodNote(note: string | null | undefined): string {
  return sanitizeInput(note, 500);
}

/**
 * Sanitizes profile name input
 * Max 100 characters
 */
export function sanitizeProfileName(name: string | null | undefined): string {
  return sanitizeInput(name, 100);
}

/**
 * Validates email format (basic check)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes and validates password
 * - Min 8 characters
 * - Max 100 characters
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Şifre en az 8 karakter olmalıdır' };
  }
  
  if (password.length > 100) {
    return { valid: false, error: 'Şifre çok uzun' };
  }

  return { valid: true };
}
