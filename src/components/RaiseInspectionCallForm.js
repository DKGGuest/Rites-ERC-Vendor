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
  VENDOR_INVENTORY_ENTRIES, // Import inventory data
  // VENDOR_PO_LIST
} from '../data/vendorMockData';
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

// Helper functions
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getMaxDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};
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
  const poSerial = selectedPO ? PO_SERIAL_DETAILS.find(p => p.poNo === selectedPO.po_no) : null;

  return {
    // === COMMON SECTION (Auto Fetched from IREPS) ===
    po_no: selectedPO?.po_no || '',
    po_serial_no: poSerial?.serialNo || '',
    po_date: selectedPO?.po_date || '',
    po_description: selectedPO?.description || '',
    po_qty: poSerial?.poQty || selectedPO?.quantity || 0,
    po_unit: poSerial?.unit || selectedPO?.unit || '',
    amendment_no: poSerial?.amendmentNo || '',
    amendment_date: poSerial?.amendmentDate || '',
    vendor_contact_name: '',
    vendor_contact_phone: '',

    // === CALL TYPE ===
    type_of_call: '',
    desired_inspection_date: '',

    // === QUANTITY TRACKING (Auto Calculated) ===
    qty_already_inspected_rm: poSerial?.qtyAlreadyInspected?.rm || 0,
    qty_already_inspected_process: poSerial?.qtyAlreadyInspected?.process || 0,
    qty_already_inspected_final: poSerial?.qtyAlreadyInspected?.final || 0,

    // === RAW MATERIAL STAGE FIELDS ===
    rm_heat_numbers: '', // Manual string input (can add multiple, comma-separated)
    rm_tc_number: '', // Dropdown - selected from inventory based on heat number
    rm_tc_date: '',
    rm_manufacturer: '',
    rm_invoice_no: '',
    rm_invoice_date: '',
    rm_sub_po_number: '',
    rm_sub_po_date: '',
    rm_sub_po_qty: '',
    rm_sub_po_total_value: '',
    rm_tc_qty: '',
    rm_tc_qty_remaining: '',
    // Chemical Analysis - Manual input (editable)
    rm_chemical_carbon: '',
    rm_chemical_manganese: '',
    rm_chemical_silicon: '',
    rm_chemical_sulphur: '',
    rm_chemical_phosphorus: '',
    rm_chemical_chromium: '',
    // Heat-wise offered quantities (array of objects: [{heatNumber, offeredQty}])
    rm_heat_quantities: [],
    rm_total_offered_qty_mt: 0, // Auto-calculated (sum of all heat quantities)
    rm_offered_qty_erc: 0, // Auto-calculated from total

    // === PROCESS STAGE FIELDS ===
    process_rm_ic_numbers: [], // Multi-select from completed RM ICs
    process_book_set_nos: [], // Auto-fetched based on selected RM ICs (array of {icNumber, bookSetNo})
    process_lot_no: '', // Manual string entry
    process_manufacturer_heat: '',
    process_offered_qty: '',
    process_total_accepted_qty_rm: 0, // Total accepted quantity from selected RM ICs

    // === FINAL STAGE FIELDS ===
    final_lot_numbers: [], // Multi-select dropdown - Lots from Process ICs
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
    company_id: COMPANY_UNIT_MASTER[0]?.id || '', // Auto-filled with vendor's company
    company_name: COMPANY_UNIT_MASTER[0]?.companyName || '', // Auto-filled with vendor's company (Name of Vendor)
    cin: COMPANY_UNIT_MASTER[0]?.cin || '', // Auto-filled from master data
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
  selectedPO = null,
  selectedItem = null,
  selectedSubPO = null,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState(() => getInitialFormState(selectedPO));
  const [errors, setErrors] = useState({});
  const [selectedPoSerial, setSelectedPoSerial] = useState(selectedItem?.po_serial_no || '');

  // Handle PO Serial selection
  const handlePoSerialChange = useCallback((serialNo) => {
    const poSerial = PO_SERIAL_DETAILS.find(p => p.serialNo === serialNo);
    if (poSerial) {
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
    }
  }, []);

  // Reset form when PO or Item changes
  useEffect(() => {
    setFormData(getInitialFormState(selectedPO));
    setErrors({});

    // Auto-fill PO Serial Number if item is provided
    if (selectedItem?.po_serial_no) {
      setSelectedPoSerial(selectedItem.po_serial_no);
      handlePoSerialChange(selectedItem.po_serial_no);
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
  const remainingQty = useMemo(() => {
    const poSerial = PO_SERIAL_DETAILS.find(p => p.serialNo === formData.po_serial_no);
    if (!poSerial) return { rm: 0, process: 0, final: 0 };

    return {
      rm: poSerial.poQty - poSerial.qtyAlreadyInspected.rm,
      process: poSerial.qtyAlreadyInspected.rm - poSerial.qtyAlreadyInspected.process,
      final: poSerial.qtyAlreadyInspected.process - poSerial.qtyAlreadyInspected.final
    };
  }, [formData.po_serial_no]);

  // Auto-calculate total offered quantity and ERC when heat quantities change
  useEffect(() => {
    if (formData.type_of_call === 'Raw Material' && formData.rm_heat_quantities.length > 0) {
      const totalMt = formData.rm_heat_quantities.reduce((sum, heat) => {
        return sum + (parseFloat(heat.offeredQty) || 0);
      }, 0);
      const ercQty = calculateErcFromMt(totalMt);
      setFormData(prev => ({
        ...prev,
        rm_total_offered_qty_mt: totalMt,
        rm_offered_qty_erc: ercQty
      }));
    } else if (formData.type_of_call === 'Raw Material' && formData.rm_heat_quantities.length === 0) {
      setFormData(prev => ({
        ...prev,
        rm_total_offered_qty_mt: 0,
        rm_offered_qty_erc: 0
      }));
    }
  }, [formData.rm_heat_quantities, formData.type_of_call, calculateErcFromMt]);

  // Get available heat numbers from inventory (only Fresh or Inspection Requested status)
  const availableHeatNumbers = useMemo(() => {
    return VENDOR_INVENTORY_ENTRIES
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
  }, []);

  // Get available TC numbers based on heat number input (from inventory)
  const availableTcNumbers = useMemo(() => {
    if (!formData.rm_heat_numbers) return [];
    const heatNumbers = formData.rm_heat_numbers.split(',').map(h => h.trim()).filter(h => h);
    const tcList = [];
    heatNumbers.forEach(heatNo => {
      // First try to find in inventory
      const inventoryEntry = VENDOR_INVENTORY_ENTRIES.find(entry => entry.heatNumber === heatNo);
      if (inventoryEntry && !tcList.find(tc => tc.tcNumber === inventoryEntry.tcNumber)) {
        tcList.push({
          tcNumber: inventoryEntry.tcNumber,
          heatNumber: inventoryEntry.heatNumber,
          manufacturer: inventoryEntry.supplierName, // Using supplier as manufacturer
          tcDate: inventoryEntry.tcDate,
          invoiceNo: inventoryEntry.invoiceNumber,
          invoiceDate: inventoryEntry.invoiceDate,
          subPoNumber: inventoryEntry.subPoNumber,
          subPoDate: inventoryEntry.subPoDate,
          subPoQty: `${inventoryEntry.subPoQty} ${inventoryEntry.unitOfMeasurement}`,
          subPoTotalValue: `₹${(inventoryEntry.subPoQty * inventoryEntry.rateOfMaterial * (1 + inventoryEntry.rateOfGst / 100)).toFixed(2)}`,
          tcQty: `${inventoryEntry.declaredQuantity} ${inventoryEntry.unitOfMeasurement}`,
          tcQtyRemaining: `${inventoryEntry.qtyLeftForInspection} ${inventoryEntry.unitOfMeasurement}`
        });
      } else {
        // Fallback to old HEAT_TC_MAPPING if not found in inventory
        const heat = HEAT_TC_MAPPING.find(h => h.heatNumber === heatNo);
        if (heat && !tcList.find(tc => tc.tcNumber === heat.tcNumber)) {
          tcList.push(heat);
        }
      }
    });
    return tcList;
  }, [formData.rm_heat_numbers]);

  // Auto-fetch details when TC number is selected (from inventory)
  useEffect(() => {
    if (formData.rm_tc_number) {
      // First try to find in inventory
      const inventoryEntry = VENDOR_INVENTORY_ENTRIES.find(entry => entry.tcNumber === formData.rm_tc_number);

      if (inventoryEntry) {
        // Calculate total value
        const totalValue = (inventoryEntry.subPoQty * inventoryEntry.rateOfMaterial * (1 + inventoryEntry.rateOfGst / 100)).toFixed(2);

        // Auto-fetch chemical analysis if exists
        const analysis = CHEMICAL_ANALYSIS_HISTORY.find(a =>
          a.heatNumber === inventoryEntry.heatNumber
        );

        setFormData(prev => ({
          ...prev,
          rm_tc_date: inventoryEntry.tcDate || '',
          rm_manufacturer: inventoryEntry.supplierName || '',
          rm_invoice_no: inventoryEntry.invoiceNumber || '',
          rm_invoice_date: inventoryEntry.invoiceDate || '',
          rm_sub_po_number: inventoryEntry.subPoNumber || '',
          rm_sub_po_date: inventoryEntry.subPoDate || '',
          rm_sub_po_qty: `${inventoryEntry.subPoQty} ${inventoryEntry.unitOfMeasurement}`,
          rm_sub_po_total_value: `₹${totalValue}`,
          rm_tc_qty: `${inventoryEntry.declaredQuantity} ${inventoryEntry.unitOfMeasurement}`,
          rm_tc_qty_remaining: `${inventoryEntry.qtyLeftForInspection} ${inventoryEntry.unitOfMeasurement}`,
          // Auto-fill chemical analysis if available
          rm_chemical_carbon: analysis?.carbon || '',
          rm_chemical_manganese: analysis?.manganese || '',
          rm_chemical_silicon: analysis?.silicon || '',
          rm_chemical_sulphur: analysis?.sulphur || '',
          rm_chemical_phosphorus: analysis?.phosphorus || '',
          rm_chemical_chromium: analysis?.chromium || ''
        }));
      } else {
        // Fallback to old HEAT_TC_MAPPING
        const tcData = HEAT_TC_MAPPING.find(h => h.tcNumber === formData.rm_tc_number);
        if (tcData) {
          const analysis = CHEMICAL_ANALYSIS_HISTORY.find(a =>
            a.heatNumber === tcData.heatNumber && a.manufacturer === tcData.manufacturer
          );

          setFormData(prev => ({
            ...prev,
            rm_tc_date: tcData.tcDate || '',
            rm_manufacturer: tcData.manufacturer || '',
            rm_invoice_no: tcData.invoiceNo || '',
            rm_invoice_date: tcData.invoiceDate || '',
            rm_sub_po_number: tcData.subPoNumber || '',
            rm_sub_po_date: tcData.subPoDate || '',
            rm_sub_po_qty: tcData.subPoQty || '',
            rm_sub_po_total_value: tcData.subPoTotalValue || '',
            rm_tc_qty: tcData.tcQty || '',
            rm_tc_qty_remaining: tcData.tcQtyRemaining || '',
            // Auto-fill chemical analysis if available
            rm_chemical_carbon: analysis?.carbon || '',
            rm_chemical_manganese: analysis?.manganese || '',
            rm_chemical_silicon: analysis?.silicon || '',
            rm_chemical_sulphur: analysis?.sulphur || '',
            rm_chemical_phosphorus: analysis?.phosphorus || '',
            rm_chemical_chromium: analysis?.chromium || ''
          }));
        }
      }
    }
  }, [formData.rm_tc_number]);

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

  // Handle heat number input change - create heat quantity entries
  const handleHeatNumbersChange = (value) => {
    const heatNumbers = value.split(',').map(h => h.trim()).filter(h => h);
    const newHeatQuantities = heatNumbers.map(heatNo => {
      const existing = formData.rm_heat_quantities.find(h => h.heatNumber === heatNo);
      return existing || { heatNumber: heatNo, offeredQty: '' };
    });
    setFormData(prev => ({
      ...prev,
      rm_heat_numbers: value,
      rm_heat_quantities: newHeatQuantities
    }));
  };

  // Handle individual heat quantity change
  const handleHeatQuantityChange = (heatNumber, quantity) => {
    const updatedQuantities = formData.rm_heat_quantities.map(heat =>
      heat.heatNumber === heatNumber
        ? { ...heat, offeredQty: quantity }
        : heat
    );
    setFormData(prev => ({ ...prev, rm_heat_quantities: updatedQuantities }));
  };

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for heat numbers
    if (name === 'rm_heat_numbers') {
      handleHeatNumbersChange(value);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form based on call type
  const validate = () => {
    const newErrors = {};
    const today = getTodayDate();
    const maxDate = getMaxDate();

    // Common validations
    if (!formData.po_serial_no) newErrors.po_serial_no = 'PO Serial Number is required';
    if (!formData.type_of_call) newErrors.type_of_call = 'Type of Call is required';
    if (!formData.desired_inspection_date) {
      newErrors.desired_inspection_date = 'Desired Inspection Date is required';
    } else if (formData.desired_inspection_date < today) {
      newErrors.desired_inspection_date = 'Date cannot be in the past';
    } else if (formData.desired_inspection_date > maxDate) {
      newErrors.desired_inspection_date = 'Date must be within 7 days from today';
    }
    if (!formData.company_id) newErrors.company_id = 'Company is required';
    if (!formData.unit_id) newErrors.unit_id = 'Unit is required';

    // Raw Material stage validations
    if (formData.type_of_call === 'Raw Material') {
      if (!formData.rm_heat_numbers || formData.rm_heat_numbers.trim() === '') {
        newErrors.rm_heat_numbers = 'Heat Number is required';
      }
      if (!formData.rm_tc_number) {
        newErrors.rm_tc_number = 'TC Number is required';
      }
      // Validate heat quantities
      if (formData.rm_heat_quantities.length === 0) {
        newErrors.rm_heat_quantities = 'At least one heat with offered quantity is required';
      } else {
        const hasEmptyQuantity = formData.rm_heat_quantities.some(h => !h.offeredQty || parseFloat(h.offeredQty) <= 0);
        if (hasEmptyQuantity) {
          newErrors.rm_heat_quantities = 'All heat numbers must have offered quantity greater than 0';
        }
      }
      // Validate total offered quantity
      if (!formData.rm_total_offered_qty_mt || parseFloat(formData.rm_total_offered_qty_mt) <= 0) {
        newErrors.rm_total_offered_qty_mt = 'Total Offered Quantity (MT) must be greater than 0';
      } else if (parseFloat(formData.rm_total_offered_qty_mt) > remainingQty.rm) {
        newErrors.rm_total_offered_qty_mt = `Total quantity cannot exceed remaining PO quantity (${remainingQty.rm} MT)`;
      }
      // Chemical analysis validations
      if (!formData.rm_chemical_carbon) newErrors.rm_chemical_carbon = 'Carbon % is required';
      if (!formData.rm_chemical_manganese) newErrors.rm_chemical_manganese = 'Manganese % is required';
      if (!formData.rm_chemical_silicon) newErrors.rm_chemical_silicon = 'Silicon % is required';
      if (!formData.rm_chemical_sulphur) newErrors.rm_chemical_sulphur = 'Sulphur % is required';
      if (!formData.rm_chemical_phosphorus) newErrors.rm_chemical_phosphorus = 'Phosphorus % is required';
      if (!formData.rm_chemical_chromium) newErrors.rm_chemical_chromium = 'Chromium % is required';
    }

    // Process stage validations
    if (formData.type_of_call === 'Process') {
      if (formData.process_rm_ic_numbers.length === 0) {
        newErrors.process_rm_ic_numbers = 'At least one RM IC is required';
      }
      if (!formData.process_lot_no || formData.process_lot_no.trim() === '') {
        newErrors.process_lot_no = 'Lot Number is required';
      }
      if (!formData.process_offered_qty || parseFloat(formData.process_offered_qty) <= 0) {
        newErrors.process_offered_qty = 'Offered Quantity is required';
      } else if (parseFloat(formData.process_offered_qty) > formData.process_total_accepted_qty_rm) {
        newErrors.process_offered_qty = `Offered Qty cannot exceed Total Accepted Material in RM IC: ${formData.process_total_accepted_qty_rm}`;
      }
    }

    // Final stage validations
    if (formData.type_of_call === 'Final') {
      if (formData.final_lot_numbers.length === 0) {
        newErrors.final_lot_numbers = 'At least one Lot Number is required';
      }
      if (!formData.final_erc_qty || parseInt(formData.final_erc_qty) <= 0) {
        newErrors.final_erc_qty = 'Quantity (No. of ERC) is required';
      }
      if (!formData.final_hdpe_bags || parseInt(formData.final_hdpe_bags) <= 0) {
        newErrors.final_hdpe_bags = 'Number of HDPE Bags is required';
      } else if (formData.final_erc_qty && formData.final_hdpe_bags) {
        // Validate: Total Qty / No. of HDPE Bags <= 50
        const totalQty = parseInt(formData.final_total_qty) || 0;
        const bags = parseInt(formData.final_hdpe_bags);
        const qtyPerBag = totalQty / bags;
        if (qtyPerBag > 50) {
          newErrors.final_hdpe_bags = `Total Qty / No. of HDPE Bags (${Math.ceil(qtyPerBag)}) exceeds limit of 50`;
        }
      }
      if (formData.final_rm_ic_numbers.length === 0) {
        newErrors.final_rm_ic_numbers = 'At least one RM IC is required';
      }
      if (formData.final_process_ic_numbers.length === 0) {
        newErrors.final_process_ic_numbers = 'At least one Process IC is required';
      }
      // Validate: Offered Qty <= Total Accepted Material in Process IC
      if (formData.final_erc_qty && formData.final_total_accepted_qty_process > 0) {
        if (parseInt(formData.final_erc_qty) > formData.final_total_accepted_qty_process) {
          newErrors.final_erc_qty = `Offered Qty cannot exceed Total Accepted Material in Process IC: ${formData.final_total_accepted_qty_process}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
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
            <FormField label="Desired Inspection Date" name="desired_inspection_date" required hint="" errors={errors}>
              <input
                type="date"
                name="desired_inspection_date"
                className="ric-form-input"
                value={formData.desired_inspection_date}
                onChange={handleChange}
                min={getTodayDate()}
                max={getMaxDate()}
              />
            </FormField>

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
                title="ERC Raw Material Details"
                subtitle="Select heat numbers from inventory and TC will be auto-fetched"
              />

              <div className="ric-form-grid">
                {/* Heat Number - Dropdown from Inventory */}
                <FormField
                  label="Heat Number"
                  name="rm_heat_numbers"
                  required
                  // hint="Selected from inventory list (comma-separated for multiple)"
                >
                  <select
                    name="rm_heat_numbers"
                    className="ric-form-select"
                    value={formData.rm_heat_numbers}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Heat Number --</option>
                    {availableHeatNumbers.map(heat => (
                      <option key={heat.heatNumber} value={heat.heatNumber}>
                        {heat.heatNumber} - {heat.rawMaterial} ({heat.supplierName}) - Qty Left: {heat.qtyLeft} {heat.unit}
                      </option>
                    ))}
                  </select>
                  {/* <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                    💡 For multiple heat numbers, select one and manually add others separated by comma
                  </div> */}
                </FormField>

                {/* TC Number - Dropdown based on Heat Number */}
                <FormField label="TC (Test Certificate) Number" name="rm_tc_number" required hint="Auto-fetched from inventory" errors={errors}>
                  <select
                    name="rm_tc_number"
                    className="ric-form-select"
                    value={formData.rm_tc_number}
                    onChange={handleChange}
                    disabled={!formData.rm_heat_numbers || availableTcNumbers.length === 0}
                  >
                    <option value="">Select TC Number</option>
                    {availableTcNumbers.map(tc => (
                      <option key={tc.tcNumber} value={tc.tcNumber}>
                        {tc.tcNumber} (Heat: {tc.heatNumber}, Supplier: {tc.manufacturer})
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* TC Date - Auto-fetched */}
                <FormField label="TC Date" name="rm_tc_date" hint="Auto-fetched" errors={errors}>
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_tc_date ? formatDate(formData.rm_tc_date) : ''}
                    disabled
                  />
                </FormField>

                {/* Manufacturer - Auto-fetched */}
                <FormField label="Manufacturer Name" name="rm_manufacturer" hint="Auto-fetched" errors={errors}>
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_manufacturer}
                    disabled
                  />
                </FormField>

                {/* Invoice Number - Auto-fetched */}
                <FormField label="Invoice Number" name="rm_invoice_no" hint="Auto-fetched" errors={errors}>
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_invoice_no}
                    disabled
                  />
                </FormField>

                {/* Invoice Date - Auto-fetched */}
                <FormField label="Invoice Date" name="rm_invoice_date" hint="Auto-fetched">
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_invoice_date ? formatDate(formData.rm_invoice_date) : ''}
                    disabled
                  />
                </FormField>

                {/* Sub PO Number & Date - Auto-fetched */}
                <FormField label="Sub PO Number & Date" name="rm_sub_po_number" hint="Auto-fetched">
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_sub_po_number && formData.rm_sub_po_date
                      ? `${formData.rm_sub_po_number} (${formatDate(formData.rm_sub_po_date)})`
                      : ''}
                    disabled
                  />
                </FormField>

                {/* Sub PO Qty - Auto-fetched */}
                <FormField label="Sub PO Qty" name="rm_sub_po_qty" hint="Auto-fetched">
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_sub_po_qty}
                    disabled
                  />
                </FormField>

                {/* Total Value of Sub PO - Auto-fetched */}
                <FormField label="Total Value of Sub PO" name="rm_sub_po_total_value" hint="Auto-fetched">
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_sub_po_total_value}
                    disabled
                  />
                </FormField>

                {/* TC Qty - Auto-fetched */}
                <FormField label="TC Qty" name="rm_tc_qty" hint="Auto-fetched">
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_tc_qty}
                    disabled
                  />
                </FormField>

                {/* TC Qty Remaining with Vendor - Auto-fetched */}
                <FormField label="TC Qty Remaining with Vendor" name="rm_tc_qty_remaining" hint="Auto-fetched">
                  <input
                    type="text"
                    className="ric-form-input ric-form-input--disabled"
                    value={formData.rm_tc_qty_remaining}
                    disabled
                  />
                </FormField>
              </div>

              {/* Chemical Analysis - Manual Input (Editable) */}
              <SectionHeader
                title="Chemical Analysis of TC"
                subtitle="Enter chemical composition percentages (auto-filled if previously entered)"
              />
              <div className="ric-form-grid">
                <FormField label="Carbon (C) %" name="rm_chemical_carbon" required errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_carbon"
                    className="ric-form-input"
                    value={formData.rm_chemical_carbon}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.45"
                  />
                </FormField>

                <FormField label="Manganese (Mn) %" name="rm_chemical_manganese" required errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_manganese"
                    className="ric-form-input"
                    value={formData.rm_chemical_manganese}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.75"
                  />
                </FormField>

                <FormField label="Silicon (Si) %" name="rm_chemical_silicon" required errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_silicon"
                    className="ric-form-input"
                    value={formData.rm_chemical_silicon}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.25"
                  />
                </FormField>

                <FormField label="Sulphur (S) %" name="rm_chemical_sulphur" required errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_sulphur"
                    className="ric-form-input"
                    value={formData.rm_chemical_sulphur}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.03"
                  />
                </FormField>

                <FormField label="Phosphorus (P) %" name="rm_chemical_phosphorus" required errors={errors}>
                  <input
                    type="number"
                    name="rm_chemical_phosphorus"
                    className="ric-form-input"
                    value={formData.rm_chemical_phosphorus}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.04"
                  />
                </FormField>

                <FormField label="Chromium (Cr) %" name="rm_chemical_chromium" required errors={errors}>
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
                </FormField>
              </div>

              {/* Offered Quantity Section */}
              <SectionHeader
                title="Offered Quantity (Heat-wise)"
                // subtitle="Enter the quantity being offered for each heat number"
              />

              {/* Heat-wise Quantity Inputs */}
              {formData.rm_heat_quantities.length > 0 && (
                <div className="ric-heat-quantities">
                  {formData.rm_heat_quantities.map((heat) => (
                    <div key={`${heat.heatNumber}-${heat.tcNumber}`} className="ric-heat-quantity-row">
                      <div className="ric-form-grid">
                        <FormField
                          label={`Heat ${heat.heatNumber} - TC ${heat.tcNumber} - Offered Qty (MT)`}
                          name={`heat_qty_${heat.heatNumber}_${heat.tcNumber}`}
                          required
                          hint={`Enter quantity in MT (Max: ${heat.maxQty} ${heat.unit})`}
                          errors={errors}
                        >
                          <input
                            type="number"
                            className="ric-form-input"
                            value={heat.offeredQty}
                            onChange={(e) => handleHeatQuantityChange(heat.heatNumber, heat.tcNumber, e.target.value)}
                            step="0.001"
                            min="0"
                            placeholder="Enter quantity in MT"
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Offered Quantity - Auto-calculated */}
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
                {/* RM IC Numbers - Dropdown with Multiple Selection */}
                <FormField
                  label="RM IC Numbers"
                  name="process_rm_ic_numbers"
                  required
                  // hint="Dropdown options - all the IC of ERC Raw Material issued for that PO Serial Number for which vendor is requesting call. Multiple IC can be selected"
                  fullWidth
                >
                  <MultiSelectDropdown
                    options={availableRmIcs
                      .filter(ic => ic.poSerialNo === formData.po_serial_no)
                      .map(ic => ({
                        value: ic.icNumber,
                        label: `${ic.icNumber} (Heat: ${ic.heatNumber}, Accepted: ${ic.qtyAccepted})`
                      }))}
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

                {/* Lot No - Manual Entry */}
                <FormField
                  label="Lot No."
                  name="process_lot_no"
                  required
                  hint="Manual Entry - String"
                >
                  <input
                    type="text"
                    name="process_lot_no"
                    className="ric-form-input"
                    value={formData.process_lot_no}
                    onChange={handleChange}
                    placeholder="Enter Lot Number (e.g., LOT-2025-001)"
                  />
                </FormField>

                {/* Message for Multiple Lot Numbers */}
                {formData.process_lot_no && formData.process_lot_no.includes(',') && (
                  <div className="ric-info-message" style={{ gridColumn: '1 / -1', padding: '12px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3', marginBottom: '16px' }}>
                    <strong>Note:</strong> If more than 1 lot no. is added - "Process IC for all the Lots will be provided once all the lots are manufactured and inspected during process inspection"
                  </div>
                )}

                {/* Manufacturer-Heat Number - Dropdown */}
                <FormField
                  label="Manufacturer - Heat Number"
                  name="process_manufacturer_heat"
                  required
                  // hint="Selected one from the list of Heat No.s which have been accepted in the RM IC Number selected above"
                >
                  <select
                    name="process_manufacturer_heat"
                    className="ric-form-select"
                    value={formData.process_manufacturer_heat}
                    onChange={handleChange}
                  >
                    <option value="">Select Manufacturer-Heat</option>
                    {formData.process_rm_ic_numbers.length > 0 &&
                      formData.process_rm_ic_numbers.map(icNumber => {
                        const ic = RM_INSPECTION_CALLS.find(ic => ic.icNumber === icNumber);
                        if (!ic) return null;
                        const heat = HEAT_TC_MAPPING.find(h => h.heatNumber === ic.heatNumber);
                        if (!heat) return null;
                        return (
                          <option key={ic.icNumber} value={`${heat.manufacturer}-${ic.heatNumber}`}>
                            {heat.manufacturer} - {ic.heatNumber}
                          </option>
                        );
                      })
                    }
                  </select>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#d32f2f', fontWeight: '500' }}>
                    {/* Process Inspection call can only be placed if: Offered Qty ≤ Total Accepted Material in RM Inspection Certificate */}
                  </div>
                </FormField>

                {/* Offered Quantity */}
                <FormField
                  label="Offered Qty"
                  name="process_offered_qty"
                  required
                  // hint={`Max: ${formData.process_total_accepted_qty_rm} (Total Accepted in selected RM ICs)`}
                >
                  <input
                    type="number"
                    name="process_offered_qty"
                    className="ric-form-input"
                    value={formData.process_offered_qty}
                    onChange={handleChange}
                    min="0"
                    max={formData.process_total_accepted_qty_rm}
                    placeholder="Enter quantity"
                  />
                  {formData.process_total_accepted_qty_rm > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      Total Accepted Material in RM IC: <strong>{formData.process_total_accepted_qty_rm}</strong>
                    </div>
                  )}
                </FormField>
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
                <FormField
                  label="Lot No."
                  name="final_lot_numbers"
                  required
                  // hint="Dropdown options - Lots captured during process inspection against the same PO serial number and for which IC have been made. Multiple lot no. can be added"
                  fullWidth
                >
                  <MultiSelectDropdown
                    options={PROCESS_INSPECTION_CALLS
                      .filter(ic => ic.poSerialNo === formData.po_serial_no && ic.status === 'Completed')
                      .map(ic => ({
                        value: ic.lotNumber,
                        label: `${ic.lotNumber} (IC: ${ic.icNumber}, Accepted: ${ic.qtyAccepted})`
                      }))}
                    selectedValues={formData.final_lot_numbers}
                    onChange={(selectedValues) => handleFinalLotSelection(selectedValues)}
                    placeholder="Select Lot Numbers"
                  />
                  {formData.final_lot_numbers.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      Selected: {formData.final_lot_numbers.join(', ')}
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

                {/* RM IC Numbers - Dropdown with Multiple Selection */}
                <FormField
                  label="RM IC Numbers"
                  name="final_rm_ic_numbers"
                  required
                  // hint="Dropdown - List of all RM IC made against this Serial Number. Multiple IC can be added"
                  fullWidth
                >
                  <MultiSelectDropdown
                    options={availableRmIcs
                      .filter(ic => ic.poSerialNo === formData.po_serial_no)
                      .map(ic => ({
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
                  // hint="Dropdown - List of all Process IC made against this Serial Number. Multiple IC can be added"
                  fullWidth
                >
                  <MultiSelectDropdown
                    options={PROCESS_INSPECTION_CALLS
                      .filter(ic => ic.poSerialNo === formData.po_serial_no && ic.status === 'Completed')
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
              </div>
            </>
          )}

          {/* ============ PLACE OF INSPECTION ============ */}
          <SectionHeader title="Place of Inspection" subtitle="Select unit for inspection" />

          <div className="ric-form-grid">
            {/* Company Name - Auto-fill (Name of Vendor) */}
            <FormField label="place of Inspection - Company Name" name="company_name" hint="Auto fill (Name of Vendor)">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={formData.company_name}
                disabled
              />
            </FormField>

            {/* CIN - Auto Fetch from master data */}
            <FormField label="place of Inspection - CIN" name="cin" hint="Auto Fetch from master data">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={formData.cin}
                disabled
              />
            </FormField>

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
          {((formData.type_of_call !== 'Final' && formData.unit_id) || (formData.type_of_call === 'Final' && formData.final_unit_name)) && (
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
          )}

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
