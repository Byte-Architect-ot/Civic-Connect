const ExcelJS = require('exceljs');

class ExcelExportService {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.setupWorkbookProperties();
  }

  setupWorkbookProperties() {
    this.workbook.creator = 'NagrikSetu';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.lastModifiedBy = 'NagrikSetu System';
  }

  /* Apply header styling */
  styleHeader(row) {
    row.eachCell((cell) => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' },
        size: 11,
        name: 'DM Sans'
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' } // slate-900
      };
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
    row.height = 25;
  }

  /* Apply data row styling */
  styleDataRow(row, index) {
    row.eachCell((cell) => {
      cell.font = { 
        size: 10,
        name: 'DM Sans'
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC' } // Alternating rows
      };
      cell.alignment = { 
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
    row.height = 20;
  }

  /* Get status color */
  getStatusColor(status) {
    const colors = {
      'Pending': 'FFF59E0B',      // amber
      'In Progress': 'FF3B82F6',  // blue
      'Resolved': 'FF10B981',     // emerald
      'Rejected': 'FFF43F5E'      // rose
    };
    return colors[status] || 'FF64748B';
  }

  /* Get priority color */
  getPriorityColor(priority) {
    const colors = {
      'Critical': 'FFF43F5E',  // rose
      'High': 'FFFB923C',      // orange
      'Medium': 'FF3B82F6',    // blue
      'Low': 'FF64748B'        // slate
    };
    return colors[priority] || 'FF64748B';
  }

  /* Create Issues Sheet */
  async createIssuesSheet(issues) {
    const sheet = this.workbook.addWorksheet('All Issues', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    });

    /* Define columns */
    sheet.columns = [
      { header: 'ID', key: 'id', width: 12 },
      { header: 'Title', key: 'title', width: 35 },
      { header: 'Description', key: 'description', width: 45 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Location', key: 'location', width: 30 },
      { header: 'Reported By', key: 'reportedBy', width: 20 },
      { header: 'Reported Date', key: 'reportedAt', width: 18 },
      { header: 'Upvotes', key: 'upvotes', width: 10 },
      { header: 'ML Category', key: 'mlCategory', width: 15 },
      { header: 'ML Priority', key: 'mlPriority', width: 12 },
      { header: 'Urgency Score', key: 'urgencyScore', width: 14 },
      { header: 'Cluster Size', key: 'clusterSize', width: 12 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 }
    ];

    /* Style header */
    this.styleHeader(sheet.getRow(1));

    /* Add data rows */
    issues.forEach((issue, index) => {
      const row = sheet.addRow({
        id: issue.id || issue._id,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        priority: issue.priority,
        status: issue.status,
        location: issue.location,
        reportedBy: issue.reportedBy,
        reportedAt: new Date(issue.reportedAt || issue.createdAt),
        upvotes: issue.upvotes || 0,
        mlCategory: issue.mlCategory || 'N/A',
        mlPriority: issue.mlPriority || 'N/A',
        urgencyScore: issue.urgencyScore || 0,
        clusterSize: issue.clusterSize || 0,
        assignedTo: issue.assignedTo || 'Unassigned'
      });

      this.styleDataRow(row, index);

      /* Color code status */
      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.getStatusColor(issue.status) }
      };
      row.getCell('status').font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 10
      };

      /* Color code priority */
      row.getCell('priority').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.getPriorityColor(issue.priority) }
      };
      row.getCell('priority').font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 10
      };

      /* Format date */
      row.getCell('reportedAt').numFmt = 'dd-mmm-yyyy hh:mm';

      /* Format urgency score with conditional formatting */
      const urgencyCell = row.getCell('urgencyScore');
      if (issue.urgencyScore >= 80) {
        urgencyCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF2F2' }
        };
        urgencyCell.font = { color: { argb: 'FFDC2626' }, bold: true };
      } else if (issue.urgencyScore >= 60) {
        urgencyCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' }
        };
        urgencyCell.font = { color: { argb: 'FFEA580C' }, bold: true };
      }
    });

    /* Auto-filter */
    sheet.autoFilter = {
      from: 'A1',
      to: 'O1'
    };
  }

  /* Create Summary Sheet */
  async createSummarySheet(issues) {
    const sheet = this.workbook.addWorksheet('Summary', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 0 }]
    });

    sheet.columns = [
      { key: 'metric', width: 30 },
      { key: 'value', width: 20 }
    ];

    /* Title */
    const titleRow = sheet.addRow(['NagrikSetu - Analytics Report']);
    titleRow.getCell(1).font = { 
      size: 18, 
      bold: true, 
      color: { argb: 'FF0F172A' },
      name: 'Space Grotesk'
    };
    titleRow.height = 30;
    sheet.mergeCells('A1:B1');

    /* Timestamp */
    const dateRow = sheet.addRow([
      'Generated on:', 
      new Date().toLocaleString('en-IN')
    ]);
    dateRow.getCell(1).font = { bold: true, size: 10 };
    dateRow.getCell(2).font = { size: 10, color: { argb: 'FF64748B' } };
    
    sheet.addRow([]);

    /* Overall Statistics */
    const statsHeaderRow = sheet.addRow(['Overall Statistics', '']);
    statsHeaderRow.getCell(1).font = { 
      bold: true, 
      size: 14, 
      color: { argb: 'FFFFFFFF' } 
    };
    statsHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    sheet.mergeCells(`A${statsHeaderRow.number}:B${statsHeaderRow.number}`);

    const stats = this.calculateStatistics(issues);

    const summaryData = [
      ['Total Issues', stats.total],
      ['Resolved Issues', stats.resolved],
      ['Pending Issues', stats.pending],
      ['In Progress', stats.inProgress],
      ['Rejected Issues', stats.rejected],
      ['Resolution Rate', `${stats.resolutionRate}%`],
      ['Average Upvotes', stats.avgUpvotes],
      ['Critical Issues', stats.critical],
      ['High Priority Issues', stats.high],
      ['ML Classified Issues', stats.mlClassified],
      ['Clustered Reports', stats.clustered],
      ['Average Urgency Score', stats.avgUrgency]
    ];

    summaryData.forEach((data, index) => {
      const row = sheet.addRow(data);
      row.getCell(1).font = { bold: true, size: 10 };
      row.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
      };
      row.getCell(2).font = { size: 11, bold: true, color: { argb: 'FF0F172A' } };
      row.getCell(2).alignment = { horizontal: 'right' };
      
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });

    sheet.addRow([]);

    /* Category Breakdown */
    const catHeaderRow = sheet.addRow(['Category Breakdown', '']);
    catHeaderRow.getCell(1).font = { 
      bold: true, 
      size: 14, 
      color: { argb: 'FFFFFFFF' } 
    };
    catHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    };
    sheet.mergeCells(`A${catHeaderRow.number}:B${catHeaderRow.number}`);

    Object.entries(stats.byCategory).forEach((data) => {
      const row = sheet.addRow(data);
      row.getCell(1).font = { bold: true, size: 10 };
      row.getCell(2).font = { size: 11, bold: true };
      row.getCell(2).alignment = { horizontal: 'right' };
      
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });
  }

  /* Create Category-wise Sheet */
  async createCategorySheet(issues) {
    const categories = ['Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'];

    categories.forEach(category => {
      const categoryIssues = issues.filter(i => i.category === category);
      
      if (categoryIssues.length === 0) return;

      const sheet = this.workbook.addWorksheet(category, {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
      });

      sheet.columns = [
        { header: 'Title', key: 'title', width: 35 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Location', key: 'location', width: 30 },
        { header: 'Upvotes', key: 'upvotes', width: 10 },
        { header: 'Reported Date', key: 'reportedAt', width: 18 },
        { header: 'Urgency Score', key: 'urgencyScore', width: 14 }
      ];

      this.styleHeader(sheet.getRow(1));

      categoryIssues.forEach((issue, index) => {
        const row = sheet.addRow({
          title: issue.title,
          priority: issue.priority,
          status: issue.status,
          location: issue.location,
          upvotes: issue.upvotes || 0,
          reportedAt: new Date(issue.reportedAt || issue.createdAt),
          urgencyScore: issue.urgencyScore || 0
        });

        this.styleDataRow(row, index);

        row.getCell('status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.getStatusColor(issue.status) }
        };
        row.getCell('status').font = {
          color: { argb: 'FFFFFFFF' },
          bold: true
        };

        row.getCell('priority').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.getPriorityColor(issue.priority) }
        };
        row.getCell('priority').font = {
          color: { argb: 'FFFFFFFF' },
          bold: true
        };

        row.getCell('reportedAt').numFmt = 'dd-mmm-yyyy';
      });

      sheet.autoFilter = {
        from: 'A1',
        to: 'G1'
      };
    });
  }

  /* Calculate statistics */
  calculateStatistics(issues) {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const pending = issues.filter(i => i.status === 'Pending').length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;
    const rejected = issues.filter(i => i.status === 'Rejected').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    const totalUpvotes = issues.reduce((sum, i) => sum + (i.upvotes || 0), 0);
    const avgUpvotes = total > 0 ? Math.round(totalUpvotes / total) : 0;
    
    const critical = issues.filter(i => i.priority === 'Critical').length;
    const high = issues.filter(i => i.priority === 'High').length;
    
    const mlClassified = issues.filter(i => i.mlCategory || i.mlPriority).length;
    const clustered = issues.filter(i => (i.clusterSize || 0) > 0).length;
    
    const withUrgency = issues.filter(i => typeof i.urgencyScore === 'number');
    const avgUrgency = withUrgency.length > 0
      ? Math.round(withUrgency.reduce((sum, i) => sum + (i.urgencyScore || 0), 0) / withUrgency.length)
      : 0;
    
    const byCategory = issues.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      resolved,
      pending,
      inProgress,
      rejected,
      resolutionRate,
      avgUpvotes,
      critical,
      high,
      mlClassified,
      clustered,
      avgUrgency,
      byCategory
    };
  }

  /* Generate complete Excel file */
  async generateExcelFile(issues) {
    await this.createSummarySheet(issues);
    await this.createIssuesSheet(issues);
    await this.createCategorySheet(issues);

    return this.workbook;
  }
}

module.exports = ExcelExportService;