/**
 * Input sanitization for user-generated content.
 * Reduces XSS and invalid data; use before sending to API or displaying.
 */

const MAX_TEXT_LENGTH = 2000;
const MAX_NAME_LENGTH = 200;
const MAX_DOSAGE_LENGTH = 100;
const MAX_NOTES_LENGTH = 1000;

/** Strip HTML/script tags and trim */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

/** Sanitize free-text (notes, etc.): no HTML, bounded length */
export function sanitizeText(
  input: string,
  maxLength: number = MAX_TEXT_LENGTH
): string {
  if (typeof input !== "string") return "";
  return stripHtml(input).slice(0, maxLength);
}

/** Sanitize medication name */
export function sanitizeMedicationName(name: string): string {
  return sanitizeText(name, MAX_NAME_LENGTH);
}

/** Sanitize dosage string */
export function sanitizeDosage(dosage: string): string {
  return sanitizeText(dosage, MAX_DOSAGE_LENGTH);
}

/** Sanitize notes field */
export function sanitizeNotes(notes: string | undefined): string {
  if (notes == null || notes === "") return "";
  return sanitizeText(notes, MAX_NOTES_LENGTH);
}

/** Sanitize time string (HH:MM or HH:MM:SS) */
export function sanitizeTime(value: string): string {
  if (typeof value !== "string") return "";
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return "";
  const [, h, m] = match;
  const hour = Math.min(23, Math.max(0, parseInt(h!, 10)));
  const min = Math.min(59, Math.max(0, parseInt(m!, 10)));
  return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}
