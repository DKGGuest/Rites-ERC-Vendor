// src/components/NewInventoryEntryForm.js
import { useState, useEffect, useMemo } from 'react';
import '../styles/forms.css';
import { COMPANY_UNIT_MASTER, RAW_MATERIAL_GRADE_MAPPING } from '../data/vendorMockData';

const NewInventoryEntryForm = ({ masterData = {}, onSubmit, isLoading = false }) => {
  const initialFormState = {
    companyId: '',
    companyName: '',
    unitId: '',
    unitName: '',
    rawMaterial: '',
    supplierName: '',
    supplierAddress: '',
    gradeSpecification: '',
    heatNumber: '',
    tcNumber: '',
    tcDate: '',
    invoiceNumber: '',
    invoiceDate: '',
    subPoNumber: '',
    subPoDate: '',
    subPoQty: '',
    rateOfMaterial: '',
    rateOfGst: '',
    declaredQuantity: '',
    baseValuePO: '',
    totalPO: '',
    lengthOfBars: '',
    unitOfMeasurement: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Get available units based on selected supplier
  const availableUnits = useMemo(() => {
    if (!formData.supplierName) return [];

    // Map supplier names to company names
    const supplierToCompanyMap = {
      'Jayaswal Neco': 'ABC Industries Pvt Ltd',
      'Tata Steel': 'XYZ Steel Mills Ltd',
      'JSPL': 'JSPL',
      'RINL': 'ABC Industries Pvt Ltd',
      'ABC Suppliers Pvt Ltd': 'ABC Industries Pvt Ltd',
      'XYZ Materials Co.': 'XYZ Steel Mills Ltd',
      'Steel India Ltd': 'XYZ Steel Mills Ltd',
      'National Cement Corp': 'ABC Industries Pvt Ltd'
    };

    const companyName = supplierToCompanyMap[formData.supplierName];
    if (!companyName) return [];

    const company = COMPANY_UNIT_MASTER.find(c => c.companyName === companyName);
    return company?.units || [];
  }, [formData.supplierName]);

  // Get available grades based on selected raw material
  const availableGrades = useMemo(() => {
    if (!formData.rawMaterial) return [];
    return RAW_MATERIAL_GRADE_MAPPING[formData.rawMaterial] || [];
  }, [formData.rawMaterial]);

  // Dynamic field label for Heat Number based on material
  const getHeatNumberLabel = () => {
    const material = formData.rawMaterial?.toLowerCase() || '';
    if (material.includes('steel') || material.includes('round')) return 'Heat Number';
    if (material.includes('cement') || material.includes('rubber') || material.includes('chemical')) return 'Batch Number';
    if (material.includes('aggregate') || material.includes('sleeper')) return 'Lot Number';
    return 'Heat Number / Batch Number / Lot Number';
  };

  // Default master data options
  const defaultMasterData = {
    rawMaterials: ['Spring Steel Round Bars', 'Cement', 'HTS Wire', 'Dowel', 'Aggregate', 'SGCI Insert'],
    suppliers: [
      'Jayaswal Neco',
      'Tata Steel',
      'JSPL',
      'RINL',
      'ABC Suppliers Pvt Ltd',
      'XYZ Materials Co.',
      'Steel India Ltd',
      'National Cement Corp'
    ],
    grades: ['Grade A', 'Grade B', 'Grade C', 'IS 2062', 'IS 1786', 'OPC 53', 'PPC'],
    units: ['Kg', 'MT', 'Nos', 'Ltrs', 'Bags', 'Cubic Meter']
  };

  const data = { ...defaultMasterData, ...masterData };

  // Auto-fetch supplier address when supplier is selected and reset unit fields
  useEffect(() => {
    if (formData.supplierName) {
      const supplierAddresses = {
        'ABC Suppliers Pvt Ltd': 'Plot No. 45, Industrial Area, Phase II, New Delhi - 110020',
        'XYZ Materials Co.': '123, MIDC Industrial Estate, Pune - 411018',
        'Steel India Ltd': 'Sector 18, Gurugram, Haryana - 122015',
        'National Cement Corp': 'NH-8, Bhiwadi, Rajasthan - 301019',
        'Jayaswal Neco': 'Industrial Area, Raipur, Chhattisgarh - 492001',
        'Tata Steel': 'Jamshedpur, Jharkhand - 831001',
        'JSPL': 'Jindal Steel Complex, Angul, Odisha - 759122',
        'RINL': 'Visakhapatnam Steel Plant, Andhra Pradesh - 530031'
      };
      setFormData(prev => ({
        ...prev,
        supplierAddress: supplierAddresses[formData.supplierName] || '',
        // Reset unit fields when supplier changes
        unitId: '',
        unitName: ''
      }));
    }
  }, [formData.supplierName]);

  // Handle company selection - cascading effect (COMMENTED OUT - No longer needed)
  // const handleCompanyChange = (e) => {
  //   const companyId = e.target.value;
  //   const company = COMPANY_UNIT_MASTER.find(c => c.id === parseInt(companyId));

  //   setFormData(prev => ({
  //     ...prev,
  //     companyId: companyId,
  //     companyName: company?.companyName || '',
  //     // Reset unit fields when company changes
  //     unitId: '',
  //     unitName: ''
  //   }));

  //   // Clear company and unit errors
  //   if (errors.companyId) {
  //     setErrors(prev => ({ ...prev, companyId: '', unitId: '' }));
  //   }
  // };

  // Handle unit selection
  const handleUnitChange = (e) => {
    const unitId = e.target.value;

    // Map supplier names to company names
    const supplierToCompanyMap = {
      'Jayaswal Neco': 'ABC Industries Pvt Ltd',
      'Tata Steel': 'XYZ Steel Mills Ltd',
      'JSPL': 'JSPL',
      'RINL': 'ABC Industries Pvt Ltd',
      'ABC Suppliers Pvt Ltd': 'ABC Industries Pvt Ltd',
      'XYZ Materials Co.': 'XYZ Steel Mills Ltd',
      'Steel India Ltd': 'XYZ Steel Mills Ltd',
      'National Cement Corp': 'ABC Industries Pvt Ltd'
    };

    const companyName = supplierToCompanyMap[formData.supplierName];
    const company = COMPANY_UNIT_MASTER.find(c => c.companyName === companyName);
    const unit = company?.units.find(u => u.id === parseInt(unitId));

    setFormData(prev => ({
      ...prev,
      companyId: company?.id || '',
      companyName: company?.companyName || '',
      unitId: unitId,
      unitName: unit?.unitName || ''
    }));

    // Clear unit error
    if (errors.unitId) {
      setErrors(prev => ({ ...prev, unitId: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If raw material changes, reset grade specification
    if (name === 'rawMaterial') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        gradeSpecification: '' // Reset grade when raw material changes
      }));
      // Clear both errors
      if (errors[name] || errors.gradeSpecification) {
        setErrors(prev => ({ ...prev, [name]: '', gradeSpecification: '' }));
      }
    }
    // If supplier name changes, reset unit fields (handled by useEffect)
    else if (name === 'supplierName') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name] || errors.unitId) {
        setErrors(prev => ({ ...prev, [name]: '', unitId: '' }));
      }
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'unitId', // Removed 'companyId' as it's now derived from supplier
      'rawMaterial', 'supplierName', 'gradeSpecification', 'heatNumber',
      'tcNumber', 'tcDate', 'invoiceNumber', 'invoiceDate',
      'subPoNumber', 'subPoDate', 'subPoQty', 'rateOfMaterial',
      'rateOfGst', 'declaredQuantity', 'unitOfMeasurement'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate numeric fields
    ['subPoQty', 'rateOfMaterial', 'rateOfGst', 'declaredQuantity'].forEach(field => {
      if (formData[field] && isNaN(parseFloat(formData[field]))) {
        newErrors[field] = 'Must be a valid number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = onSubmit?.(formData);
      // Reset form if submission was successful (parent returns true)
      if (result) {
        handleReset();
      }
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <div className="inventory-entry-form">
      <form onSubmit={handleSubmit}>

        {/* Material & Supplier Information Section */}
        <div className="form-section">
          <div className="form-section-header">
            <h4 className="form-section-title">📦 Material & Supplier Information</h4>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Name of Raw Material <span className="required">*</span>
              </label>
              <select
                name="rawMaterial"
                value={formData.rawMaterial}
                onChange={handleChange}
                className={`form-input ${errors.rawMaterial ? 'error' : ''}`}
              >
                <option value="">-- Select Material --</option>
                {data.rawMaterials.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.rawMaterial && <span className="error-text">{errors.rawMaterial}</span>}
            </div>




            <div className="form-group">
              <label className="form-label">
                Grade / Specification <span className="required">*</span>
              </label>
              <select
                name="gradeSpecification"
                value={formData.gradeSpecification}
                onChange={handleChange}
                className={`form-input ${errors.gradeSpecification ? 'error' : ''}`}
                disabled={!formData.rawMaterial || availableGrades.length === 0}
              >
                <option value="">
                  {!formData.rawMaterial ? '-- Select Raw Material First --' : '-- Select Grade --'}
                </option>
                {availableGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.gradeSpecification && <span className="error-text">{errors.gradeSpecification}</span>}
              {!formData.rawMaterial && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  Please select a raw material first to see available grades
                </div>
              )}
            </div>




            <div className="form-group">
              <label className="form-label">
               Length of Bars <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="lengthOfBars"
                value={formData.lengthOfBars}
                onChange={handleChange}
                className={`form-input ${errors.lengthOfBars ? 'error' : ''}`}
                placeholder="Length of Bars"
              />
              {errors.subPoQty && <span className="error-text">{errors.lengthOfBars}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Supplier Name <span className="required">*</span>
              </label>
              <select
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                className={`form-input ${errors.supplierName ? 'error' : ''}`}
              >
                <option value="">-- Select Supplier --</option>
                {data.suppliers.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.supplierName && <span className="error-text">{errors.supplierName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Unit Name <span className="required">*</span>
              </label>
              <select
                name="unitId"
                value={formData.unitId}
                onChange={handleUnitChange}
                className={`form-input ${errors.unitId ? 'error' : ''}`}
                disabled={!formData.supplierName || availableUnits.length === 0}
              >
                <option value="">
                  {!formData.supplierName ? '-- Select Supplier First --' : '-- Select Unit --'}
                </option>
                {availableUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unitName}
                  </option>
                ))}
              </select>
              {errors.unitId && <span className="error-text">{errors.unitId}</span>}
              {!formData.supplierName && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  Please select a supplier first to see available units
                </div>
              )}
            </div>

            {/* <div className="form-group">
              <label className="form-label">
                Grade / Specification <span className="required">*</span>
              </label>
              <select
                name="gradeSpecification"
                value={formData.gradeSpecification}
                onChange={handleChange}
                className={`form-input ${errors.gradeSpecification ? 'error' : ''}`}
                disabled={!formData.rawMaterial || availableGrades.length === 0}
              >
                <option value="">
                  {!formData.rawMaterial ? '-- Select Raw Material First --' : '-- Select Grade --'}
                </option>
                {availableGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.gradeSpecification && <span className="error-text">{errors.gradeSpecification}</span>}
              {!formData.rawMaterial && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  Please select a raw material first to see available grades
                </div>
              )}
            </div> */}

            <div className="form-group full-width">
              <label className="form-label">Supplier Address (Auto-fetched)</label>
              <input
                type="text"
                name="supplierAddress"
                value={formData.supplierAddress}
                className="form-input disabled"
                disabled
                placeholder="Will be auto-filled based on supplier selection"
              />
            </div>

            {/* <div className="form-group">
              <label className="form-label">
               Length of Bars <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="lengthOfBars"
                value={formData.lengthOfBars}
                onChange={handleChange}
                className={`form-input ${errors.lengthOfBars ? 'error' : ''}`}
                placeholder="Length of Bars"
              />
              {errors.subPoQty && <span className="error-text">{errors.lengthOfBars}</span>}
            </div> */}


            
          </div>
        </div>



        {/* Company & Unit Information Section - COMMENTED OUT */}
        {/* <div className="form-section">
          <div className="form-section-header">
            <h4 className="form-section-title">🏢 Company & Unit Information</h4>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Company Name <span className="required">*</span>
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleCompanyChange}
                className={`form-input ${errors.companyId ? 'error' : ''}`}
              >
                <option value="">-- Select Company --</option>
                {COMPANY_UNIT_MASTER.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
              {errors.companyId && <span className="error-text">{errors.companyId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Unit Name <span className="required">*</span>
              </label>
              <select
                name="unitId"
                value={formData.unitId}
                onChange={handleUnitChange}
                className={`form-input ${errors.unitId ? 'error' : ''}`}
                disabled={!formData.companyId || availableUnits.length === 0}
              >
                <option value="">
                  {!formData.companyId ? '-- Select Company First --' : '-- Select Unit --'}
                </option>
                {availableUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unitName}
                  </option>
                ))}
              </select>
              {errors.unitId && <span className="error-text">{errors.unitId}</span>}
              {!formData.companyId && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  Please select a company first to see available units
                </div>
              )}
            </div>
          </div>
        </div> */}



        {/* Conditional Sections - Only show after Raw Material is selected */}
        {formData.rawMaterial && (
          <>
            {/* Test Certificate & Batch Information Section */}
            <div className="form-section">
              <div className="form-section-header">
                <h4 className="form-section-title">📋 Test Certificate & Batch Information</h4>
              </div>
              <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                {getHeatNumberLabel()} <span className="required">*</span>
              </label>
              <input
                type="text"
                name="heatNumber"
                value={formData.heatNumber}
                onChange={handleChange}
                className={`form-input ${errors.heatNumber ? 'error' : ''}`}
                placeholder={`Enter ${getHeatNumberLabel()}`}
              />
              {errors.heatNumber && <span className="error-text">{errors.heatNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                TC Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="tcNumber"
                value={formData.tcNumber}
                onChange={handleChange}
                className={`form-input ${errors.tcNumber ? 'error' : ''}`}
                placeholder="Enter TC Number"
              />
              {errors.tcNumber && <span className="error-text">{errors.tcNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                TC Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="tcDate"
                value={formData.tcDate}
                onChange={handleChange}
                className={`form-input ${errors.tcDate ? 'error' : ''}`}
              />
              {errors.tcDate && <span className="error-text">{errors.tcDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                TC Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="declaredQuantity"
                value={formData.declaredQuantity}
                onChange={handleChange}
                className={`form-input ${errors.declaredQuantity ? 'error' : ''}`}
                placeholder="Enter TC Qty"
              />
              {errors.declaredQuantity && <span className="error-text">{errors.declaredQuantity}</span>}
            </div>



          </div>
        </div>


        {/* Invoice & Purchase Order Information Section */}
        <div className="form-section">
          <div className="form-section-header">
            <h4 className="form-section-title">🧾 Invoice & Purchase Order Details</h4>
          </div>
          <div className="form-grid">

            <div className="form-group">
              <label className="form-label">
                Sub PO Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="subPoNumber"
                value={formData.subPoNumber}
                onChange={handleChange}
                className={`form-input ${errors.subPoNumber ? 'error' : ''}`}
                placeholder="Enter Sub PO Number"
              />
              {errors.subPoNumber && <span className="error-text">{errors.subPoNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Sub PO Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="subPoDate"
                value={formData.subPoDate}
                onChange={handleChange}
                className={`form-input ${errors.subPoDate ? 'error' : ''}`}
              />
              {errors.subPoDate && <span className="error-text">{errors.subPoDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Sub PO Qty <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="subPoQty"
                value={formData.subPoQty}
                onChange={handleChange}
                className={`form-input ${errors.subPoQty ? 'error' : ''}`}
                placeholder="Enter Quantity"
              />
              {errors.subPoQty && <span className="error-text">{errors.subPoQty}</span>}
            </div>



            <div className="form-group">
              <label className="form-label">
                Invoice Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className={`form-input ${errors.invoiceNumber ? 'error' : ''}`}
                placeholder="Enter Invoice Number"
              />
              {errors.invoiceNumber && <span className="error-text">{errors.invoiceNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Invoice Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className={`form-input ${errors.invoiceDate ? 'error' : ''}`}
              />
              {errors.invoiceDate && <span className="error-text">{errors.invoiceDate}</span>}
            </div>

            
          </div>
        </div>


        {/* Pricing & Quantity Information Section */}
        <div className="form-section">
          <div className="form-section-header">
            <h4 className="form-section-title">💰 Pricing & Quantity Details</h4>
          </div>


          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Unit of Measurement <span className="required">*</span>
              </label>
              <select
                name="unitOfMeasurement"
                value={formData.unitOfMeasurement}
                onChange={handleChange}
                className={`form-input ${errors.unitOfMeasurement ? 'error' : ''}`}
              >
                <option value="">-- Select Unit --</option>
                {data.units.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.unitOfMeasurement && <span className="error-text">{errors.unitOfMeasurement}</span>}
            </div>



            <div className="form-group">
              <label className="form-label">
                Rate of Material (Rs/UOM) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="rateOfMaterial"
                value={formData.rateOfMaterial}
                onChange={handleChange}
                className={`form-input ${errors.rateOfMaterial ? 'error' : ''}`}
                placeholder="Enter Rate"
              />
              {errors.rateOfMaterial && <span className="error-text">{errors.rateOfMaterial}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Rate of GST (%) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="rateOfGst"
                value={formData.rateOfGst}
                onChange={handleChange}
                className={`form-input ${errors.rateOfGst ? 'error' : ''}`}
                placeholder="Enter GST %"
              />
              {errors.rateOfGst && <span className="error-text">{errors.rateOfGst}</span>}
            </div>

            {/* <div className="form-group">
              <label className="form-label">
                TC Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="declaredQuantity"
                value={formData.declaredQuantity}
                onChange={handleChange}
                className={`form-input ${errors.declaredQuantity ? 'error' : ''}`}
                placeholder="Enter TC Qty"
              />
              {errors.declaredQuantity && <span className="error-text">{errors.declaredQuantity}</span>}
            </div> */}

            <div className="form-group">
              <label className="form-label">
               Base Value of PO <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="baseValuePO"
                value={formData.baseValuePO}
                onChange={handleChange}
                className={`form-input ${errors.baseValuePO ? 'error' : ''}`}
                placeholder="Enter Base Value of PO"
              />
              {errors.rateOfGst && <span className="error-text">{errors.baseValuePO}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Total PO <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="totalPO"
                value={formData.totalPO}
                onChange={handleChange}
                className={`form-input ${errors.totalPO ? 'error' : ''}`}
                placeholder="Enter Total PO"
              />
              {errors.rateOfGst && <span className="error-text">{errors.totalPO}</span>}
            </div>




          </div>
        </div>
          </>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleReset}>
            🔄 Reset Form
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? '⏳ Submitting...' : '✓ Submit Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewInventoryEntryForm;

