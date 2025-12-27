// ============================================================
// IC NUMBER GENERATOR UTILITY
// ============================================================
// Description: Utility functions for auto-generating Inspection Call Numbers
// Format: {PREFIX}-{YEAR}-{SEQUENCE}
// Examples: RM-IC-2025-0001, PROC-IC-2025-0001, FINAL-IC-2025-0001
// ============================================================

/**
 * IC Number Prefixes for different inspection types
 */
export const IC_PREFIXES = {
  'Raw Material': 'RM-IC',
  'Process': 'PROC-IC',
  'Final': 'FINAL-IC'
};

/**
 * Generate IC Number format
 * @param {string} typeOfCall - Type of inspection call ('Raw Material', 'Process', 'Final')
 * @param {number} sequence - Sequence number
 * @param {number} year - Year (defaults to current year)
 * @returns {string} - Formatted IC number
 */
export const generateICNumber = (typeOfCall, sequence, year = null) => {
  const prefix = IC_PREFIXES[typeOfCall];
  if (!prefix) {
    throw new Error(`Invalid type of call: ${typeOfCall}`);
  }
  
  const currentYear = year || new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(4, '0');
  
  return `${prefix}-${currentYear}-${paddedSequence}`;
};

/**
 * Parse IC Number to extract components
 * @param {string} icNumber - IC number to parse
 * @returns {Object} - Object with prefix, year, and sequence
 */
export const parseICNumber = (icNumber) => {
  const parts = icNumber.split('-');
  
  if (parts.length < 4) {
    throw new Error(`Invalid IC number format: ${icNumber}`);
  }
  
  // Handle both RM-IC and PROC-IC/FINAL-IC formats
  let prefix, year, sequence;
  
  if (parts.length === 4) {
    // Format: RM-IC-2025-0001 or PROC-IC-2025-0001
    prefix = `${parts[0]}-${parts[1]}`;
    year = parseInt(parts[2]);
    sequence = parseInt(parts[3]);
  } else if (parts.length === 5) {
    // Format: FINAL-IC-2025-0001 (if FINAL is separate)
    prefix = `${parts[0]}-${parts[1]}`;
    year = parseInt(parts[2]);
    sequence = parseInt(parts[3]);
  }
  
  return { prefix, year, sequence };
};

/**
 * Get next IC number for a given type
 * This function should be called from the backend API
 * Frontend can use this for display/validation purposes only
 * 
 * @param {string} typeOfCall - Type of inspection call
 * @param {number} currentSequence - Current sequence number from database
 * @returns {string} - Next IC number
 */
export const getNextICNumber = (typeOfCall, currentSequence = 0) => {
  const nextSequence = currentSequence + 1;
  return generateICNumber(typeOfCall, nextSequence);
};

/**
 * Validate IC Number format
 * @param {string} icNumber - IC number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateICNumber = (icNumber) => {
  if (!icNumber || typeof icNumber !== 'string') {
    return false;
  }
  
  // Regex pattern: PREFIX-YEAR-SEQUENCE
  // Examples: RM-IC-2025-0001, PROC-IC-2025-0001, FINAL-IC-2025-0001
  const pattern = /^(RM-IC|PROC-IC|FINAL-IC)-\d{4}-\d{4}$/;
  return pattern.test(icNumber);
};

/**
 * Get type of call from IC number
 * @param {string} icNumber - IC number
 * @returns {string} - Type of call ('Raw Material', 'Process', 'Final')
 */
export const getTypeFromICNumber = (icNumber) => {
  if (!validateICNumber(icNumber)) {
    throw new Error(`Invalid IC number: ${icNumber}`);
  }
  
  if (icNumber.startsWith('RM-IC')) {
    return 'Raw Material';
  } else if (icNumber.startsWith('PROC-IC')) {
    return 'Process';
  } else if (icNumber.startsWith('FINAL-IC')) {
    return 'Final';
  }
  
  throw new Error(`Unknown IC number prefix: ${icNumber}`);
};

/**
 * Compare IC numbers (for sorting)
 * @param {string} icNumber1 - First IC number
 * @param {string} icNumber2 - Second IC number
 * @returns {number} - -1 if icNumber1 < icNumber2, 0 if equal, 1 if icNumber1 > icNumber2
 */
export const compareICNumbers = (icNumber1, icNumber2) => {
  const parsed1 = parseICNumber(icNumber1);
  const parsed2 = parseICNumber(icNumber2);
  
  // Compare by year first
  if (parsed1.year !== parsed2.year) {
    return parsed1.year - parsed2.year;
  }
  
  // Then by sequence
  return parsed1.sequence - parsed2.sequence;
};

/**
 * Format IC number for display
 * @param {string} icNumber - IC number
 * @returns {string} - Formatted IC number with type label
 */
export const formatICNumberForDisplay = (icNumber) => {
  if (!validateICNumber(icNumber)) {
    return icNumber;
  }
  
  const type = getTypeFromICNumber(icNumber);
  return `${icNumber} (${type})`;
};

export default {
  IC_PREFIXES,
  generateICNumber,
  parseICNumber,
  getNextICNumber,
  validateICNumber,
  getTypeFromICNumber,
  compareICNumbers,
  formatICNumberForDisplay
};

