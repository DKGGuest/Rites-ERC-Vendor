# Inventory Form Styling Guide

## Color Palette

### Primary Colors
```css
--primary-blue: #3b82f6
--primary-blue-dark: #2563eb
--primary-blue-darker: #1d4ed8
```

### Neutral Colors
```css
--white: #ffffff
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-700: #374151
--gray-900: #1f2937
```

### Semantic Colors
```css
--error: #ef4444
--error-light: #fef2f2
--error-dark: #dc2626
--success: #10b981
--warning: #f59e0b
```

### Section Backgrounds
```css
--section-bg: #f9fafb
--header-gradient-start: #f0f9ff
--header-gradient-end: #e0f2fe
```

---

## Typography

### Font Sizes
```css
--form-section-title: 15px (weight: 700)
--form-label: 13px (weight: 600)
--form-input: 14px (weight: 400)
--error-text: 12px (weight: 500)
--button-text: 14px (weight: 600)
```

### Font Families
```css
font-family: inherit; /* Uses system font stack */
```

---

## Spacing System

### Padding
```css
--form-container: 28px
--form-section: 20px
--input-padding: 11px 14px
--button-padding: 11px 24px
```

### Margins
```css
--section-margin-bottom: 28px
--label-margin-bottom: 8px
--error-margin-top: 4px
```

### Gaps
```css
--form-grid-gap: 18px (row) 24px (column)
--form-group-gap: 8px
--button-gap: 12px
```

---

## Border Radius

```css
--form-container: 12px
--form-section: 10px
--input-border-radius: 8px
--button-border-radius: 8px
```

---

## Shadows

### Input Shadows
```css
/* Default */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

/* Focus */
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 
            0 1px 2px rgba(0, 0, 0, 0.05);

/* Error Focus */
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

### Button Shadows
```css
/* Default */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Hover */
box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
```

### Section Shadows
```css
/* Hover */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
```

---

## Transitions

### Standard Transition
```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Specific Transitions
```css
/* Inputs */
transition: border-color 0.2s, box-shadow 0.2s;

/* Buttons */
transition: all 0.2s ease;

/* Shimmer Effect */
transition: left 0.5s;
```

---

## Component Classes

### Form Structure
```css
.inventory-entry-form          /* Main container */
.form-section                  /* Section wrapper */
.form-section-header           /* Section header */
.form-section-title            /* Section title */
.form-grid                     /* Grid layout */
.form-group                    /* Field wrapper */
.form-group.full-width         /* Full-width field */
```

### Form Elements
```css
.form-label                    /* Field label */
.form-label .required          /* Required asterisk */
.form-input                    /* Text input */
.form-select                   /* Select dropdown */
.form-textarea                 /* Textarea */
.error-text                    /* Error message */
```

### Buttons
```css
.form-actions                  /* Button container */
.btn-primary                   /* Primary button */
.btn-secondary                 /* Secondary button */
```

### State Modifiers
```css
.form-input.error              /* Error state */
.form-input.disabled           /* Disabled state */
.form-input:hover              /* Hover state */
.form-input:focus              /* Focus state */
.btn-primary:disabled          /* Disabled button */
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small Mobile */
@media (max-width: 480px) {
  /* Single column, compact spacing */
}

/* Mobile */
@media (max-width: 767px) {
  /* Single column, stacked buttons */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 2-column grid */
}

/* Desktop */
@media (min-width: 1024px) {
  /* 3-column grid */
}
```

---

## Animation Effects

### Button Shimmer
```css
.btn-primary::before {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent);
  /* Animates on hover */
}
```

### Lift Effect
```css
transform: translateY(-1px);
```

### Section Hover
```css
.form-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
```

---

## Usage Examples

### Creating a New Form Section
```jsx
<div className="form-section">
  <div className="form-section-header">
    <h4 className="form-section-title">🎯 Your Section Title</h4>
  </div>
  <div className="form-grid">
    {/* Your form fields */}
  </div>
</div>
```

### Adding a Form Field
```jsx
<div className="form-group">
  <label className="form-label">
    Field Name <span className="required">*</span>
  </label>
  <input
    type="text"
    className={`form-input ${errors.field ? 'error' : ''}`}
    placeholder="Enter value"
  />
  {errors.field && <span className="error-text">{errors.field}</span>}
</div>
```

### Full-Width Field
```jsx
<div className="form-group full-width">
  {/* Field content */}
</div>
```

