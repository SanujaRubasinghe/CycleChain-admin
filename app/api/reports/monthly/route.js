import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import RentalSession from "@/models/RentalSession";
import User from "@/models/User";
import Payment from "@/models/Payment";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import path from "path";
import fs from "fs";

const MONGO_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

export async function GET() {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const sessions = await RentalSession.find({ start_time: { $gte: startOfMonth, $lte: endOfMonth } }).lean();
  const payments = await Payment.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).lean();
  const maintenance = await MaintenanceRecord.find({ reported_at: { $gte: startOfMonth, $lte: endOfMonth } }).lean();
  const users = await User.find({ createdAt: { $lte: endOfMonth } }).lean();

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true, font: "./public/fonts/Roboto-Regular.ttf" });

  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  // Color Scheme
  const primaryColor = "#2B6CB0"; // blue
  const secondaryColor = "#4299E1"; // lighter blue
  const lightGray = "#F7FAFC";
  const darkColor = "#2D3748";
  const mediumGray = "#718096";

  // Fonts paths
  const robotoRegular = "./public/fonts/Roboto-Regular.ttf";
  const robotoBold = "./public/fonts/Roboto-Bold.ttf";
  const robotoMedium = "./public/fonts/Roboto-Medium.ttf";

  // ----------------------- FRONT PAGE -----------------------
  function addFrontPage() {
    const logoPath = path.resolve("./public/logo.png");
    doc.font(robotoBold).fillColor(primaryColor).fontSize(36);
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 50, 130, { width: 100 });
    }
    doc.text("CycleChain", { align: "center", lineGap: 12 });
    doc.font(robotoMedium).fillColor(darkColor).fontSize(18);
    doc.text("Monthly Performance Report", { align: "center", lineGap: 6 });
    doc.font(robotoRegular).fillColor(mediumGray).fontSize(14);
    doc.text(`Report Period: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`, { align: "center" });
    doc.addPage();
  }

  // ----------------------- HEADER & FOOTER -----------------------
  function addHeader() {
    const logoPath = path.resolve("./public/logo.png");
    doc.font(robotoBold).fillColor(primaryColor).fontSize(16);
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 40 });
    }
    doc.text("CycleChain", 100, 45);
    doc.font(robotoMedium).fillColor(darkColor).fontSize(12);
    doc.text("Monthly Performance Report", 100, 65);
    doc.strokeColor(lightGray).lineWidth(1).moveTo(50, 85).lineTo(doc.page.width - 50, 85).stroke();
  }

  function addFooter() {
    const page = doc.page;
    const bottom = page.height - 40;
    doc.font(robotoRegular).fillColor(mediumGray).fontSize(10);
    doc.text(`Page ${page.number}`, 0, bottom, { align: "center" });
    doc.text(`Generated on: ${now.toLocaleDateString()}`, doc.options.margin, bottom, { align: "left" });
  }

  // ----------------------- SUMMARY BOXES -----------------------
  function addSummary() {
    addHeader();
    doc.moveDown(3);
    doc.font(robotoBold).fillColor(primaryColor).fontSize(18).text("Executive Summary", { underline: true });

    const startX = 50;
    const boxWidth = 130;
    const boxHeight = 80;
    const spacing = 25;
    const y = doc.y + 20;

    const summaryData = [
      { label: "Total Users", value: users.length },
      { label: "Rental Sessions", value: sessions.length },
      { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
      { label: "Maintenance Issues", value: maintenance.length },
    ];

    summaryData.forEach((item, i) => {
      const x = startX + i * (boxWidth + spacing);
      doc.roundedRect(x, y, boxWidth, boxHeight, 8).fillAndStroke(lightGray, secondaryColor);
      doc.fillColor(darkColor).font(robotoMedium).fontSize(13).text(item.label, x, y + 15, { width: boxWidth, align: "center" });
      doc.fillColor(primaryColor).font(robotoBold).fontSize(22).text(item.value.toString(), x, y + 40, { width: boxWidth, align: "center" });
    });

    doc.moveDown(8);
    addFooter();
    doc.addPage();
  }

  // ----------------------- TABLE HELPER -----------------------
  function drawTable(headers, rows) {
    const columnCount = headers.length;
    const pageWidth = doc.page.width - doc.options.margin * 2;
    const colWidth = pageWidth / columnCount;
    let y = doc.y;

    // Header
    doc.font(robotoBold).fontSize(11);
    doc.fillColor("white");
    doc.rect(doc.options.margin, y, pageWidth, 25).fill(primaryColor);
    headers.forEach((h, i) => {
      doc.text(h, doc.options.margin + i * colWidth + 5, y + 7, { width: colWidth - 10, align: "center" });
    });
    y += 25;

    // Rows
    doc.font(robotoRegular).fontSize(10);
    rows.forEach((row, idx) => {
      const fillColor = idx % 2 === 0 ? lightGray : "#FFFFFF";
      doc.rect(doc.options.margin, y, pageWidth, 25).fill(fillColor);
      doc.fillColor(darkColor);
      row.forEach((cell, i) => {
        // Right align numeric data columns (Cost, Amount)
        const isNumericColumn = typeof cell === "string" && cell.startsWith("$");
        doc.text(cell.toString(), doc.options.margin + i * colWidth + 5, y + 7, {
          width: colWidth - 10,
          align: isNumericColumn ? "right" : "center",
        });
      });
      y += 25;
      if (y > 730) {
        doc.addPage();
        addHeader();
        y = 110;
      }
    });

    doc.y = y + 10;
  }

  // ----------------------- DETAILED TABLES -----------------------
  function addDetailedTables() {
    // Rental Sessions
    addHeader();
    doc.moveDown(2);
    doc.font(robotoBold).fillColor(primaryColor).fontSize(16).text("Rental Sessions Detail", { underline: true });
    const sessionRows = sessions.map(s => [
      s.session_id.substring(0, 8),
      s.user_id.substring(0, 8),
      s.bike_id.substring(0, 8),
      s.status,
      `$${s.cost.toFixed(2)}`
    ]);
    drawTable(["Session", "User", "Bike", "Status", "Cost"], sessionRows);
    addFooter();

    // Payments
    doc.addPage();
    addHeader();
    doc.moveDown(2);
    doc.font(robotoBold).fillColor(primaryColor).fontSize(16).text("Payments Detail", { underline: true });
    const paymentRows = payments.map(p => [
      p._id.toString().substring(0, 8),
      p.user_id.substring(0, 8),
      `$${p.amount.toFixed(2)}`,
      p.status,
      new Date(p.createdAt).toLocaleDateString()
    ]);
    drawTable(["Payment", "User", "Amount", "Status", "Date"], paymentRows);
    addFooter();

    // Maintenance
    doc.addPage();
    addHeader();
    doc.moveDown(2);
    doc.font(robotoBold).fillColor(primaryColor).fontSize(16).text("Maintenance Records", { underline: true });
    const maintenanceRows = maintenance.map(m => [
      m.bike_id.substring(0, 8),
      m.issue.length > 30 ? m.issue.substring(0, 27) + "..." : m.issue,
      m.status,
      `$${m.cost?.toFixed(2) || "0.00"}`
    ]);
    drawTable(["Bike", "Issue", "Status", "Cost"], maintenanceRows);
    addFooter();
  }

  // ----------------------- GENERATE PDF -----------------------
  addFrontPage();
  addSummary();
  addDetailedTables();

  doc.end();

  const pdfData = await new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  return new NextResponse(pdfData, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CycleChain_Report_${now.getMonth() + 1}_${now.getFullYear()}.pdf"`,
    },
  });
}
