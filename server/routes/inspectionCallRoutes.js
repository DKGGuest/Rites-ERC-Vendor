// Inspection Call Routes
const express = require('express');
const router = express.Router();
const {
  createRMInspectionCall,
  createProcessInspectionCall,
  createFinalInspectionCall,
  getAllInspectionCalls,
  getInspectionCallByICNumber,
  getApprovedRMInspectionCalls,
  getApprovedProcessInspectionCalls,
  getHeatNumbersFromRMIC,
  getApprovedRMICsWithHeatDetails
} = require('../controllers/inspectionCallController');

// Raw Material Inspection Routes
router.post('/raw-material', createRMInspectionCall);
router.get('/raw-material', getAllInspectionCalls);
router.get('/raw-material/approved', getApprovedRMInspectionCalls);
router.get('/raw-material/approved-with-heats', getApprovedRMICsWithHeatDetails);
router.get('/raw-material/:icNumber', getInspectionCallByICNumber);

// Process Inspection Routes
router.post('/process', createProcessInspectionCall);
router.get('/process', getAllInspectionCalls);
router.get('/process/approved', getApprovedProcessInspectionCalls);
router.get('/process/:icNumber', getInspectionCallByICNumber);

// Final Inspection Routes
router.post('/final', createFinalInspectionCall);
router.get('/final', getAllInspectionCalls);
router.get('/final/:icNumber', getInspectionCallByICNumber);

// Heat numbers from RM IC
router.get('/heat-numbers/:rm_ic_number', getHeatNumbersFromRMIC);

// Get all inspection calls (any type)
router.get('/', getAllInspectionCalls);
router.get('/:icNumber', getInspectionCallByICNumber);

module.exports = router;

