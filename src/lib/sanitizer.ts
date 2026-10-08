/**
 * Front-end input validation, anti-XSS, anti-SQL Injection, and anti-traversal protection.
 * Detects and blocks malicious scripts, SQL injection patterns, HTML tags, path traversal, and invalid phone numbers.
 * Includes pre-decoding (URL and HTML entity decoding) to thwart obfuscation and bypass attempts.
 */

// Patterns indicating SQL injection attempts or dangerous database manipulation
const SQL_INJECTION_PATTERNS = [
  /\b(union([\s\/\*]+all)?[\s\/\*]+select)\b/i,
  /\b(select[\s\/\*]+.+[\s\/\*]+from)\b/i,
  /\b(insert[\s\/\*]+into.+values)\b/i,
  /\b(delete[\s\/\*]+from)\b/i,
  /\b(drop[\s\/\*]+(table|database|schema|procedure|view))\b/i,
  /\b(alter[\s\/\*]+(table|database))\b/i,
  /\b(truncate[\s\/\*]+table)\b/i,
  /\b(exec(\s+|(ute\s+))\b|execute\s*immediate)/i,
  /\b(xp_cmdshell|sp_executesql)\b/i,
  /--/,
  /\/\*[\s\S]*?\*\//,
  /;\s*(drop|delete|insert|update|select|truncate)\b/i,
  /('|"|`)\s*or\s*('|"|`)?(\d+|\w+)('|"|`)?\s*=\s*('|"|`)?\3/i,
  /('|"|`)\s*or\s*('|"|`)?1('|"|`)?\s*=\s*('|"|`)?1/i,
  /\b(sleep|benchmark)\s*\(/i,
  /\b(information_schema|pg_catalog|sys\.tables|sqlite_master)\b/i,
];

// Patterns indicating script injection, dangerous HTML tags, or event handler exploits
const MALICIOUS_PATTERNS = [
  /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/i,
  /<\s*script[^>]*>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\bon[a-z]{3,24}\s*=/i,
  /<\s*(iframe|object|embed|svg|applet|meta|link|style|base|form|input|button|details|marquee|template)[^>]*>/i,
  /\beval\s*\(/i,
  /\bexpression\s*\(/i,
  /\b(document|window)\.(location|cookie|write)\b/i,
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /[\/\\]\.\./,
  /%2e%2e/i,
  /\.\.%2f/i,
  /%2f\.\./i,
  /\.\.%5c/i,
  /%5c\.\./i,
];

// Basic OS command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`]\s*(cat|ls|rm|chmod|chown|wget|curl|nc|bash|sh|powershell|cmd)\b/i,
  /\$\([^\)]+\)/,
];

// Basic HTML tag detection for strict plain-text fields (names, addresses, phones)
const HTML_TAG_PATTERN = /<[^>]+>/;

// Strict Sri Lankan 9-digit mobile regex (subscriber part: 7XXXXXXXX)
// Matches: 771234567, 0771234567, +94771234567, 94771234567
const LK_MOBILE_REGEX = /^(?:(?:\+?94|0)?)(7[0-9]{8})$/;

// Dangerous characters for phone inputs
const PHONE_DANGEROUS_CHARS = /[<>'"`\\;=\/]/;

/**
 * Pre-decodes URL and HTML-entity encoded variants to prevent evasion/obfuscation.
 */
function getDecodedVariants(input: string): string[] {
  const variants = [input];

  try {
    const urlDecoded = decodeURIComponent(input);
    if (urlDecoded !== input) {
      variants.push(urlDecoded);
      try {
        const doubleDecoded = decodeURIComponent(urlDecoded);
        if (doubleDecoded !== urlDecoded && !variants.includes(doubleDecoded)) {
          variants.push(doubleDecoded);
        }
      } catch {
        // ignore malformed double decode
      }
    }
  } catch {
    // ignore malformed URI
  }

  // HTML entity decode basic tokens
  for (const v of [...variants]) {
    const htmlDecoded = v
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, "&")
      .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch {
          return _;
        }
      })
      .replace(/&#([0-9]+);?/gi, (_, dec) => {
        try {
          return String.fromCharCode(parseInt(dec, 10));
        } catch {
          return _;
        }
      });

    if (!variants.includes(htmlDecoded)) {
      variants.push(htmlDecoded);
    }
  }

  return variants;
}

/**
 * Checks whether an input contains SQL injection patterns (including encoded variants).
 */
export function containsSqlInjection(input?: string | null): boolean {
  if (!input || typeof input !== "string") return false;
  const variants = getDecodedVariants(input);
  return variants.some((v) => SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(v)));
}

/**
 * Checks whether an input contains script payloads or dangerous exploit attempts.
 */
export function containsMaliciousScript(input?: string | null): boolean {
  if (!input || typeof input !== "string") return false;
  const variants = getDecodedVariants(input);
  return variants.some((v) => MALICIOUS_PATTERNS.some((pattern) => pattern.test(v)));
}

/**
 * Checks whether an input contains path traversal attempts (../, ..\, %2e%2e).
 */
export function containsPathTraversal(input?: string | null): boolean {
  if (!input || typeof input !== "string") return false;
  const variants = getDecodedVariants(input);
  return variants.some((v) => PATH_TRAVERSAL_PATTERNS.some((pattern) => pattern.test(v)));
}

/**
 * Checks whether an input contains command injection attempts.
 */
export function containsCommandInjection(input?: string | null): boolean {
  if (!input || typeof input !== "string") return false;
  const variants = getDecodedVariants(input);
  return variants.some((v) => COMMAND_INJECTION_PATTERNS.some((pattern) => pattern.test(v)));
}

/**
 * High-level check for any malicious payload (XSS, SQLi, traversal, command injection).
 */
export function containsMaliciousPayload(input?: string | null): boolean {
  if (!input || typeof input !== "string") return false;
  return (
    containsMaliciousScript(input) ||
    containsSqlInjection(input) ||
    containsPathTraversal(input) ||
    containsCommandInjection(input)
  );
}

/**
 * Checks whether an input contains any HTML tags.
 */
export function containsHtml(input?: string | null): boolean {
  if (!input || typeof input !== "string") return false;
  const variants = getDecodedVariants(input);
  return variants.some((v) => HTML_TAG_PATTERN.test(v) || containsMaliciousScript(v));
}

/**
 * Validates Sri Lankan mobile numbers strictly:
 * Must be 9 subscriber digits starting with 7 (e.g. 771234567 or 0771234567 or +94771234567).
 */
export function validateSriLankanMobile(phone?: string | null): {
  isValid: boolean;
  normalized: string;
  formatted: string;
  error?: string;
} {
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return {
      isValid: false,
      normalized: "",
      formatted: "",
      error: "Mobile number is required.",
    };
  }

  const trimmed = phone.trim();

  // Reject malicious characters and payloads
  if (
    PHONE_DANGEROUS_CHARS.test(trimmed) ||
    containsSqlInjection(trimmed) ||
    containsMaliciousScript(trimmed) ||
    containsPathTraversal(trimmed)
  ) {
    return {
      isValid: false,
      normalized: "",
      formatted: "",
      error: "Mobile number contains invalid or malicious characters.",
    };
  }

  // Remove spaces, hyphens, and parentheses for matching
  const cleanDigits = trimmed.replace(/[\s\-\(\)\.]/g, "");

  const match = cleanDigits.match(LK_MOBILE_REGEX);
  if (!match) {
    return {
      isValid: false,
      normalized: "",
      formatted: "",
      error: "Please enter a valid 9-digit mobile number starting with 7 (e.g. 77 XXX XXXX or 077 XXX XXXX).",
    };
  }

  const subscriberDigits = match[1]; // Exactly 9 digits, starting with 7
  return {
    isValid: true,
    normalized: `0${subscriberDigits}`,
    formatted: `+94 ${subscriberDigits.substring(0, 2)} ${subscriberDigits.substring(2, 5)} ${subscriberDigits.substring(5)}`,
  };
}

/**
 * Validates a plain text field and returns an error message if invalid (XSS, SQLi, HTML tags, traversal).
 */
export function validateSafePlainText(
  value: string | undefined | null,
  fieldName: string
): string | null {
  if (!value || typeof value !== "string") return null;

  if (containsMaliciousScript(value)) {
    return `${fieldName} contains prohibited or malicious script code.`;
  }

  if (containsSqlInjection(value)) {
    return `${fieldName} contains prohibited database query syntax.`;
  }

  if (containsPathTraversal(value)) {
    return `${fieldName} contains prohibited path navigation sequences.`;
  }

  if (containsHtml(value)) {
    return `${fieldName} cannot contain HTML tags or formatting.`;
  }

  return null;
}

/**
 * Validates general text (like messages or reviews) preventing scripts, SQLi, and path traversal.
 */
export function validateSafeTextInput(
  value: string | undefined | null,
  fieldName: string
): string | null {
  if (!value || typeof value !== "string") return null;

  if (containsMaliciousScript(value)) {
    return `${fieldName} contains prohibited or malicious script code.`;
  }

  if (containsSqlInjection(value)) {
    return `${fieldName} contains prohibited database query syntax.`;
  }

  if (containsPathTraversal(value)) {
    return `${fieldName} contains prohibited path navigation sequences.`;
  }

  return null;
}

/**
 * Strips script tags, HTML tags, dangerous SQL constructs, and normalizes spaces.
 */
export function sanitizeInput(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/['"`]/g, "")
    .replace(/--/g, "")
    .trim();
}
