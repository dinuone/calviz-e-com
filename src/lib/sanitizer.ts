/**
 * Front-end input validation and anti-XSS protection.
 * Detects and blocks malicious scripts, HTML injection, and dangerous pseudo-protocols.
 */

// Patterns indicating script injection, dangerous HTML tags, or event handler exploits
const MALICIOUS_PATTERNS = [
  /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/i,
  /<\s*script[^>]*>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /on(load|error|click|mouseover|focus|blur|change|submit)\s*=/i,
  /<\s*(iframe|object|embed|svg|applet|meta|link|style)[^>]*>/i,
];

// Basic HTML tag detection for strict plain-text fields (names, addresses, phones)
const HTML_TAG_PATTERN = /<[^>]+>/;

/**
 * Checks whether an input contains script payloads or dangerous exploit attempts.
 */
export function containsMaliciousScript(input?: string | null): boolean {
  if (!input || typeof input !== 'string') return false;
  return MALICIOUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Checks whether an input contains any HTML tags.
 */
export function containsHtml(input?: string | null): boolean {
  if (!input || typeof input !== 'string') return false;
  return HTML_TAG_PATTERN.test(input) || containsMaliciousScript(input);
}

/**
 * Validates a plain text field and returns an error message if invalid.
 */
export function validateSafePlainText(value: string | undefined | null, fieldName: string): string | null {
  if (!value) return null;
  if (containsMaliciousScript(value)) {
    return `${fieldName} contains invalid or malicious characters.`;
  }
  if (containsHtml(value)) {
    return `${fieldName} cannot contain HTML formatting or tags.`;
  }
  return null;
}

/**
 * Strips script tags, HTML tags and normalizes spaces for a safer payload.
 */
export function sanitizeInput(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
