// IC Number Generator - Database Version
const { pool } = require('../config/database');

/**
 * Generate next IC number for the given type
 * Uses database sequence table for atomic increment
 * @param {string} typeOfCall - 'Raw Material', 'Process', or 'Final'
 * @returns {Promise<string>} - Generated IC number (e.g., 'RM-IC-2025-0001')
 */
const generateNextICNumber = async (typeOfCall) => {
  const connection = await pool.getConnection();
  
  try {
    // Start transaction for atomic operation
    await connection.beginTransaction();
    
    const currentYear = new Date().getFullYear();
    
    // Get current sequence for this type
    const [rows] = await connection.query(
      'SELECT prefix, current_year, current_sequence FROM ic_number_sequences WHERE type_of_call = ? FOR UPDATE',
      [typeOfCall]
    );
    
    if (rows.length === 0) {
      throw new Error(`IC number sequence not found for type: ${typeOfCall}`);
    }
    
    let { prefix, current_year, current_sequence } = rows[0];
    
    // Check if year has changed - reset sequence
    if (current_year !== currentYear) {
      current_year = currentYear;
      current_sequence = 0;
    }
    
    // Increment sequence
    current_sequence += 1;
    
    // Generate IC number: PREFIX-YEAR-SEQUENCE
    const paddedSequence = String(current_sequence).padStart(4, '0');
    const icNumber = `${prefix}-${current_year}-${paddedSequence}`;

    // Update sequence in database
    await connection.query(
      'UPDATE ic_number_sequences SET current_year = ?, current_sequence = ?, last_generated_ic = ?, updated_at = NOW() WHERE type_of_call = ?',
      [current_year, current_sequence, icNumber, typeOfCall]
    );

    // Commit transaction
    await connection.commit();
    
    console.log(`✅ Generated IC Number: ${icNumber}`);
    return icNumber;
    
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    console.error('❌ Error generating IC number:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Validate IC number format
 * @param {string} icNumber - IC number to validate
 * @returns {boolean} - True if valid format
 */
const validateICNumber = (icNumber) => {
  const pattern = /^(RM-IC|PROC-IC|FINAL-IC)-\d{4}-\d{4}$/;
  return pattern.test(icNumber);
};

/**
 * Parse IC number to extract components
 * @param {string} icNumber - IC number to parse
 * @returns {Object} - { prefix, year, sequence }
 */
const parseICNumber = (icNumber) => {
  if (!validateICNumber(icNumber)) {
    throw new Error('Invalid IC number format');
  }
  
  const parts = icNumber.split('-');
  return {
    prefix: `${parts[0]}-${parts[1]}`,
    year: parseInt(parts[2]),
    sequence: parseInt(parts[3])
  };
};

module.exports = {
  generateNextICNumber,
  validateICNumber,
  parseICNumber
};

