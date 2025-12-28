// src/pages/VendorDashboardPage.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Tabs from '../components/Tabs';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { InstrumentForm, ApprovalForm, GaugeForm } from '../components/CalibrationForms';
import { PaymentForm } from '../components/PaymentForm';
import { RaiseInspectionCallForm } from '../components/RaiseInspectionCallForm';
import { MasterUpdatingForm } from '../components/MasterUpdatingForm';
import NewInventoryEntryForm from '../components/NewInventoryEntryForm';
import AddSubPOForm from '../components/AddSubPOForm';
import {
  // VENDOR_PO_LIST,
  VENDOR_REQUESTED_CALLS,
  VENDOR_COMPLETED_CALLS,
  VENDOR_CALIBRATION_ITEMS,
  VENDOR_APPROVAL_ITEMS,
  VENDOR_GAUGE_ITEMS,
  VENDOR_PAYMENT_ITEMS,
  VENDOR_MASTER_ITEMS,
  VENDOR_RAISE_CALL_PO,
  VENDOR_INVENTORY_ENTRIES,
  CALIBRATION_MASTER_DATA,
  PAYMENT_MASTER_DATA,
  CALIBRATION_REQUIREMENTS,
  VENDOR_PRODUCT_TYPE,
  VENDOR_SUB_PO_LIST
} from '../data/vendorMockData';
import { formatDate } from '../utils/helpers';
import useVendorWorkflow from '../hooks/useVendorWorkflow';
import inspectionCallService from '../services/inspectionCallService';
import poAssignedService from '../services/poAssignedService';
import '../styles/vendorDashboard.css';

const VendorDashboardPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('po-assigned');

  // Modal states for Calibration forms
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isGaugeModalOpen, setIsGaugeModalOpen] = useState(false);

  // Modal state for Payment form
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Modal state for Raise Inspection Request form
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedPOItem, setSelectedPOItem] = useState(null);

  // Modal state for Add Sub PO form
  const [isAddSubPOModalOpen, setIsAddSubPOModalOpen] = useState(false);
  const [selectedSubPOItem, setSelectedSubPOItem] = useState(null);

  // State to track selected Sub PO for each item
  // const [selectedSubPOsByItem, setSelectedSubPOsByItem] = useState({});

  // Expanded PO rows state
  const [expandedPORows, setExpandedPORows] = useState({});

  // State for approved RM ICs per PO
  const [approvedRMICsByPO, setApprovedRMICsByPO] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [loadingRMICs, setLoadingRMICs] = useState({});

  // Expanded Inspection Call rows state (for Requested Calls tab)
  const [expandedCallRows, setExpandedCallRows] = useState({});

  // Modals for Inspection Call Details and Rectification
  const [isCallDetailsModalOpen, setIsCallDetailsModalOpen] = useState(false);
  const [isRectificationModalOpen, setIsRectificationModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  // Expanded Completed Call rows state
  const [expandedCompletedRows, setExpandedCompletedRows] = useState({});

  // Modals for Completed Calls - Inspection Summary and IC Correction
  const [isInspectionSummaryModalOpen, setIsInspectionSummaryModalOpen] = useState(false);
  const [isICCorrectionModalOpen, setIsICCorrectionModalOpen] = useState(false);
  const [selectedCompletedCall, setSelectedCompletedCall] = useState(null);

  // Payment filter state
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [showOldApproved, setShowOldApproved] = useState(false);
  const [selectedPaymentCall, setSelectedPaymentCall] = useState(null);

  // Data state (for future API integration - currently using mock data)
  const [instrumentItems, setInstrumentItems] = useState(VENDOR_CALIBRATION_ITEMS);
  const [approvalItems, setApprovalItems] = useState(VENDOR_APPROVAL_ITEMS);
  const [gaugeItems, setGaugeItems] = useState(VENDOR_GAUGE_ITEMS);
  const [paymentItems, setPaymentItems] = useState(VENDOR_PAYMENT_ITEMS);
  const [subPOList, setSubPOList] = useState(VENDOR_SUB_PO_LIST);

  // PO Assigned data state - using real API
  const [poAssignedList, setPoAssignedList] = useState([]);
  const [loadingPOData, setLoadingPOData] = useState(false);
  const [poDataError, setPoDataError] = useState(null);

  // ============ VENDOR WORKFLOW API INTEGRATION ============
  // Initialize the workflow hook for API calls
  const {
    loading: workflowLoading,
    errors: workflowErrors,
    transitionHistory,
    // paymentBlockedRecords,
    // pendingTransitions,
    initiateWorkflow,
    // performTransitionAction,
    fetchTransitionHistory,
    // fetchPaymentBlockedTransitions,
    fetchPendingTransitions,
    clearError,
    // WORKFLOW_ACTIONS
  } = useVendorWorkflow();

  // State for workflow transition history modal
  const [isTransitionHistoryModalOpen, setIsTransitionHistoryModalOpen] = useState(false);
  const [selectedIcForHistory, setSelectedIcForHistory] = useState(null);

  // Current user context (would be from auth context in production)
  const currentUser = useMemo(() => ({
    id: 'vendor-user-001',
    role: 'VENDOR',
    email: 'vendor@example.com'
  }), []);

  // ============ FETCH PO ASSIGNED DATA ============
  useEffect(() => {
    const fetchPOAssignedData = async () => {
      setLoadingPOData(true);
      setPoDataError(null);
      try {
        // TODO: Replace ':13101' with actual vendor code from auth context
        // For testing, using vendor code ':13101' from database
        const response = await poAssignedService.getPoAssigned(':13104');

        if (response.success && response.data) {
          // Transform API data to match frontend structure
          // Backend returns VendorPoHeaderResponseDto with: poNo, poDate, poDes, qty, unit, poItem[]
          const transformedData = response.data.map((item, index) => ({
            id: index + 1, // Generate ID since backend doesn't return it
            po_no: item.poNo || '',
            po_date: item.poDate || '',
            description: item.poDes || '',
            quantity: item.qty || 0,
            unit: item.unit || '',
            status: 'Fresh PO', // Backend doesn't return status, using default
            amendment_no: '',
            amendment_date: '',
            items: (item.poItem || []).map((poItem, itemIndex) => ({
              id: itemIndex + 1,
              item_name: poItem.poDes || '',
              item_qty: poItem.orderedQty || 0,
              item_unit: item.unit || '',
              item_status: 'Fresh PO',
              po_serial_no: poItem.poSerialNo || '',
              consignee: poItem.conigness || '',
              delivery_period: poItem.deliveryPeriod || '',
              item_code: '',
              unit_price: 0,
              total_price: 0
            }))
          }));

          setPoAssignedList(transformedData);
        } else {
          setPoDataError('Failed to fetch PO data');
          // Fallback to mock data
          setPoAssignedList([]);
        }
      } catch (error) {
        console.error('Error fetching PO assigned data:', error);
        setPoDataError(error.message || 'Error fetching PO data');
        // Fallback to mock data
        setPoAssignedList([]);
      } finally {
        setLoadingPOData(false);
      }
    };

    fetchPOAssignedData();
  }, []);

  // Filtered payment items based on status and date
  const filteredPaymentItems = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return paymentItems.filter(item => {
      // Status filter
      if (paymentStatusFilter !== 'all' && item.payment_status !== paymentStatusFilter) {
        return false;
      }
      // Hide approved items older than 30 days unless showOldApproved is true
      if (item.payment_status === 'Approved by RITES Finance' && !showOldApproved) {
        const approvedDate = item.approved_date ? new Date(item.approved_date) : new Date(item.call_date);
        if (approvedDate < thirtyDaysAgo) return false;
      }
      return true;
    });
  }, [paymentItems, paymentStatusFilter, showOldApproved]);

  // ============ COMPLIANCE STATUS CALCULATION ============
  // Get requirements for current vendor's product type
  const productRequirements = useMemo(() => {
    return CALIBRATION_REQUIREMENTS[VENDOR_PRODUCT_TYPE] || CALIBRATION_REQUIREMENTS['default'];
  }, []);

  // Calculate days until expiry
  const getDaysUntilExpiry = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  // Get calibration status based on due date
  const getCalibrationStatus = (dueDate, notificationDays = 30) => {
    const daysLeft = getDaysUntilExpiry(dueDate);
    if (daysLeft < 0) return 'Expired';
    if (daysLeft <= notificationDays) return 'Expiring Soon';
    return 'Valid';
  };

  // Calculate compliance for each category
  const complianceStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate instrument compliance per category
    const instrumentCompliance = productRequirements.instruments.map(req => {
      const matchingItems = instrumentItems.filter(i => i.instrument_name === req.category);
      const validItems = matchingItems.filter(i => {
        const dueDate = new Date(i.calibration_due_date);
        return dueDate >= today;
      });
      const expiringItems = matchingItems.filter(i => {
        const daysLeft = getDaysUntilExpiry(i.calibration_due_date);
        return daysLeft >= 0 && daysLeft <= (i.notification_days || 30);
      });
      const expiredItems = matchingItems.filter(i => {
        const dueDate = new Date(i.calibration_due_date);
        return dueDate < today;
      });

      let status = 'Non-Compliant';
      if (validItems.length >= req.minRequired && expiredItems.length === 0) {
        status = expiringItems.length > 0 ? 'Partially Compliant' : 'Compliant';
      } else if (validItems.length >= req.minRequired) {
        status = 'Partially Compliant';
      }

      return {
        ...req,
        currentCount: matchingItems.length,
        validCount: validItems.length,
        expiringCount: expiringItems.length,
        expiredCount: expiredItems.length,
        status,
        items: matchingItems
      };
    });

    // Calculate approval compliance per category
    const approvalCompliance = productRequirements.approvals.map(req => {
      const matchingItems = approvalItems.filter(a => a.approval_document_name === req.category);
      const validItems = matchingItems.filter(a => {
        const validTill = new Date(a.valid_till);
        return validTill >= today;
      });
      const expiringItems = matchingItems.filter(a => {
        const daysLeft = getDaysUntilExpiry(a.valid_till);
        return daysLeft >= 0 && daysLeft <= (a.notification_days || 30);
      });
      const expiredItems = matchingItems.filter(a => {
        const validTill = new Date(a.valid_till);
        return validTill < today;
      });

      let status = 'Non-Compliant';
      if (validItems.length >= req.minRequired && expiredItems.length === 0) {
        status = expiringItems.length > 0 ? 'Partially Compliant' : 'Compliant';
      } else if (validItems.length >= req.minRequired) {
        status = 'Partially Compliant';
      }

      return {
        ...req,
        currentCount: matchingItems.length,
        validCount: validItems.length,
        expiringCount: expiringItems.length,
        expiredCount: expiredItems.length,
        status,
        items: matchingItems
      };
    });

    // Calculate gauge compliance per category
    const gaugeCompliance = productRequirements.gauges.map(req => {
      const matchingItems = gaugeItems.filter(g => g.gauge_description === req.category);
      const validItems = matchingItems.filter(g => {
        const dueDate = new Date(g.calibration_due_date);
        return dueDate >= today;
      });
      const expiringItems = matchingItems.filter(g => {
        const daysLeft = getDaysUntilExpiry(g.calibration_due_date);
        return daysLeft >= 0 && daysLeft <= (g.notification_days || 30);
      });
      const expiredItems = matchingItems.filter(g => {
        const dueDate = new Date(g.calibration_due_date);
        return dueDate < today;
      });

      let status = 'Non-Compliant';
      if (validItems.length >= req.minRequired && expiredItems.length === 0) {
        status = expiringItems.length > 0 ? 'Partially Compliant' : 'Compliant';
      } else if (validItems.length >= req.minRequired) {
        status = 'Partially Compliant';
      }

      return {
        ...req,
        currentCount: matchingItems.length,
        validCount: validItems.length,
        expiringCount: expiringItems.length,
        expiredCount: expiredItems.length,
        status,
        items: matchingItems
      };
    });

    return {
      instruments: instrumentCompliance,
      approvals: approvalCompliance,
      gauges: gaugeCompliance
    };
  }, [instrumentItems, approvalItems, gaugeItems, productRequirements]);

  // Calculate overall compliance status
  const overallCompliance = useMemo(() => {
    const allCategories = [
      ...complianceStatus.instruments,
      ...complianceStatus.approvals,
      ...complianceStatus.gauges
    ];

    const mandatoryCategories = allCategories.filter(c => c.mandatory);
    const nonCompliantMandatory = mandatoryCategories.filter(c => c.status === 'Non-Compliant');
    const partiallyCompliantMandatory = mandatoryCategories.filter(c => c.status === 'Partially Compliant');
    const totalExpired = allCategories.reduce((sum, c) => sum + c.expiredCount, 0);
    const totalExpiring = allCategories.reduce((sum, c) => sum + c.expiringCount, 0);

    // Check inspection call eligibility
    const canRaiseInspectionCall = nonCompliantMandatory.length === 0 && totalExpired === 0;

    let status = 'Compliant';
    let message = 'All calibration and approval records are valid. You can raise inspection calls.';

    if (nonCompliantMandatory.length > 0 || totalExpired > 0) {
      status = 'Non-Compliant';
      const issues = [];
      if (nonCompliantMandatory.length > 0) {
        issues.push(`${nonCompliantMandatory.length} mandatory category(s) incomplete`);
      }
      if (totalExpired > 0) {
        issues.push(`${totalExpired} expired certificate(s)`);
      }
      message = `Cannot raise inspection calls: ${issues.join(', ')}.`;
    } else if (partiallyCompliantMandatory.length > 0 || totalExpiring > 0) {
      status = 'Partially Compliant';
      message = `${totalExpiring} certificate(s) expiring soon. Renew before expiry to maintain eligibility.`;
    }

    return {
      status,
      message,
      canRaiseInspectionCall,
      nonCompliantCount: nonCompliantMandatory.length,
      partiallyCompliantCount: partiallyCompliantMandatory.length,
      totalExpired,
      totalExpiring
    };
  }, [complianceStatus]);

  // Edit state (null means add new, object means edit existing)
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [editingApproval, setEditingApproval] = useState(null);
  const [editingGauge, setEditingGauge] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // Loading state for future API calls
  const [isLoading, setIsLoading] = useState(false);

  // ============ INSTRUMENT HANDLERS ============
  const handleOpenInstrumentModal = (instrument = null) => {
    setEditingInstrument(instrument);
    setIsInstrumentModalOpen(true);
  };

  const handleCloseInstrumentModal = () => {
    setIsInstrumentModalOpen(false);
    setEditingInstrument(null);
  };

  const handleSubmitInstrument = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Replace with API call
      // await api.createInstrument(data) or await api.updateInstrument(data.id, data)

      if (editingInstrument) {
        // Update existing
        setInstrumentItems(prev =>
          prev.map(item => item.id === editingInstrument.id ? { ...data, id: item.id } : item)
        );
      } else {
        // Add new
        const newId = Math.max(...instrumentItems.map(i => i.id), 0) + 1;
        setInstrumentItems(prev => [...prev, { ...data, id: newId }]);
      }
      handleCloseInstrumentModal();
    } catch (error) {
      console.error('Error saving instrument:', error);
      // TODO: Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  // ============ APPROVAL HANDLERS ============
  const handleOpenApprovalModal = (approval = null) => {
    setEditingApproval(approval);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setEditingApproval(null);
  };

  const handleSubmitApproval = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Replace with API call
      if (editingApproval) {
        setApprovalItems(prev =>
          prev.map(item => item.id === editingApproval.id ? { ...data, id: item.id } : item)
        );
      } else {
        const newId = Math.max(...approvalItems.map(i => i.id), 0) + 1;
        setApprovalItems(prev => [...prev, { ...data, id: newId }]);
      }
      handleCloseApprovalModal();
    } catch (error) {
      console.error('Error saving approval:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ GAUGE HANDLERS ============
  const handleOpenGaugeModal = (gauge = null) => {
    setEditingGauge(gauge);
    setIsGaugeModalOpen(true);
  };

  const handleCloseGaugeModal = () => {
    setIsGaugeModalOpen(false);
    setEditingGauge(null);
  };

  const handleSubmitGauge = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Replace with API call
      if (editingGauge) {
        setGaugeItems(prev =>
          prev.map(item => item.id === editingGauge.id ? { ...data, id: item.id } : item)
        );
      } else {
        const newId = Math.max(...gaugeItems.map(i => i.id), 0) + 1;
        setGaugeItems(prev => [...prev, { ...data, id: newId }]);
      }
      handleCloseGaugeModal();
    } catch (error) {
      console.error('Error saving gauge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ PAYMENT HANDLERS ============
  const handleOpenPaymentModal = (payment = null) => {
    setEditingPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setEditingPayment(null);
  };

  const handleSubmitPayment = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Replace with API call
      // For file upload, would need to use FormData and multipart/form-data
      if (editingPayment) {
        setPaymentItems(prev =>
          prev.map(item => item.id === editingPayment.id ? { ...data, id: item.id } : item)
        );
      } else {
        const newId = Math.max(...paymentItems.map(i => i.id), 0) + 1;
        setPaymentItems(prev => [...prev, { ...data, id: newId, payment_status: 'Pending' }]);
      }
      handleClosePaymentModal();
    } catch (error) {
      console.error('Error saving payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ EXPANDABLE PO ROW HANDLERS ============
  const togglePORow = async (poId) => {
    const isExpanding = !expandedPORows[poId];

    setExpandedPORows(prev => ({
      ...prev,
      [poId]: isExpanding
    }));

    // Fetch approved RM ICs when expanding a PO
    if (isExpanding) {
      const po = poAssignedList.find(p => p.id === poId);
      if (po && !approvedRMICsByPO[po.po_no]) {
        setLoadingRMICs(prev => ({ ...prev, [po.po_no]: true }));
        try {
          const response = await inspectionCallService.getApprovedRMICsWithHeatDetails(po.po_no);
          if (response.success) {
            const data = Array.isArray(response.data) ? response.data : [];
            setApprovedRMICsByPO(prev => ({
              ...prev,
              [po.po_no]: data
            }));
          } else {
            setApprovedRMICsByPO(prev => ({
              ...prev,
              [po.po_no]: []
            }));
          }
        } catch (error) {
          console.error('Error fetching approved RM ICs:', error);
          setApprovedRMICsByPO(prev => ({
            ...prev,
            [po.po_no]: []
          }));
        } finally {
          setLoadingRMICs(prev => ({ ...prev, [po.po_no]: false }));
        }
      }
    }
  };

  // ============ RAISE INSPECTION REQUEST HANDLERS ============
  const handleOpenInspectionModal = (po, item, subPO = null) => {
    setSelectedPOItem({ po, item, subPO });
    setIsInspectionModalOpen(true);
  };

  const handleCloseInspectionModal = () => {
    setIsInspectionModalOpen(false);
    setSelectedPOItem(null);
  };

  const handleSubmitInspectionRequest = async (data) => {
    setIsLoading(true);
    try {
      // Step 1: Save inspection call data to DATABASE
      console.log('💾 Saving inspection call to database...', data);

      let savedInspectionCall;

      // Call appropriate API based on inspection type
      let response;

      if (data.type_of_call === 'Raw Material') {
        response = await inspectionCallService.createRMInspectionCall(data);
      } else if (data.type_of_call === 'Process') {
        // Transform Process IC data to match new backend API
        const processData = {
          rm_ic_number: data.process_rm_ic_numbers && data.process_rm_ic_numbers.length > 0
            ? data.process_rm_ic_numbers[0]
            : null,
          heat_number: data.process_lot_heat_mapping && data.process_lot_heat_mapping.length > 0
            ? data.process_lot_heat_mapping[0].heatNumber
            : null,
          lot_number: data.process_lot_heat_mapping && data.process_lot_heat_mapping.length > 0
            ? data.process_lot_heat_mapping[0].lotNumber
            : null,
          offered_qty: data.process_lot_heat_mapping && data.process_lot_heat_mapping.length > 0
            ? parseInt(data.process_lot_heat_mapping[0].offeredQty) || 0
            : 0,
          desired_inspection_date: data.desired_inspection_date,
          remarks: data.remarks
        };

        console.log('📦 Transformed Process IC data:', processData);
        response = await inspectionCallService.createProcessInspectionCall(processData);
      } else if (data.type_of_call === 'Final') {
        response = await inspectionCallService.createFinalInspectionCall(data);
      } else {
        throw new Error('Invalid inspection call type');
      }

      if (response.success) {
        savedInspectionCall = {
          ...data,
          icId: response.data.inspection_call_id,
          icNumber: response.data.ic_number,
          vendorId: currentUser.id,
          createdBy: currentUser.id,
          createdAt: new Date().toISOString()
        };

        console.log('✅ Inspection call saved to database:', savedInspectionCall);

        // Step 2: Call initiateWorkflow API (optional - for workflow management)
        try {
          const workflowResponse = await initiateWorkflow({
            icId: savedInspectionCall.icNumber,
            poNo: data.po_no,
            poSerialNo: data.po_serial_no,
            vendorId: currentUser.id,
            stage: data.type_of_call,
            callDetails: {
              desiredInspectionDate: data.desired_inspection_date,
              offeredQty: data.rm_offered_qty_mt || data.process_offered_qty || data.final_total_erc_qty,
              companyId: data.company_id,
              unitId: data.unit_id,
              remarks: data.rm_remarks || data.process_remarks || data.final_remarks
            }
          });

          console.log('✅ Workflow initiated:', workflowResponse);
          alert(`✅ ${data.type_of_call} Inspection Request saved successfully!\n\nIC Number: ${savedInspectionCall.icNumber}\nItem: ${selectedPOItem?.item?.item_name}\n\nData has been saved to the database.`);
        } catch (workflowError) {
          // If workflow initiation fails, still show success for the save
          console.warn('⚠️ Workflow initiation failed (optional):', workflowError);
          alert(`✅ ${data.type_of_call} Inspection Request saved successfully!\n\nIC Number: ${savedInspectionCall.icNumber}\nItem: ${selectedPOItem?.item?.item_name}\n\nData has been saved to the database.\n\nNote: Workflow initiation pending - will be retried automatically.`);
        }
      } else {
        throw new Error('Failed to save inspection call');
      }

      handleCloseInspectionModal();
    } catch (error) {
      console.error('❌ Error submitting inspection request:', error);
      alert(`❌ Failed to save inspection request.\n\nError: ${error.message}\n\nPlease check:\n1. API server is running (http://localhost:8080)\n2. Database connection is working\n3. All required fields are filled`);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ ADD SUB PO HANDLERS ============
  // const handleOpenAddSubPOModal = (po, item) => {
  //   setSelectedSubPOItem({ po, item });
  //   setIsAddSubPOModalOpen(true);
  // };

  const handleCloseAddSubPOModal = () => {
    setIsAddSubPOModalOpen(false);
    setSelectedSubPOItem(null);
  };

  const handleSubmitSubPO = async (subPOData) => {
    setIsLoading(true);
    try {
      // Generate new Sub PO ID
      const newSubPO = {
        ...subPOData,
        id: subPOList.length + 1,
        submitted_date: new Date().toISOString().split('T')[0]
      };

      // Add to Sub PO list
      setSubPOList(prev => [...prev, newSubPO]);

      alert(`Sub PO ${subPOData.sub_po_number} submitted for approval successfully!`);
      handleCloseAddSubPOModal();
    } catch (error) {
      console.error('Error submitting Sub PO:', error);
      alert('Failed to submit Sub PO. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get approved Sub POs for a specific PO (all items)
  const getApprovedSubPOsForPO = (po) => {
    const poItemIds = po.items?.map(item => item.id) || [];
    return subPOList.filter(
      subPO => poItemIds.includes(subPO.po_item_id) && subPO.approval_status === 'Approved'
    );
  };

  // ============ INSPECTION CALL ROW HANDLERS ============
  const toggleCallRow = (callId) => {
    setExpandedCallRows(prev => ({
      ...prev,
      [callId]: !prev[callId]
    }));
  };

  // View Full Inspection Call Details modal handlers
  const handleOpenCallDetailsModal = (call) => {
    setSelectedCall(call);
    setIsCallDetailsModalOpen(true);
  };

  const handleCloseCallDetailsModal = () => {
    setIsCallDetailsModalOpen(false);
    setSelectedCall(null);
  };

  // Update Rectification Details modal handlers
  const handleOpenRectificationModal = (call) => {
    setSelectedCall(call);
    setIsRectificationModalOpen(true);
  };

  const handleCloseRectificationModal = () => {
    setIsRectificationModalOpen(false);
    setSelectedCall(null);
  };

  // Download Acknowledged Documents handler
  const handleDownloadDocuments = (call) => {
    console.log('Downloading documents for:', call.call_no);
    alert(`Downloading documents for ${call.call_no}:\n- ${call.inspection_details?.documents?.join('\n- ') || 'No documents available'}`);
  };

  // ============ COMPLETED CALLS ROW HANDLERS ============
  const toggleCompletedRow = (callId) => {
    setExpandedCompletedRows(prev => ({
      ...prev,
      [callId]: !prev[callId]
    }));
  };

  // View Full Inspection Summary modal handlers
  const handleOpenInspectionSummaryModal = (call) => {
    setSelectedCompletedCall(call);
    setIsInspectionSummaryModalOpen(true);
  };

  const handleCloseInspectionSummaryModal = () => {
    setIsInspectionSummaryModalOpen(false);
    setSelectedCompletedCall(null);
  };

  // Download IC handler
  const handleDownloadIC = (call) => {
    console.log('Downloading IC for:', call.ic_number);
    alert(`Downloading Inspection Certificate: ${call.ic_number}\nFor Call: ${call.call_no}`);
  };

  // Download Inspection Documents handler
  const handleDownloadInspectionDocuments = (call) => {
    console.log('Downloading inspection documents for:', call.call_no);
    alert(`Downloading Inspection Documents for ${call.call_no}:\n- ${call.documents?.join('\n- ') || 'No documents available'}`);
  };

  // Request IC Correction modal handlers
  const handleOpenICCorrectionModal = (call) => {
    setSelectedCompletedCall(call);
    setIsICCorrectionModalOpen(true);
  };

  const handleCloseICCorrectionModal = () => {
    setIsICCorrectionModalOpen(false);
    setSelectedCompletedCall(null);
  };

  // ============ WORKFLOW API HANDLERS ============

  /**
   * Open transition history modal and fetch history for an IC
   * Uses workflowTransitionHistory API
   */
  const handleViewTransitionHistory = useCallback(async (call) => {
    setSelectedIcForHistory(call);
    setIsTransitionHistoryModalOpen(true);

    try {
      await fetchTransitionHistory(call.ic_number || call.call_no);
    } catch (error) {
      console.error('Failed to fetch transition history:', error);
    }
  }, [fetchTransitionHistory]);

  /**
   * Close transition history modal
   */
  const handleCloseTransitionHistoryModal = useCallback(() => {
    setIsTransitionHistoryModalOpen(false);
    setSelectedIcForHistory(null);
  }, []);

  /**
   * Perform workflow action (verify, approve, reject)
   * Uses performTransitionAction API
   */
  // const handlePerformWorkflowAction = useCallback(async (call, action, remarks = '') => {
  //   try {
  //     const response = await performTransitionAction({
  //       icId: call.ic_number || call.call_no,
  //       action: action,
  //       performedBy: currentUser.id,
  //       roleName: currentUser.role,
  //       remarks: remarks,
  //       timestamp: new Date().toISOString()
  //     });

  //     alert(`Action "${action}" performed successfully on ${call.call_no}`);
  //     return response;
  //   } catch (error) {
  //     console.error('Failed to perform action:', error);
  //     alert(`Failed to perform action: ${error.message || 'Unknown error'}`);
  //     throw error;
  //   }
  // }, [performTransitionAction, currentUser]);

  /**
   * Fetch payment blocked records
   * Uses workflowTransitionsPaymentBlocked API
   */
  // const handleFetchPaymentBlockedRecords = useCallback(async () => {
  //   try {
  //     await fetchPaymentBlockedTransitions({
  //       vendorId: currentUser.id
  //     });
  //   } catch (error) {
  //     console.error('Failed to fetch payment blocked records:', error);
  //   }
  // }, [fetchPaymentBlockedTransitions, currentUser.id]);

  /**
   * Fetch pending transitions for the current user's role
   * Uses allPendingWorkflowtrasition API
   * Note: API returns all for role, then filters by createdBy == userId
   */
  const handleFetchPendingTransitions = useCallback(async () => {
    try {
      await fetchPendingTransitions(currentUser.role, currentUser.id);
    } catch (error) {
      console.error('Failed to fetch pending transitions:', error);
    }
  }, [fetchPendingTransitions, currentUser]);

  // Fetch pending transitions when requested calls tab is active
  useEffect(() => {
    if (activeTab === 'requested-calls') {
      handleFetchPendingTransitions();
    }
  }, [activeTab, handleFetchPendingTransitions]);

  // Summary numbers for tab badges
  const totalPOs = poAssignedList.length;
  const pendingRequests = useMemo(
    () => VENDOR_REQUESTED_CALLS.filter(c => c.status === 'Pending').length,
    []
  );
  const completedCalls = VENDOR_COMPLETED_CALLS.length;

  // Primary tabs with counts (displayed in a box)
  const primaryTabs = [
    {
      id: 'po-assigned',
      label: 'PO Assigned',
      description: 'POs assigned to vendor with status',
      count: totalPOs
    },
    {
      id: 'requested-calls',
      label: 'Requested Calls',
      description: 'Request Inspection Call Status',
      count: pendingRequests
    },
    {
      id: 'completed-calls',
      label: 'Completed Calls',
      description: 'Inspection Calls & IC Download',
      count: completedCalls
    }
  ];

  // Secondary tabs (displayed below)
  const secondaryTabs = [
    {
      id: 'inventory-entry',
      label: 'New Inventory Entry',
      description: 'Inventory Management System'
    },
    {
      id: 'calibration-approval',
      label: 'Calibration & Approval',
      description: 'Instruments, Approvals & Gauges management'
    },
    {
      id: 'raise-call',
      label: 'Raising Inspection Call',
      description: 'Auto-fetched PO Data & call details'
    },
    {
      id: 'payment-module',
      label: 'Payment Details',
      description: 'Payment Details Updating Module'
    },
    {
      id: 'master-updating',
      label: 'Master Updating',
      description: 'Place / Factory / Contractor / Manufacturer'
    }
  ];

  // Column definitions for DataTable

  const poColumns = [
    { key: 'po_no', label: 'PO No.' },
    {
      key: 'po_date',
      label: 'PO Date',
      render: (value) => formatDate(value)
    },
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    // { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  const requestedColumns = [
    { key: 'call_no', label: 'Call No.' },
    { key: 'po_no', label: 'PO No.' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'stage', label: 'Stage' },
    {
      key: 'call_date',
      label: 'Call Date',
      render: (value) => formatDate(value)
    },
    { key: 'quantity_offered', label: 'Qty Offered' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  const completedColumns = [
    { key: 'call_no', label: 'Call No.' },
    { key: 'po_no', label: 'PO No.' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'stage', label: 'Stage' },
    {
      key: 'completion_date',
      label: 'Completion Date',
      render: (value) => formatDate(value)
    },
    { key: 'quantity_offered', label: 'Qty Offered' },
    { key: 'quantity_accepted', label: 'Qty Accepted' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'ic_number', label: 'IC No.' }
  ];

  // Updated column definitions with expiry highlighting
  const calibrationInstrumentColumns = [
    { key: 'instrument_name', label: 'Instrument / Machine Name' },
    { key: 'capacity_range', label: 'Capacity / Range' },
    { key: 'serial_number', label: 'Serial No.' },
    { key: 'calibration_certificate_no', label: 'Certificate No.' },
    {
      key: 'calibration_date',
      label: 'Calibration Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'calibration_due_date',
      label: 'Due Date',
      render: (value, row) => {
        const daysLeft = getDaysUntilExpiry(value);
        const status = getCalibrationStatus(value, row.notification_days || 30);
        return (
          <span className={`due-date-cell ${status.toLowerCase().replace(' ', '-')}`}>
            {formatDate(value)}
            {status === 'Expired' && <span className="expiry-badge expired">Expired</span>}
            {status === 'Expiring Soon' && <span className="expiry-badge expiring">{daysLeft}d left</span>}
          </span>
        );
      }
    },
    { key: 'certifying_lab_name', label: 'Certifying Lab' },
    { key: 'accreditation_agency', label: 'Agency' },
    {
      key: 'calibration_status',
      label: 'Status',
      render: (_, row) => {
        const computedStatus = getCalibrationStatus(row.calibration_due_date, row.notification_days || 30);
        return <StatusBadge status={computedStatus} />;
      }
    }
  ];

  const approvalsColumns = [
    { key: 'approval_document_name', label: 'Document Name' },
    { key: 'document_number', label: 'Document No.' },
    { key: 'approving_authority', label: 'Approving Authority' },
    {
      key: 'date_of_issue',
      label: 'Issue Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'valid_till',
      label: 'Valid Till',
      render: (value, row) => {
        const daysLeft = getDaysUntilExpiry(value);
        const status = getCalibrationStatus(value, row.notification_days || 30);
        return (
          <span className={`due-date-cell ${status.toLowerCase().replace(' ', '-')}`}>
            {formatDate(value)}
            {status === 'Expired' && <span className="expiry-badge expired">Expired</span>}
            {status === 'Expiring Soon' && <span className="expiry-badge expiring">{daysLeft}d left</span>}
          </span>
        );
      }
    },
    { key: 'notification_days', label: 'Notification Days' },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const computedStatus = getCalibrationStatus(row.valid_till, row.notification_days || 30);
        return <StatusBadge status={computedStatus} />;
      }
    }
  ];

  const gaugesColumns = [
    { key: 'gauge_description', label: 'Gauge Description' },
    { key: 'product_name', label: 'Product' },
    { key: 'gauge_sr_no', label: 'Gauge Sr. No.' },
    { key: 'calibration_certificate_no', label: 'Certificate No.' },
    {
      key: 'calibration_date',
      label: 'Calibration Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'calibration_due_date',
      label: 'Due Date',
      render: (value, row) => {
        const daysLeft = getDaysUntilExpiry(value);
        const status = getCalibrationStatus(value, row.notification_days || 30);
        return (
          <span className={`due-date-cell ${status.toLowerCase().replace(' ', '-')}`}>
            {formatDate(value)}
            {status === 'Expired' && <span className="expiry-badge expired">Expired</span>}
            {status === 'Expiring Soon' && <span className="expiry-badge expiring">{daysLeft}d left</span>}
          </span>
        );
      }
    },
    { key: 'certifying_lab_name', label: 'Certifying Lab' },
    { key: 'accreditation_agency', label: 'Agency' },
    {
      key: 'calibration_status',
      label: 'Status',
      render: (_, row) => {
        const computedStatus = getCalibrationStatus(row.calibration_due_date, row.notification_days || 30);
        return <StatusBadge status={computedStatus} />;
      }
    }
  ];

  // Payment columns as per requirement
  const paymentColumns = [
    { key: 'call_no', label: 'Call No.' },
    { key: 'call_date', label: 'Call Date', render: (v) => v ? formatDate(v) : '-' },
    { key: 'po_no', label: 'PO No.' },
    { key: 'po_item_no', label: 'Item No.' },
    { key: 'payment_reason', label: 'Reason' },
    { key: 'offered_qty', label: 'Offered Qty' },
    { key: 'total_payable_amount', label: 'Charges (₹)', render: (v) => v?.toLocaleString('en-IN') || '-' },
    { key: 'payment_status', label: 'Status', render: (v) => <StatusBadge status={v} /> }
  ];

  const masterColumns = [
    { key: 'master_type', label: 'Master Type' }, // from Excel
    { key: 'value', label: 'Value' },
    {
      key: 'is_active',
      label: 'Active?',
      render: (value) => (value ? 'Yes' : 'No')
    }
  ];

  // Inventory Entries Columns - List of Entries from Inventory Management System
  const inventoryColumns = [
    { key: 'rawMaterial', label: 'Raw Material' },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'gradeSpecification', label: 'Grade/Spec' },
    { key: 'heatNumber', label: 'Heat/Batch/Lot No.' },
    { key: 'invoiceNumber', label: 'Invoice No.' },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      render: (value) => (value ? formatDate(value) : '-')
    },
    { key: 'subPoNumber', label: 'Sub PO No.' },
    {
      key: 'declaredQuantity',
      label: 'Declared Qty',
      render: (value, row) => `${value} ${row.unitOfMeasurement}`
    },
    {
      key: 'qtyOfferedForInspection',
      label: 'Qty Offered',
      render: (value, row) => (
        <span style={{ color: '#059669', fontWeight: 500 }}>
          {value} {row.unitOfMeasurement}
        </span>
      )
    },
    {
      key: 'qtyLeftForInspection',
      label: 'Qty Left',
      render: (value, row) => (
        <span style={{ color: value > 0 ? '#dc2626' : '#6b7280', fontWeight: 500 }}>
          {value} {row.unitOfMeasurement}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
  };

  return (
    <div className="page-container vendor-page">
      {/* Breadcrumb */}
      <div className="vendor-breadcrumb">
        <span className="breadcrumb-item">Home</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item breadcrumb-active">Vendor Dashboard</span>
      </div>

      {/* Header */}
      <div className="vendor-page-header">
        <div>
          <div className="vendor-page-title">Vendor Dashboard</div>
          <div className="vendor-page-subtitle">
            All vendor-facing actions as per Vendor Module sheet (POs, Calls, Calibration, Payments, Masters).
          </div>
        </div>
        {onBack && (
          <button className="rm-back-button" onClick={onBack}>
            ← Back to Landing Page
          </button>
        )}
      </div>

      {/* Primary Tabs - Overview Stats in a Box */}
      <div className="primary-tabs-wrapper">
        <div className="primary-tabs-header">
          <h3 className="primary-tabs-title">Quick Overview</h3>
          <span className="primary-tabs-subtitle">Monitor your POs and inspection calls at a glance</span>
        </div>
        <Tabs tabs={primaryTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Secondary Tabs - Other Modules */}
      <div className="secondary-tabs-wrapper">
        <Tabs tabs={secondaryTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div className="card vendor-tab-card">
        <div className="card-body">
          {/* 1. PO Assigned */}
          {activeTab === 'po-assigned' && (
            <>
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">PO Assigned to Vendor</h3>
                  <p className="vendor-section-header-desc">
                    List of all POs assigned along with status (Fresh PO, Inspection under Process,
                    Partially Supplied, Order Executed). Click + to expand PO and view items.
                  </p>
                </div>
              </div>

              {/* Loading and Error States */}
              {loadingPOData && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading PO data...</span>
                  </div>
                  <p className="mt-2">Loading PO data...</p>
                </div>
              )}

              {poDataError && (
                <div className="alert alert-warning" role="alert">
                  <strong>Warning:</strong> {poDataError}. Showing empty list.
                </div>
              )}

              {/* Custom Expandable PO Table */}
              {!loadingPOData && (
                <div className="data-table-wrapper">
                  <div className="data-table-container">
                    <table className="data-table expandable-po-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}></th>
                          {poColumns.map(col => (
                            <th key={col.key}>{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {poAssignedList.length === 0 ? (
                          <tr>
                            <td colSpan={poColumns.length + 1} className="text-center py-4">
                              No PO data available
                            </td>
                          </tr>
                        ) : (
                          poAssignedList.map((po) => (
                        <React.Fragment key={po.id}>
                          {/* PO Row */}
                          <tr className={`po-row ${expandedPORows[po.id] ? 'expanded' : ''}`}>
                            <td>
                              <button
                                className="po-expand-btn"
                                onClick={() => togglePORow(po.id)}
                                aria-label={expandedPORows[po.id] ? 'Collapse' : 'Expand'}
                              >
                                {expandedPORows[po.id] ? '−' : '+'}
                              </button>
                            </td>
                            {poColumns.map(col => (
                              <td key={col.key} data-label={col.label}>
                                {col.render ? col.render(po[col.key], po) : po[col.key]}
                              </td>
                            ))}
                          </tr>
                          {/* Expanded Items Row */}
                          {expandedPORows[po.id] && (
                            <tr className="po-items-row">
                              <td colSpan={poColumns.length + 1}>
                                <div className="po-items-container">
                                  <div className="po-items-header">
                                    <span className="po-items-title">Items in {po.po_no}</span>
                                    {/* <button
                                      className="btn btn-sm btn-secondary"
                                      onClick={() => handleOpenAddSubPOModal(po, null)}
                                      style={{ whiteSpace: 'nowrap' }}
                                    >
                                      + Add Sub PO
                                    </button> */}
                                  </div>

                                  {/* Sub PO List Table */}
                                  {/* {(() => {
                                    const poSubPOs = subPOList.filter(subPO =>
                                      po.items?.some(item => item.id === subPO.po_item_id)
                                    );

                                    if (poSubPOs.length > 0) {
                                      return (
                                        <div className="sub-po-section">
                                          <h4 className="sub-po-section-title">Sub POs for this PO</h4>
                                          <table className="po-items-table sub-po-table">
                                            <thead>
                                              <tr>
                                                <th>Sub-PO Number</th>
                                                <th>Raw Material</th>
                                                <th>Contractor</th>
                                                <th>Manufacturer</th>
                                                <th>Sub-PO Qty</th>
                                                <th>Rate (₹)</th>
                                                <th>Status</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {poSubPOs.map(subPO => (
                                                <tr key={subPO.id}>
                                                  <td>{subPO.sub_po_number}</td>
                                                  <td>{subPO.raw_material_name}</td>
                                                  <td>{subPO.contractor}</td>
                                                  <td>{subPO.manufacturer}</td>
                                                  <td>{subPO.sub_po_quantity}</td>
                                                  <td>{subPO.rate}</td>
                                                  <td>
                                                    <span
                                                      className="status-badge"
                                                      style={{
                                                        backgroundColor:
                                                          subPO.approval_status === 'Approved' ? '#d1fae5' :
                                                          subPO.approval_status === 'Rejected' ? '#fee2e2' :
                                                          '#fef3c7',
                                                        color:
                                                          subPO.approval_status === 'Approved' ? '#065f46' :
                                                          subPO.approval_status === 'Rejected' ? '#991b1b' :
                                                          '#92400e'
                                                      }}
                                                    >
                                                      {subPO.approval_status}
                                                    </span>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()} */}

                                  {/* PO Items Table */}
                                  <h4 className="po-items-section-title">PO Items</h4>
                                  <table className="po-items-table">
                                    <thead>
                                      <tr>
                                        <th>Item Description</th>
                                        <th>PO Serial No.</th>
                                        <th>Consignee</th>
                                        <th>Ordered Quantity</th>
                                        <th>Delivery Period</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {po.items && po.items.length > 0 ? (
                                        (() => {
                                          // Get all approved Sub POs for this PO (shared across all items,  selectedSubPOsByItem[item.id] || )
                                          const approvedSubPOs = getApprovedSubPOsForPO(po);

                                          return po.items.map((item) => {
                                            const selectedSubPO = '';

                                            return (
                                              <tr key={item.id}>
                                                <td>{item.item_name}</td>
                                                <td>{item.po_serial_no}</td>
                                                <td>{item.consignee}</td>
                                                <td>{item.item_qty} {item.item_unit}</td>
                                                <td>{formatDate(item.delivery_period)}</td>
                                                <td>
                                                  <StatusBadge status={item.item_status} />
                                                </td>
                                                <td>
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {/* Sub PO Dropdown - Always show for all items */}
                                                    {/* <select
                                                      className="ric-form-select"
                                                      value={selectedSubPO}
                                                      onChange={(e) => {
                                                        setSelectedSubPOsByItem(prev => ({
                                                          ...prev,
                                                          [item.id]: e.target.value
                                                        }));
                                                      }}
                                                      style={{ fontSize: '12px', padding: '4px' }}
                                                    >
                                                      <option value="">Select Sub PO (Optional)</option>
                                                      {approvedSubPOs.map(subPO => (
                                                        <option key={subPO.id} value={subPO.id}>
                                                          {subPO.sub_po_number} - {subPO.raw_material_name}
                                                        </option>
                                                      ))}
                                                    </select> */}

                                                    {/* Raise Inspection Request Button */}
                                                    <button
                                                      className="btn btn-sm btn-primary"
                                                      onClick={() => {
                                                        const subPOData = selectedSubPO
                                                          ? approvedSubPOs.find(sp => sp.id === parseInt(selectedSubPO))
                                                          : null;
                                                        handleOpenInspectionModal(po, item, subPOData);
                                                      }}
                                                      style={{ whiteSpace: 'nowrap' }}
                                                    >
                                                      Raise Inspection Request
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          });
                                        })()
                                      ) : (
                                        <tr>
                                          <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>
                                            No items found for this PO
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>

                                  {/* Approved RM Inspection Calls Section */}
                                  {/* <div className="approved-rm-ics-section" style={{ marginTop: '24px' }}>
                                    <h4 className="po-items-section-title">Approved Raw Material Inspection Calls</h4>
                                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                      List of approved RM inspection calls for this PO. These can be used for Process Inspection.
                                    </p>
                                    <table className="po-items-table">
                                      <thead>
                                        <tr>
                                          <th>RM IC Number</th>
                                          <th>PO Serial No.</th>
                                          <th>Heat Numbers</th>
                                          <th>Offered Qty (MT)</th>
                                          <th>Offered Qty (ERCs)</th>
                                          <th>Manufacturer</th>
                                          <th>Inspection Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(() => {
                                          // Get approved RM ICs from state
                                          const rmICsData = approvedRMICsByPO[po.po_no];
                                          const approvedRMICs = Array.isArray(rmICsData) ? rmICsData : [];
                                          const isLoading = loadingRMICs[po.po_no];

                                          if (isLoading) {
                                            return (
                                              <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: '16px' }}>
                                                  Loading approved RM inspection calls...
                                                </td>
                                              </tr>
                                            );
                                          }

                                          if (approvedRMICs.length === 0) {
                                            return (
                                              <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: '16px' }}>
                                                  No approved RM inspection calls found for this PO
                                                </td>
                                              </tr>
                                            );
                                          }

                                          return approvedRMICs.map((rmIC) => (
                                            <tr key={rmIC.id}>
                                              <td style={{ fontWeight: '600', color: '#2563eb' }}>{rmIC.ic_number}</td>
                                              <td>{rmIC.po_serial_no}</td>
                                              <td>{rmIC.heat_numbers || 'N/A'}</td>
                                              <td>{rmIC.total_offered_qty_mt ? `${rmIC.total_offered_qty_mt} MT` : 'N/A'}</td>
                                              <td>{rmIC.offered_qty_erc ? rmIC.offered_qty_erc.toLocaleString('en-IN') : 'N/A'}</td>
                                              <td>{rmIC.manufacturer || 'N/A'}</td>
                                              <td>{formatDate(rmIC.actual_inspection_date || rmIC.desired_inspection_date)}</td>
                                            </tr>
                                          ));
                                        })()}
                                      </tbody>
                                    </table>
                                  </div> */}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2. Requested Inspection Call Status */}
          {activeTab === 'requested-calls' && (
            <>
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">Requested Inspection Call Status</h3>
                  <p className="vendor-section-header-desc">
                    List of inspection calls requested by vendor with their status (Pending, Scheduled,
                    Under Inspection, Rectification Requested, IC Pending). Click on a row to view actions.
                  </p>
                </div>
              </div>

              {/* Custom Expandable Inspection Calls Table */}
              <div className="data-table-wrapper">
                <div className="data-table-container">
                  <table className="data-table expandable-calls-table">
                    <thead>
                      <tr>
                        {requestedColumns.map(col => (
                          <th key={col.key}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {VENDOR_REQUESTED_CALLS.map((call) => (
                        <React.Fragment key={call.id}>
                          {/* Call Row */}
                          <tr
                            className={`call-row ${expandedCallRows[call.id] ? 'expanded' : ''}`}
                            onClick={() => toggleCallRow(call.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {requestedColumns.map(col => (
                              <td key={col.key} data-label={col.label}>
                                {col.render ? col.render(call[col.key], call) : call[col.key]}
                              </td>
                            ))}
                          </tr>
                          {/* Expanded Actions Row */}
                          {expandedCallRows[call.id] && (
                            <tr className="call-actions-row">
                              <td colSpan={requestedColumns.length}>
                                <div className="call-actions-container">
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCallDetailsModal(call);
                                    }}
                                  >
                                    View Full Inspection Call Details
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewTransitionHistory(call);
                                    }}
                                    disabled={workflowLoading.transitionHistory}
                                  >
                                    {workflowLoading.transitionHistory ? 'Loading...' : 'View Workflow History'}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenRectificationModal(call);
                                    }}
                                  >
                                    Update Rectification Details
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadDocuments(call);
                                    }}
                                  >
                                    Download Acknowledged Documents
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 3. Completed Inspection Calls & IC Download */}
          {activeTab === 'completed-calls' && (
            <>
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">
                    Completed Inspection Calls &amp; IC Download
                  </h3>
                  <p className="vendor-section-header-desc">
                    List of all inspection calls completed (Accepted, Partially Accepted,
                    Rejected or Cancelled) for Vendor. Click on a row to view actions.
                  </p>
                </div>
              </div>

              {/* Custom Expandable Completed Calls Table */}
              <div className="data-table-wrapper">
                <div className="data-table-container">
                  <table className="data-table expandable-completed-table">
                    <thead>
                      <tr>
                        {completedColumns.map(col => (
                          <th key={col.key}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {VENDOR_COMPLETED_CALLS.map((call) => (
                        <React.Fragment key={call.id}>
                          {/* Completed Call Row */}
                          <tr
                            className={`completed-call-row ${expandedCompletedRows[call.id] ? 'expanded' : ''}`}
                            onClick={() => toggleCompletedRow(call.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {completedColumns.map(col => (
                              <td key={col.key} data-label={col.label}>
                                {col.render ? col.render(call[col.key], call) : call[col.key]}
                              </td>
                            ))}
                          </tr>
                          {/* Expanded Actions Row */}
                          {expandedCompletedRows[call.id] && (
                            <tr className="completed-actions-row">
                              <td colSpan={completedColumns.length}>
                                <div className="completed-actions-container">
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenInspectionSummaryModal(call);
                                    }}
                                  >
                                    View Full Inspection Summary
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadIC(call);
                                    }}
                                  >
                                    Download Inspection Certificate (IC)
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadInspectionDocuments(call);
                                    }}
                                  >
                                    Download Inspection Documents
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenICCorrectionModal(call);
                                    }}
                                  >
                                    Request IC Correction
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 4. Calibration & Approval (Combined) */}
          {activeTab === 'calibration-approval' && (
            <>
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">
                    Calibration &amp; Approval Records Management
                  </h3>
                  {/* <p className="vendor-section-header-desc">
                    Manage calibration and approval documents for {VENDOR_PRODUCT_TYPE}. Compliance status controls inspection call eligibility.
                  </p> */}
                </div>
              </div>

              {/* Full Calibration View with All Items */}
              <>
                  {/* Overall Compliance Status Banner */}
                  {/* <div className={`compliance-banner compliance-${overallCompliance.status.toLowerCase().replace(' ', '-')}`}>
                    <div className="compliance-banner-content">
                      <div className="compliance-status-icon">
                        {overallCompliance.status === 'Compliant' && '✓'}
                        {overallCompliance.status === 'Partially Compliant' && '⚠'}
                        {overallCompliance.status === 'Non-Compliant' && '✗'}
                      </div>
                      <div className="compliance-status-info">
                        <h4 className="compliance-status-title">
                          Inspection Call Eligibility: {overallCompliance.canRaiseInspectionCall ? 'Eligible' : 'Blocked'}
                        </h4>
                        <p className="compliance-status-message">{overallCompliance.message}</p>
                      </div>
                    </div>
                    <div className="compliance-stats">
                      {overallCompliance.totalExpired > 0 && (
                        <span className="compliance-stat expired">
                          {overallCompliance.totalExpired} Expired
                        </span>
                      )}
                      {overallCompliance.totalExpiring > 0 && (
                        <span className="compliance-stat expiring">
                          {overallCompliance.totalExpiring} Expiring Soon
                        </span>
                      )}
                    </div>
                  </div> */}

                  {/* Expiry Reminders Section */}
                  {overallCompliance.totalExpiring > 0 && (
                    <div className="expiry-reminders-section">
                      <h4 className="expiry-reminders-title">⏰ Upcoming Expiry Reminders</h4>
                      <div className="expiry-reminders-list">
                        {[
                          ...instrumentItems.filter(i => {
                            const days = getDaysUntilExpiry(i.calibration_due_date);
                            return days >= 0 && days <= (i.notification_days || 30);
                          }).map(i => ({ type: 'Instrument', name: i.instrument_name, serial: i.serial_number, dueDate: i.calibration_due_date })),
                          ...approvalItems.filter(a => {
                            const days = getDaysUntilExpiry(a.valid_till);
                            return days >= 0 && days <= (a.notification_days || 30);
                          }).map(a => ({ type: 'Approval', name: a.approval_document_name, serial: a.document_number, dueDate: a.valid_till })),
                          ...gaugeItems.filter(g => {
                            const days = getDaysUntilExpiry(g.calibration_due_date);
                            return days >= 0 && days <= (g.notification_days || 30);
                          }).map(g => ({ type: 'Gauge', name: g.gauge_description, serial: g.gauge_sr_no, dueDate: g.calibration_due_date }))
                        ].map((item, idx) => (
                          <div key={idx} className="expiry-reminder-item">
                            <span className="expiry-reminder-type">{item.type}</span>
                            <span className="expiry-reminder-name">{item.name} ({item.serial})</span>
                            <span className="expiry-reminder-days">
                              {getDaysUntilExpiry(item.dueDate)} days left
                            </span>
                            <span className="expiry-reminder-date">Due: {formatDate(item.dueDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Title */}
                  <div className="calibration-section-title">
                    {/* <h4>Required Documents & Equipment for {VENDOR_PRODUCT_TYPE}</h4> */}
                    <p>All instruments, approvals, and gauges with calibration and validity details</p>
                  </div>

                  {/* ========== INSTRUMENTS SECTION ========== */}
                  <div className="calibration-full-section">
                    <div className="calibration-section-header">
                      <div className="calibration-section-header-left">
                        <h4 className="calibration-section-heading">📏 Calibration – Instruments</h4>
                        <p className="calibration-section-subtitle">Instrument / Machine calibration details with validity tracking</p>
                      </div>
                      <div className="calibration-section-header-right">
                        <span className="section-record-count">{instrumentItems.length} Total Records</span>
                        <button className="btn btn-sm btn-primary" onClick={() => handleOpenInstrumentModal()}>
                          + Add Instrument
                        </button>
                      </div>
                    </div>

                    {/* Requirements Summary */}
                    <div className="requirements-summary-row">
                      {complianceStatus.instruments.map((cat, idx) => (
                        <div key={idx} className={`requirement-chip ${cat.status.toLowerCase().replace(' ', '-')}`}>
                          <span className="requirement-chip-name">
                            {cat.category}{cat.mandatory && <span className="mandatory-badge">*</span>}
                          </span>
                          <span className="requirement-chip-count">{cat.validCount}/{cat.minRequired}</span>
                        </div>
                      ))}
                    </div>

                    {/* Full Items Table */}
                    <DataTable
                      columns={calibrationInstrumentColumns}
                      data={instrumentItems}
                      onRowClick={(row) => handleOpenInstrumentModal(row)}
                      selectable={false}
                      selectedRows={[]}
                      onSelectionChange={() => {}}
                    />
                  </div>

                  {/* ========== APPROVALS SECTION ========== */}
                  <div className="calibration-full-section">
                    <div className="calibration-section-header">
                      <div className="calibration-section-header-left">
                        <h4 className="calibration-section-heading">📄 Calibration – Approvals</h4>
                        <p className="calibration-section-subtitle">RDSO Approval, ISO Certificate & other mandatory documents</p>
                      </div>
                      <div className="calibration-section-header-right">
                        <span className="section-record-count">{approvalItems.length} Total Records</span>
                        <button className="btn btn-sm btn-primary" onClick={() => handleOpenApprovalModal()}>
                          + Add Approval
                        </button>
                      </div>
                    </div>

                    {/* Requirements Summary */}
                    <div className="requirements-summary-row">
                      {complianceStatus.approvals.map((cat, idx) => (
                        <div key={idx} className={`requirement-chip ${cat.status.toLowerCase().replace(' ', '-')}`}>
                          <span className="requirement-chip-name">
                            {cat.category}{cat.mandatory && <span className="mandatory-badge">*</span>}
                          </span>
                          <span className="requirement-chip-count">{cat.validCount}/{cat.minRequired}</span>
                        </div>
                      ))}
                    </div>

                    {/* Full Items Table */}
                    <DataTable
                      columns={approvalsColumns}
                      data={approvalItems}
                      onRowClick={(row) => handleOpenApprovalModal(row)}
                      selectable={false}
                      selectedRows={[]}
                      onSelectionChange={() => {}}
                    />
                  </div>

                  {/* ========== GAUGES SECTION ========== */}
                  {complianceStatus.gauges.length > 0 && (
                    <div className="calibration-full-section">
                      <div className="calibration-section-header">
                        <div className="calibration-section-header-left">
                          <h4 className="calibration-section-heading">🔧 Calibration – Gauges</h4>
                          <p className="calibration-section-subtitle">Go/No-Go Gauges, Profile Gauges & calibration status</p>
                        </div>
                        <div className="calibration-section-header-right">
                          <span className="section-record-count">{gaugeItems.length} Total Records</span>
                          <button className="btn btn-sm btn-primary" onClick={() => handleOpenGaugeModal()}>
                            + Add Gauge
                          </button>
                        </div>
                      </div>

                      {/* Requirements Summary */}
                      <div className="requirements-summary-row">
                        {complianceStatus.gauges.map((cat, idx) => (
                          <div key={idx} className={`requirement-chip ${cat.status.toLowerCase().replace(' ', '-')}`}>
                            <span className="requirement-chip-name">
                              {cat.category}{cat.mandatory && <span className="mandatory-badge">*</span>}
                            </span>
                            <span className="requirement-chip-count">{cat.validCount}/{cat.minRequired}</span>
                          </div>
                        ))}
                      </div>

                      {/* Full Items Table */}
                      <DataTable
                        columns={gaugesColumns}
                        data={gaugeItems}
                        onRowClick={(row) => handleOpenGaugeModal(row)}
                        selectable={false}
                        selectedRows={[]}
                        onSelectionChange={() => {}}
                      />
                    </div>
                  )}

                  <p className="mandatory-note">
                    <span className="mandatory-badge">*</span> Mandatory categories must be complete with valid certificates to raise inspection calls.
                  </p>
                </>
            </>
          )}

          {/* 7. Raising an Inspection Call */}
          {activeTab === 'raise-call' && (
            <>
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">Raising an Inspection Call</h3>
                  <p className="vendor-section-header-desc">
                    Complete all required fields to raise an inspection call. PO Data is auto-fetched from IREPS.
                  </p>
                </div>
              </div>

              <RaiseInspectionCallForm
                selectedPO={VENDOR_RAISE_CALL_PO}
                onSubmit={(data) => {
                  // TODO: Replace with API call
                  console.log('Inspection call submitted:', data);
                  alert('Inspection Call submitted successfully!');
                }}
                isLoading={isLoading}
              />
            </>
          )}

          {/* 8. Payment Details Updating Module */}
          {activeTab === 'payment-module' && (
            <>
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">Payment Details Updating Module</h3>
                  <p className="vendor-section-header-desc">
                    View and manage inspection calls requiring payment (Cancelled/Rejected/Advance Payment).
                  </p>
                </div>
              </div>

              {/* Payment Filters */}
              <div className="payment-filters">
                <div className="payment-filter-group">
                  <label className="payment-filter-label">Status Filter:</label>
                  <select
                    className="payment-filter-select"
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Payment Pending for Approval">Pending for Approval</option>
                    <option value="Approved by RITES Finance">Approved by RITES</option>
                    <option value="Not Approved by RITES Finance">Not Approved</option>
                  </select>
                </div>
                <div className="payment-filter-group">
                  <label className="payment-filter-checkbox">
                    <input
                      type="checkbox"
                      checked={showOldApproved}
                      onChange={(e) => setShowOldApproved(e.target.checked)}
                    />
                    Show approved calls older than 30 days
                  </label>
                </div>
              </div>

              {/* Payment Status Summary Cards */}
              <div className="payment-summary-cards">
                {[
                  { status: 'Payment Pending', label: 'Payment Pending', color: '#dc2626' },
                  { status: 'Payment Pending for Approval', label: 'Pending Approval', color: '#f59e0b' },
                  { status: 'Approved by RITES Finance', label: 'Approved', color: '#16a34a' },
                  { status: 'Not Approved by RITES Finance', label: 'Not Approved', color: '#7c3aed' }
                ].map(({ status, label, color }) => (
                  <div
                    key={status}
                    className={`payment-summary-card ${paymentStatusFilter === status ? 'active' : ''}`}
                    onClick={() => setPaymentStatusFilter(paymentStatusFilter === status ? 'all' : status)}
                    style={{ borderColor: color }}
                  >
                    <span className="payment-summary-count" style={{ color }}>
                      {paymentItems.filter(i => i.payment_status === status).length}
                    </span>
                    <span className="payment-summary-label">{label}</span>
                  </div>
                ))}
              </div>

              {/* Payment Table */}
              <DataTable
                columns={paymentColumns}
                data={filteredPaymentItems}
                onRowClick={(row) => {
                  setSelectedPaymentCall(row);
                  handleOpenPaymentModal(row);
                }}
                selectable={false}
                selectedRows={[]}
                onSelectionChange={() => {}}
              />

              {/* Selected Payment Details */}
              {selectedPaymentCall && (
                <div className="payment-details-card">
                  <div className="payment-details-header">
                    <h4>Payment Details - {selectedPaymentCall.call_no}</h4>
                    <button className="btn btn-sm btn-outline" onClick={() => setSelectedPaymentCall(null)}>
                      Close
                    </button>
                  </div>
                  <div className="payment-details-grid">
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Charge Type</span>
                      <span className="payment-detail-value">{selectedPaymentCall.charge_type}</span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Base Amount</span>
                      <span className="payment-detail-value">₹{selectedPaymentCall.base_payable_amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">GST (18%)</span>
                      <span className="payment-detail-value">₹{selectedPaymentCall.gst?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="payment-detail-item">
                      <span className="payment-detail-label">Total Payable</span>
                      <span className="payment-detail-value payment-total">₹{selectedPaymentCall.total_payable_amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="payment-detail-item full-width">
                      <span className="payment-detail-label">Bank Account Details</span>
                      <span className="payment-detail-value">{selectedPaymentCall.bank_account_details}</span>
                    </div>
                    {selectedPaymentCall.rejection_reason && (
                      <div className="payment-detail-item full-width rejection">
                        <span className="payment-detail-label">Rejection Reason</span>
                        <span className="payment-detail-value">{selectedPaymentCall.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                  <div className="payment-details-actions">
                    {selectedPaymentCall.payment_status === 'Payment Pending' && (
                      <button className="btn btn-primary" onClick={() => handleOpenPaymentModal(selectedPaymentCall)}>
                        Enter Payment Details
                      </button>
                    )}
                    {selectedPaymentCall.payment_status === 'Not Approved by RITES Finance' && (
                      <button className="btn btn-primary" onClick={() => handleOpenPaymentModal(selectedPaymentCall)}>
                        Update Payment Details
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 9. New Inventory Entry */}
          {activeTab === 'inventory-entry' && (
            <>
              {/* List of Entries Section */}
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">Inventory - List of Entries</h3>
                  <p className="vendor-section-header-desc">
                    Data entered during form with Quantity Offered for Inspection and Quantity left for inspection.
                    Status: Fresh, Inspection Requested, Under Inspection, Partially Inspected, Exhausted.
                  </p>
                </div>
              </div>

              <DataTable
                columns={inventoryColumns}
                data={VENDOR_INVENTORY_ENTRIES}
                onRowClick={handleRowClick}
                selectable={false}
                selectedRows={[]}
                onSelectionChange={() => {}}
              />

              {/* New Entry Form Section */}
              <div className="inventory-form-section">
                <div className="inventory-form-header">
                  <h4 className="inventory-form-title">Add New Inventory Entry</h4>
                  <p className="inventory-form-subtitle">Fill in the details below to add a new material entry</p>
                </div>

                <NewInventoryEntryForm
                  onSubmit={(data) => {
                    console.log('Inventory entry submitted:', data);
                    alert(`Inventory entry saved successfully!\nMaterial: ${data.rawMaterial}\nSupplier: ${data.supplierName}`);
                  }}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}

          {/* 10. Master Updating */}
          {activeTab === 'master-updating' && (
            <>
              <div className="vendor-section-header">
                <div>
                  <h3 className="vendor-section-header-title">Master Updating</h3>
                  <p className="vendor-section-header-desc">
                    Add or update master data for Places, Factories, Contractors, Manufacturers, or Sub-PO Entities.
                    Field labels change based on the Master Type selected.
                  </p>
                </div>
              </div>

              <MasterUpdatingForm
                onSubmit={(data) => {
                  // TODO: Replace with API call
                  console.log('Master entry submitted:', data);
                  alert(`Master entry saved successfully!\nType: ${data.master_type}\nEntity: ${data.entity_name}`);
                }}
                isLoading={isLoading}
              />

              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 12, color: '#374151' }}>Existing Master Entries</h4>
                <DataTable
                  columns={masterColumns}
                  data={VENDOR_MASTER_ITEMS}
                  onRowClick={handleRowClick}
                  selectable={false}
                  selectedRows={[]}
                  onSelectionChange={() => {}}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============ CALIBRATION FORM MODALS ============ */}

      {/* Instrument Form Modal */}
      <InstrumentForm
        isOpen={isInstrumentModalOpen}
        onClose={handleCloseInstrumentModal}
        onSubmit={handleSubmitInstrument}
        masterData={CALIBRATION_MASTER_DATA}
        editData={editingInstrument}
        isLoading={isLoading}
      />

      {/* Approval Form Modal */}
      <ApprovalForm
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        onSubmit={handleSubmitApproval}
        masterData={CALIBRATION_MASTER_DATA}
        editData={editingApproval}
        isLoading={isLoading}
      />

      {/* Gauge Form Modal */}
      <GaugeForm
        isOpen={isGaugeModalOpen}
        onClose={handleCloseGaugeModal}
        onSubmit={handleSubmitGauge}
        masterData={CALIBRATION_MASTER_DATA}
        editData={editingGauge}
        isLoading={isLoading}
      />

      {/* ============ PAYMENT FORM MODAL ============ */}
      <PaymentForm
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSubmit={handleSubmitPayment}
        masterData={PAYMENT_MASTER_DATA}
        editData={editingPayment}
        isLoading={isLoading}
      />

      {/* ============ RAISE INSPECTION REQUEST MODAL ============ */}
      {isInspectionModalOpen && (
        <div className="modal-overlay" onClick={handleCloseInspectionModal}>
          <div className="modal raise-inspection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Raise Inspection Request</h3>
              <button className="modal-close-btn" onClick={handleCloseInspectionModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedPOItem && (
                <div className="inspection-modal-info">
                  <div className="inspection-info-row">
                    <span className="info-label">PO Number:</span>
                    <span className="info-value">{selectedPOItem.po?.po_no}</span>
                  </div>
                  <div className="inspection-info-row">
                    <span className="info-label">Item:</span>
                    <span className="info-value">{selectedPOItem.item?.item_name}</span>
                  </div>
                  <div className="inspection-info-row">
                    <span className="info-label">Quantity:</span>
                    <span className="info-value">{selectedPOItem.item?.item_qty} {selectedPOItem.item?.item_unit}</span>
                  </div>
                  {selectedPOItem.subPO && (
                    <div className="inspection-info-row">
                      <span className="info-label">Selected Sub PO:</span>
                      <span className="info-value">{selectedPOItem.subPO.sub_po_number} - {selectedPOItem.subPO.raw_material_name}</span>
                    </div>
                  )}
                </div>
              )}
              <RaiseInspectionCallForm
                selectedPO={selectedPOItem?.po}
                selectedItem={selectedPOItem?.item}
                selectedSubPO={selectedPOItem?.subPO}
                onSubmit={handleSubmitInspectionRequest}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD SUB PO MODAL ============ */}
      {isAddSubPOModalOpen && (
        <div className="modal-overlay" onClick={handleCloseAddSubPOModal}>
          <div className="modal raise-inspection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Sub PO</h3>
              <button className="modal-close-btn" onClick={handleCloseAddSubPOModal}>×</button>
            </div>
            <div className="modal-body">
              <AddSubPOForm
                selectedPO={selectedSubPOItem?.po}
                selectedItem={selectedSubPOItem?.item}
                onSubmit={handleSubmitSubPO}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============ VIEW FULL INSPECTION CALL DETAILS MODAL ============ */}
      {isCallDetailsModalOpen && selectedCall && (
        <div className="modal-overlay" onClick={handleCloseCallDetailsModal}>
          <div className="modal call-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Full Inspection Call Details</h3>
              <button className="modal-close-btn" onClick={handleCloseCallDetailsModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="call-details-grid">
                <div className="call-detail-section">
                  <h4 className="call-detail-section-title">Call Information</h4>
                  <div className="call-detail-row">
                    <span className="detail-label">Call No:</span>
                    <span className="detail-value">{selectedCall.call_no}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">PO No:</span>
                    <span className="detail-value">{selectedCall.po_no}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Item Name:</span>
                    <span className="detail-value">{selectedCall.item_name}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Stage:</span>
                    <span className="detail-value">{selectedCall.stage}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Call Date:</span>
                    <span className="detail-value">{formatDate(selectedCall.call_date)}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Quantity Offered:</span>
                    <span className="detail-value">{selectedCall.quantity_offered}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedCall.location}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value"><StatusBadge status={selectedCall.status} /></span>
                  </div>
                </div>

                {selectedCall.inspection_details && (
                  <div className="call-detail-section">
                    <h4 className="call-detail-section-title">Inspection Details</h4>
                    <div className="call-detail-row">
                      <span className="detail-label">Inspector Name:</span>
                      <span className="detail-value">{selectedCall.inspection_details.inspector_name}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">Inspection Date:</span>
                      <span className="detail-value">{formatDate(selectedCall.inspection_details.inspection_date)}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">Remarks:</span>
                      <span className="detail-value">{selectedCall.inspection_details.remarks}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">Documents:</span>
                      <span className="detail-value">
                        {selectedCall.inspection_details.documents?.map((doc, idx) => (
                          <span key={idx} className="document-tag">{doc}</span>
                        ))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ UPDATE RECTIFICATION DETAILS MODAL ============ */}
      {isRectificationModalOpen && selectedCall && (
        <div className="modal-overlay" onClick={handleCloseRectificationModal}>
          <div className="modal rectification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Rectification Details</h3>
              <button className="modal-close-btn" onClick={handleCloseRectificationModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="inspection-modal-info" style={{ marginBottom: '20px' }}>
                <div className="inspection-info-row">
                  <span className="info-label">Call No:</span>
                  <span className="info-value">{selectedCall.call_no}</span>
                </div>
                <div className="inspection-info-row">
                  <span className="info-label">Item:</span>
                  <span className="info-value">{selectedCall.item_name}</span>
                </div>
                <div className="inspection-info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value"><StatusBadge status={selectedCall.status} /></span>
                </div>
              </div>

              {selectedCall.rectification_details ? (
                <div className="rectification-current">
                  <h4 className="rectification-section-title">Current Rectification Details</h4>
                  <div className="call-detail-row">
                    <span className="detail-label">Issue Description:</span>
                    <span className="detail-value">{selectedCall.rectification_details.issue_description}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Rectification Action:</span>
                    <span className="detail-value">{selectedCall.rectification_details.rectification_action}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Target Date:</span>
                    <span className="detail-value">{formatDate(selectedCall.rectification_details.target_date)}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value"><StatusBadge status={selectedCall.rectification_details.status} /></span>
                  </div>
                </div>
              ) : (
                <div className="no-rectification-info">
                  <p>No rectification has been requested for this inspection call.</p>
                </div>
              )}

              <form className="rectification-form">
                <h4 className="rectification-section-title">
                  {selectedCall.rectification_details ? 'Update Rectification' : 'Submit Rectification Response'}
                </h4>
                <div className="form-group">
                  <label className="form-label">Rectification Action Taken</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe the rectification action taken..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Completion Date</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Supporting Documents</label>
                  <input type="file" className="form-control" multiple />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCloseRectificationModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Rectification details updated successfully!');
                      handleCloseRectificationModal();
                    }}
                  >
                    Submit Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============ VIEW FULL INSPECTION SUMMARY MODAL ============ */}
      {isInspectionSummaryModalOpen && selectedCompletedCall && (
        <div className="modal-overlay" onClick={handleCloseInspectionSummaryModal}>
          <div className="modal inspection-summary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Full Inspection Summary</h3>
              <button className="modal-close-btn" onClick={handleCloseInspectionSummaryModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="call-details-grid">
                {/* Call Basic Information */}
                <div className="call-detail-section">
                  <h4 className="call-detail-section-title">Inspection Call Information</h4>
                  <div className="call-detail-row">
                    <span className="detail-label">Call No:</span>
                    <span className="detail-value">{selectedCompletedCall.call_no}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">PO No:</span>
                    <span className="detail-value">{selectedCompletedCall.po_no}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Item Name:</span>
                    <span className="detail-value">{selectedCompletedCall.item_name}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Stage:</span>
                    <span className="detail-value">{selectedCompletedCall.stage}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">Completion Date:</span>
                    <span className="detail-value">{formatDate(selectedCompletedCall.completion_date)}</span>
                  </div>
                  <div className="call-detail-row">
                    <span className="detail-label">IC Number:</span>
                    <span className="detail-value">{selectedCompletedCall.ic_number}</span>
                  </div>
                </div>

                {/* Quantity Details */}
                <div className="call-detail-section">
                  <h4 className="call-detail-section-title">Quantity Details</h4>
                  <div className="quantity-summary-grid">
                    <div className="quantity-card">
                      <span className="quantity-label">Qty Offered</span>
                      <span className="quantity-value">{selectedCompletedCall.quantity_offered}</span>
                    </div>
                    <div className="quantity-card accepted">
                      <span className="quantity-label">Qty Accepted</span>
                      <span className="quantity-value">{selectedCompletedCall.quantity_accepted}</span>
                    </div>
                    <div className="quantity-card rejected">
                      <span className="quantity-label">Qty Rejected</span>
                      <span className="quantity-value">{selectedCompletedCall.quantity_rejected || 0}</span>
                    </div>
                    <div className="quantity-card status">
                      <span className="quantity-label">Status</span>
                      <StatusBadge status={selectedCompletedCall.status} />
                    </div>
                  </div>
                </div>

                {/* Inspection Summary */}
                {selectedCompletedCall.inspection_summary && (
                  <div className="call-detail-section">
                    <h4 className="call-detail-section-title">Inspection Details</h4>
                    <div className="call-detail-row">
                      <span className="detail-label">Inspector Name:</span>
                      <span className="detail-value">{selectedCompletedCall.inspection_summary.inspector_name}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">Inspection Date:</span>
                      <span className="detail-value">{formatDate(selectedCompletedCall.inspection_summary.inspection_date)}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">Acceptance Criteria:</span>
                      <span className="detail-value">{selectedCompletedCall.inspection_summary.acceptance_criteria}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">Test Results:</span>
                      <span className="detail-value">{selectedCompletedCall.inspection_summary.test_results}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">IE Remarks:</span>
                      <span className="detail-value ie-remarks">{selectedCompletedCall.inspection_summary.ie_remarks}</span>
                    </div>
                    <div className="call-detail-row">
                      <span className="detail-label">Final Decision:</span>
                      <span className="detail-value final-decision">{selectedCompletedCall.inspection_summary.final_decision}</span>
                    </div>
                  </div>
                )}

                {/* Supporting Documents */}
                <div className="call-detail-section">
                  <h4 className="call-detail-section-title">Supporting Documents</h4>
                  <div className="documents-list">
                    {selectedCompletedCall.documents?.map((doc, idx) => (
                      <span key={idx} className="document-tag clickable">
                        📄 {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ REQUEST IC CORRECTION MODAL ============ */}
      {isICCorrectionModalOpen && selectedCompletedCall && (
        <div className="modal-overlay" onClick={handleCloseICCorrectionModal}>
          <div className="modal ic-correction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request IC Correction</h3>
              <button className="modal-close-btn" onClick={handleCloseICCorrectionModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="inspection-modal-info" style={{ marginBottom: '20px' }}>
                <div className="inspection-info-row">
                  <span className="info-label">IC Number:</span>
                  <span className="info-value">{selectedCompletedCall.ic_number}</span>
                </div>
                <div className="inspection-info-row">
                  <span className="info-label">Call No:</span>
                  <span className="info-value">{selectedCompletedCall.call_no}</span>
                </div>
                <div className="inspection-info-row">
                  <span className="info-label">Item:</span>
                  <span className="info-value">{selectedCompletedCall.item_name}</span>
                </div>
                <div className="inspection-info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value"><StatusBadge status={selectedCompletedCall.status} /></span>
                </div>
              </div>

              <div className="ic-correction-note">
                <p>
                  <strong>Note:</strong> IC Correction requests are reviewed by the respective RIO.
                  Please provide accurate details about the error and the required correction.
                </p>
              </div>

              <form className="ic-correction-form">
                <div className="form-group">
                  <label className="form-label">Type of Error</label>
                  <select className="form-control">
                    <option value="">Select Error Type</option>
                    <option value="clerical">Clerical Error</option>
                    <option value="quantity">Quantity Mismatch</option>
                    <option value="date">Date Error</option>
                    <option value="spelling">Spelling/Name Error</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Error Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe the error in the IC..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correct Information</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide the correct information that should appear in the IC..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Supporting Evidence (if any)</label>
                  <input type="file" className="form-control" multiple />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCloseICCorrectionModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`IC Correction request submitted for ${selectedCompletedCall.ic_number}. It will be reviewed by the RIO.`);
                      handleCloseICCorrectionModal();
                    }}
                  >
                    Submit Correction Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============ WORKFLOW TRANSITION HISTORY MODAL ============ */}
      {isTransitionHistoryModalOpen && selectedIcForHistory && (
        <div className="modal-overlay" onClick={handleCloseTransitionHistoryModal}>
          <div className="modal workflow-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Workflow Transition History</h3>
              <button className="modal-close-btn" onClick={handleCloseTransitionHistoryModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="inspection-modal-info" style={{ marginBottom: '20px' }}>
                <div className="inspection-info-row">
                  <span className="info-label">Call No:</span>
                  <span className="info-value">{selectedIcForHistory.call_no}</span>
                </div>
                <div className="inspection-info-row">
                  <span className="info-label">IC Number:</span>
                  <span className="info-value">{selectedIcForHistory.ic_number || 'Pending'}</span>
                </div>
                <div className="inspection-info-row">
                  <span className="info-label">Current Status:</span>
                  <span className="info-value">
                    <StatusBadge status={selectedIcForHistory.status} />
                  </span>
                </div>
              </div>

              {/* Loading State */}
              {workflowLoading.transitionHistory && (
                <div className="workflow-loading">
                  <p>Loading transition history...</p>
                </div>
              )}

              {/* Error State */}
              {workflowErrors.transitionHistory && (
                <div className="workflow-error">
                  <p>Error: {workflowErrors.transitionHistory}</p>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      clearError('transitionHistory');
                      handleViewTransitionHistory(selectedIcForHistory);
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Transition History Timeline */}
              {!workflowLoading.transitionHistory && !workflowErrors.transitionHistory && (
                <div className="workflow-timeline">
                  <h4 className="timeline-title">Transition Timeline</h4>
                  {transitionHistory.length > 0 ? (
                    <div className="timeline-container">
                      {transitionHistory.map((transition, idx) => (
                        <div key={idx} className="timeline-item">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-action">{transition.action}</span>
                              <span className="timeline-date">
                                {formatDate(transition.timestamp || transition.createdAt)}
                              </span>
                            </div>
                            <div className="timeline-details">
                              <span className="timeline-user">By: {transition.performedBy || transition.userName}</span>
                              <span className="timeline-role">Role: {transition.roleName}</span>
                            </div>
                            {transition.remarks && (
                              <div className="timeline-remarks">
                                <span>Remarks: {transition.remarks}</span>
                              </div>
                            )}
                            <div className="timeline-status-change">
                              <span className="from-status">{transition.fromStatus}</span>
                              <span className="status-arrow">→</span>
                              <span className="to-status">{transition.toStatus}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="timeline-empty">
                      <p>No transition history available yet.</p>
                      <p className="timeline-empty-hint">
                        Workflow history will appear here once actions are performed on this inspection call.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCloseTransitionHistoryModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;
