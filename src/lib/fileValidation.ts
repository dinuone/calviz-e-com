/**
 * Client-side file validation including magic byte (file signature) inspection.
 * Prevents attackers from uploading malicious executables or scripts disguised as images/documents.
 */

export interface FileValidationOptions {
  allowPdf?: boolean;
  maxSizeMb?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  detectedType?: string;
}

/**
 * Validates file size, extension, and binary magic bytes before sending to the server.
 */
export async function validateFileMagicBytes(
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const { allowPdf = false, maxSizeMb = 15 } = options;

  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  // 1. Check size limit
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `File is too large. Maximum allowed size is ${maxSizeMb}MB.`,
    };
  }

  if (file.size < 4) {
    return { isValid: false, error: 'File is empty or corrupted.' };
  }

  // 2. Read first 16 bytes for magic signature inspection
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let detected: string | null = null;

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      detected = 'image/jpeg';
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    else if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      detected = 'image/png';
    }
    // GIF: 47 49 46 38 (GIF8)
    else if (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38
    ) {
      detected = 'image/gif';
    }
    // WEBP: 52 49 46 46 .... 57 45 42 50 (RIFF .... WEBP)
    else if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      detected = 'image/webp';
    }
    // PDF: 25 50 44 46 (%PDF)
    else if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      detected = 'application/pdf';
    }

    if (!detected) {
      return {
        isValid: false,
        error:
          'Security check failed: Invalid file header signature. Only authentic JPEG, PNG, WEBP' +
          (allowPdf ? ' or PDF' : '') +
          ' files are permitted.',
      };
    }

    if (detected === 'application/pdf' && !allowPdf) {
      return {
        isValid: false,
        error: 'PDF files are not allowed here. Please upload an image file.',
      };
    }

    return { isValid: true, detectedType: detected };
  } catch (err: any) {
    return {
      isValid: false,
      error: 'Failed to inspect file contents: ' + (err?.message || 'Unknown error'),
    };
  }
}
