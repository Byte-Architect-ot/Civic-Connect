const express = require('express');
const router = express.Router();
const Hazard = require('../models/Hazard');
const protect = require('../middleware/authMiddleware');
const authorize = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized' });
  }
};
const ExcelExportService = require('../services/excelExportService');

/* Export all issues to Excel */
router.get('/excel', protect, authorize('admin'), async (req, res) => {
  try {
    const issues = await Hazard.find()
      .populate('reportedByUserId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const excelService = new ExcelExportService();
    const workbook = await excelService.generateExcelFile(issues);

    /* Set response headers */
    const fileName = `NagrikSetu_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );

    /* Write to response */
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Failed to generate Excel report', error: error.message });
  }
});

/* Export filtered issues */
router.post('/excel/filtered', protect, authorize('admin'), async (req, res) => {
  try {
    const { category, status, priority, dateRange } = req.body;

    /* Build query */
    const query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    
    if (dateRange && dateRange !== 'All') {
      const now = new Date();
      let startDate = new Date();
      
      switch(dateRange) {
        case 'Today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'Week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'Month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      query.createdAt = { $gte: startDate };
    }

    const issues = await Hazard.find(query)
      .populate('reportedByUserId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const excelService = new ExcelExportService();
    const workbook = await excelService.generateExcelFile(issues);

    const fileName = `NagrikSetu_Filtered_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Filtered Excel export error:', error);
    res.status(500).json({ message: 'Failed to generate filtered Excel report', error: error.message });
  }
});

module.exports = router;