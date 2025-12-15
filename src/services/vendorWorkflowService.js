// Vendor Workflow API Service
// Handles all workflow-related API calls for Vendor module

import { httpClient, ApiError } from './httpClient';
import { API_ENDPOINTS } from './apiConfig';

const { VENDOR_WORKFLOW } = API_ENDPOINTS;

/**
 * Vendor Workflow Service
 * Contains all workflow API methods as per the Vendor workflow specification
 */
const vendorWorkflowService = {
  /**
   * 1. Initiate Workflow
   * Called after saving inspection call data to initiate the Inspection workflow
   * @param {Object} inspectionCallData - The inspection call data
   * @param {string} inspectionCallData.icId - Inspection Call ID
   * @param {string} inspectionCallData.poNo - PO Number
   * @param {string} inspectionCallData.vendorId - Vendor ID
   * @param {string} inspectionCallData.stage - Inspection stage (RM/Process/Final)
   * @param {Object} inspectionCallData.callDetails - Additional call details
   * @returns {Promise<Object>} - API response with workflow initiation status
   */
  initiateWorkflow: async (inspectionCallData) => {
    try {
      const response = await httpClient.post(
        VENDOR_WORKFLOW.INITIATE_WORKFLOW,
        inspectionCallData
      );
      return response;
    } catch (error) {
      console.error('Error initiating workflow:', error);
      throw error;
    }
  },

  /**
   * 2. Perform Transition Action
   * Used when user wants to perform an action such as verify, approve, or reject
   * @param {Object} actionData - The action data
   * @param {string} actionData.icId - Inspection Call ID
   * @param {string} actionData.action - Action type (VERIFY, APPROVE, REJECT)
   * @param {string} actionData.performedBy - User ID performing the action
   * @param {string} actionData.roleName - Role of the user
   * @param {string} [actionData.remarks] - Optional remarks for the action
   * @param {Object} [actionData.additionalData] - Any additional data for the action
   * @returns {Promise<Object>} - API response with action result
   */
  performTransitionAction: async (actionData) => {
    try {
      const response = await httpClient.post(
        VENDOR_WORKFLOW.PERFORM_TRANSITION_ACTION,
        actionData
      );
      return response;
    } catch (error) {
      console.error('Error performing transition action:', error);
      throw error;
    }
  },

  /**
   * 3. Workflow Transition History
   * Returns complete transition history for a specific IC ID
   * @param {string} icId - Inspection Call ID
   * @returns {Promise<Object>} - API response with complete transition history
   */
  getWorkflowTransitionHistory: async (icId) => {
    try {
      const response = await httpClient.get(
        `${VENDOR_WORKFLOW.WORKFLOW_TRANSITION_HISTORY}?icId=${encodeURIComponent(icId)}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching workflow transition history:', error);
      throw error;
    }
  },

  /**
   * 4. Workflow Transitions Payment Blocked
   * Returns all IC records that are blocked due to pending payment
   * @param {Object} [filters] - Optional filters for the query
   * @param {string} [filters.vendorId] - Filter by vendor ID
   * @param {string} [filters.fromDate] - Filter from date (dd/MM/yyyy)
   * @param {string} [filters.toDate] - Filter to date (dd/MM/yyyy)
   * @returns {Promise<Object>} - API response with blocked IC records
   */
  getPaymentBlockedTransitions: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.vendorId) {
        queryParams.append('vendorId', filters.vendorId);
      }
      if (filters.fromDate) {
        queryParams.append('fromDate', filters.fromDate);
      }
      if (filters.toDate) {
        queryParams.append('toDate', filters.toDate);
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${VENDOR_WORKFLOW.WORKFLOW_TRANSITIONS_PAYMENT_BLOCKED}?${queryString}`
        : VENDOR_WORKFLOW.WORKFLOW_TRANSITIONS_PAYMENT_BLOCKED;
      
      const response = await httpClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payment blocked transitions:', error);
      throw error;
    }
  },

  /**
   * 5. All Pending Workflow Transitions
   * Returns all pending records of inspection based on role name
   * Note: UI should filter by createdBy == logged in user ID before displaying
   * @param {string} roleName - Role name to filter pending transitions
   * @param {string} [userId] - Optional user ID for client-side filtering
   * @returns {Promise<Object>} - API response with pending transitions
   */
  getAllPendingWorkflowTransitions: async (roleName, userId = null) => {
    try {
      const response = await httpClient.get(
        `${VENDOR_WORKFLOW.ALL_PENDING_WORKFLOW_TRANSITION}?roleName=${encodeURIComponent(roleName)}`
      );
      
      // Client-side filter: createdBy == logged in user ID
      if (userId && response.data && Array.isArray(response.data)) {
        response.data = response.data.filter(
          (record) => record.createdBy === userId
        );
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching pending workflow transitions:', error);
      throw error;
    }
  }
};

// Action types for performTransitionAction
export const WORKFLOW_ACTIONS = {
  VERIFY: 'VERIFY',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  HOLD: 'HOLD',
  CANCEL: 'CANCEL',
  RECTIFY: 'RECTIFY'
};

// Export ApiError for error handling in components
export { ApiError };

export default vendorWorkflowService;

