// ============================================================
// INVENTORY SERVICE
// ============================================================
// Description: API service for managing inventory entries
// Handles CRUD operations for vendor inventory management
// ============================================================

import httpClient from './httpClient';
import { getStoredUser } from '../services/authService';


/**
 * Inventory Service
 * Provides methods for creating and fetching inventory entries
 */
const inventoryService = {
  
  /**
   * Create a new inventory entry
   * @param {Object} inventoryData - Inventory entry data from form
   * @returns {Promise<Object>} - API response with created inventory entry
   */
  createInventoryEntry: async (inventoryData) => {
    const user = getStoredUser();
    try {
      console.log('📥 Inventory data received:', inventoryData);

      // Transform frontend data structure to match backend DTO
      const transformedData = {
        vendorCode: inventoryData.vendorCode || user.userName, // Default vendor code
        vendorName: inventoryData.vendorName || 'Default Vendor',
        companyId: inventoryData.companyId ? parseInt(inventoryData.companyId) : null,
        companyName: inventoryData.companyName || '',
        supplierName: inventoryData.supplierName,
        unitName: inventoryData.unitName,
        supplierAddress: inventoryData.supplierAddress || '',
        rawMaterial: inventoryData.rawMaterial,
        gradeSpecification: inventoryData.gradeSpecification,
        lengthOfBars: inventoryData.lengthOfBars ? parseFloat(inventoryData.lengthOfBars) : null,
        heatNumber: inventoryData.heatNumber,
        tcNumber: inventoryData.tcNumber,
        tcDate: inventoryData.tcDate, // Format: yyyy-MM-dd
        tcQuantity: inventoryData.declaredQuantity ? parseFloat(inventoryData.declaredQuantity) : 0,
        subPoNumber: inventoryData.subPoNumber,
        subPoDate: inventoryData.subPoDate, // Format: yyyy-MM-dd
        subPoQty: inventoryData.subPoQty ? parseFloat(inventoryData.subPoQty) : 0,
        invoiceNumber: inventoryData.invoiceNumber,
        invoiceDate: inventoryData.invoiceDate, // Format: yyyy-MM-dd
        unitOfMeasurement: inventoryData.unitOfMeasurement,
        rateOfMaterial: inventoryData.rateOfMaterial ? parseFloat(inventoryData.rateOfMaterial) : 0,
        rateOfGst: inventoryData.rateOfGst ? parseFloat(inventoryData.rateOfGst) : 0,
        baseValuePo: inventoryData.baseValuePO ? parseFloat(inventoryData.baseValuePO) : 0,
        totalPo: inventoryData.totalPO ? parseFloat(inventoryData.totalPO) : 0
      };

      console.log('📤 Transformed data for backend:', transformedData);

      // Make API call to backend
      const response = await httpClient.post('/vendor/inventory/entries', transformedData);

      console.log('✅ Backend response:', response);

      // Check if response has the expected structure
      // Backend returns statusCode: 0 for success
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Inventory entry created successfully'
        };
      } else {
        throw new Error('Unexpected response format from backend');
      }

    } catch (error) {
      console.error('❌ Error creating inventory entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to create inventory entry',
        details: error.response?.data || error
      };
    }
  },

  /**
   * Get all inventory entries for a vendor
   * @param {String} vendorCode - Vendor code to fetch entries for
   * @returns {Promise<Object>} - API response with list of inventory entries
   */
  getInventoryEntries: async (vendorCode) => {
    try {
      console.log('📥 Fetching inventory entries for vendor:', vendorCode);

      // Make API call to backend
      const response = await httpClient.get(`/vendor/inventory/entries/${vendorCode}`);

      console.log('✅ Backend response:', response);

      // Check if response has the expected structure
      // Backend returns statusCode: 0 for success
      if (response && response.success) {
        return {
          success: true,
          data: response.data || [],
          message: 'Inventory entries fetched successfully'
        };
      } else {
        throw new Error('Unexpected response format from backend');
      }

    } catch (error) {
      console.error('❌ Error fetching inventory entries:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch inventory entries',
        details: error.response?.data || error,
        data: [] // Return empty array on error
      };
    }
  },

  /**
   * Get inventory entry by ID
   * @param {Number} id - Inventory entry ID
   * @returns {Promise<Object>} - API response with inventory entry details
   */
  getInventoryEntryById: async (id) => {
    try {
      console.log('📥 Fetching inventory entry by ID:', id);

      const response = await httpClient.get(`/vendor/inventory/entries/detail/${id}`);

      // Backend returns statusCode: 0 for success
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Inventory entry fetched successfully'
        };
      } else {
        throw new Error('Unexpected response format from backend');
      }

    } catch (error) {
      console.error('❌ Error fetching inventory entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch inventory entry',
        details: error.response?.data || error
      };
    }
  },

  /**
   * Get available heat numbers for a vendor (for dropdown in Raw Material Raising Call)
   * This endpoint returns only heat numbers with:
   * - Remaining quantity > 0
   * - Status = FRESH_PO
   *
   * EXHAUSTED entries are filtered out but remain in database for audit trail.
   *
   * @param {String} vendorCode - Vendor code to fetch available heat numbers for
   * @returns {Promise<Object>} - API response with list of available heat numbers
   */
  getAvailableHeatNumbers: async (vendorCode) => {
    try {
      console.log('📥 Fetching available heat numbers for vendor:', vendorCode);

      // Make API call to backend
      const response = await httpClient.get(`/vendor/available-heat-numbers/${vendorCode}`);

      console.log('✅ Backend response (available heat numbers):', response);

      // Check if response has the expected structure
      // Backend returns statusCode: 0 for success
      if (response && response.success) {
        return {
          success: true,
          data: response.data || [],
          message: 'Available heat numbers fetched successfully'
        };
      } else {
        throw new Error('Unexpected response format from backend');
      }

    } catch (error) {
      console.error('❌ Error fetching available heat numbers:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch available heat numbers',
        details: error.response?.data || error,
        data: [] // Return empty array on error
      };
    }
  },

  /**
   * Update an existing inventory entry
   * Note: Only entries with status = FRESH_PO can be updated
   * @param {Number} id - Inventory entry ID
   * @param {Object} inventoryData - Updated inventory entry data
   * @returns {Promise<Object>} - API response with updated inventory entry
   */
  updateInventoryEntry: async (id, inventoryData) => {
    const user = getStoredUser();
    try {
      console.log('📥 Updating inventory entry ID:', id, 'with data:', inventoryData);

      // Transform frontend data structure to match backend DTO
      const transformedData = {
        vendorCode: inventoryData.vendorCode || user.userName,
        vendorName: inventoryData.vendorName || 'Default Vendor',
        companyId: inventoryData.companyId ? parseInt(inventoryData.companyId) : null,
        companyName: inventoryData.companyName || '',
        supplierName: inventoryData.supplierName,
        unitName: inventoryData.unitName,
        supplierAddress: inventoryData.supplierAddress || '',
        rawMaterial: inventoryData.rawMaterial,
        gradeSpecification: inventoryData.gradeSpecification,
        lengthOfBars: inventoryData.lengthOfBars ? parseFloat(inventoryData.lengthOfBars) : null,
        heatNumber: inventoryData.heatNumber,
        tcNumber: inventoryData.tcNumber,
        tcDate: inventoryData.tcDate,
        tcQuantity: inventoryData.declaredQuantity ? parseFloat(inventoryData.declaredQuantity) : 0,
        subPoNumber: inventoryData.subPoNumber,
        subPoDate: inventoryData.subPoDate,
        subPoQty: inventoryData.subPoQty ? parseFloat(inventoryData.subPoQty) : 0,
        invoiceNumber: inventoryData.invoiceNumber,
        invoiceDate: inventoryData.invoiceDate,
        unitOfMeasurement: inventoryData.unitOfMeasurement,
        rateOfMaterial: inventoryData.rateOfMaterial ? parseFloat(inventoryData.rateOfMaterial) : 0,
        rateOfGst: inventoryData.rateOfGst ? parseFloat(inventoryData.rateOfGst) : 0,
        baseValuePo: inventoryData.baseValuePO ? parseFloat(inventoryData.baseValuePO) : 0,
        totalPo: inventoryData.totalPO ? parseFloat(inventoryData.totalPO) : 0
      };

      console.log('📤 Transformed data for backend:', transformedData);

      // Make API call to backend
      const response = await httpClient.put(`/vendor/inventory/entries/${id}`, transformedData);

      console.log('✅ Backend response:', response);

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Inventory entry updated successfully'
        };
      } else {
        throw new Error('Unexpected response format from backend');
      }

    } catch (error) {
      console.error('❌ Error updating inventory entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to update inventory entry',
        details: error.response?.data || error
      };
    }
  },

  /**
   * Delete an inventory entry
   * Note: Only entries with status = FRESH_PO can be deleted
   * @param {Number} id - Inventory entry ID
   * @returns {Promise<Object>} - API response
   */
  deleteInventoryEntry: async (id) => {
    try {
      console.log('📥 Deleting inventory entry ID:', id);

      // Make API call to backend
      const response = await httpClient.delete(`/vendor/inventory/entries/${id}`);

      console.log('✅ Backend response:', response);

      if (response && response.success) {
        return {
          success: true,
          message: 'Inventory entry deleted successfully'
        };
      } else {
        throw new Error('Unexpected response format from backend');
      }

    } catch (error) {
      console.error('❌ Error deleting inventory entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete inventory entry',
        details: error.response?.data || error
      };
    }
  }
};

export default inventoryService;

