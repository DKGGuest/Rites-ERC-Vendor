# Implementation Guide - Raw Material Inspection Request

## 🎯 Overview
This guide provides step-by-step instructions for implementing the Raw Material Inspection Request feature with support for multiple heat numbers (3 in this scenario).

---

## 📋 Prerequisites

### Backend
- Spring Boot 2.7+ or 3.x
- MySQL 8.0+
- Java 11+ or 17+
- Maven or Gradle

### Frontend
- React 18+
- Node.js 16+
- Axios or Fetch API for HTTP requests

---

## 🗄️ Step 1: Database Setup

### Create Tables

```sql
-- Main inspection calls table
CREATE TABLE inspection_calls (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ic_number VARCHAR(50) UNIQUE NOT NULL,
  po_no VARCHAR(50) NOT NULL,
  po_serial_no VARCHAR(50) NOT NULL,
  type_of_call ENUM('Raw Material', 'Process', 'Final') NOT NULL,
  desired_inspection_date DATE NOT NULL,
  actual_inspection_date DATE,
  status ENUM('Pending', 'Scheduled', 'Under Inspection', 'Completed', 'Rejected') DEFAULT 'Pending',
  company_id INT NOT NULL,
  unit_id INT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  INDEX idx_po_no (po_no),
  INDEX idx_status (status),
  INDEX idx_type_of_call (type_of_call)
);

-- Raw material inspection details
CREATE TABLE rm_inspection_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ic_id BIGINT NOT NULL,
  heat_numbers TEXT NOT NULL,
  tc_number VARCHAR(50) NOT NULL,
  tc_date DATE,
  manufacturer VARCHAR(255),
  invoice_no VARCHAR(50),
  invoice_date DATE,
  sub_po_number VARCHAR(50),
  sub_po_date DATE,
  sub_po_qty VARCHAR(50),
  sub_po_total_value VARCHAR(50),
  tc_qty VARCHAR(50),
  tc_qty_remaining VARCHAR(50),
  total_offered_qty_mt DECIMAL(10,3),
  offered_qty_erc INT,
  FOREIGN KEY (ic_id) REFERENCES inspection_calls(id) ON DELETE CASCADE,
  INDEX idx_tc_number (tc_number)
);

-- Heat-wise quantities
CREATE TABLE rm_heat_quantities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rm_detail_id BIGINT NOT NULL,
  heat_number VARCHAR(50) NOT NULL,
  offered_qty DECIMAL(10,3) NOT NULL,
  FOREIGN KEY (rm_detail_id) REFERENCES rm_inspection_details(id) ON DELETE CASCADE,
  INDEX idx_heat_number (heat_number)
);

-- Chemical analysis
CREATE TABLE rm_chemical_analysis (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rm_detail_id BIGINT NOT NULL,
  carbon DECIMAL(5,3),
  manganese DECIMAL(5,3),
  silicon DECIMAL(5,3),
  sulphur DECIMAL(5,3),
  phosphorus DECIMAL(5,3),
  chromium DECIMAL(5,3),
  FOREIGN KEY (rm_detail_id) REFERENCES rm_inspection_details(id) ON DELETE CASCADE
);
```

---

## 🔧 Step 2: Backend Implementation

### 2.1 Create Entity Classes

**InspectionCall.java**
```java
@Entity
@Table(name = "inspection_calls")
public class InspectionCall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String icNumber;
    
    @Column(nullable = false)
    private String poNo;
    
    @Column(nullable = false)
    private String poSerialNo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeOfCall typeOfCall;
    
    @Column(nullable = false)
    private LocalDate desiredInspectionDate;
    
    private LocalDate actualInspectionDate;
    
    @Enumerated(EnumType.STRING)
    private InspectionStatus status = InspectionStatus.PENDING;
    
    @Column(nullable = false)
    private Integer companyId;
    
    @Column(nullable = false)
    private Integer unitId;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    @OneToOne(mappedBy = "inspectionCall", cascade = CascadeType.ALL)
    private RmInspectionDetail rmInspectionDetail;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private String createdBy;
    
    // Getters and setters
}
```

**RmInspectionDetail.java**
```java
@Entity
@Table(name = "rm_inspection_details")
public class RmInspectionDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "ic_id", nullable = false)
    private InspectionCall inspectionCall;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String heatNumbers;
    
    @Column(nullable = false)
    private String tcNumber;
    
    private LocalDate tcDate;
    private String manufacturer;
    private String invoiceNo;
    private LocalDate invoiceDate;
    private String subPoNumber;
    private LocalDate subPoDate;
    private String subPoQty;
    private String subPoTotalValue;
    private String tcQty;
    private String tcQtyRemaining;
    
    @Column(precision = 10, scale = 3)
    private BigDecimal totalOfferedQtyMt;
    
    private Integer offeredQtyErc;
    
    @OneToMany(mappedBy = "rmInspectionDetail", cascade = CascadeType.ALL)
    private List<RmHeatQuantity> heatQuantities;
    
    @OneToOne(mappedBy = "rmInspectionDetail", cascade = CascadeType.ALL)
    private RmChemicalAnalysis chemicalAnalysis;
    
    // Getters and setters
}
```

### 2.2 Create DTOs

**RawMaterialInspectionRequestDTO.java**
```java
@Data
public class RawMaterialInspectionRequestDTO {
    // PO Data
    private String poNo;
    private String poSerialNo;
    private LocalDate poDate;
    private String poDescription;
    private Integer poQty;
    private String poUnit;
    
    // Call Details
    private String typeOfCall;
    private LocalDate desiredInspectionDate;
    
    // RM Details
    private String rmHeatNumbers;
    private String rmTcNumber;
    private LocalDate rmTcDate;
    private String rmManufacturer;
    private String rmInvoiceNo;
    private LocalDate rmInvoiceDate;
    private String rmSubPoNumber;
    private LocalDate rmSubPoDate;
    private String rmSubPoQty;
    private String rmSubPoTotalValue;
    private String rmTcQty;
    private String rmTcQtyRemaining;
    
    // Chemical Analysis
    private BigDecimal rmChemicalCarbon;
    private BigDecimal rmChemicalManganese;
    private BigDecimal rmChemicalSilicon;
    private BigDecimal rmChemicalSulphur;
    private BigDecimal rmChemicalPhosphorus;
    private BigDecimal rmChemicalChromium;
    
    // Heat Quantities
    private List<HeatQuantityDTO> rmHeatQuantities;
    private BigDecimal rmTotalOfferedQtyMt;
    private Integer rmOfferedQtyErc;
    
    // Place of Inspection
    private Integer companyId;
    private Integer unitId;
    
    // Additional
    private String remarks;
}

@Data
class HeatQuantityDTO {
    private String heatNumber;
    private String offeredQty;
}
```

### 2.3 Create Service

**InspectionCallService.java**
```java
@Service
@Transactional
public class InspectionCallService {
    
    @Autowired
    private InspectionCallRepository inspectionCallRepository;
    
    public InspectionCallResponseDTO createRawMaterialInspectionCall(
            RawMaterialInspectionRequestDTO request) {
        
        // Validate request
        validateRawMaterialRequest(request);
        
        // Generate IC Number
        String icNumber = generateIcNumber("RM");
        
        // Create InspectionCall entity
        InspectionCall inspectionCall = new InspectionCall();
        inspectionCall.setIcNumber(icNumber);
        inspectionCall.setPoNo(request.getPoNo());
        inspectionCall.setPoSerialNo(request.getPoSerialNo());
        inspectionCall.setTypeOfCall(TypeOfCall.RAW_MATERIAL);
        inspectionCall.setDesiredInspectionDate(request.getDesiredInspectionDate());
        inspectionCall.setStatus(InspectionStatus.PENDING);
        inspectionCall.setCompanyId(request.getCompanyId());
        inspectionCall.setUnitId(request.getUnitId());
        inspectionCall.setRemarks(request.getRemarks());
        
        // Create RM Details
        RmInspectionDetail rmDetail = new RmInspectionDetail();
        rmDetail.setInspectionCall(inspectionCall);
        rmDetail.setHeatNumbers(request.getRmHeatNumbers());
        rmDetail.setTcNumber(request.getRmTcNumber());
        rmDetail.setTcDate(request.getRmTcDate());
        rmDetail.setManufacturer(request.getRmManufacturer());
        // ... set other fields
        rmDetail.setTotalOfferedQtyMt(request.getRmTotalOfferedQtyMt());
        rmDetail.setOfferedQtyErc(request.getRmOfferedQtyErc());
        
        // Create Heat Quantities
        List<RmHeatQuantity> heatQuantities = request.getRmHeatQuantities().stream()
            .map(dto -> {
                RmHeatQuantity hq = new RmHeatQuantity();
                hq.setRmInspectionDetail(rmDetail);
                hq.setHeatNumber(dto.getHeatNumber());
                hq.setOfferedQty(new BigDecimal(dto.getOfferedQty()));
                return hq;
            })
            .collect(Collectors.toList());
        rmDetail.setHeatQuantities(heatQuantities);
        
        // Create Chemical Analysis
        RmChemicalAnalysis chemicalAnalysis = new RmChemicalAnalysis();
        chemicalAnalysis.setRmInspectionDetail(rmDetail);
        chemicalAnalysis.setCarbon(request.getRmChemicalCarbon());
        chemicalAnalysis.setManganese(request.getRmChemicalManganese());
        // ... set other elements
        rmDetail.setChemicalAnalysis(chemicalAnalysis);
        
        inspectionCall.setRmInspectionDetail(rmDetail);
        
        // Save
        InspectionCall saved = inspectionCallRepository.save(inspectionCall);
        
        // Return response
        return buildResponse(saved);
    }
    
    private String generateIcNumber(String prefix) {
        // Generate unique IC number: RM-IC-2025-001
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = inspectionCallRepository.countByTypeOfCall(TypeOfCall.RAW_MATERIAL);
        return String.format("%s-IC-%s-%03d", prefix, year, count + 1);
    }
    
    private void validateRawMaterialRequest(RawMaterialInspectionRequestDTO request) {
        // Implement validation logic
        // - Check required fields
        // - Validate date range
        // - Validate quantities
        // - Check chemical analysis values
    }
}
```

### 2.4 Create Controller

**InspectionCallController.java**
```java
@RestController
@RequestMapping("/api/vendor/inspection-calls")
public class InspectionCallController {

    @Autowired
    private InspectionCallService inspectionCallService;

    @PostMapping("/raw-material")
    public ResponseEntity<ApiResponse<InspectionCallResponseDTO>> createRawMaterialInspectionCall(
            @Valid @RequestBody RawMaterialInspectionRequestDTO request) {

        InspectionCallResponseDTO response = inspectionCallService
            .createRawMaterialInspectionCall(request);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Raw Material Inspection Call created successfully", response));
    }

    @GetMapping("/{icNumber}")
    public ResponseEntity<ApiResponse<InspectionCallDetailDTO>> getInspectionCallDetails(
            @PathVariable String icNumber) {

        InspectionCallDetailDTO details = inspectionCallService.getInspectionCallDetails(icNumber);
        return ResponseEntity.ok(ApiResponse.success(details));
    }
}
```

### 2.5 Create Inventory Controller (for auto-population)

**InventoryController.java**
```java
@RestController
@RequestMapping("/api/vendor/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/heat/{heatNumber}")
    public ResponseEntity<ApiResponse<HeatDetailsDTO>> getHeatDetails(
            @PathVariable String heatNumber) {

        HeatDetailsDTO details = inventoryService.getHeatDetails(heatNumber);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @GetMapping("/available-heats")
    public ResponseEntity<ApiResponse<List<HeatSummaryDTO>>> getAvailableHeats(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String rawMaterial) {

        List<HeatSummaryDTO> heats = inventoryService.getAvailableHeats(status, rawMaterial);
        return ResponseEntity.ok(ApiResponse.success(heats));
    }

    @GetMapping("/tc/{tcNumber}")
    public ResponseEntity<ApiResponse<TcDetailsDTO>> getTcDetails(
            @PathVariable String tcNumber) {

        TcDetailsDTO details = inventoryService.getTcDetails(tcNumber);
        return ResponseEntity.ok(ApiResponse.success(details));
    }
}
```

---

## 🎨 Step 3: Frontend Implementation

### 3.1 Create API Service

**inspectionCallApi.js**
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const inspectionCallApi = {
  // Submit raw material inspection request
  submitRawMaterialInspection: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/vendor/inspection-calls/raw-material`,
      data
    );
    return response.data;
  },

  // Get heat details
  getHeatDetails: async (heatNumber) => {
    const response = await axios.get(
      `${API_BASE_URL}/vendor/inventory/heat/${heatNumber}`
    );
    return response.data;
  },

  // Get available heat numbers
  getAvailableHeats: async (filters = {}) => {
    const response = await axios.get(
      `${API_BASE_URL}/vendor/inventory/available-heats`,
      { params: filters }
    );
    return response.data;
  },

  // Get TC details
  getTcDetails: async (tcNumber) => {
    const response = await axios.get(
      `${API_BASE_URL}/vendor/inventory/tc/${tcNumber}`
    );
    return response.data;
  },

  // Calculate ERC quantity
  calculateErc: async (totalQtyMt, productType) => {
    const response = await axios.post(
      `${API_BASE_URL}/vendor/inspection-calls/calculate-erc`,
      { totalQtyMt, productType }
    );
    return response.data;
  }
};
```

### 3.2 Update Form Component

**RaiseInspectionCallForm.js** (Key changes)
```javascript
// Add API integration for heat number selection
const handleHeatNumberChange = async (heatNumber) => {
  setFormData(prev => ({ ...prev, rm_heat_numbers: heatNumber }));

  try {
    // Fetch heat details from backend
    const response = await inspectionCallApi.getHeatDetails(heatNumber);
    const heatDetails = response.data;

    // Auto-populate TC number and other details
    setFormData(prev => ({
      ...prev,
      rm_tc_number: heatDetails.tcNumber,
      rm_tc_date: heatDetails.tcDate,
      rm_manufacturer: heatDetails.manufacturer,
      rm_invoice_no: heatDetails.invoiceNumber,
      rm_invoice_date: heatDetails.invoiceDate,
      rm_sub_po_number: heatDetails.subPoNumber,
      rm_sub_po_date: heatDetails.subPoDate,
      rm_sub_po_qty: `${heatDetails.subPoQty} ${heatDetails.unitOfMeasurement}`,
      rm_sub_po_total_value: `₹${heatDetails.subPoTotalValue}`,
      rm_tc_qty: `${heatDetails.declaredQuantity} ${heatDetails.unitOfMeasurement}`,
      rm_tc_qty_remaining: `${heatDetails.qtyLeftForInspection} ${heatDetails.unitOfMeasurement}`,
      // Auto-fill chemical analysis if available
      rm_chemical_carbon: heatDetails.chemicalAnalysis?.carbon || '',
      rm_chemical_manganese: heatDetails.chemicalAnalysis?.manganese || '',
      rm_chemical_silicon: heatDetails.chemicalAnalysis?.silicon || '',
      rm_chemical_sulphur: heatDetails.chemicalAnalysis?.sulphur || '',
      rm_chemical_phosphorus: heatDetails.chemicalAnalysis?.phosphorus || '',
      rm_chemical_chromium: heatDetails.chemicalAnalysis?.chromium || ''
    }));
  } catch (error) {
    console.error('Error fetching heat details:', error);
    // Show error message to user
  }
};

// Submit form with API call
const handleSubmit = async () => {
  if (validate()) {
    try {
      setIsLoading(true);
      const response = await inspectionCallApi.submitRawMaterialInspection(formData);

      // Show success message
      alert(`Inspection Call created successfully! IC Number: ${response.data.ic_number}`);

      // Reset form or redirect
      handleReset();

    } catch (error) {
      console.error('Error submitting inspection call:', error);
      // Show error message
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  }
};
```

---

## ✅ Step 4: Testing

### 4.1 Backend Testing

**InspectionCallServiceTest.java**
```java
@SpringBootTest
class InspectionCallServiceTest {

    @Autowired
    private InspectionCallService inspectionCallService;

    @Test
    void testCreateRawMaterialInspectionCall() {
        // Prepare test data
        RawMaterialInspectionRequestDTO request = new RawMaterialInspectionRequestDTO();
        request.setPoNo("PO-2025-1001");
        request.setPoSerialNo("PO-2025-1001/01");
        request.setTypeOfCall("Raw Material");
        request.setDesiredInspectionDate(LocalDate.now().plusDays(3));
        request.setRmHeatNumbers("HT-2025-001,HT-2025-002,HT-2025-003");
        request.setRmTcNumber("TC-45678");
        // ... set other fields

        List<HeatQuantityDTO> heatQuantities = Arrays.asList(
            new HeatQuantityDTO("HT-2025-001", "1.500"),
            new HeatQuantityDTO("HT-2025-002", "2.250"),
            new HeatQuantityDTO("HT-2025-003", "1.750")
        );
        request.setRmHeatQuantities(heatQuantities);
        request.setRmTotalOfferedQtyMt(new BigDecimal("5.500"));
        request.setRmOfferedQtyErc(4786);

        // Execute
        InspectionCallResponseDTO response = inspectionCallService
            .createRawMaterialInspectionCall(request);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getIcNumber());
        assertTrue(response.getIcNumber().startsWith("RM-IC-"));
        assertEquals("Pending", response.getStatus());
    }
}
```

### 4.2 API Testing with Postman/cURL

```bash
# Test: Submit Raw Material Inspection Request
curl -X POST http://localhost:8080/api/vendor/inspection-calls/raw-material \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @mock-data-raw-material-3-heats.json

# Test: Get Heat Details
curl -X GET http://localhost:8080/api/vendor/inventory/heat/HT-2025-001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test: Get Available Heats
curl -X GET "http://localhost:8080/api/vendor/inventory/available-heats?status=Fresh,Inspection%20Requested" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Step 5: Deployment

### 5.1 Backend Deployment Checklist
- [ ] Database migrations executed
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Authentication/Authorization configured
- [ ] Logging configured
- [ ] Error handling implemented

### 5.2 Frontend Deployment Checklist
- [ ] API base URL configured
- [ ] Form validation working
- [ ] Auto-population features tested
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Responsive design verified

---

## 📝 Additional Notes

### Performance Optimization
- Add database indexes on frequently queried columns
- Implement caching for master data (company units, conversion factors)
- Use pagination for large data sets

### Security Considerations
- Validate all inputs on backend
- Implement proper authentication and authorization
- Sanitize user inputs to prevent SQL injection
- Use HTTPS for all API calls

### Future Enhancements
- Support for bulk heat number selection
- File upload for TC documents
- Email notifications on inspection call creation
- Dashboard for tracking inspection calls


