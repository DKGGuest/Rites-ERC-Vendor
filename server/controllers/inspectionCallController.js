// Inspection Call Controller - Handles all inspection call operations
const { pool } = require('../config/database');
const { generateNextICNumber } = require('../utils/icNumberGenerator');

/**
 * Create Raw Material Inspection Call
 */
const createRMInspectionCall = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const data = req.body;

    console.log('📥 Received RM Inspection Call request');
    console.log('📋 Data:', JSON.stringify(data, null, 2));

    // Generate IC Number
    const icNumber = await generateNextICNumber('Raw Material');
    console.log('🔢 Generated IC Number:', icNumber);

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value) => {
      if (value === '' || value === undefined || value === null) return null;
      return value;
    };

    // Helper function to convert to number or null
    const toNumberOrNull = (value) => {
      if (value === '' || value === undefined || value === null) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    // Insert into inspection_calls table
    const [result] = await connection.query(
      `INSERT INTO inspection_calls
       (ic_number, po_no, po_serial_no, type_of_call, desired_inspection_date,
        company_id, company_name, unit_id, unit_name, unit_address,
        remarks, status, created_at, updated_at)
       VALUES (?, ?, ?, 'Raw Material', ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
      [
        icNumber,
        data.po_no || 'N/A',
        data.po_serial_no || '001',
        data.desired_inspection_date || new Date().toISOString().split('T')[0],
        data.company_id || 1,
        data.company_name || 'Default Company',
        data.unit_id || 1,
        data.unit_name || 'Default Unit',
        toNullIfEmpty(data.unit_address),
        toNullIfEmpty(data.rm_remarks)
      ]
    );

    const inspectionCallId = result.insertId;
    console.log('✅ Inspection call created with ID:', inspectionCallId);

    // Prepare heat numbers (comma-separated from rm_heat_tc_mapping)
    let heatNumbers = '';
    if (data.rm_heat_tc_mapping && Array.isArray(data.rm_heat_tc_mapping) && data.rm_heat_tc_mapping.length > 0) {
      heatNumbers = data.rm_heat_tc_mapping.map(h => h.heatNumber).filter(Boolean).join(', ');
    }

    // Get first TC info from rm_heat_tc_mapping (for backward compatibility)
    const firstHeatTC = data.rm_heat_tc_mapping && data.rm_heat_tc_mapping.length > 0 ? data.rm_heat_tc_mapping[0] : {};

    // Insert into rm_inspection_details table
    const [rmResult] = await connection.query(
      `INSERT INTO rm_inspection_details
       (ic_id, item_description, item_quantity, consignee_zonal_railway,
        heat_numbers, tc_number, tc_date, tc_quantity, manufacturer,
        supplier_name, supplier_address, invoice_number, invoice_date,
        sub_po_number, sub_po_date, sub_po_qty,
        total_offered_qty_mt, offered_qty_erc, unit_of_measurement,
        rate_of_material, rate_of_gst, base_value_po, total_po)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inspectionCallId,
        toNullIfEmpty(data.po_description) || toNullIfEmpty(data.item_description) || 'N/A',
        toNumberOrNull(data.po_qty) || toNumberOrNull(data.item_quantity) || 0,
        toNullIfEmpty(data.consignee_zonal_railway),
        heatNumbers || 'N/A',
        toNullIfEmpty(firstHeatTC.tcNumber) || 'N/A',
        toNullIfEmpty(firstHeatTC.tcDate),
        toNumberOrNull(data.rm_total_offered_qty_mt) || toNumberOrNull(firstHeatTC.offeredQty),
        toNullIfEmpty(firstHeatTC.manufacturer),
        toNullIfEmpty(data.supplier_name),
        toNullIfEmpty(data.supplier_address),
        toNullIfEmpty(firstHeatTC.invoiceNo),
        toNullIfEmpty(firstHeatTC.invoiceDate),
        toNullIfEmpty(data.sub_po_number),
        toNullIfEmpty(data.sub_po_date),
        toNumberOrNull(data.sub_po_qty),
        toNumberOrNull(data.rm_total_offered_qty_mt) || 0,
        toNumberOrNull(data.rm_offered_qty_erc) || 0,
        toNullIfEmpty(data.unit_of_measurement) || 'MT',
        toNumberOrNull(data.rate_of_material),
        toNumberOrNull(data.rate_of_gst),
        toNumberOrNull(data.base_value_po),
        toNumberOrNull(data.total_po)
      ]
    );

    const rmDetailId = rmResult.insertId;
    console.log('✅ RM inspection details created with ID:', rmDetailId);

    // Insert heat-wise quantities from rm_heat_tc_mapping
    if (data.rm_heat_tc_mapping && Array.isArray(data.rm_heat_tc_mapping) && data.rm_heat_tc_mapping.length > 0) {
      for (const heatTC of data.rm_heat_tc_mapping) {
        if (heatTC.heatNumber) {
          await connection.query(
            `INSERT INTO rm_heat_quantities
             (rm_detail_id, heat_number, manufacturer, offered_qty, tc_number, tc_date, tc_quantity)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              rmDetailId,
              toNullIfEmpty(heatTC.heatNumber),
              toNullIfEmpty(heatTC.manufacturer),
              toNumberOrNull(heatTC.offeredQty) || 0,
              toNullIfEmpty(heatTC.tcNumber),
              toNullIfEmpty(heatTC.tcDate),
              toNumberOrNull(heatTC.offeredQty)
            ]
          );
        }
      }
      console.log(`✅ Inserted ${data.rm_heat_tc_mapping.length} heat quantities`);
    }

    // Insert chemical analysis data if provided
    if (data.rm_heat_tc_mapping && Array.isArray(data.rm_heat_tc_mapping)) {
      for (const heatTC of data.rm_heat_tc_mapping) {
        // Check if chemical data exists for this heat
        const hasChemicalData =
          data.rm_chemical_carbon || data.rm_chemical_manganese ||
          data.rm_chemical_silicon || data.rm_chemical_sulphur ||
          data.rm_chemical_phosphorus || data.rm_chemical_chromium;

        if (heatTC.heatNumber && hasChemicalData) {
          await connection.query(
            `INSERT INTO rm_chemical_analysis
             (rm_detail_id, heat_number, carbon, manganese, silicon, sulphur, phosphorus, chromium)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              rmDetailId,
              toNullIfEmpty(heatTC.heatNumber),
              toNumberOrNull(data.rm_chemical_carbon),
              toNumberOrNull(data.rm_chemical_manganese),
              toNumberOrNull(data.rm_chemical_silicon),
              toNumberOrNull(data.rm_chemical_sulphur),
              toNumberOrNull(data.rm_chemical_phosphorus),
              toNumberOrNull(data.rm_chemical_chromium)
            ]
          );
        }
      }
      console.log('✅ Chemical analysis data inserted');
    }

    await connection.commit();
    console.log('✅ Transaction committed successfully');

    res.status(201).json({
      success: true,
      message: 'Raw Material Inspection Call created successfully',
      data: {
        ic_number: icNumber,
        inspection_call_id: inspectionCallId
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating RM inspection call:', error);
    console.error('📋 Request data received:', JSON.stringify(req.body, null, 2));
    console.error('🔍 SQL Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create inspection call',
      error: error.message,
      sqlError: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.sql : undefined
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all inspection calls with filters
 */
const getAllInspectionCalls = async (req, res) => {
  try {
    const { type_of_call, status, po_no } = req.query;
    
    let query = 'SELECT * FROM inspection_calls WHERE 1=1';
    const params = [];
    
    if (type_of_call) {
      query += ' AND type_of_call = ?';
      params.push(type_of_call);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (po_no) {
      query += ' AND po_no = ?';
      params.push(po_no);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching inspection calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection calls',
      error: error.message
    });
  }
};

/**
 * Get inspection call by IC Number
 */
const getInspectionCallByICNumber = async (req, res) => {
  try {
    const { icNumber } = req.params;
    
    // Get main inspection call
    const [calls] = await pool.query(
      'SELECT * FROM inspection_calls WHERE ic_number = ?',
      [icNumber]
    );
    
    if (calls.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inspection call not found'
      });
    }
    
    const inspectionCall = calls[0];
    
    // Get type-specific details based on type_of_call
    if (inspectionCall.type_of_call === 'Raw Material') {
      const [rmDetails] = await pool.query(
        'SELECT * FROM rm_inspection_details WHERE ic_number = ?',
        [icNumber]
      );
      
      const [heatQuantities] = await pool.query(
        'SELECT * FROM rm_heat_quantities WHERE ic_number = ?',
        [icNumber]
      );
      
      inspectionCall.rm_details = rmDetails[0] || null;
      inspectionCall.heat_quantities = heatQuantities;
    }
    
    res.json({
      success: true,
      data: inspectionCall
    });
    
  } catch (error) {
    console.error('Error fetching inspection call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection call',
      error: error.message
    });
  }
};

/**
 * Create Process Inspection Call
 */
const createProcessInspectionCall = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const data = req.body;

    console.log('📥 Received Process Inspection Call request');
    console.log('📋 Data:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.rm_ic_number) {
      return res.status(400).json({
        success: false,
        message: 'RM IC Number is required'
      });
    }

    if (!data.heat_number) {
      return res.status(400).json({
        success: false,
        message: 'Heat Number is required'
      });
    }

    if (!data.lot_number) {
      return res.status(400).json({
        success: false,
        message: 'Lot Number is required'
      });
    }

    if (!data.offered_qty || data.offered_qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Offered Quantity must be greater than 0'
      });
    }

    // Get RM IC details
    const [rmICRows] = await connection.query(
      `SELECT ic.*, rm.manufacturer, rm.heat_numbers, rm.offered_qty_erc
       FROM inspection_calls ic
       LEFT JOIN rm_inspection_details rm ON ic.id = rm.ic_id
       WHERE ic.ic_number = ? AND ic.type_of_call = 'Raw Material' AND ic.status = 'Approved'`,
      [data.rm_ic_number]
    );

    if (rmICRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'RM IC not found or not approved'
      });
    }

    const rmIC = rmICRows[0];

    // Get heat quantity details from RM IC
    const [heatRows] = await connection.query(
      `SELECT hq.heat_number, hq.manufacturer, hq.qty_accepted, hq.offered_qty
       FROM rm_heat_quantities hq
       JOIN rm_inspection_details rm ON hq.rm_detail_id = rm.id
       WHERE rm.ic_id = ? AND hq.heat_number = ?`,
      [rmIC.id, data.heat_number]
    );

    if (heatRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Heat number not found in the selected RM IC'
      });
    }

    const heatData = heatRows[0];

    // Validate offered quantity doesn't exceed accepted quantity from RM
    if (data.offered_qty > heatData.qty_accepted) {
      return res.status(400).json({
        success: false,
        message: `Offered quantity (${data.offered_qty}) cannot exceed accepted quantity from RM inspection (${heatData.qty_accepted})`
      });
    }

    // Generate IC Number
    const icNumber = await generateNextICNumber('Process');
    console.log('🔢 Generated IC Number:', icNumber);

    // Create manufacturer_heat format
    const manufacturerHeat = `${heatData.manufacturer} - ${data.heat_number}`;

    // Insert into inspection_calls table
    const [result] = await connection.query(
      `INSERT INTO inspection_calls
       (ic_number, po_no, po_serial_no, type_of_call, desired_inspection_date,
        company_id, company_name, unit_id, unit_name, unit_address,
        remarks, status, created_at, updated_at)
       VALUES (?, ?, ?, 'Process', ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
      [
        icNumber,
        rmIC.po_no,
        rmIC.po_serial_no,
        data.desired_inspection_date || new Date().toISOString().split('T')[0],
        rmIC.company_id,
        rmIC.company_name,
        rmIC.unit_id,
        rmIC.unit_name,
        rmIC.unit_address,
        data.remarks || null
      ]
    );

    const inspectionCallId = result.insertId;
    console.log('✅ Process Inspection call created with ID:', inspectionCallId);

    // Insert into process_inspection_details table
    await connection.query(
      `INSERT INTO process_inspection_details
       (ic_id, rm_ic_id, rm_ic_number, lot_number, heat_number, manufacturer,
        manufacturer_heat, offered_qty, total_accepted_qty_rm,
        company_id, company_name, unit_id, unit_name, unit_address,
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        inspectionCallId,
        rmIC.id,
        data.rm_ic_number,
        data.lot_number,
        data.heat_number,
        heatData.manufacturer,
        manufacturerHeat,
        data.offered_qty,
        heatData.qty_accepted,
        rmIC.company_id,
        rmIC.company_name,
        rmIC.unit_id,
        rmIC.unit_name,
        rmIC.unit_address
      ]
    );

    // Insert into process_rm_ic_mapping table
    await connection.query(
      `INSERT INTO process_rm_ic_mapping
       (process_ic_id, rm_ic_id, rm_ic_number, heat_number, manufacturer,
        rm_qty_accepted, rm_ic_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        inspectionCallId,
        rmIC.id,
        data.rm_ic_number,
        data.heat_number,
        heatData.manufacturer,
        heatData.qty_accepted,
        rmIC.actual_inspection_date || rmIC.desired_inspection_date
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Process Inspection Call created successfully',
      data: {
        ic_number: icNumber,
        inspection_call_id: inspectionCallId,
        rm_ic_number: data.rm_ic_number,
        lot_number: data.lot_number,
        heat_number: data.heat_number,
        manufacturer: heatData.manufacturer,
        offered_qty: data.offered_qty
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating Process inspection call:', error);
    console.error('📋 Request data received:', req.body);
    console.error('🔍 SQL Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create Process inspection call',
      error: error.message,
      sqlError: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.sql : undefined
    });
  } finally {
    connection.release();
  }
};

/**
 * Create Final Inspection Call
 */
const createFinalInspectionCall = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const data = req.body;

    console.log('📥 Received Final Inspection Call request');
    console.log('📋 Data:', JSON.stringify(data, null, 2));

    // Generate IC Number
    const icNumber = await generateNextICNumber('Final');
    console.log('🔢 Generated IC Number:', icNumber);

    // Insert into inspection_calls table
    const [result] = await connection.query(
      `INSERT INTO inspection_calls
       (ic_number, po_no, po_serial_no, type_of_call, desired_inspection_date,
        company_id, unit_id, unit_address, status, created_at, updated_at)
       VALUES (?, ?, ?, 'Final', ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
      [
        icNumber,
        data.po_no,
        data.po_serial_no || null,
        data.desired_inspection_date,
        data.company_id,
        data.unit_id,
        data.unit_address
      ]
    );

    const inspectionCallId = result.insertId;

    // Insert into final_inspection_details table
    await connection.query(
      `INSERT INTO final_inspection_details
       (inspection_call_id, ic_number, final_total_erc_qty, final_hdpe_bags, final_remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [
        inspectionCallId,
        icNumber,
        data.final_total_erc_qty,
        data.final_hdpe_bags || null,
        data.final_remarks || null
      ]
    );

    // Insert lot details
    if (data.lot_details && Array.isArray(data.lot_details)) {
      for (const lot of data.lot_details) {
        await connection.query(
          `INSERT INTO final_inspection_lot_details
           (inspection_call_id, ic_number, lot_number, manufacturer_heat, offered_qty_erc)
           VALUES (?, ?, ?, ?, ?)`,
          [
            inspectionCallId,
            icNumber,
            lot.lot_number,
            lot.manufacturer_heat,
            lot.offered_qty_erc
          ]
        );
      }
    }

    // Insert Process IC mappings
    if (data.process_ic_numbers && Array.isArray(data.process_ic_numbers)) {
      for (const processIcNumber of data.process_ic_numbers) {
        await connection.query(
          `INSERT INTO final_process_ic_mapping
           (final_ic_number, process_ic_number)
           VALUES (?, ?)`,
          [icNumber, processIcNumber]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Final Inspection Call created successfully',
      data: {
        ic_number: icNumber,
        inspection_call_id: inspectionCallId
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating Final inspection call:', error);
    console.error('📋 Request data received:', data);
    console.error('🔍 SQL Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create Final inspection call',
      error: error.message,
      sqlError: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.sql : undefined
    });
  } finally {
    connection.release();
  }
};

/**
 * Get approved RM inspection calls for a specific PO
 */
const getApprovedRMInspectionCalls = async (req, res) => {
  try {
    const { po_no, po_serial_no } = req.query;

    let query = `
      SELECT
        ic.id,
        ic.ic_number,
        ic.po_no,
        ic.po_serial_no,
        ic.company_id,
        ic.company_name,
        ic.unit_id,
        ic.unit_name,
        ic.unit_address,
        ic.status,
        ic.created_at,
        rm.heat_numbers,
        rm.total_offered_qty_mt,
        rm.offered_qty_erc,
        rm.manufacturer
      FROM inspection_calls ic
      LEFT JOIN rm_inspection_details rm ON ic.id = rm.ic_id
      WHERE ic.type_of_call = 'Raw Material'
      AND ic.status = 'Approved'
    `;

    const params = [];

    if (po_no) {
      query += ' AND ic.po_no = ?';
      params.push(po_no);
    }

    if (po_serial_no) {
      query += ' AND ic.po_serial_no = ?';
      params.push(po_serial_no);
    }

    query += ' ORDER BY ic.created_at DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('Error fetching approved RM inspection calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved RM inspection calls',
      error: error.message
    });
  }
};

/**
 * Get approved Process inspection calls for a specific PO
 */
const getApprovedProcessInspectionCalls = async (req, res) => {
  try {
    const { po_no } = req.query;

    const [rows] = await pool.query(
      `SELECT ic.*, proc.*
       FROM inspection_calls ic
       LEFT JOIN process_inspection_details proc ON ic.ic_number = proc.ic_number
       WHERE ic.type_of_call = 'Process'
       AND ic.status = 'Approved'
       AND ic.po_no = ?
       ORDER BY ic.created_at DESC`,
      [po_no]
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('Error fetching approved Process inspection calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved Process inspection calls',
      error: error.message
    });
  }
};

/**
 * Get heat numbers from approved RM inspection call
 */
const getHeatNumbersFromRMIC = async (req, res) => {
  try {
    const { rm_ic_number } = req.params;

    // Get the IC ID first
    const [icRows] = await pool.query(
      'SELECT id FROM inspection_calls WHERE ic_number = ?',
      [rm_ic_number]
    );

    if (icRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'RM IC not found'
      });
    }

    const icId = icRows[0].id;

    // Get RM detail ID
    const [rmRows] = await pool.query(
      'SELECT id FROM rm_inspection_details WHERE ic_id = ?',
      [icId]
    );

    if (rmRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'RM details not found'
      });
    }

    const rmDetailId = rmRows[0].id;

    // Get heat quantities with accepted quantities
    const [heatRows] = await pool.query(
      `SELECT
        heat_number,
        manufacturer,
        offered_qty,
        qty_accepted,
        qty_rejected,
        tc_number,
        tc_date
       FROM rm_heat_quantities
       WHERE rm_detail_id = ? AND qty_accepted > 0
       ORDER BY manufacturer, heat_number`,
      [rmDetailId]
    );

    res.json({
      success: true,
      data: heatRows,
      count: heatRows.length
    });

  } catch (error) {
    console.error('Error fetching heat numbers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heat numbers',
      error: error.message
    });
  }
};

/**
 * Get approved RM inspection calls with heat details for a specific PO
 * This is used in the vendor dashboard to show approved RM ICs
 */
const getApprovedRMICsWithHeatDetails = async (req, res) => {
  try {
    const { po_no } = req.query;

    if (!po_no) {
      return res.status(400).json({
        success: false,
        message: 'PO Number is required'
      });
    }

    // Get approved RM ICs with heat details
    const [rows] = await pool.query(
      `SELECT
        ic.id,
        ic.ic_number,
        ic.po_no,
        ic.po_serial_no,
        ic.company_id,
        ic.company_name,
        ic.unit_id,
        ic.unit_name,
        ic.unit_address,
        ic.status,
        ic.actual_inspection_date,
        ic.desired_inspection_date,
        ic.created_at,
        rm.heat_numbers,
        rm.total_offered_qty_mt,
        rm.offered_qty_erc,
        rm.manufacturer,
        GROUP_CONCAT(
          CONCAT(hq.heat_number, '|', hq.manufacturer, '|', hq.qty_accepted, '|', hq.offered_qty)
          SEPARATOR ';;'
        ) as heat_details
      FROM inspection_calls ic
      LEFT JOIN rm_inspection_details rm ON ic.id = rm.ic_id
      LEFT JOIN rm_heat_quantities hq ON rm.id = hq.rm_detail_id
      WHERE ic.type_of_call = 'Raw Material'
      AND ic.status = 'Approved'
      AND ic.po_no = ?
      GROUP BY ic.id, ic.ic_number, ic.po_no, ic.po_serial_no,
               ic.company_id, ic.company_name, ic.unit_id, ic.unit_name,
               ic.unit_address, ic.status, ic.actual_inspection_date,
               ic.desired_inspection_date, ic.created_at,
               rm.heat_numbers, rm.total_offered_qty_mt, rm.offered_qty_erc, rm.manufacturer
      ORDER BY ic.created_at DESC`,
      [po_no]
    );

    // Parse heat details
    const parsedRows = rows.map(row => {
      const heatDetailsArray = [];
      if (row.heat_details) {
        const heatParts = row.heat_details.split(';;');
        heatParts.forEach(part => {
          const [heat_number, manufacturer, qty_accepted, offered_qty] = part.split('|');
          heatDetailsArray.push({
            heat_number,
            manufacturer,
            qty_accepted: parseInt(qty_accepted) || 0,
            offered_qty: parseFloat(offered_qty) || 0
          });
        });
      }

      return {
        ...row,
        heat_details_parsed: heatDetailsArray
      };
    });

    res.json({
      success: true,
      data: parsedRows,
      count: parsedRows.length
    });

  } catch (error) {
    console.error('Error fetching approved RM ICs with heat details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved RM ICs',
      error: error.message
    });
  }
};

module.exports = {
  createRMInspectionCall,
  createProcessInspectionCall,
  createFinalInspectionCall,
  getAllInspectionCalls,
  getInspectionCallByICNumber,
  getApprovedRMInspectionCalls,
  getApprovedProcessInspectionCalls,
  getHeatNumbersFromRMIC,
  getApprovedRMICsWithHeatDetails
};

