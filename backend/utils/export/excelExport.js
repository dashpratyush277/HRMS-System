const ExcelJS = require("exceljs");

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
const HEADER_FONT = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const BORDER = {
  top:    { style: "thin", color: { argb: "FFCCCCCC" } },
  bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
  left:   { style: "thin", color: { argb: "FFCCCCCC" } },
  right:  { style: "thin", color: { argb: "FFCCCCCC" } },
};
const ALT_ROW_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F7FA" } };

const createWorkbook = (creator = "HRMS") => {
  const wb = new ExcelJS.Workbook();
  wb.creator = creator;
  wb.created = new Date();
  return wb;
};

/**
 * Add a styled worksheet with frozen header row.
 * columns: [{ header, key, width }]
 * rows:    array of plain objects keyed by column.key
 */
const addWorksheet = (workbook, { sheetName, columns, rows, title }) => {
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: title ? 2 : 1 }],
  });

  if (title) {
    ws.mergeCells(1, 1, 1, columns.length);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 13, color: { argb: "FF1E3A5F" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 28;
    ws.addRow([]);
  }

  ws.columns = columns.map((c) => ({ ...c, width: c.width || 18 }));

  const headerRow = title ? ws.getRow(3) : ws.getRow(1);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BORDER;
  });
  headerRow.height = 22;

  const dataStartRow = title ? 4 : 2;
  rows.forEach((rowData, idx) => {
    const row = ws.addRow(columns.map((c) => rowData[c.key] ?? ""));
    const rowNum = dataStartRow + idx;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = BORDER;
      cell.alignment = { vertical: "middle", wrapText: false };
      if (idx % 2 !== 0) cell.fill = ALT_ROW_FILL;
    });
    ws.getRow(rowNum).height = 18;
  });

  return ws;
};

const sendExcelResponse = async (res, workbook, filename) => {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { createWorkbook, addWorksheet, sendExcelResponse };
