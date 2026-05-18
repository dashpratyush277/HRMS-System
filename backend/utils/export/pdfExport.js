const PDFDocument = require("pdfkit");
const { formatDate, formatCurrency, getMonthName } = require("./reportHelpers");

const BRAND   = "#1E3A5F";
const ACCENT  = "#3B82F6";
const LIGHT   = "#F5F7FA";
const BORDER  = "#CBD5E1";
const TEXT    = "#1E293B";
const MUTED   = "#64748B";

const drawHR = (doc, y, color = BORDER) => {
  doc.save().moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor(color).lineWidth(0.5).stroke().restore();
};

const createPayslipPDF = (res, { employee, payroll }) => {
  const doc = new PDFDocument({ size: "A4", margin: 40, info: { Title: "Payslip" } });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="payslip_${employee.employeeId || employee._id}_${payroll.month}_${payroll.year}.pdf"`
  );
  doc.pipe(res);

  const { width } = doc.page;
  const mid = width / 2;

  // ── Header banner ──────────────────────────────────────────────
  doc.rect(0, 0, width, 90).fill(BRAND);
  doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text("HRMS", 40, 22);
  doc.fontSize(10).font("Helvetica").text("Human Resource Management System", 40, 48);

  doc.fontSize(20).font("Helvetica-Bold")
    .text("PAYSLIP", 0, 28, { align: "right", width: width - 40 });
  doc.fontSize(10).font("Helvetica")
    .text(`${getMonthName(payroll.month)} ${payroll.year}`, 0, 52, { align: "right", width: width - 40 });

  // ── Employee info block ─────────────────────────────────────────
  let y = 108;
  doc.roundedRect(40, y, width - 80, 80, 4).fill(LIGHT);

  const col1x = 56, col2x = mid + 8;
  doc.fillColor(TEXT).fontSize(10).font("Helvetica-Bold");

  const empName = employee.firstName ? `${employee.firstName} ${employee.lastName}` : (employee.name || "—");
  doc.text("Employee", col1x, y + 10).text("Department", col1x, y + 28).text("Designation", col1x, y + 46).text("Employee ID", col1x, y + 64);
  doc.text("Pay Period", col2x, y + 10).text("Pay Date", col2x, y + 28).text("Status", col2x, y + 46);

  doc.font("Helvetica").fillColor(MUTED);
  doc.text(empName, col1x + 80, y + 10).text(employee.department?.name || "—", col1x + 80, y + 28)
    .text(employee.designation || "—", col1x + 80, y + 46).text(employee.employeeId || "—", col1x + 80, y + 64);
  doc.text(`${getMonthName(payroll.month)} ${payroll.year}`, col2x + 72, y + 10)
    .text(formatDate(payroll.paymentDate || new Date()), col2x + 72, y + 28)
    .text((payroll.status || "generated").toUpperCase(), col2x + 72, y + 46);

  // ── Earnings / Deductions table ─────────────────────────────────
  y += 96;
  drawHR(doc, y, BRAND);
  y += 6;

  const tableLeft = 40, tableRight = width - 40, colW = (tableRight - tableLeft) / 2;

  // Column headers
  doc.fillColor(BRAND).fontSize(11).font("Helvetica-Bold");
  doc.text("EARNINGS", tableLeft, y).text("DEDUCTIONS", mid, y);
  y += 18;
  drawHR(doc, y);

  // Rows
  const earnings = [
    ["Basic Salary",      payroll.basicSalary],
    ["HRA",               payroll.hra],
    ["Transport Allowance", payroll.transportAllowance],
    ["Medical Allowance", payroll.medicalAllowance],
    ["Other Allowances",  payroll.otherAllowances],
  ].filter(([, v]) => v != null);

  const deductions = [
    ["Professional Tax",  payroll.professionalTax],
    ["PF (Employee)",     payroll.providentFund],
    ["Income Tax (TDS)",  payroll.incomeTax],
    ["Other Deductions",  payroll.otherDeductions],
    ["Late Deductions",   payroll.lateDeductions],
  ].filter(([, v]) => v != null);

  const maxRows = Math.max(earnings.length, deductions.length);
  doc.fontSize(10).font("Helvetica");

  for (let i = 0; i < maxRows; i++) {
    y += 2;
    if (i % 2 === 0) {
      doc.rect(tableLeft, y - 1, colW, 17).fill(LIGHT);
      doc.rect(mid, y - 1, colW, 17).fill(LIGHT);
    }

    if (earnings[i]) {
      doc.fillColor(TEXT).text(earnings[i][0], tableLeft + 6, y, { width: colW / 2 - 6 });
      doc.fillColor(MUTED).text(`₹ ${formatCurrency(earnings[i][1])}`, mid - 8, y, { width: colW / 2, align: "right" });
    }
    if (deductions[i]) {
      doc.fillColor(TEXT).text(deductions[i][0], mid + 6, y, { width: colW / 2 - 6 });
      doc.fillColor(MUTED).text(`₹ ${formatCurrency(deductions[i][1])}`, tableRight - 8, y, { width: colW / 2, align: "right" });
    }
    y += 17;
  }

  y += 6;
  drawHR(doc, y);
  y += 10;

  // Totals row
  doc.rect(tableLeft, y, colW, 24).fill(ACCENT);
  doc.rect(mid, y, colW, 24).fill("#EF4444");

  const totalEarnings = payroll.grossSalary ?? earnings.reduce((s, [, v]) => s + (v || 0), 0);
  const totalDeductions = payroll.totalDeductions ?? deductions.reduce((s, [, v]) => s + (v || 0), 0);

  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
  doc.text("Gross Earnings", tableLeft + 6, y + 7).text(`₹ ${formatCurrency(totalEarnings)}`, mid - 8, y + 7, { align: "right", width: colW / 2 });
  doc.text("Total Deductions", mid + 6, y + 7).text(`₹ ${formatCurrency(totalDeductions)}`, tableRight - 8, y + 7, { align: "right", width: colW / 2 });

  // ── Net pay box ─────────────────────────────────────────────────
  y += 36;
  doc.rect(tableLeft, y, tableRight - tableLeft, 42).fill(BRAND);
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(10).text("NET PAY (Take Home)", tableLeft + 12, y + 8);
  doc.font("Helvetica-Bold").fontSize(18).text(`₹ ${formatCurrency(payroll.netSalary ?? 0)}`, 0, y + 6, { align: "right", width: tableRight - 8 });

  // ── Footer ──────────────────────────────────────────────────────
  y += 58;
  drawHR(doc, y);
  doc.fillColor(MUTED).fontSize(8).font("Helvetica")
    .text("This is a computer-generated payslip and does not require a signature.", 40, y + 6, { align: "center", width: width - 80 });

  doc.end();
};

module.exports = { createPayslipPDF };
