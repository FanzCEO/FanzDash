/**
 * FanzDash ID Generator
 * Generates unique FanzIDs for all users in the system
 * Format: FZ-YYYY-XXXXXX (e.g., FZ-2025-123456)
 */

let idCounter = 100000; // Starting counter for unique IDs

/**
 * Generates a unique FanzID for a new user
 * @returns Promise<string> - The generated FanzID
 */
export async function generateFanzId(): Promise<string> {
  const year = new Date().getFullYear();
  const uniqueNumber = idCounter++;

  // Format: FZ-YYYY-XXXXXX
  const fanzId = `FZ-${year}-${uniqueNumber.toString().padStart(6, "0")}`;

  return fanzId;
}

/**
 * Validates a FanzID format
 * @param fanzId - The FanzID to validate
 * @returns boolean - Whether the FanzID is valid
 */
export function validateFanzId(fanzId: string): boolean {
  const fanzIdPattern = /^FZ-\d{4}-\d{6}$/;
  return fanzIdPattern.test(fanzId);
}

/**
 * Extracts year from FanzID
 * @param fanzId - The FanzID to parse
 * @returns number - The year the ID was created
 */
export function getFanzIdYear(fanzId: string): number {
  if (!validateFanzId(fanzId)) {
    throw new Error("Invalid FanzID format");
  }

  const parts = fanzId.split("-");
  return parseInt(parts[1], 10);
}

/**
 * Gets the sequential number from FanzID
 * @param fanzId - The FanzID to parse
 * @returns number - The sequential number
 */
export function getFanzIdNumber(fanzId: string): number {
  if (!validateFanzId(fanzId)) {
    throw new Error("Invalid FanzID format");
  }

  const parts = fanzId.split("-");
  return parseInt(parts[2], 10);
}
