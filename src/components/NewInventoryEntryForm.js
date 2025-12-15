// src/components/NewInventoryEntryForm.js
import { useState, useEffect } from 'react';
import '../styles/forms.css';

const NewInventoryEntryForm = ({ masterData = {}, onSubmit, isLoading = false }) => {
  const initialFormState = {
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
    unitOfMeasurement: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

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
    rawMaterials: ['Steel Round', 'Cement', 'Rubber Pad', 'Chemical Compound', 'Aggregate', 'Sleeper Component'],
    suppliers: ['ABC Suppliers Pvt Ltd', 'XYZ Materials Co.', 'Steel India Ltd', 'National Cement Corp'],
    grades: ['Grade A', 'Grade B', 'Grade C', 'IS 2062', 'IS 1786', 'OPC 53', 'PPC'],
    units: ['Kg', 'MT', 'Nos', 'Ltrs', 'Bags', 'Cubic Meter']
  };

  const data = { ...defaultMasterData, ...masterData };

  // Auto-fetch supplier address when supplier is selected
  useEffect(() => {
    if (formData.supplierName) {
      const supplierAddresses = {
        'ABC Suppliers Pvt Ltd': 'Plot No. 45, Industrial Area, Phase II, New Delhi - 110020',
        'XYZ Materials Co.': '123, MIDC Industrial Estate, Pune - 411018',
        'Steel India Ltd': 'Sector 18, Gurugram, Haryana - 122015',
        'National Cement Corp': 'NH-8, Bhiwadi, Rajasthan - 301019'
      };
      setFormData(prev => ({
        ...prev,
        supplierAddress: supplierAddresses[formData.supplierName] || ''
      }));
    }
  }, [formData.supplierName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
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
      onSubmit?.(formData);
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
                Grade / Specification <span className="required">*</span>
              </label>
              <select
                name="gradeSpecification"
                value={formData.gradeSpecification}
                onChange={handleChange}
                className={`form-input ${errors.gradeSpecification ? 'error' : ''}`}
              >
                <option value="">-- Select Grade --</option>
                {data.grades.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.gradeSpecification && <span className="error-text">{errors.gradeSpecification}</span>}
            </div>

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
          </div>
        </div>


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

            <div className="form-group">
              <label className="form-label">
                Declared Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="declaredQuantity"
                value={formData.declaredQuantity}
                onChange={handleChange}
                className={`form-input ${errors.declaredQuantity ? 'error' : ''}`}
                placeholder="Enter Declared Qty"
              />
              {errors.declaredQuantity && <span className="error-text">{errors.declaredQuantity}</span>}
            </div>

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
          </div>
        </div>

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

