// src/components/RaiseInspectionCallForm.js
// Raising an Inspection Call Form - ERC Raw Material, Process, Final stages
// Based on SARTHI specification for Indian Railways inspection management

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  COMPANY_UNIT_MASTER,
  MANUFACTURER_MASTER,
  HEAT_TC_MAPPING,
  CHEMICAL_ANALYSIS_HISTORY,
  RM_INSPECTION_CALLS,
  PROCESS_INSPECTION_CALLS,
  LOT_NUMBERS,
  ERC_CONVERSION_FACTORS,
  PO_SERIAL_DETAILS,
  VENDOR_PO_LIST
} from '../data/vendorMockData';
import '../styles/raiseInspectionCall.css';

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
  { value: 'Raw Material', label: 'ERC Raw Material' },
  { value: 'Process', label: 'ERC Process' },
  { value: 'Final', label: 'ERC Final' }
];

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
    rm_heat_numbers: [], // Multi-select
    rm_tc_numbers: [], // Auto-fetch based on heat
    rm_invoice_no: '',
    rm_invoice_date: '',
    rm_manufacturer: '',
    rm_chemical_analysis: null, // Auto-fetch
    rm_offered_qty_mt: '',
    rm_offered_qty_erc: 0, // Auto-calculated

    // === PROCESS STAGE FIELDS ===
    process_rm_ic_numbers: [], // Multi-select from completed RM ICs
    process_book_set_no: '',
    process_lot_numbers: [], // Multi-select
    process_manufacturer_heat: '',
    process_offered_qty: '',

    // === FINAL STAGE FIELDS ===
    final_lot_numbers: [], // Multi-select
    final_erc_qty: '',
    final_hdpe_bags: '',
    final_rm_ic_numbers: [], // Multi-select
    final_process_ic_numbers: [], // Multi-select

    // === PLACE OF INSPECTION ===
    company_id: '',
    company_name: '',
    cin: '',
    unit_id: '',
    unit_name: '',
    gstin: '',
    unit_address: '',

    // === ADDITIONAL ===
    remarks: ''
  };
};

export const RaiseInspectionCallForm = ({
  selectedPO = null,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState(() => getInitialFormState(selectedPO));
  const [errors, setErrors] = useState({});
  const [selectedPoSerial, setSelectedPoSerial] = useState('');

  // Reset form when PO changes
  useEffect(() => {
    setFormData(getInitialFormState(selectedPO));
    setErrors({});
  }, [selectedPO]);

  // Get available PO serial numbers for dropdown
  const poSerialOptions = useMemo(() => {
    if (!selectedPO) return PO_SERIAL_DETAILS;
    return PO_SERIAL_DETAILS.filter(p => p.poNo === selectedPO.po_no);
  }, [selectedPO]);

  // Get available heat numbers from inventory
  const availableHeatNumbers = useMemo(() => {
    return HEAT_TC_MAPPING.filter(h => h.qtyAvailable > 0);
  }, []);

  // Get available RM ICs for Process stage
  const availableRmIcs = useMemo(() => {
    return RM_INSPECTION_CALLS.filter(ic => ic.status === 'Completed');
  }, []);

  // Get available Process ICs for Final stage
  const availableProcessIcs = useMemo(() => {
    return PROCESS_INSPECTION_CALLS.filter(ic => ic.status === 'Completed');
  }, []);

  // Get available lot numbers
  const availableLots = useMemo(() => {
    return LOT_NUMBERS.filter(l => l.qtyAvailable > 0);
  }, []);

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

  // Auto-calculate ERC quantity when MT changes
  useEffect(() => {
    if (formData.type_of_call === 'Raw Material' && formData.rm_offered_qty_mt) {
      const ercQty = calculateErcFromMt(parseFloat(formData.rm_offered_qty_mt) || 0);
      setFormData(prev => ({ ...prev, rm_offered_qty_erc: ercQty }));
    }
  }, [formData.rm_offered_qty_mt, formData.type_of_call, calculateErcFromMt]);

  // Auto-fetch chemical analysis when heat number is selected
  useEffect(() => {
    if (formData.rm_heat_numbers.length > 0) {
      const heatNo = formData.rm_heat_numbers[0];
      const analysis = CHEMICAL_ANALYSIS_HISTORY.find(a => a.heatNumber === heatNo);
      if (analysis) {
        setFormData(prev => ({ ...prev, rm_chemical_analysis: analysis }));
      }
    }
  }, [formData.rm_heat_numbers]);

  // Handle PO Serial selection
  const handlePoSerialChange = (serialNo) => {
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
  };

  // Handle company selection
  const handleCompanyChange = (companyId) => {
    const company = COMPANY_UNIT_MASTER.find(c => c.id === parseInt(companyId));
    setFormData(prev => ({
      ...prev,
      company_id: companyId,
      company_name: company?.companyName || '',
      cin: company?.cin || '',
      unit_id: '',
      unit_name: '',
      gstin: '',
      unit_address: ''
    }));
  };

  // Handle unit selection
  const handleUnitChange = (unitId) => {
    const company = COMPANY_UNIT_MASTER.find(c => c.id === parseInt(formData.company_id));
    const unit = company?.units.find(u => u.id === parseInt(unitId));
    setFormData(prev => ({
      ...prev,
      unit_id: unitId,
      unit_name: unit?.unitName || '',
      gstin: unit?.gstin || '',
      unit_address: unit?.address || ''
    }));
  };

  // Handle heat number selection (multi-select)
  const handleHeatNumberChange = (heatNumber, isChecked) => {
    const heat = HEAT_TC_MAPPING.find(h => h.heatNumber === heatNumber);
    setFormData(prev => {
      let newHeatNumbers = [...prev.rm_heat_numbers];
      let newTcNumbers = [...prev.rm_tc_numbers];

      if (isChecked) {
        newHeatNumbers.push(heatNumber);
        if (heat) {
          newTcNumbers.push(heat.tcNumber);
          return {
            ...prev,
            rm_heat_numbers: newHeatNumbers,
            rm_tc_numbers: newTcNumbers,
            rm_invoice_no: heat.invoiceNo,
            rm_invoice_date: heat.invoiceDate,
            rm_manufacturer: heat.manufacturer
          };
        }
      } else {
        newHeatNumbers = newHeatNumbers.filter(h => h !== heatNumber);
        if (heat) {
          newTcNumbers = newTcNumbers.filter(t => t !== heat.tcNumber);
        }
      }
      return { ...prev, rm_heat_numbers: newHeatNumbers, rm_tc_numbers: newTcNumbers };
    });
  };

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
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
      if (formData.rm_heat_numbers.length === 0) {
        newErrors.rm_heat_numbers = 'At least one Heat Number is required';
      }
      if (!formData.rm_offered_qty_mt || parseFloat(formData.rm_offered_qty_mt) <= 0) {
        newErrors.rm_offered_qty_mt = 'Offered Quantity (MT) is required';
      } else if (parseFloat(formData.rm_offered_qty_mt) > remainingQty.rm) {
        newErrors.rm_offered_qty_mt = `Quantity cannot exceed remaining PO quantity (${remainingQty.rm})`;
      }
    }

    // Process stage validations
    if (formData.type_of_call === 'Process') {
      if (formData.process_rm_ic_numbers.length === 0) {
        newErrors.process_rm_ic_numbers = 'At least one RM IC is required';
      }
      if (!formData.process_book_set_no) {
        newErrors.process_book_set_no = 'Book/Set Number is required';
      }
      if (formData.process_lot_numbers.length === 0) {
        newErrors.process_lot_numbers = 'At least one Lot Number is required';
      }
      if (!formData.process_offered_qty || parseFloat(formData.process_offered_qty) <= 0) {
        newErrors.process_offered_qty = 'Offered Quantity is required';
      } else if (parseFloat(formData.process_offered_qty) > remainingQty.process) {
        newErrors.process_offered_qty = `Quantity cannot exceed (RM Accepted - Already in Process ICs): ${remainingQty.process}`;
      }
    }

    // Final stage validations
    if (formData.type_of_call === 'Final') {
      if (formData.final_lot_numbers.length === 0) {
        newErrors.final_lot_numbers = 'At least one Lot Number is required';
      }
      if (!formData.final_erc_qty || parseInt(formData.final_erc_qty) <= 0) {
        newErrors.final_erc_qty = 'ERC Quantity is required';
      } else if (parseInt(formData.final_erc_qty) > remainingQty.final) {
        newErrors.final_erc_qty = `Quantity cannot exceed (Process Accepted - Already in Final ICs): ${remainingQty.final}`;
      }
      if (!formData.final_hdpe_bags || parseInt(formData.final_hdpe_bags) <= 0) {
        newErrors.final_hdpe_bags = 'Number of HDPE Bags is required';
      } else {
        // Validate: Total ERCs / No. of bags ≤ 50
        const ercsPerBag = parseInt(formData.final_erc_qty) / parseInt(formData.final_hdpe_bags);
        if (ercsPerBag > 50) {
          newErrors.final_hdpe_bags = `ERCs per bag (${Math.ceil(ercsPerBag)}) exceeds limit of 50`;
        }
      }
      if (formData.final_rm_ic_numbers.length === 0) {
        newErrors.final_rm_ic_numbers = 'At least one RM IC is required';
      }
      if (formData.final_process_ic_numbers.length === 0) {
        newErrors.final_process_ic_numbers = 'At least one Process IC is required';
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

  // Form field component
  const FormField = ({ label, name, required, hint, children, fullWidth = false }) => (
    <div className={`ric-form-group ${fullWidth ? 'ric-form-group--full-width' : ''}`}>
      <label className="ric-form-label">
        {label} {required && <span className="ric-required">*</span>}
      </label>
      {children}
      {hint && <span className="ric-form-hint">{hint}</span>}
      {errors[name] && <span className="ric-form-error">{errors[name]}</span>}
    </div>
  );

  // Section header component
  const SectionHeader = ({ title, subtitle }) => (
    <div className="ric-section-header">
      <h4 className="ric-section-title">{title}</h4>
      {subtitle && <p className="ric-section-subtitle">{subtitle}</p>}
    </div>
  );

  return (
    <div className="ric-form">
      {/* ============ COMMON SECTION ============ */}
      <SectionHeader
        title="PO Data (Auto Fetched from IREPS)"
        subtitle="Select PO Serial Number to auto-populate PO details"
      />

      <div className="ric-form-grid">
        <FormField label="PO Serial Number" name="po_serial_no" required hint="Select to auto-fetch PO data">
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
        </FormField>

        <FormField label="PO Number" name="po_no" hint="Auto Fetched">
          <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.po_no} disabled />
        </FormField>

        <FormField label="PO Date" name="po_date" hint="Auto Fetched">
          <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.po_date ? formatDate(formData.po_date) : ''} disabled />
        </FormField>

        <FormField label="PO Quantity" name="po_qty" hint="Auto Fetched">
          <input type="text" className="ric-form-input ric-form-input--disabled" value={`${formData.po_qty} ${formData.po_unit}`} disabled />
        </FormField>

        {formData.amendment_no && (
          <>
            <FormField label="Amendment No." name="amendment_no" hint="Auto Fetched">
              <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.amendment_no} disabled />
            </FormField>
            <FormField label="Amendment Date" name="amendment_date" hint="Auto Fetched">
              <input type="text" className="ric-form-input ric-form-input--disabled" value={formatDate(formData.amendment_date)} disabled />
            </FormField>
          </>
        )}
      </div>

      {/* Quantity Already Inspected Summary */}
      {formData.po_serial_no && (
        <div className="ric-qty-summary">
          <div className="ric-qty-summary__title">Quantity Already Inspected</div>
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
            <div className="ric-qty-card ric-qty-card--remaining">
              <span className="ric-qty-card__label">Remaining (PO)</span>
              <span className="ric-qty-card__value">{formData.po_qty - formData.qty_already_inspected_final}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============ CALL TYPE SELECTION ============ */}
      <SectionHeader title="Call Details" subtitle="Select type of inspection call and desired date" />

      <div className="ric-form-grid">
        <FormField label="Type of Call" name="type_of_call" required hint="Select inspection stage">
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

        <FormField label="Desired Inspection Date" name="desired_inspection_date" required hint="Within 7 days from today">
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

        <FormField label="Vendor Contact Name" name="vendor_contact_name">
          <input
            type="text"
            name="vendor_contact_name"
            className="ric-form-input"
            value={formData.vendor_contact_name}
            onChange={handleChange}
            placeholder="Enter contact person name"
          />
        </FormField>

        <FormField label="Vendor Contact Phone" name="vendor_contact_phone">
          <input
            type="tel"
            name="vendor_contact_phone"
            className="ric-form-input"
            value={formData.vendor_contact_phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </FormField>
      </div>

      {/* ============ RAW MATERIAL STAGE FIELDS ============ */}
      {formData.type_of_call === 'Raw Material' && (
        <>
          <SectionHeader
            title="ERC Raw Material Details"
            subtitle="Select heat numbers and enter quantity details"
          />

          <div className="ric-form-grid">
            <FormField label="Heat Numbers" name="rm_heat_numbers" required hint="Select from inventory" fullWidth>
              <div className="ric-checkbox-group">
                {availableHeatNumbers.map(heat => (
                  <label key={heat.heatNumber} className="ric-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.rm_heat_numbers.includes(heat.heatNumber)}
                      onChange={(e) => handleHeatNumberChange(heat.heatNumber, e.target.checked)}
                    />
                    <span>{heat.heatNumber} (TC: {heat.tcNumber}, Avail: {heat.qtyAvailable} {heat.unit})</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="TC Numbers" name="rm_tc_numbers" hint="Auto-fetched from Heat selection">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={formData.rm_tc_numbers.join(', ')}
                disabled
              />
            </FormField>

            <FormField label="Invoice No." name="rm_invoice_no" hint="Auto-fetched">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={formData.rm_invoice_no}
                disabled
              />
            </FormField>

            <FormField label="Invoice Date" name="rm_invoice_date" hint="Auto-fetched">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={formData.rm_invoice_date ? formatDate(formData.rm_invoice_date) : ''}
                disabled
              />
            </FormField>

            <FormField label="Manufacturer" name="rm_manufacturer" hint="Auto-fetched from Heat">
              <input
                type="text"
                className="ric-form-input ric-form-input--disabled"
                value={formData.rm_manufacturer}
                disabled
              />
            </FormField>

            <FormField label="Offered Qty (MT)" name="rm_offered_qty_mt" required hint={`Max: ${remainingQty.rm} (Remaining PO Qty)`}>
              <input
                type="number"
                name="rm_offered_qty_mt"
                className="ric-form-input"
                value={formData.rm_offered_qty_mt}
                onChange={handleChange}
                step="0.001"
                min="0"
                placeholder="Enter quantity in MT"
              />
            </FormField>

            <FormField label="Equivalent ERC Qty" name="rm_offered_qty_erc" hint="Auto-calculated (1.150 MT per 1000 ERCs)">
              <input
                type="text"
                className="ric-form-input ric-form-input--calculated"
                value={formData.rm_offered_qty_erc.toLocaleString('en-IN')}
                disabled
              />
            </FormField>
          </div>

          {/* Chemical Analysis (Auto-fetched) */}
          {formData.rm_chemical_analysis && (
            <div className="ric-chemical-analysis">
              <div className="ric-chemical-analysis__title">Chemical Analysis (Auto-fetched)</div>
              <div className="ric-chemical-analysis__grid">
                <div className="ric-chemical-item">
                  <span className="ric-chemical-item__label">Carbon (C)</span>
                  <span className="ric-chemical-item__value">{formData.rm_chemical_analysis.carbon}%</span>
                </div>
                <div className="ric-chemical-item">
                  <span className="ric-chemical-item__label">Manganese (Mn)</span>
                  <span className="ric-chemical-item__value">{formData.rm_chemical_analysis.manganese}%</span>
                </div>
                <div className="ric-chemical-item">
                  <span className="ric-chemical-item__label">Silicon (Si)</span>
                  <span className="ric-chemical-item__value">{formData.rm_chemical_analysis.silicon}%</span>
                </div>
                <div className="ric-chemical-item">
                  <span className="ric-chemical-item__label">Sulphur (S)</span>
                  <span className="ric-chemical-item__value">{formData.rm_chemical_analysis.sulphur}%</span>
                </div>
                <div className="ric-chemical-item">
                  <span className="ric-chemical-item__label">Phosphorus (P)</span>
                  <span className="ric-chemical-item__value">{formData.rm_chemical_analysis.phosphorus}%</span>
                </div>
                <div className="ric-chemical-item">
                  <span className="ric-chemical-item__label">Chromium (Cr)</span>
                  <span className="ric-chemical-item__value">{formData.rm_chemical_analysis.chromium}%</span>
                </div>
              </div>
            </div>
          )}
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
            <FormField label="RM IC Numbers" name="process_rm_ic_numbers" required hint="Select completed RM ICs" fullWidth>
              <div className="ric-checkbox-group">
                {availableRmIcs.map(ic => (
                  <label key={ic.icNumber} className="ric-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.process_rm_ic_numbers.includes(ic.icNumber)}
                      onChange={(e) => {
                        const newIcs = e.target.checked
                          ? [...formData.process_rm_ic_numbers, ic.icNumber]
                          : formData.process_rm_ic_numbers.filter(i => i !== ic.icNumber);
                        setFormData(prev => ({ ...prev, process_rm_ic_numbers: newIcs }));
                      }}
                    />
                    <span>{ic.icNumber} (Heat: {ic.heatNumber}, Accepted: {ic.qtyAccepted})</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Book/Set Number" name="process_book_set_no" required>
              <input
                type="text"
                name="process_book_set_no"
                className="ric-form-input"
                value={formData.process_book_set_no}
                onChange={handleChange}
                placeholder="Enter Book/Set Number"
              />
            </FormField>

            <FormField label="Lot Numbers" name="process_lot_numbers" required hint="Select or create lot numbers" fullWidth>
              <div className="ric-checkbox-group">
                {availableLots.map(lot => (
                  <label key={lot.lotNumber} className="ric-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.process_lot_numbers.includes(lot.lotNumber)}
                      onChange={(e) => {
                        const newLots = e.target.checked
                          ? [...formData.process_lot_numbers, lot.lotNumber]
                          : formData.process_lot_numbers.filter(l => l !== lot.lotNumber);
                        setFormData(prev => ({ ...prev, process_lot_numbers: newLots }));
                      }}
                    />
                    <span>{lot.lotNumber} (RM IC: {lot.rmIcNumber}, Avail: {lot.qtyAvailable})</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Manufacturer-Heat" name="process_manufacturer_heat" hint="Select combination">
              <select
                name="process_manufacturer_heat"
                className="ric-form-select"
                value={formData.process_manufacturer_heat}
                onChange={handleChange}
              >
                <option value="">Select Manufacturer-Heat</option>
                {HEAT_TC_MAPPING.map(h => (
                  <option key={h.heatNumber} value={`${h.manufacturer}-${h.heatNumber}`}>
                    {h.manufacturer} - {h.heatNumber}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Offered Quantity" name="process_offered_qty" required hint={`Max: ${remainingQty.process} (RM Accepted - Already in Process)`}>
              <input
                type="number"
                name="process_offered_qty"
                className="ric-form-input"
                value={formData.process_offered_qty}
                onChange={handleChange}
                min="0"
                placeholder="Enter quantity"
              />
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
            <FormField label="Lot Numbers" name="final_lot_numbers" required hint="Select from Process ICs" fullWidth>
              <div className="ric-checkbox-group">
                {availableLots.map(lot => (
                  <label key={lot.lotNumber} className="ric-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.final_lot_numbers.includes(lot.lotNumber)}
                      onChange={(e) => {
                        const newLots = e.target.checked
                          ? [...formData.final_lot_numbers, lot.lotNumber]
                          : formData.final_lot_numbers.filter(l => l !== lot.lotNumber);
                        setFormData(prev => ({ ...prev, final_lot_numbers: newLots }));
                      }}
                    />
                    <span>{lot.lotNumber} (Avail: {lot.qtyAvailable})</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="ERC Quantity" name="final_erc_qty" required hint={`Max: ${remainingQty.final} (Process Accepted - Already in Final)`}>
              <input
                type="number"
                name="final_erc_qty"
                className="ric-form-input"
                value={formData.final_erc_qty}
                onChange={handleChange}
                min="0"
                placeholder="Enter ERC quantity"
              />
            </FormField>

            <FormField label="No. of HDPE Bags" name="final_hdpe_bags" required hint="Max 50 ERCs per bag">
              <input
                type="number"
                name="final_hdpe_bags"
                className="ric-form-input"
                value={formData.final_hdpe_bags}
                onChange={handleChange}
                min="1"
                placeholder="Enter number of bags"
              />
            </FormField>

            {formData.final_erc_qty && formData.final_hdpe_bags && (
              <div className="ric-calculation-info">
                ERCs per bag: {Math.ceil(parseInt(formData.final_erc_qty) / parseInt(formData.final_hdpe_bags))}
                {Math.ceil(parseInt(formData.final_erc_qty) / parseInt(formData.final_hdpe_bags)) > 50 && (
                  <span className="ric-calculation-warning"> (Exceeds limit of 50!)</span>
                )}
              </div>
            )}

            <FormField label="RM IC Numbers" name="final_rm_ic_numbers" required hint="Select related RM ICs" fullWidth>
              <div className="ric-checkbox-group">
                {availableRmIcs.map(ic => (
                  <label key={ic.icNumber} className="ric-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.final_rm_ic_numbers.includes(ic.icNumber)}
                      onChange={(e) => {
                        const newIcs = e.target.checked
                          ? [...formData.final_rm_ic_numbers, ic.icNumber]
                          : formData.final_rm_ic_numbers.filter(i => i !== ic.icNumber);
                        setFormData(prev => ({ ...prev, final_rm_ic_numbers: newIcs }));
                      }}
                    />
                    <span>{ic.icNumber} (Heat: {ic.heatNumber})</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Process IC Numbers" name="final_process_ic_numbers" required hint="Select related Process ICs" fullWidth>
              <div className="ric-checkbox-group">
                {availableProcessIcs.map(ic => (
                  <label key={ic.icNumber} className="ric-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.final_process_ic_numbers.includes(ic.icNumber)}
                      onChange={(e) => {
                        const newIcs = e.target.checked
                          ? [...formData.final_process_ic_numbers, ic.icNumber]
                          : formData.final_process_ic_numbers.filter(i => i !== ic.icNumber);
                        setFormData(prev => ({ ...prev, final_process_ic_numbers: newIcs }));
                      }}
                    />
                    <span>{ic.icNumber} (Lot: {ic.lotNumber}, Accepted: {ic.qtyAccepted})</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        </>
      )}

      {/* ============ PLACE OF INSPECTION ============ */}
      <SectionHeader title="Place of Inspection" subtitle="Select company and unit for inspection" />

      <div className="ric-form-grid">
        <FormField label="Company Name" name="company_id" required>
          <select
            className="ric-form-select"
            value={formData.company_id}
            onChange={(e) => handleCompanyChange(e.target.value)}
          >
            <option value="">Select Company</option>
            {COMPANY_UNIT_MASTER.map(company => (
              <option key={company.id} value={company.id}>{company.companyName}</option>
            ))}
          </select>
        </FormField>

        <FormField label="CIN" name="cin" hint="Auto-fetched">
          <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.cin} disabled />
        </FormField>

        <FormField label="Unit Name" name="unit_id" required hint="Select unit for inspection">
          <select
            className="ric-form-select"
            value={formData.unit_id}
            onChange={(e) => handleUnitChange(e.target.value)}
            disabled={!formData.company_id}
          >
            <option value="">Select Unit</option>
            {unitOptions.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.unitName}</option>
            ))}
          </select>
        </FormField>

        <FormField label="GSTIN" name="gstin" hint="Auto-fetched">
          <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.gstin} disabled />
        </FormField>

        <FormField label="Unit Address" name="unit_address" hint="Auto-fetched" fullWidth>
          <input type="text" className="ric-form-input ric-form-input--disabled" value={formData.unit_address} disabled />
        </FormField>
      </div>

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
    </div>
  );
};

export default RaiseInspectionCallForm;
