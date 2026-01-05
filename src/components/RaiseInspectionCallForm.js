// src/components/RaiseInspectionCallForm.js
// Raising an Inspection Call Form - ERC Raw Material, Process, Final stages
// Based on SARTHI specification for Indian Railways inspection management

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  COMPANY_UNIT_MASTER,
  // MANUFACTURER_MASTER,
  HEAT_TC_MAPPING,
  CHEMICAL_ANALYSIS_HISTORY,
  RM_INSPECTION_CALLS,
  PROCESS_INSPECTION_CALLS,
  // LOT_NUMBERS, // Removed unused import
  ERC_CONVERSION_FACTORS,
  PO_SERIAL_DETAILS,
  // VENDOR_INVENTORY_ENTRIES, // Import inventory data
  // VENDOR_PO_LIST
} from '../data/vendorMockData';
// import inspectionCallService from '../services/inspectionCallService';
import '../styles/raiseInspectionCall.css';

// Multi-Select Dropdown Component
const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} items selected`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.ric-multiselect-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="ric-multiselect-dropdown">
      <div className="ric-multiselect-trigger" onClick={toggleDropdown}>
        <span>{getDisplayText()}</span>
        <span className="ric-multiselect-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="ric-multiselect-options">
          {options.length === 0 ? (
            <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
              No options available
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={`ric-multiselect-option ${selectedValues.includes(option.value) ? 'ric-multiselect-option--selected' : ''}`}
                onClick={() => handleOptionClick(option.value)}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => {}}
                  className="ric-multiselect-checkbox"
                />
                <span>{option.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MOCK DATA FOR TESTING PROCESS IC (TEMPORARY)
// ============================================================
const MOCK_APPROVED_RM_ICS = [
  {
    id: 1,
    ic_number: 'RM-IC-2025-0001',
    po_no: 'PO-2025-1001',
    po_serial_no: '01',
    heat_numbers: 'HT-2025-001, HT-2025-002',
    offered_qty_erc: 135000,
    manufacturer: 'ABC Steel Industries'
  },
  {
    id: 2,
    ic_number: 'RM-IC-2025-0002',
    po_no: 'PO-2025-1001',
    po_serial_no: '01',
    heat_numbers: 'HT-2025-003, HT-2025-004',
    offered_qty_erc: 180000,
    manufacturer: 'XYZ Steel Corp'
  }
];

const MOCK_HEAT_NUMBERS = {
  'RM-IC-2025-0001': [
    {
      heat_number: 'HT-2025-001',
      manufacturer: 'ABC Steel Industries',
      qty_accepted_mt: 75.00,
      qty_accepted: 67500
    },
    {
      heat_number: 'HT-2025-002',
      manufacturer: 'ABC Steel Industries',
      qty_accepted_mt: 75.00,
      qty_accepted: 67500
    }
  ],
  'RM-IC-2025-0002': [
    {
      heat_number: 'HT-2025-003',
      manufacturer: 'XYZ Steel Corp',
      qty_accepted_mt: 100.00,
      qty_accepted: 90000
    },
    {
      heat_number: 'HT-2025-004',
      manufacturer: 'XYZ Steel Corp',
      qty_accepted_mt: 100.00,
      qty_accepted: 90000
    }
  ]
};

// Mock RM IC data
// const MOCK_RM_INSPECTION_CALLS = [
//   {
//     icNumber: 'RMIC-001',
//     poSerialNo: 'PO-SR-001',
//     heatNumber: 'H-101',
//     qtyAccepted: 12.5
//   },
//   {
//     icNumber: 'RMIC-002',
//     poSerialNo: 'PO-SR-001',
//     heatNumber: 'H-102',
//     qtyAccepted: 10.0
//   },
//   {
//     icNumber: 'RMIC-003',
//     poSerialNo: 'PO-SR-002',
//     heatNumber: 'H-201',
//     qtyAccepted: 8.75
//   },
//   {
//     icNumber: 'RMIC-004',
//     poSerialNo: 'PO-SR-001',
//     heatNumber: 'H-103',
//     qtyAccepted: 15.0
//   }
// ];


// Helper functions
const getTodayDate = () => new Date().toISOString().split('T')[0];
// const getMaxDate = () => {
//   const date = new Date();
//   date.setDate(date.getDate() + 7);
//   return date.toISOString().split('T')[0];
// };
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Inspection stage options
const INSPECTION_STAGES = [
  { value: '', label: 'Select Type of Call' },
  { value: 'Raw Material', label: ' Raw Material' },
  { value: 'Process', label: ' Process' },
  { value: 'Final', label: ' Final' }
];

// ERC type options
const ERC_TYPES = [
  { value: '', label: 'Select Type of ERC' },
  { value: 'MK-III', label: 'MK-III' },
  { value: 'MK-V', label: 'MK-V' },
  { value: 'J-Type', label: 'J-Type' }
];

// Form field component - MOVED OUTSIDE to prevent re-creation on every render
const FormField = ({ label, name, required, hint, children, fullWidth = false, errors = {} }) => (
  <div className={`ric-form-group ${fullWidth ? 'ric-form-group--full-width' : ''}`}>
    <label className="ric-form-label">
      {label} {required && <span className="ric-required">*</span>}
    </label>
    {children}
    {hint && <span className="ric-form-hint">{hint}</span>}
    {errors[name] && <span className="ric-form-error">{errors[name]}</span>}
  </div>
);

// Section header component - MOVED OUTSIDE to prevent re-creation on every render
const SectionHeader = ({ title, subtitle }) => (
  <div className="ric-section-header">
    <h4 className="ric-section-title">{title}</h4>
    {subtitle && <p className="ric-section-subtitle">{subtitle}</p>}
  </div>
);

// Initial form state generator
const getInitialFormState = (selectedPO = null) => {
  // Find the first PO serial for the selected PO
  const poSerial = selectedPO ? PO_SERIAL_DETAILS.find(p => p.poNo === selectedPO.po_no) : null;

  return {
    // === COMMON SECTION (Auto Fetched from IREPS) ===
    po_no: selectedPO?.po_no || '',
    po_serial_no: '', // Will be set when user selects from dropdown
    po_date: selectedPO?.po_date || '',
    po_description: selectedPO?.description || '',
    po_qty: 0, // Will be set when user selects PO serial
    po_unit: selectedPO?.unit || '',
    amendment_no: '',
    amendment_date: '',
    vendor_contact_name: '',
    vendor_contact_phone: '',

    // === CALL TYPE ===
    type_of_call: '',
    type_of_erc: '',
    desired_inspection_date: '',

    // === QUANTITY TRACKING (Auto Calculated) ===
    qty_already_inspected_rm: poSerial?.qtyAlreadyInspected?.rm || 0,
    qty_already_inspected_process: poSerial?.qtyAlreadyInspected?.process || 0,
    qty_already_inspected_final: poSerial?.qtyAlreadyInspected?.final || 0,

    // === RAW MATERIAL STAGE FIELDS ===
    // NEW: Array of heat-TC mappings with auto-fetched details
    rm_heat_tc_mapping: [
      {
        id: Date.now(), // Unique ID for React key
        heatNumber: '',
        tcNumber: '',
        tcDate: '',
        manufacturer: '',
        invoiceNo: '',
        invoiceDate: '',
        subPoNumber: '',
        subPoDate: '',
        subPoQty: '',
        subPoTotalValue: '',
        tcQty: '',
        tcQtyRemaining: '',
        offeredQty: '',
        maxQty: '',
        unit: '',
        isLoading: false
      }
    ],
    // Chemical Analysis - Manual input (editable) - shared across all heats
    rm_chemical_carbon: '',
    rm_chemical_manganese: '',
    rm_chemical_silicon: '',
    rm_chemical_sulphur: '',
    rm_chemical_phosphorus: '',
    // rm_chemical_chromium: '',
    rm_total_offered_qty_mt: 0, // Auto-calculated (sum of all heat quantities)
    rm_offered_qty_erc: 0, // Auto-calculated from total

    // === PROCESS STAGE FIELDS ===
    process_rm_ic_numbers: [], // Multi-select from completed RM ICs
    process_book_set_nos: [], // Auto-fetched based on selected RM ICs (array of {icNumber, bookSetNo})
    // NEW: Array of lot-heat mappings
    process_lot_heat_mapping: [
      {
        id: Date.now(),
        lotNumber: '',
        manufacturerHeat: '',
        heatNumber: '',
        manufacturer: '',
        offeredQty: '',
        isLoading: false
      }
    ],
    process_total_accepted_qty_rm: 0, // Total accepted quantity from selected RM ICs

    // === FINAL STAGE FIELDS ===
    final_lot_numbers: [], // Multi-select dropdown - Lots from Process ICs
    final_selected_lot: '', // Currently selected lot in dropdown (before adding)
    final_manufacturer_heat: '', // Auto-fetched based on selected lots
    final_erc_qty: '', // Free text, integer - Quantity (No. of ERC)
    final_total_qty: '', // Auto-calculated: final_erc_qty * final_hdpe_bags
    final_hdpe_bags: '', // Free text, integer
    final_rm_ic_numbers: [], // Multi-select dropdown
    final_process_ic_numbers: [], // Multi-select dropdown
    final_total_accepted_qty_process: 0, // Total accepted quantity from selected Process ICs
    final_unit_id: '', // Auto-filled from Process IC
    final_unit_name: '', // Auto-filled from Process IC
    final_unit_address: '', // Auto-filled from Process IC

    // === PLACE OF INSPECTION ===
    company_id: '', // User selects from dropdown
    company_name: '', // Auto-filled based on company_id selection
    cin: '', // Auto-filled from master data
    unit_id: '',
    unit_name: '',
    unit_address: '',
    unit_gstin: '',
    unit_contact_person: '',
    unit_role: '',

    // === ADDITIONAL ===
    remarks: ''
  };
};

export const RaiseInspectionCallForm = ({
  inventoryEntries = [],
  selectedPO = null,
  selectedItem = null,
  selectedSubPO = null,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState(() => getInitialFormState(selectedPO));
  const [errors, setErrors] = useState({});
  const [selectedPoSerial, setSelectedPoSerial] = useState(selectedItem?.po_serial_no || '');

  // State for approved RM ICs and heat numbers (for Process IC)
  // eslint-disable-next-line no-unused-vars
  const [approvedRMICsForProcess, setApprovedRMICsForProcess] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [processHeatNumbers, setProcessHeatNumbers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingRMICs, setLoadingRMICs] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loadingHeats, setLoadingHeats] = useState(false);

  // Handle PO Serial selection
  const handlePoSerialChange = useCallback((serialNo, itemData = null) => {
    const poSerial = PO_SERIAL_DETAILS.find(p => p.serialNo === serialNo);
    if (poSerial) {
      // Use mock data if found
      setSelectedPoSerial(serialNo);
      setFormData(prev => ({
        ...prev,
        po_serial_no: serialNo,
        po_no: poSerial.poNo,
        po_qty: poSerial.poQty,
        po_unit: poSerial.unit,
        amendment_no: poSerial.amendmentNo || '',
        amendment_date: poSerial.amendmentDate || '',
        qty_already_inspected_rm: poSerial.qtyAlreadyInspected.rm,
        qty_already_inspected_process: poSerial.qtyAlreadyInspected.process,
        qty_already_inspected_final: poSerial.qtyAlreadyInspected.final
      }));
    } else if (itemData) {
      // Use real data from API if mock data not found
      setSelectedPoSerial(serialNo);
      setFormData(prev => ({
        ...prev,
        po_serial_no: serialNo,
        po_qty: itemData.item_qty || 0,
        po_unit: itemData.item_unit || '',
        qty_already_inspected_rm: 0,
        qty_already_inspected_process: 0,
        qty_already_inspected_final: 0
      }));
    }
  }, []);

  // Reset form when PO or Item changes
  useEffect(() => {
    setFormData(getInitialFormState(selectedPO));
    setErrors({});

    // Auto-fill PO Serial Number if item is provided
    if (selectedItem?.po_serial_no) {
      setSelectedPoSerial(selectedItem.po_serial_no);
      handlePoSerialChange(selectedItem.po_serial_no, selectedItem);
    }
  }, [selectedPO, selectedItem, handlePoSerialChange]);

  // Get available PO serial numbers for dropdown
  const poSerialOptions = useMemo(() => {
    if (!selectedPO) return PO_SERIAL_DETAILS;
    return PO_SERIAL_DETAILS.filter(p => p.poNo === selectedPO.po_no);
  }, [selectedPO]);

  // Get available heat numbers from inventory
  // const availableHeatNumbers = useMemo(() => {
  //   return HEAT_TC_MAPPING.filter(h => h.qtyAvailable > 0);
  // }, []);

  // Fetch approved RM ICs when PO number changes and type is Process
  useEffect(() => {
    const fetchApprovedRMICs = async () => {
      if (formData.type_of_call === 'Process' && formData.po_no) {
        setLoadingRMICs(true);

        // ⚡ USING MOCK DATA FOR TESTING - Remove this block when database is ready
        setTimeout(() => {
          console.log('🔍 Using MOCK approved RM ICs for PO:', formData.po_no);
          const mockData = MOCK_APPROVED_RM_ICS.filter(
            ic => ic.po_no === formData.po_no && ic.po_serial_no === formData.po_serial_no
          );
          console.log('✅ Setting MOCK approved RM ICs:', mockData);
          setApprovedRMICsForProcess(mockData);
          setLoadingRMICs(false);
        }, 500); // Simulate API delay

        /*
        // 🔄 UNCOMMENT THIS WHEN DATABASE IS READY
        try {
          console.log('🔍 Fetching approved RM ICs for PO:', formData.po_no, formData.po_serial_no);
          const response = await inspectionCallService.getApprovedRMInspectionCalls(
            formData.po_no,
            formData.po_serial_no
          );
          console.log('📦 Approved RM ICs response:', response);
          if (response.success) {
            const data = Array.isArray(response.data) ? response.data : [];
            console.log('✅ Setting approved RM ICs:', data);
            setApprovedRMICsForProcess(data);
          } else {
            console.log('⚠️ Response not successful, setting empty array');
            setApprovedRMICsForProcess([]);
          }
        } catch (error) {
          console.error('❌ Error fetching approved RM ICs:', error);
          setApprovedRMICsForProcess([]);
        } finally {
          setLoadingRMICs(false);
        }
        */
      } else {
        // Reset when not Process type
        setApprovedRMICsForProcess([]);
      }
    };

    fetchApprovedRMICs();
  }, [formData.type_of_call, formData.po_no, formData.po_serial_no]);

  // Fetch heat numbers when RM IC is selected
  useEffect(() => {
    const fetchHeatNumbers = async () => {
      if (formData.type_of_call === 'Process' && formData.process_rm_ic_numbers && formData.process_rm_ic_numbers.length > 0) {
        setLoadingHeats(true);

        // ⚡ USING MOCK DATA FOR TESTING - Remove this block when database is ready
        setTimeout(() => {
          const rmIcNumber = formData.process_rm_ic_numbers[0]; // Get first selected RM IC
          console.log('🔍 Using MOCK heat numbers for RM IC:', rmIcNumber);
          const mockHeats = MOCK_HEAT_NUMBERS[rmIcNumber] || [];
          console.log('✅ Setting MOCK heat numbers:', mockHeats);
          setProcessHeatNumbers(mockHeats);
          setLoadingHeats(false);
        }, 300); // Simulate API delay

        /*
        // 🔄 UNCOMMENT THIS WHEN DATABASE IS READY
        try {
          const rmIcNumber = formData.process_rm_ic_numbers[0]; // Get first selected RM IC
          const response = await inspectionCallService.getHeatNumbersFromRMIC(rmIcNumber);
          if (response.success) {
            setProcessHeatNumbers(Array.isArray(response.data) ? response.data : []);
          } else {
            setProcessHeatNumbers([]);
          }
        } catch (error) {
          console.error('Error fetching heat numbers:', error);
          setProcessHeatNumbers([]);
        } finally {
          setLoadingHeats(false);
        }
        */
      } else {
        setProcessHeatNumbers([]);
      }
    };

    fetchHeatNumbers();
  }, [formData.type_of_call, formData.process_rm_ic_numbers]);

  // Get available RM ICs for Process stage
  const availableRmIcs = useMemo(() => {
    return RM_INSPECTION_CALLS.filter(ic => ic.status === 'Completed');
  }, []);

  // Get available Process ICs for Final stage
  // const availableProcessIcs = useMemo(() => {
  //   return PROCESS_INSPECTION_CALLS.filter(ic => ic.status === 'Completed');
  // }, []);

  // Get available lot numbers
  // const availableLots = useMemo(() => {
  //   return LOT_NUMBERS.filter(l => l.qtyAvailable > 0);
  // }, []);

  // Get units for selected company
  const unitOptions = useMemo(() => {
    const company = COMPANY_UNIT_MASTER.find(c => c.id === parseInt(formData.company_id));
    return company?.units || [];
  }, [formData.company_id]);

  // Calculate ERC quantity from MT (for Raw Material)
  const calculateErcFromMt = useCallback((mtQty, productType = 'ERC MK-III') => {
    const factor = ERC_CONVERSION_FACTORS[productType] || ERC_CONVERSION_FACTORS.default;
    return Math.floor((mtQty / factor) * 1000);
  }, []);

  // Calculate remaining quantity for each stage
  // eslint-disable-next-line no-unused-vars
  const remainingQty = useMemo(() => {
    const poSerial = PO_SERIAL_DETAILS.find(p => p.serialNo === formData.po_serial_no);
    if (!poSerial) return { rm: 0, process: 0, final: 0 };

    return {
      rm: poSerial.poQty - poSerial.qtyAlreadyInspected.rm,
      process: poSerial.qtyAlreadyInspected.rm - poSerial.qtyAlreadyInspected.process,
      final: poSerial.qtyAlreadyInspected.process - poSerial.qtyAlreadyInspected.final
    };
  }, [formData.po_serial_no]);

  // Auto-calculate total offered quantity and ERC when heat-TC mappings change
  useEffect(() => {
    if (formData.type_of_call === 'Raw Material' && formData.rm_heat_tc_mapping.length > 0) {
      const totalMt = formData.rm_heat_tc_mapping.reduce((sum, heat) => {
        return sum + (parseFloat(heat.offeredQty) || 0);
      }, 0);
      const ercQty = calculateErcFromMt(totalMt);
      setFormData(prev => ({
        ...prev,
        rm_total_offered_qty_mt: totalMt,
        rm_offered_qty_erc: ercQty
      }));
    } else if (formData.type_of_call === 'Raw Material' && formData.rm_heat_tc_mapping.length === 0) {
      setFormData(prev => ({
        ...prev,
        rm_total_offered_qty_mt: 0,
        rm_offered_qty_erc: 0
      }));
    }
  }, [formData.rm_heat_tc_mapping, formData.type_of_call, calculateErcFromMt]);

  // Get available heat numbers from inventory (only Fresh or Inspection Requested status)
  const availableHeatNumbers = useMemo(() => {
    return inventoryEntries
      .filter(entry =>
        entry.status === 'Fresh' ||
        entry.status === 'Inspection Requested' ||
        entry.qtyLeftForInspection > 0
      )
      .map(entry => ({
        heatNumber: entry.heatNumber,
        tcNumber: entry.tcNumber,
        rawMaterial: entry.rawMaterial,
        supplierName: entry.supplierName,
        qtyLeft: entry.qtyLeftForInspection,
        unit: entry.unitOfMeasurement
      }));
  }, [inventoryEntries]);

  // Get available TC numbers for a specific heat number
  const getAvailableTcNumbers = useCallback((heatNumber) => {
    if (!heatNumber) return [];

    const tcList = [];
    // Find all inventory entries matching this heat number
    const matchingEntries = inventoryEntries.filter(entry => entry.heatNumber === heatNumber);

    matchingEntries.forEach(entry => {
      if (!tcList.find(tc => tc.tcNumber === entry.tcNumber)) {
        tcList.push({
          tcNumber: entry.tcNumber,
          heatNumber: entry.heatNumber,
          manufacturer: entry.supplierName,
          tcDate: entry.tcDate
        });
      }
    });

    // Fallback to old HEAT_TC_MAPPING if not found in inventory
    if (tcList.length === 0) {
      const heat = HEAT_TC_MAPPING.find(h => h.heatNumber === heatNumber);
      if (heat) {
        tcList.push({
          tcNumber: heat.tcNumber,
          heatNumber: heat.heatNumber,
          manufacturer: heat.manufacturer,
          tcDate: heat.tcDate
        });
      }
    }

    return tcList;
  }, [inventoryEntries]);

  // OLD CODE - Commented out as we now handle per heat-TC combination
  // const availableTcNumbers = useMemo(() => { ... }, [formData.rm_heat_numbers]);
  // useEffect(() => { ... }, [formData.rm_tc_number]);

  // Handle unit selection (company is auto-filled, not changeable)
  const handleUnitChange = (unitId) => {
    const company = COMPANY_UNIT_MASTER.find(c => c.id === parseInt(formData.company_id));
    const unit = company?.units.find(u => u.id === parseInt(unitId));
    setFormData(prev => ({
      ...prev,
      unit_id: unitId,
      unit_name: unit?.unitName || '',
      unit_address: unit?.address || '',
      unit_gstin: unit?.gstin || '',
      unit_contact_person: unit?.contactPerson || '',
      unit_role: unit?.roleOfUnit || ''
    }));
  };

  // Handle RM IC selection for Process stage
  const handleRmIcSelection = (selectedIcNumbers) => {
    // Get book/set numbers for selected ICs
    const bookSetNos = selectedIcNumbers.map(icNumber => {
      const ic = RM_INSPECTION_CALLS.find(ic => ic.icNumber === icNumber);
      return { icNumber, bookSetNo: ic?.bookSetNo || '' };
    });

    // Calculate total accepted quantity from selected RM ICs
    const totalAccepted = selectedIcNumbers.reduce((sum, icNumber) => {
      const ic = RM_INSPECTION_CALLS.find(ic => ic.icNumber === icNumber);
      return sum + (ic?.qtyAccepted || 0);
    }, 0);

    setFormData(prev => ({
      ...prev,
      process_rm_ic_numbers: selectedIcNumbers,
      process_book_set_nos: bookSetNos,
      process_total_accepted_qty_rm: totalAccepted
    }));
  };

  // ========== PROCESS STAGE: LOT-HEAT MAPPING HANDLERS ==========

  // Add new lot-heat entry
  const handleAddProcessLotHeat = () => {
    setFormData(prev => ({
      ...prev,
      process_lot_heat_mapping: [
        ...prev.process_lot_heat_mapping,
        {
          id: Date.now(),
          lotNumber: '',
          manufacturerHeat: '',
          heatNumber: '',
          manufacturer: '',
          offeredQty: '',
          isLoading: false
        }
      ]
    }));
  };

  // Remove lot-heat entry
  const handleRemoveProcessLotHeat = (id) => {
    setFormData(prev => ({
      ...prev,
      process_lot_heat_mapping: prev.process_lot_heat_mapping.filter(item => item.id !== id)
    }));
  };

  // Handle lot number change
  const handleProcessLotNumberChange = (id, lotNumber) => {
    setFormData(prev => ({
      ...prev,
      process_lot_heat_mapping: prev.process_lot_heat_mapping.map(item =>
        item.id === id ? { ...item, lotNumber } : item
      )
    }));
  };

  // Handle manufacturer-heat selection and auto-fetch details
  const handleProcessManufacturerHeatChange = (id, manufacturerHeat, heatNumber = null, manufacturer = null, maxQty = null) => {
    // If heatNumber and manufacturer are not provided, parse from manufacturerHeat string
    if (!heatNumber || !manufacturer) {
      const parts = manufacturerHeat.split(' - ');
      manufacturer = parts[0] || '';
      heatNumber = parts[1] || '';
    }

    setFormData(prev => ({
      ...prev,
      process_lot_heat_mapping: prev.process_lot_heat_mapping.map(item =>
        item.id === id ? {
          ...item,
          manufacturerHeat,
          manufacturer,
          heatNumber,
          maxQty: maxQty || item.maxQty
        } : item
      )
    }));
  };

  // Handle offered quantity change for process lot-heat
  // eslint-disable-next-line no-unused-vars
  const handleProcessOfferedQtyChange = (id, offeredQty) => {
    setFormData(prev => ({
      ...prev,
      process_lot_heat_mapping: prev.process_lot_heat_mapping.map(item =>
        item.id === id ? { ...item, offeredQty } : item
      )
    }));
  };

  // ========== FINAL STAGE HANDLERS ==========

  // Handle Lot selection for Final stage - auto-fetch manufacturer-heat and unit details
  const handleFinalLotSelection = (selectedLotNumbers) => {
    // Get unique manufacturer-heat numbers from selected lots
    const manufacturerHeats = new Set();

    selectedLotNumbers.forEach(lotNumber => {
      const processIc = PROCESS_INSPECTION_CALLS.find(ic => ic.lotNumber === lotNumber);
      if (processIc) {
        manufacturerHeats.add(processIc.manufacturerHeat);
      }
    });

    // Auto-fill manufacturer-heat (join if multiple)
    const manufacturerHeat = Array.from(manufacturerHeats).join(', ');

    // Auto-fill unit details from first Process IC (assuming same unit for all lots)
    const firstProcessIc = PROCESS_INSPECTION_CALLS.find(ic => ic.lotNumber === selectedLotNumbers[0]);

    setFormData(prev => ({
      ...prev,
      final_lot_numbers: selectedLotNumbers,
      final_manufacturer_heat: manufacturerHeat,
      final_unit_id: firstProcessIc?.unitId || '',
      final_unit_name: firstProcessIc?.unitName || '',
      final_unit_address: firstProcessIc?.unitAddress || ''
    }));
  };

  // Handle Process IC selection for Final stage - calculate total accepted qty
  const handleFinalProcessIcSelection = (selectedIcNumbers) => {
    // Calculate total accepted quantity from selected Process ICs
    const totalAccepted = selectedIcNumbers.reduce((sum, icNumber) => {
      const ic = PROCESS_INSPECTION_CALLS.find(ic => ic.icNumber === icNumber);
      return sum + (ic?.qtyAccepted || 0);
    }, 0);

    setFormData(prev => ({
      ...prev,
      final_process_ic_numbers: selectedIcNumbers,
      final_total_accepted_qty_process: totalAccepted
    }));
  };

  // Auto-calculate Total Qty for Final stage
  useEffect(() => {
    if (formData.final_erc_qty && formData.final_hdpe_bags) {
      const totalQty = parseInt(formData.final_erc_qty) * parseInt(formData.final_hdpe_bags);
      setFormData(prev => ({
        ...prev,
        final_total_qty: totalQty.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        final_total_qty: ''
      }));
    }
  }, [formData.final_erc_qty, formData.final_hdpe_bags]);

  // === NEW: Heat-TC Mapping Handlers ===

  // Add new heat number section
  const handleAddHeatNumber = () => {
    setFormData(prev => ({
      ...prev,
      rm_heat_tc_mapping: [
        ...prev.rm_heat_tc_mapping,
        {
          id: Date.now(),
          heatNumber: '',
          tcNumber: '',
          tcDate: '',
          manufacturer: '',
          invoiceNo: '',
          invoiceDate: '',
          subPoNumber: '',
          subPoDate: '',
          subPoQty: '',
          subPoTotalValue: '',
          tcQty: '',
          tcQtyRemaining: '',
          offeredQty: '',
          maxQty: '',
          unit: '',
          isLoading: false
        }
      ]
    }));
  };

  // Remove heat number section
  const handleRemoveHeatNumber = (id) => {
    setFormData(prev => ({
      ...prev,
      rm_heat_tc_mapping: prev.rm_heat_tc_mapping.filter(heat => heat.id !== id)
    }));
  };

  // Handle heat number selection for a specific section
  const handleHeatNumberChange = (id, heatNumber) => {
    setFormData(prev => ({
      ...prev,
      rm_heat_tc_mapping: prev.rm_heat_tc_mapping.map(heat =>
        heat.id === id
          ? { ...heat, heatNumber, tcNumber: '', tcDate: '', manufacturer: '', invoiceNo: '', invoiceDate: '', subPoNumber: '', subPoDate: '', subPoQty: '', subPoTotalValue: '', tcQty: '', tcQtyRemaining: '', maxQty: '', unit: '' }
          : heat
      )
    }));
  };

  // Handle TC number selection and auto-fetch details
  const handleTcNumberChange = (id, tcNumber) => {
    const heatMapping = formData.rm_heat_tc_mapping.find(h => h.id === id);
    if (!heatMapping) return;

    // Set loading state
    setFormData(prev => ({
      ...prev,
      rm_heat_tc_mapping: prev.rm_heat_tc_mapping.map(heat =>
        heat.id === id ? { ...heat, isLoading: true, tcNumber } : heat
      )
    }));

    // Find inventory entry matching heat number and TC number
    const inventoryEntry = inventoryEntries.find(
      entry => entry.heatNumber === heatMapping.heatNumber && entry.tcNumber === tcNumber
    );

    if (inventoryEntry) {
      // Calculate total value
      const totalValue = (
        inventoryEntry.subPoQty *
        inventoryEntry.rateOfMaterial *
        (1 + inventoryEntry.rateOfGst / 100)
      ).toFixed(2);

      // Auto-fetch chemical analysis if available
      const analysis = CHEMICAL_ANALYSIS_HISTORY.find(
        a => a.heatNumber === inventoryEntry.heatNumber && a.manufacturer === inventoryEntry.supplierName
      );

      // Update the specific heat mapping with fetched data
      setFormData(prev => ({
        ...prev,
        rm_heat_tc_mapping: prev.rm_heat_tc_mapping.map(heat =>
          heat.id === id
            ? {
                ...heat,
                tcNumber,
                tcDate: inventoryEntry.tcDate || '',
                manufacturer: inventoryEntry.supplierName || '',
                invoiceNo: inventoryEntry.invoiceNumber || '',
                invoiceDate: inventoryEntry.invoiceDate || '',
                subPoNumber: inventoryEntry.subPoNumber || '',
                subPoDate: inventoryEntry.subPoDate || '',
                subPoQty: `${inventoryEntry.subPoQty} ${inventoryEntry.unitOfMeasurement}`,
                subPoTotalValue: `₹${totalValue}`,
                tcQty: `${inventoryEntry.subPoQty} ${inventoryEntry.unitOfMeasurement}`,
                tcQtyRemaining: `${inventoryEntry.qtyLeftForInspection} ${inventoryEntry.unitOfMeasurement}`,
                maxQty: inventoryEntry.qtyLeftForInspection,
                unit: inventoryEntry.unitOfMeasurement,
                isLoading: false
              }
            : heat
        ),
        // Update chemical analysis if this is the first heat or if not already set
        rm_chemical_carbon: prev.rm_chemical_carbon || analysis?.carbon || '',
        rm_chemical_manganese: prev.rm_chemical_manganese || analysis?.manganese || '',
        rm_chemical_silicon: prev.rm_chemical_silicon || analysis?.silicon || '',
        rm_chemical_sulphur: prev.rm_chemical_sulphur || analysis?.sulphur || '',
        rm_chemical_phosphorus: prev.rm_chemical_phosphorus || analysis?.phosphorus || '',
        // rm_chemical_chromium: prev.rm_chemical_chromium || analysis?.chromium || ''
      }));
    } else {
      // No data found - clear loading state
      setFormData(prev => ({
        ...prev,
        rm_heat_tc_mapping: prev.rm_heat_tc_mapping.map(heat =>
          heat.id === id ? { ...heat, isLoading: false } : heat
        )
      }));
    }
  };

  // Handle offered quantity change for a specific heat
  const handleHeatOfferedQtyChange = (id, offeredQty) => {
    setFormData(prev => ({
      ...prev,
      rm_heat_tc_mapping: prev.rm_heat_tc_mapping.map(heat =>
        heat.id === id ? { ...heat, offeredQty } : heat
      )
    }));
  };

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for heat numbers
    // if (name === 'rm_heat_numbers') {
    //   handleHeatNumbersChange(value);
    //   return;
    // }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  const handleSubmit = () => {
    console.log('🚀 Submitting form data:', formData);
    console.log('📋 Validation starting...');

    const newErrors = {};
    const today = getTodayDate();
    // const maxDate = getMaxDate();

    // Common validations
    if (!formData.po_serial_no) newErrors.po_serial_no = 'PO Serial Number is required';
    if (!formData.type_of_call) newErrors.type_of_call = 'Type of Call is required';
    if (!formData.desired_inspection_date) {
      newErrors.desired_inspection_date = 'Desired Inspection Date is required';
    } else if (formData.desired_inspection_date < today) {
      newErrors.desired_inspection_date = 'Date cannot be in the past';
    } 
    // else if (formData.desired_inspection_date > maxDate) {
    //   newErrors.desired_inspection_date = 'Date must be within 7 days from today';
    // }
    if (!formData.company_id) newErrors.company_id = 'Company is required';
    if (!formData.unit_id) newErrors.unit_id = 'Unit is required';

    // Raw Material stage validations
    if (formData.type_of_call === 'Raw Material') {
      // TEMPORARY: Make RM fields optional for testing without inventory data
      // TODO: Re-enable strict validation once inventory module is implemented

      // Only validate if user has started filling heat-TC mappings
      const hasHeatData = formData.rm_heat_tc_mapping.some(heat =>
        heat.heatNumber || heat.tcNumber || heat.offeredQty
      );

      if (hasHeatData) {
        // Check each heat-TC mapping
        formData.rm_heat_tc_mapping.forEach((heat, index) => {
          if (heat.heatNumber || heat.tcNumber || heat.offeredQty) {
            if (!heat.heatNumber) {
              newErrors[`heat_${index}_heatNumber`] = 'Heat Number is required';
            }
            if (!heat.tcNumber) {
              newErrors[`heat_${index}_tcNumber`] = 'TC Number is required';
            }
            if (!heat.offeredQty || parseFloat(heat.offeredQty) <= 0) {
              newErrors[`heat_${index}_offeredQty`] = 'Offered Quantity must be greater than 0';
            } else {
              // Check if offered quantity exceeds TC qty remaining
              const offeredQty = parseFloat(heat.offeredQty);
              const tcQtyRemaining = parseFloat(heat.tcQtyRemaining);
              if (tcQtyRemaining && offeredQty > tcQtyRemaining) {
                newErrors[`heat_${index}_offeredQty`] = 'Offered Qty cannot be more than TC Qty Remaining with Vendor';
              }
            }
          }
        });

        // Validate total offered quantity only if heat data is provided
        if (!formData.rm_total_offered_qty_mt || parseFloat(formData.rm_total_offered_qty_mt) <= 0) {
          newErrors.rm_total_offered_qty_mt = 'Total Offered Quantity (MT) must be greater than 0';
        }

        // Chemical analysis validations only if heat data is provided
        if (!formData.rm_chemical_carbon) {
          newErrors.rm_chemical_carbon = 'Carbon % is required';
        } else {
          const carbon = parseFloat(formData.rm_chemical_carbon);
          if (carbon < 0.5 || carbon > 0.6) {
            newErrors.rm_chemical_carbon = 'Ladle Analysis of Heat should be in tolerance of the Grade Chemistry';
          }
        }

        if (!formData.rm_chemical_manganese) {
          newErrors.rm_chemical_manganese = 'Manganese % is required';
        } else {
          const manganese = parseFloat(formData.rm_chemical_manganese);
          if (manganese < 0.8 || manganese > 1.0) {
            newErrors.rm_chemical_manganese = 'Ladle Analysis of Heat should be in tolerance of the Grade Chemistry';
          }
        }

        if (!formData.rm_chemical_silicon) {
          newErrors.rm_chemical_silicon = 'Silicon % is required';
        } else {
          const silicon = parseFloat(formData.rm_chemical_silicon);
          if (silicon < 1.5 || silicon > 2.0) {
            newErrors.rm_chemical_silicon = 'Ladle Analysis of Heat should be in tolerance of the Grade Chemistry';
          }
        }

        if (!formData.rm_chemical_sulphur) {
          newErrors.rm_chemical_sulphur = 'Sulphur % is required';
        } else {
          const sulphur = parseFloat(formData.rm_chemical_sulphur);
          if (sulphur > 0.03) {
            newErrors.rm_chemical_sulphur = 'Ladle Analysis of Heat should be in tolerance of the Grade Chemistry';
          }
        }

        if (!formData.rm_chemical_phosphorus) {
          newErrors.rm_chemical_phosphorus = 'Phosphorus % is required';
        } else {
          const phosphorus = parseFloat(formData.rm_chemical_phosphorus);
          if (phosphorus > 0.03) {
            newErrors.rm_chemical_phosphorus = 'Ladle Analysis of Heat should be in tolerance of the Grade Chemistry';
          }
        }
        // if (!formData.rm_chemical_chromium) newErrors.rm_chemical_chromium = 'Chromium % is required';
      }
    }

    console.log('🔍 Validation errors:', newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation failed!', newErrors);
      setErrors(newErrors);
      return;
    }

    console.log('✅ Validation passed!');
    setErrors({});

    // Filter data based on inspection type - send only relevant fields
    let filteredData = {
      // Common fields for all inspection types
      po_no: formData.po_no,
      po_serial_no: formData.po_serial_no,
      po_date: formData.po_date,
      po_description: formData.po_description,
      po_qty: formData.po_qty,
      po_unit: formData.po_unit,
      type_of_call: formData.type_of_call,
      desired_inspection_date: formData.desired_inspection_date,
      company_id: formData.company_id,
      company_name: formData.company_name,
      unit_id: formData.unit_id,
      unit_name: formData.unit_name,
      unit_address: formData.unit_address,
      remarks: formData.remarks
    };

    // Add type-specific fields
    if (formData.type_of_call === 'Raw Material') {
      filteredData = {
        ...filteredData,
        rm_heat_tc_mapping: formData.rm_heat_tc_mapping,
        rm_chemical_carbon: formData.rm_chemical_carbon,
        rm_chemical_manganese: formData.rm_chemical_manganese,
        rm_chemical_silicon: formData.rm_chemical_silicon,
        rm_chemical_sulphur: formData.rm_chemical_sulphur,
        rm_chemical_phosphorus: formData.rm_chemical_phosphorus,
        // rm_chemical_chromium: formData.rm_chemical_chromium,
        rm_total_offered_qty_mt: formData.rm_total_offered_qty_mt,
        rm_offered_qty_erc: formData.rm_offered_qty_erc,
        rm_remarks: formData.remarks
      };
    } else if (formData.type_of_call === 'Process') {
      filteredData = {
        ...filteredData,
        process_rm_ic_numbers: formData.process_rm_ic_numbers,
        process_book_set_nos: formData.process_book_set_nos,
        process_lot_heat_mapping: formData.process_lot_heat_mapping,
        process_total_accepted_qty_rm: formData.process_total_accepted_qty_rm
      };
    } else if (formData.type_of_call === 'Final') {
      filteredData = {
        ...filteredData,
        final_lot_numbers: formData.final_lot_numbers,
        final_manufacturer_heat: formData.final_manufacturer_heat,
        final_erc_qty: formData.final_erc_qty,
        final_total_qty: formData.final_total_qty,
        final_hdpe_bags: formData.final_hdpe_bags,
        final_rm_ic_numbers: formData.final_rm_ic_numbers,
        final_process_ic_numbers: formData.final_process_ic_numbers,
        final_total_accepted_qty_process: formData.final_total_accepted_qty_process,
        final_unit_id: formData.final_unit_id,
        final_unit_name: formData.final_unit_name,
        final_unit_address: formData.final_unit_address
      };
    }

    console.log('📤 Calling onSubmit with filtered data:', filteredData);
    onSubmit(filteredData);
  };

  const handleReset = () => {
    setFormData(getInitialFormState(selectedPO));
    setSelectedPoSerial('');
    setErrors({});
  };

  return (
    <div className="ric-form">
      {/* ============ COMMON SECTION ============ */}
      <SectionHeader
        title="PO Data (Auto Fetched from IREPS)"
        subtitle="Select PO Serial Number to auto-populate PO details"
      />

      <div className="ric-form-grid">
        <FormField label="PO Serial Number" name="po_serial_no" required hint={selectedItem ? "Auto Fetched" : "Select to auto-fetch PO data"} errors={errors}>
          {selectedItem ? (
            <input
              type="text"
              className="ric-form-input ric-form-input--disabled"
              value={selectedPoSerial}
              disabled
            />
          ) : (
            <select
              className="ric-form-select"
              value={selectedPoSerial}
              onChange={(e) => handlePoSerialChange(e.target.value)}
            >
              <option value="">Select PO Serial Number</option>
              {poSerialOptions.map(po => (
                <option key={po.serialNo} value={po.serialNo}>
                  {po.serialNo} - {po.itemName}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="PO Number" name="po_no" hint="Auto Fetched" errors={errors}>
          <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.po_no} disabled />
        </FormField>

        <FormField label="PO Date" name="po_date" hint="Auto Fetched" errors={errors}>
          <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.po_date ? formatDate(formData.po_date) : ''} disabled />
        </FormField>

        <FormField label="PO Quantity" name="po_qty" hint="Auto Fetched" errors={errors}>
          <input type="text" className="ric-form-input ric-form-input--disabled" value={`${formData.po_qty} ${formData.po_unit}`} disabled />
        </FormField>

        {formData.amendment_no && (
          <>
            <FormField label="Amendment No." name="amendment_no" hint="Auto Fetched" errors={errors}>
              <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.amendment_no} disabled />
            </FormField>
            <FormField label="Amendment Date" name="amendment_date" hint="Auto Fetched" errors={errors}>
              <input type="text" className="ric-form-input ric-form-input--disabled" value={formatDate(formData.amendment_date)} disabled />
            </FormField>
          </>
        )}

        <FormField label="Type of ERC" name="type_of_erc" required hint="Select ERC type" errors={errors}>
          <select
            name="type_of_erc"
            className="ric-form-select"
            value={formData.type_of_erc}
            onChange={handleChange}
          >
            {ERC_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Desired Inspection Date" name="desired_inspection_date" required hint="" errors={errors}>
              <input
                type="date"
                name="desired_inspection_date"
                className="ric-form-input"
                value={formData.desired_inspection_date}
                onChange={handleChange}
                min={getTodayDate()}
                // max={getMaxDate()}
              />
            </FormField>


      </div>

      {/* Quantity Already Inspected Summary */}
      {formData.po_serial_no && (
        <div className="ric-qty-summary">
          <div className="ric-qty-summary__title">Quantity Accepted</div>
          <div className="ric-qty-summary__grid">
            <div className="ric-qty-card">
              <span className="ric-qty-card__label">Raw Material</span>
              <span className="ric-qty-card__value">{formData.qty_already_inspected_rm}</span>
            </div>
            <div className="ric-qty-card">
              <span className="ric-qty-card__label">Process</span>
              <span className="ric-qty-card__value">{formData.qty_already_inspected_process}</span>
            </div>
            <div className="ric-qty-card">
              <span className="ric-qty-card__label">Final</span>
              <span className="ric-qty-card__value">{formData.qty_already_inspected_final}</span>
            </div>
            {/* <div className="ric-qty-card ric-qty-card--remaining">
              <span className="ric-qty-card__label">Remaining (PO)</span>
              <span className="ric-qty-card__value">{formData.po_qty - formData.qty_already_inspected_final}</span>
            </div> */}
          </div>
        </div>
      )}

      {/* ============ SUB PO INFORMATION (if selected) ============ */}
      {selectedSubPO && (formData.type_of_call === 'Raw Material' || formData.type_of_call === 'Process') && (
        <>
          <SectionHeader title="Sub PO Information" subtitle="Details of selected Sub PO" />
          <div className="ric-form-grid">
            <FormField label="Sub-PO Number">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={selectedSubPO.sub_po_number}
                disabled
              />
            </FormField>
            <FormField label="Raw Material Name">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={selectedSubPO.raw_material_name}
                disabled
              />
            </FormField>
            <FormField label="Contractor">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={selectedSubPO.contractor}
                disabled
              />
            </FormField>
            <FormField label="Manufacturer">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={selectedSubPO.manufacturer}
                disabled
              />
            </FormField>
            <FormField label="Sub-PO Quantity">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={selectedSubPO.sub_po_quantity}
                disabled
              />
            </FormField>
            <FormField label="Rate (₹)">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={selectedSubPO.rate}
                disabled
              />
            </FormField>
          </div>
        </>
      )}

      {/* ============ CALL TYPE SELECTION ============ */}
      <SectionHeader title="Call Details" subtitle="Select type of inspection call" />

      <div className="ric-form-grid">
        <FormField label="Type of Call" name="type_of_call" required hint="Select inspection stage" errors={errors}>
          <select
            name="type_of_call"
            className="ric-form-select"
            value={formData.type_of_call}
            onChange={handleChange}
          >
            {INSPECTION_STAGES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* ============ SHOW REST OF FORM ONLY AFTER TYPE SELECTION ============ */}
      {formData.type_of_call && (
        <>
          <div className="ric-form-grid">
            {/* <FormField label="Desired Inspection Date" name="desired_inspection_date" required hint="" errors={errors}>
              <input
                type="date"
                name="desired_inspection_date"
                className="ric-form-input"
                value={formData.desired_inspection_date}
                onChange={handleChange}
                // min={getTodayDate()}
                // max={getMaxDate()}
              />
            </FormField> */}

            {/* <FormField label="Vendor Contact Name" name="vendor_contact_name">
              <input
                type="text"
                name="vendor_contact_name"
                className="ric-form-input"
                value={formData.vendor_contact_name}
                onChange={handleChange}
                placeholder="Enter contact person name"
              />
            </FormField> */}

            {/* <FormField label="Vendor Contact Phone" name="vendor_contact_phone">
              <input
                type="tel"
                name="vendor_contact_phone"
                className="ric-form-input"
                value={formData.vendor_contact_phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </FormField> */}
          </div>

          {/* ============ RAW MATERIAL STAGE FIELDS ============ */}
          {formData.type_of_call === 'Raw Material' && (
            <>
              <SectionHeader
                title="ERC Raw Material Details - Heat Numbers & TC Information"
                subtitle="Add multiple heat numbers and select TC for each. Details will be auto-fetched from inventory."
              />

              {/* Dynamic Heat-TC Mapping Sections */}
              {formData.rm_heat_tc_mapping.map((heatMapping, index) => (
                <div key={heatMapping.id} className="ric-heat-section">
                  <div className="ric-heat-section-header">
                    <h4 className="ric-heat-section-title">Heat Number {index + 1}</h4>
                    {formData.rm_heat_tc_mapping.length > 1 && (
                      <button
                        type="button"
                        className="ric-btn-remove-heat"
                        onClick={() => handleRemoveHeatNumber(heatMapping.id)}
                        title="Remove this heat number"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div className="ric-form-grid">
                    {/* Heat Number - Dropdown from Inventory {heat.rawMaterial} - Qty Left: {heat.qtyLeft} {heat.unit}*/}
                    <FormField
                      label="Heat Number"
                      name={`heat_${index}_heatNumber`}
                      required
                      errors={errors}
                    >
                      <select
                        className="ric-form-select"
                        value={heatMapping.heatNumber}
                        onChange={(e) => handleHeatNumberChange(heatMapping.id, e.target.value)}
                      >
                        <option value="">-- Select Heat Number --</option>
                        {availableHeatNumbers.map(heat => (
                          <option key={heat.heatNumber} value={heat.heatNumber}>
                            {heat.heatNumber} -  ({heat.supplierName}) 
                          </option>
                        ))}
                      </select>
                    </FormField>

                    {/* TC Number - Dropdown based on selected Heat Number */}
                    <FormField
                      label="TC (Test Certificate) Number"
                      name={`heat_${index}_tcNumber`}
                      required
                      hint="Auto-fetched from inventory"
                      errors={errors}
                    >
                      <select
                        className="ric-form-select"
                        value={heatMapping.tcNumber}
                        onChange={(e) => handleTcNumberChange(heatMapping.id, e.target.value)}
                        disabled={!heatMapping.heatNumber}
                      >
                        <option value="">Select TC Number</option>
                        {getAvailableTcNumbers(heatMapping.heatNumber).map(tc => (
                          <option key={tc.tcNumber} value={tc.tcNumber}>
                            {tc.tcNumber} - {tc.manufacturer}
                          </option>
                        ))}
                      </select>
                      {heatMapping.isLoading && (
                        <div style={{ marginTop: '4px', fontSize: '12px', color: '#2196f3' }}>
                          Loading details...
                        </div>
                      )}
                    </FormField>

                    {/* TC Date - Auto-fetched */}
                    <FormField label="TC Date" name={`heat_${index}_tcDate`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.tcDate ? formatDate(heatMapping.tcDate) : ''}
                        disabled
                      />
                    </FormField>

                    {/* Manufacturer - Auto-fetched */}
                    <FormField label="Manufacturer Name" name={`heat_${index}_manufacturer`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.manufacturer}
                        disabled
                      />
                    </FormField>

                    {/* Invoice Number - Auto-fetched */}
                    <FormField label="Invoice Number" name={`heat_${index}_invoiceNo`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.invoiceNo}
                        disabled
                      />
                    </FormField>

                    {/* Invoice Date - Auto-fetched */}
                    <FormField label="Invoice Date" name={`heat_${index}_invoiceDate`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.invoiceDate ? formatDate(heatMapping.invoiceDate) : ''}
                        disabled
                      />
                    </FormField>

                    {/* Sub PO Number & Date - Auto-fetched */}
                    <FormField label="Sub PO Number & Date" name={`heat_${index}_subPoNumber`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.subPoNumber && heatMapping.subPoDate
                          ? `${heatMapping.subPoNumber} (${formatDate(heatMapping.subPoDate)})`
                          : ''}
                        disabled
                      />
                    </FormField>

                    {/* Sub PO Qty - Auto-fetched */}
                    <FormField label="Sub PO Qty" name={`heat_${index}_subPoQty`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.subPoQty}
                        disabled
                      />
                    </FormField>

                    {/* Total Value of Sub PO - Auto-fetched */}
                    <FormField label="Total Value of Sub PO" name={`heat_${index}_subPoTotalValue`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.subPoTotalValue}
                        disabled
                      />
                    </FormField>

                    {/* TC Qty - Auto-fetched */}
                    <FormField label="TC Qty" name={`heat_${index}_tcQty`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.tcQty}
                        disabled
                      />
                    </FormField>

                    {/* TC Qty Remaining with Vendor - Auto-fetched */}
                    <FormField label="TC Qty Remaining with Vendor" name={`heat_${index}_tcQtyRemaining`} hint="Auto-fetched">
                      <input
                        type="text"
                        className="ric-form-input ric-form-input--disabled"
                        value={heatMapping.tcQtyRemaining}
                        disabled
                      />
                    </FormField>

                    {/* Offered Quantity for this Heat - Manual Input */}
                    <FormField
                      label="Offered Qty (MT)"
                      name={`heat_${index}_offeredQty`}
                      required
                      hint={heatMapping.tcQtyRemaining ? `Max: ${heatMapping.tcQtyRemaining} MT (TC Qty Remaining)` : heatMapping.maxQty ? `Max: ${heatMapping.maxQty} ${heatMapping.unit}` : ''}
                      errors={errors}
                    >
                      <input
                        type="number"
                        className="ric-form-input"
                        value={heatMapping.offeredQty}
                        onChange={(e) => handleHeatOfferedQtyChange(heatMapping.id, e.target.value)}
                        step="0.001"
                        min="0"
                        max={heatMapping.tcQtyRemaining || heatMapping.maxQty || undefined}
                        placeholder="Enter quantity in MT"
                        disabled={!heatMapping.tcNumber}
                      />
                    </FormField>
                  </div>
                </div>
              ))}

              {/* Add Heat Number Button */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  type="button"
                  className="ric-btn-add-heat"
                  onClick={handleAddHeatNumber}
                >
                  + Add Another Heat Number
                </button>
              </div>

              {/* Chemical Analysis - Manual Input (Editable) - Shared across all heats */}
              <SectionHeader
                title="Chemical Analysis of TC"
                subtitle="Enter chemical composition percentages (auto-filled if previously entered)"
              />
              <div className="ric-form-grid">
                <FormField label="Carbon (C) %" name="rm_chemical_carbon" required hint="Range: 0.5 - 0.6" errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_carbon"
                    className="ric-form-input"
                    value={formData.rm_chemical_carbon}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.55"
                  />
                </FormField>

                <FormField label="Manganese (Mn) %" name="rm_chemical_manganese" required hint="Range: 0.8 - 1.0" errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_manganese"
                    className="ric-form-input"
                    value={formData.rm_chemical_manganese}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.9"
                  />
                </FormField>

                <FormField label="Silicon (Si) %" name="rm_chemical_silicon" required hint="Range: 1.5 - 2.0" errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_silicon"
                    className="ric-form-input"
                    value={formData.rm_chemical_silicon}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 1.75"
                  />
                </FormField>

                <FormField label="Sulphur (S) %" name="rm_chemical_sulphur" required hint="Max: 0.03" errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_sulphur"
                    className="ric-form-input"
                    value={formData.rm_chemical_sulphur}
                    onChange={handleChange}
                    step="0.001"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.02"
                  />
                </FormField>

                <FormField label="Phosphorus (P) %" name="rm_chemical_phosphorus" required hint="Max: 0.03" errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_phosphorus"
                    className="ric-form-input"
                    value={formData.rm_chemical_phosphorus}
                    onChange={handleChange}
                    step="0.001"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.02"
                  />
                </FormField>

                {/* <FormField label="Chromium (Cr) %" name="rm_chemical_chromium" required errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_chromium"
                    className="ric-form-input"
                    value={formData.rm_chemical_chromium}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.15"
                  />
                </FormField> */}
              </div>

              {/* Total Offered Quantity - Auto-calculated from all heats */}
              <SectionHeader
                title="Total Offered Quantity Summary"
                subtitle="Auto-calculated from all heat numbers"
              />
              <div className="ric-form-grid">
                <FormField
                  label="Total Offered Qty (MT)"
                  name="rm_total_offered_qty_mt"
                  // hint={`Auto-calculated (Sum of all heats) | Max: ${remainingQty.rm} MT`}
                >
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--calculated"
                    value={formData.rm_total_offered_qty_mt.toFixed(3)}
                    disabled
                  />
                </FormField>

                <FormField
                  label="Approx. No. of ERC to be Supplied"
                  name="rm_offered_qty_erc"
                  // hint="Auto-calculated from Total Qty (1.150 MT per 1000 ERCs)"
                  hint="total offfered Qty / 1.170 (MK-V)
                        total offered Qty / (will tell) -- MK-III"
                >
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--calculated"
                    value={formData.rm_offered_qty_erc.toLocaleString('en-IN')}
                    disabled
                  />
                </FormField>
              </div>
            </>
          )}

          {/* ============ PROCESS STAGE FIELDS ============ */}
          {formData.type_of_call === 'Process' && (
            <>
              <SectionHeader
                title="ERC Process Inspection Details"
                subtitle="Select RM ICs and enter lot details"
              />

              <div className="ric-form-grid">
                {/* RM IC Numbers - Dropdown with Multiple Selection - HARDCODED FOR TESTING */}
                <FormField
                  label="RM IC Numbers"
                  name="process_rm_ic_numbers"
                  required
                  hint="Select approved RM IC for this PO (Hardcoded for testing)"
                  fullWidth
                >
                  <MultiSelectDropdown
                    options={[
                      { value: 'RM-IC-1767597604003', label: 'RM-IC-1767597604003 ' },
                      { value: 'RM-IC-1767603751862', label: 'RM-IC-1767603751862' },
                      { value: 'RM-IC-1767604183531', label: 'RM-IC-1767604183531' },  
                      { value: 'RM-IC-1767604882477', label: 'RM-IC-1767604882477' }
                    ]}
                    selectedValues={formData.process_rm_ic_numbers}
                    onChange={(selectedValues) => handleRmIcSelection(selectedValues)}
                    placeholder="Select RM IC Numbers"
                  />
                  {formData.process_rm_ic_numbers.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      Selected: {formData.process_rm_ic_numbers.join(', ')}
                    </div>
                  )}
                </FormField>

                {/* Book No - Set No - Auto-fetched */}
                <FormField
                  label="Book No - Set No."
                  name="process_book_set_nos"
                  // hint="Auto-fetched for each RM IC Number added above"
                  fullWidth
                >
                  <div className="ric-form-input ric-form-input--disabled" style={{ minHeight: '60px', padding: '12px' }}>
                    {formData.process_book_set_nos.length > 0 ? (
                      formData.process_book_set_nos.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '4px' }}>
                          <strong>{item.icNumber}:</strong> {item.bookSetNo}
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#999' }}>Select RM IC Numbers to auto-fetch Book/Set Numbers</span>
                    )}
                  </div>
                </FormField>

                {/* Info Message for Multiple Lots */}
                {formData.process_lot_heat_mapping.length > 1 && (
                  <div className="ric-info-message" style={{ gridColumn: '1 / -1', padding: '12px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3', marginBottom: '16px' }}>
                    <strong>Note:</strong> If more than 1 lot no. is added - "Process IC for all the Lots will be provided once all the lots are manufactured and inspected during process inspection"
                  </div>
                )}
              </div>

              {/* ========== LOT-HEAT MAPPING SECTION ========== */}
              <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    Lot Numbers & Heat Numbers
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddProcessLotHeat}
                    className="ric-btn-secondary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    + Add Lot & Heat
                  </button>
                </div>

                {/* Lot-Heat Entries */}
                {formData.process_lot_heat_mapping.map((lotHeat, index) => (
                  <div
                    key={lotHeat.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px',
                      backgroundColor: '#f9fafb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Entry #{index + 1}
                      </h5>
                      {formData.process_lot_heat_mapping.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProcessLotHeat(lotHeat.id)}
                          style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="ric-form-grid">
                      {/* Lot Number */}
                      <FormField
                        label="Lot No."
                        name={`process_lot_no_${lotHeat.id}`}
                        required
                        hint="Manual Entry - String"
                      >
                        <input
                          type="text"
                          className="ric-form-input"
                          value={lotHeat.lotNumber}
                          onChange={(e) => handleProcessLotNumberChange(lotHeat.id, e.target.value)}
                          placeholder="Enter Lot Number (e.g., LOT-2025-001)"
                        />
                      </FormField>

                      {/* Heat Number */}
                      <FormField
                        label="Heat Number"
                        name={`process_heat_number_${lotHeat.id}`}
                        required
                        hint="Select heat number from approved RM IC (Hardcoded for testing)"
                      >
                        <select
                          className="ric-form-select"
                          value={lotHeat.heatNumber}
                          onChange={(e) => {
                            const heatValue = e.target.value;
                            // Hardcoded heat data for testing // "T844929" "25-8899" "T844929" "khigtu1234"
                            const hardcodedHeats = {
                              '442974': { manufacturer: 'ABC Steel Industries', qty_accepted: 67500 },
                              'T844929': { manufacturer: 'ABC Steel Industries', qty_accepted: 67500 },
                              'H844927': { manufacturer: 'XYZ Steel Corp', qty_accepted: 90000 },
                              'J844927': { manufacturer: 'XYZ Steel Corp', qty_accepted: 90000 }
                            };
                            const selectedHeat = hardcodedHeats[heatValue];
                            if (selectedHeat) {
                              handleProcessManufacturerHeatChange(
                                lotHeat.id,
                                `${selectedHeat.manufacturer} - ${heatValue}`,
                                heatValue,
                                selectedHeat.manufacturer,
                                selectedHeat.qty_accepted
                              );
                            }
                          }}
                        >
                          <option value="">Select Heat Number</option>
                          <option value="442974">ABC Steel Industries - HT-2025-001 (Accepted: 67500 ERCs)</option>
                          <option value="T844929">JSPL - HT-2025-002 (Accepted: 67500 ERCs)</option>
                          <option value="H844927">TATA STEEL - HT-2025-003 (Accepted: 90000 ERCs)</option>
                          <option value="J844927">XYZ Steel Corp - HT-2025-004 (Accepted: 90000 ERCs)</option>
                        </select>
                      </FormField>

                      {/* Offered Quantity */}
                      {/* <FormField
                        label="Offered Qty (ERCs)"
                        name={`process_offered_qty_${lotHeat.id}`}
                        required
                        hint={lotHeat.heatNumber && lotHeat.maxQty ? `Max: ${lotHeat.maxQty} ERCs (from RM IC)` : "Select heat number first"}
                      >
                        <input
                          type="number"
                          className="ric-form-input"
                          value={lotHeat.offeredQty}
                          onChange={(e) => handleProcessOfferedQtyChange(lotHeat.id, e.target.value)}
                          min="0"
                          max={lotHeat.maxQty || undefined}
                          placeholder="Enter quantity"
                          disabled={!lotHeat.heatNumber}
                        />
                      </FormField> */}

                      {/* Offered Quantity */}
                      {/* <FormField
                        label="Offered Qty (ERC)"
                        name={`process_offered_qty_${lotHeat.id}`}
                        required
                        hint={`Max: ${formData.process_total_accepted_qty_rm} (Total Accepted in RM IC)`}
                      >
                        <input
                          type="number"
                          className="ric-form-input"
                          value={lotHeat.offeredQty}
                          onChange={(e) => handleProcessOfferedQtyChange(lotHeat.id, e.target.value)}
                          min="0"
                          max={formData.process_total_accepted_qty_rm}
                          placeholder="Enter quantity"
                        />
                      </FormField> */}
                    </div>
                  </div>
                ))}
              </div>

              <div className="ric-form-grid">
              </div>
            </>
          )}

          {/* ============ FINAL STAGE FIELDS ============ */}
          {formData.type_of_call === 'Final' && (
            <>
              <SectionHeader
                title="ERC Final Inspection Details"
                subtitle="Select lots and enter final quantity details"
              />

              <div className="ric-form-grid">
                {/* Lot No. - Dropdown with Multiple Selection */}
                      {/* RM IC Numbers - Dropdown with Multiple Selection */}
                      <FormField
                        label="RM IC Numbers"
                        name="final_rm_ic_numbers"
                        required
                        hint="Mock data - showing all completed RM ICs for testing"
                        fullWidth
                      >
                        <MultiSelectDropdown
                          options={availableRmIcs.map(ic => ({
                            value: ic.icNumber,
                            label: `${ic.icNumber} (Heat: ${ic.heatNumber}, Accepted: ${ic.qtyAccepted})`
                          }))}
                          selectedValues={formData.final_rm_ic_numbers}
                          onChange={(selectedValues) => setFormData(prev => ({ ...prev, final_rm_ic_numbers: selectedValues }))}
                          placeholder="Select RM IC Numbers"
                        />
                        {formData.final_rm_ic_numbers.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                            Selected: {formData.final_rm_ic_numbers.join(', ')}
                          </div>
                        )}
                      </FormField>

                      {/* Process IC Numbers - Dropdown with Multiple Selection */}
                      <FormField
                        label="Process IC Numbers"
                        name="final_process_ic_numbers"
                        required
                        hint="Mock data - showing all completed Process ICs for testing"
                        fullWidth
                      >
                        <MultiSelectDropdown
                          options={PROCESS_INSPECTION_CALLS
                            .filter(ic => ic.status === 'Completed')
                            .map(ic => ({
                              value: ic.icNumber,
                              label: `${ic.icNumber} (Lot: ${ic.lotNumber}, Accepted: ${ic.qtyAccepted})`
                            }))}
                          selectedValues={formData.final_process_ic_numbers}
                          onChange={(selectedValues) => handleFinalProcessIcSelection(selectedValues)}
                          placeholder="Select Process IC Numbers"
                        />
                        {formData.final_process_ic_numbers.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                            Selected: {formData.final_process_ic_numbers.join(', ')}
                          </div>
                        )}
                      </FormField>
                {/* Lot No. - Dropdown with Add Button */}
                <FormField
                  label="Lot No."
                  name="final_lot_numbers"
                  required
                  hint="Select lot numbers and click Add to include multiple lots"
                  fullWidth
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <select
                        className="ric-form-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !formData.final_lot_numbers.includes(e.target.value)) {
                            const newLots = [...formData.final_lot_numbers, e.target.value];
                            handleFinalLotSelection(newLots);
                          }
                        }}
                      >
                        <option value="">Select Lot Number</option>
                        {PROCESS_INSPECTION_CALLS
                          .filter(ic => ic.status === 'Completed')
                          .map(ic => (
                            <option key={ic.lotNumber} value={ic.lotNumber}>
                              {ic.lotNumber} (IC: {ic.icNumber}, Accepted: {ic.qtyAccepted})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Display added lots */}
                  {formData.final_lot_numbers.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                        Added Lots ({formData.final_lot_numbers.length}):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formData.final_lot_numbers.map((lotNumber, index) => {
                          const lotInfo = PROCESS_INSPECTION_CALLS.find(ic => ic.lotNumber === lotNumber);
                          return (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 12px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              <div style={{ fontSize: '14px', color: '#374151' }}>
                                <strong>{lotNumber}</strong>
                                {lotInfo && (
                                  <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                                    (IC: {lotInfo.icNumber}, Accepted: {lotInfo.qtyAccepted})
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newLots = formData.final_lot_numbers.filter((_, i) => i !== index);
                                  handleFinalLotSelection(newLots);
                                }}
                                style={{
                                  padding: '4px 12px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '500'
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </FormField>

                {/* Manufacturer - Heat No. - Auto Fetch */}
                <FormField
                  label="Manufacturer - Heat No."
                  name="final_manufacturer_heat"
                  hint="Auto Fetch based on selected lots"
                  fullWidth
                >
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.final_manufacturer_heat}
                    disabled
                    placeholder="Auto-fetched from selected lots"
                  />
                </FormField>

                {/* Qunantity (No. of ERC) - Free Text */}
                <FormField
                  label="Qunantity (No. of ERC)"
                  name="final_erc_qty"
                  required
                  // hint="Free Text - Integer"
                >
                  <input
                    type="number"
                    name="final_erc_qty"
                    className="ric-form-input"
                    value={formData.final_erc_qty}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="Enter quantity (integer)"
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#d32f2f', fontWeight: '500' }}>
                    {/* Final Inspection call can only be placed if: Offered Qty = Corresponding Value for Each Lot */}
                  </div>
                  {formData.final_total_accepted_qty_process > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      Total Accepted Material in Process IC: <strong>{formData.final_total_accepted_qty_process}</strong>
                    </div>
                  )}
                </FormField>

                {/* Total Qty - Auto Calculate */}
                <FormField
                  label="Total Qty"
                  name="final_total_qty"
                  // hint="Auto calculate: Quantity × No. of HDPE Bags"
                >
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.final_total_qty}
                    disabled
                    placeholder="Auto-calculated"
                  />
                </FormField>

                {/* No of HDPE Bags - Free Text */}
                <FormField
                  label="No of HDPE Bags"
                  name="final_hdpe_bags"
                  required
                  // hint="Free Text - Integer. Validation: Total Qty / No. of HDPE Bags <= 50"
                >
                  <input
                    type="number"
                    name="final_hdpe_bags"
                    className="ric-form-input"
                    value={formData.final_hdpe_bags}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder="Enter number of bags (integer)"
                  />
                  {formData.final_total_qty && formData.final_hdpe_bags && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      Qty per bag: <strong>{Math.ceil(parseInt(formData.final_total_qty) / parseInt(formData.final_hdpe_bags))}</strong>
                      {Math.ceil(parseInt(formData.final_total_qty) / parseInt(formData.final_hdpe_bags)) > 50 && (
                        <span style={{ color: '#d32f2f', marginLeft: '8px' }}>(Exceeds limit of 50!)</span>
                      )}
                    </div>
                  )}
                </FormField>

              </div>
            </>
          )}

          {/* ============ PLACE OF INSPECTION ============ */}
          <SectionHeader title="Place of Inspection" subtitle="Select unit for inspection" />

          <div className="ric-form-grid">
            {/* Company Name - Dropdown */}
            <FormField label="Place of Inspection - Company Name" name="company_name" required errors={errors}>
              <select
                className="ric-form-select"
                value={formData.company_id}
                onChange={(e) => {
                  const companyId = e.target.value;
                  const company = COMPANY_UNIT_MASTER.find(c => c.id === parseInt(companyId));
                  setFormData(prev => ({
                    ...prev,
                    company_id: companyId,
                    company_name: company?.companyName || '',
                    cin: company?.cin || '',
                    // Reset unit when company changes
                    unit_id: '',
                    unit_name: '',
                    unit_address: '',
                    unit_gstin: '',
                    unit_contact_person: ''
                  }));
                }}
              >
                <option value="">-- Select Company --</option>
                {COMPANY_UNIT_MASTER.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </FormField>

            {/* CIN - Auto Fetch from master data */}
            {/* <FormField label="place of Inspection - CIN" name="cin" hint="Auto Fetch from master data">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={formData.cin}
                disabled
              />
            </FormField> */}

            {/* Unit Name - For Final stage: auto-filled from Process IC, For others: Dropdown */}
            {formData.type_of_call === 'Final' ? (
              <FormField
                label="place of Inspection - Unit Name"
                name="final_unit_name"
                // hint="Auto fill - same as the data for Process Inspection for that particular serial number"
              >
                <input
                  type="text"
                  className="ric-form-input ric-form-input--disabled"
                  value={formData.final_unit_name}
                  disabled
                />
              </FormField>
            ) : (
              <FormField
                label="place of Inspection - Unit Name"
                name="unit_id"
                required
                hint="DropDown (based upon the selection of Company name)"
              >
                <select
                  className="ric-form-select"
                  value={formData.unit_id}
                  onChange={(e) => handleUnitChange(e.target.value)}
                >
                  <option value="">Select Unit</option>
                  {unitOptions.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.unitName}</option>
                  ))}
                </select>
              </FormField>
            )}

            {/* Unit Address - For Final stage: auto-filled from Process IC, For others: Auto Fetch */}
            {formData.type_of_call === 'Final' ? (
              <FormField
                label="place of Inspection - Unit Address"
                name="final_unit_address"
                // hint="Auto fill - same as the data for Process Inspection for that particular serial number"
                fullWidth
              >
                <input
                  type="text"
                  className="ric-form-input ric-form-input--disabled"
                  value={formData.final_unit_address}
                  disabled
                />
              </FormField>
            ) : (
              <FormField label="place of Inspection - Unit Address" name="unit_address" hint="Auto Fetch" fullWidth>
                <input
                  type="text"
                  className="ric-form-input ric-form-input--disabled"
                  value={formData.unit_address}
                  disabled
                />
              </FormField>
            )}
          </div>

          {/* Company Details Table - Show for non-Final stages when unit is selected, or for Final when lots are selected */}
          {/* {((formData.type_of_call !== 'Final' && formData.unit_id) || (formData.type_of_call === 'Final' && formData.final_unit_name)) && (
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                Company Details Table
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>Name</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>CIN</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>Unit Name</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>Unit Address</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>GSTIN</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>Name of Contact Person</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: '600' }}>Role of Unit (ERC Manufacturer, Steel Round Supplier (ERC), Sleeper Manufacturer, Cement Supplier)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formData.company_name}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formData.cin}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {formData.type_of_call === 'Final' ? formData.final_unit_name : formData.unit_name}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {formData.type_of_call === 'Final' ? formData.final_unit_address : formData.unit_address}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formData.unit_gstin}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formData.unit_contact_person}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formData.unit_role}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                Note: Entries created by Admin or created by Vendor (approved by Admin)
              </div>
            </div>
          )} */}

          {/* ============ REMARKS ============ */}
          <SectionHeader title="Additional Information" />

          <div className="ric-form-grid">
            <FormField label="Remarks" name="remarks" fullWidth>
              <textarea
                name="remarks"
                className="ric-form-textarea"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Enter any additional remarks..."
              />
            </FormField>
          </div>

          {/* ============ FORM ACTIONS ============ */}
          <div className="ric-form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset Form
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading || !formData.type_of_call}
            >
              {isLoading ? 'Submitting...' : 'Submit Inspection Call'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RaiseInspectionCallForm;
