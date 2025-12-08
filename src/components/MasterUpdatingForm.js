// src/components/MasterUpdatingForm.js
// Master Updating Form - Fields dynamically change based on Master Type selection
// Designed for future backend integration

import React, { useState, useMemo } from 'react';

// Master Type options
const MASTER_TYPES = [
  { value: '', label: 'Select Master Type' },
  { value: 'Place', label: 'Place' },
  { value: 'Factory', label: 'Factory' },
  { value: 'Contractor', label: 'Contractor' },
  { value: 'Manufacturer', label: 'Manufacturer' },
  { value: 'Sub-PO Entity', label: 'Sub-PO Entity' }
];

// Dynamic field labels based on Master Type
const FIELD_LABELS = {
  'Place': {
    entity_name: 'Place Name',
    primary_identifier: 'PIN Code',
    address_details: 'Full Address',
    statutory_document: 'Address Proof',
    support_document: 'Utility Bill',
    contact_details: 'Place Contact No.',
    email: 'Place Email'
  },
  'Factory': {
    entity_name: 'Factory Name',
    primary_identifier: 'GSTIN',
    address_details: 'Factory Address',
    statutory_document: 'GST Certificate',
    support_document: 'Factory License',
    contact_details: 'Factory Contact No.',
    email: 'Factory Email'
  },
  'Contractor': {
    entity_name: 'Contractor Name',
    primary_identifier: 'GSTIN / CIN',
    address_details: 'Office Address',
    statutory_document: 'CIN Document',
    support_document: 'Contractor Agreement',
    contact_details: 'Contractor Contact No.',
    email: 'Contractor Email'
  },
  'Manufacturer': {
    entity_name: 'Manufacturer Name',
    primary_identifier: 'GSTIN / CIN',
    address_details: 'Manufacturing Address',
    statutory_document: 'GST Certificate / CIN Document',
    support_document: 'Manufacturing License',
    contact_details: 'Manufacturer Contact No.',
    email: 'Manufacturer Email'
  },
  'Sub-PO Entity': {
    entity_name: 'Entity Name',
    primary_identifier: 'GSTIN / CIN',
    address_details: 'Entity Address',
    statutory_document: 'GST Certificate / CIN Document',
    support_document: 'Supporting Documents',
    contact_details: 'Entity Contact No.',
    email: 'Entity Email'
  }
};

// Default labels when no Master Type is selected
const DEFAULT_LABELS = {
  entity_name: 'Entity Name',
  primary_identifier: 'Primary Identifier (PIN/GSTIN/CIN)',
  address_details: 'Address Details',
  statutory_document: 'Statutory Document (GST/CIN/Address Proof)',
  support_document: 'Support Document',
  contact_details: 'Contact Details',
  email: 'Email (If applicable)'
};

// Initial form state
const getInitialFormState = () => ({
  master_type: '',
  entity_name: '',
  primary_identifier: '',
  address_details: '',
  statutory_document: null,
  statutory_document_filename: '',
  support_document: null,
  support_document_filename: '',
  contact_details: '',
  email: '',
  is_active: true
});

export const MasterUpdatingForm = ({
  masterData = {},
  editData = null,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState(() => 
    editData ? { ...getInitialFormState(), ...editData } : getInitialFormState()
  );
  const [errors, setErrors] = useState({});

  // Get dynamic labels based on selected master type
  const labels = useMemo(() => {
    return formData.master_type 
      ? FIELD_LABELS[formData.master_type] || DEFAULT_LABELS 
      : DEFAULT_LABELS;
  }, [formData.master_type]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'master_type') {
      // Reset form when master type changes
      setFormData({
        ...getInitialFormState(),
        master_type: value
      });
      setErrors({});
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [fieldName]: 'Only PDF, JPG, PNG files allowed' }));
        return;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [fieldName]: 'File size must be less than 10MB' }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}_filename`]: file.name
      }));
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.master_type) newErrors.master_type = 'Master Type is required';
    if (!formData.entity_name?.trim()) newErrors.entity_name = `${labels.entity_name} is required`;
    if (!formData.primary_identifier?.trim()) newErrors.primary_identifier = `${labels.primary_identifier} is required`;
    if (!formData.address_details?.trim()) newErrors.address_details = `${labels.address_details} is required`;

    // Statutory Document is required
    if (!formData.statutory_document && !formData.statutory_document_filename) {
      newErrors.statutory_document = `${labels.statutory_document} is required`;
    }

    if (!formData.contact_details?.trim()) newErrors.contact_details = `${labels.contact_details} is required`;

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
    setFormData(getInitialFormState());
    setErrors({});
  };

  // Form field component for consistency
  const FormField = ({ label, name, required, hint, children, fullWidth = false }) => (
    <div className={`vendor-form-group ${fullWidth ? 'full-width' : ''}`}>
      <label className="vendor-form-label">
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
      {hint && <span className="vendor-form-hint">{hint}</span>}
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="master-updating-form">
      <div className="vendor-form-grid">
        {/* Master Type Dropdown - Controls all other fields */}
        <FormField
          label="Master Type"
          name="master_type"
          required
          hint="Controls the labels and requirements of all other fields"
        >
          <select
            name="master_type"
            value={formData.master_type}
            onChange={handleChange}
            className="vendor-form-select"
          >
            {(masterData.master_types || MASTER_TYPES).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FormField>

        {/* Entity Name */}
        <FormField
          label={labels.entity_name}
          name="entity_name"
          required
          hint={formData.master_type ? `Enter ${labels.entity_name}` : 'Select Master Type first'}
        >
          <input
            type="text"
            name="entity_name"
            value={formData.entity_name}
            onChange={handleChange}
            className="vendor-form-input"
            placeholder={`Enter ${labels.entity_name}`}
            disabled={!formData.master_type}
          />
        </FormField>

        {/* Primary Identifier */}
        <FormField
          label={labels.primary_identifier}
          name="primary_identifier"
          required
          hint={formData.master_type === 'Place' ? '6-digit PIN Code' : 'GSTIN (15 chars) or CIN (21 chars)'}
        >
          <input
            type="text"
            name="primary_identifier"
            value={formData.primary_identifier}
            onChange={handleChange}
            className="vendor-form-input"
            placeholder={`Enter ${labels.primary_identifier}`}
            disabled={!formData.master_type}
          />
        </FormField>

        {/* Address Details - Full width */}
        <FormField
          label={labels.address_details}
          name="address_details"
          required
          fullWidth
        >
          <textarea
            name="address_details"
            value={formData.address_details}
            onChange={handleChange}
            className="vendor-form-input"
            rows={3}
            placeholder={`Enter ${labels.address_details}`}
            disabled={!formData.master_type}
            style={{ resize: 'vertical' }}
          />
        </FormField>

        {/* Statutory Document Upload - Required */}
        <FormField
          label={labels.statutory_document}
          name="statutory_document"
          required
          hint="PDF/JPG/PNG, Max 10MB - Required"
        >
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'statutory_document')}
            className="vendor-form-input"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={!formData.master_type}
          />
          {formData.statutory_document_filename && (
            <span className="vendor-form-hint" style={{ color: '#16a34a' }}>
              Selected: {formData.statutory_document_filename}
            </span>
          )}
        </FormField>

        {/* Support Document Upload - Optional */}
        <FormField
          label={labels.support_document}
          name="support_document"
          hint="PDF/JPG/PNG, Max 10MB - Optional"
        >
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'support_document')}
            className="vendor-form-input"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={!formData.master_type}
          />
          {formData.support_document_filename && (
            <span className="vendor-form-hint" style={{ color: '#16a34a' }}>
              Selected: {formData.support_document_filename}
            </span>
          )}
        </FormField>

        {/* Contact Details */}
        <FormField
          label={labels.contact_details}
          name="contact_details"
          required
        >
          <input
            type="tel"
            name="contact_details"
            value={formData.contact_details}
            onChange={handleChange}
            className="vendor-form-input"
            placeholder="Enter contact number"
            disabled={!formData.master_type}
          />
        </FormField>

        {/* Email */}
        <FormField
          label={labels.email}
          name="email"
          hint="Optional"
        >
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="vendor-form-input"
            placeholder="Enter email address"
            disabled={!formData.master_type}
          />
        </FormField>

        {/* Is Active */}
        <FormField
          label="Active Status"
          name="is_active"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              id="is_active_checkbox"
              style={{ width: 18, height: 18 }}
            />
            <label htmlFor="is_active_checkbox" style={{ cursor: 'pointer' }}>
              {formData.is_active ? 'Active' : 'Inactive'}
            </label>
          </div>
        </FormField>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isLoading || !formData.master_type}
        >
          {isLoading ? 'Saving...' : editData ? 'Update Master Entry' : 'Save Master Entry'}
        </button>
        <button
          className="btn btn-outline"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset Form
        </button>
      </div>
    </div>
  );
};

export default MasterUpdatingForm;

