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
  if (!MONGO_URI) throw new Error("MONGODB_URI is not set");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

// Simple, focused monthly PDF report route
export async function GET() {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // load all data in parallel
  const [sessions, payments, maintenance, users] = await Promise.all([
    RentalSession.find({ start_time: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
    Payment.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
    MaintenanceRecord.find({ reported_at: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
    // For a monthly stat we usually report *new* users during the month
    User.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
  ]);

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // create PDF with buffered pages so we can add page numbers at the end
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true, font: "./public/fonts/Roboto-Regular.ttf" });

  // Helper to resolve public assets
  const publicPath = (p) => path.join(process.cwd(), "public", p);

  // Register fonts if available, otherwise PDFKit falls back to Helvetica
  const fonts = {
    regular: publicPath("fonts/Roboto-Regular.ttf"),
    medium: publicPath("fonts/Roboto-Medium.ttf"),
    bold: publicPath("fonts/Roboto-Bold.ttf"),
  };
  if (fs.existsSync(fonts.regular)) doc.registerFont("Roboto-Regular", fonts.regular);
  if (fs.existsSync(fonts.medium)) doc.registerFont("Roboto-Medium", fonts.medium);
  if (fs.existsSync(fonts.bold)) doc.registerFont("Roboto-Bold", fonts.bold);

  // Stream buffers
  const buffers = [];
  const pdfBuffer = await new Promise((resolve, reject) => {
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // ---------------- COVER PAGE ----------------
    // Only the cover contains logo and title
    const logoPath = publicPath("logo.png");
    if (fs.existsSync(logoPath)) {
      // center the logo
      const logoWidth = 120;
      doc.image(logoPath, doc.page.width / 2 - logoWidth / 2, 120, { width: logoWidth });
    }

    // Title and subtitle
    doc
      .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
      .fontSize(36)
      .fillColor("#2B6CB0")
      .text("CycleChain", { align: "center", lineGap: 6 });

    doc
      .font(fs.existsSync(fonts.medium) ? "Roboto-Medium" : "Helvetica")
      .fontSize(18)
      .fillColor("#2D3748")
      .text("Monthly Performance Report", { align: "center" });

    doc
      .font(fs.existsSync(fonts.regular) ? "Roboto-Regular" : "Helvetica")
      .fontSize(12)
      .fillColor("#718096")
      .text(`Report Period: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`, {
        align: "center",
      });

    // move to next page (summary)
    doc.addPage();

    // ---------------- SUMMARY PAGE ----------------
    doc
      .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
      .fontSize(18)
      .fillColor("#2D3748")
      .text("Executive Summary", { underline: false });

    doc.moveDown(1);

    const summaryData = [
      { label: "New Users", value: users.length },
      { label: "Rental Sessions", value: sessions.length },
      { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
      { label: "Maintenance Issues", value: maintenance.length },
    ];

    // Simple stacked summary (easy to read)
    summaryData.forEach((item) => {
      doc
        .font(fs.existsSync(fonts.medium) ? "Roboto-Medium" : "Helvetica")
        .fontSize(12)
        .fillColor("#4A5568")
        .text(`${item.label}: `, { continued: true });

      doc
        .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
        .fontSize(14)
        .fillColor("#2B6CB0")
        .text(String(item.value));

      doc.moveDown(0.5);
    });

    // move to the next page which will contain simple tables
    doc.addPage();

    // ---------------- SIMPLE TABLES ----------------
    // Helper to draw a plain table that paginates
    function drawSimpleTable(title, headers, rows) {
      doc
        .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
        .fontSize( fourteenOr12(16) )
        .fillColor("#2D3748")
        .text(title);

      doc.moveDown(0.5);

      const margin = doc.options.margin;
      const usableWidth = doc.page.width - margin * 2;
      const rowHeight = 20;
      const headerHeight = 22;
      const colCount = Math.max(headers.length, 1);
      const colWidth = usableWidth / colCount;

      // draw header row
      let y = doc.y;
      function drawHeader() {
        doc.rect(margin, y, usableWidth, headerHeight).fill("#2B6CB0");
        doc.fillColor("white");
        doc.font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold").fontSize(10);
        headers.forEach((h, i) => {
          doc.text(h, margin + i * colWidth + 5, y + 6, { width: colWidth - 10, align: "center" });
        });
        y += headerHeight;
      }

      drawHeader();

      doc.font(fs.existsSync(fonts.regular) ? "Roboto-Regular" : "Helvetica").fontSize(10).fillColor("#2D3748");

      rows.forEach((row, rIdx) => {
        // paginate
        if (y + rowHeight > doc.page.height - margin) {
          doc.addPage();
          y = doc.y;
          drawHeader();
        }

        const fill = rIdx % 2 === 0 ? "#FFFFFF" : "#F7FAFC";
        doc.rect(margin, y, usableWidth, rowHeight).fill(fill);

        row.forEach((cell, cIdx) => {
          const text = cell == null ? "" : String(cell);
          const isNumeric = typeof cell === "number" || (typeof text === "string" && text.startsWith("$"));

          doc.fillColor("#2D3748");
          doc.text(text, margin + cIdx * colWidth + 5, y + 4, {
            width: colWidth - 10,
            align: isNumeric ? "right" : "center",
          });
        });

        y += rowHeight;
      });

      // set doc.y so subsequent content starts after table
      doc.y = y + 10;
      doc.moveDown(0.5);
    }

    // Prepare rows for each dataset (keep it concise)
    const sessionRows = sessions.map((s) => [
      (s.session_id || s._id)?.toString?.().slice(0, 8) || "-",
      (s.user_id || s.user)?.toString?.().slice(0, 8) || "-",
      (s.bike_id || s.bike)?.toString?.().slice(0, 8) || "-",
      s.status || "-",
      `$${Number(s.cost || 0).toFixed(2)}`,
    ]);

    const paymentRows = payments.map((p) => [
      (p._id || "")?.toString?.().slice(0, 8) || "-",
      (p.user_id || p.user)?.toString?.().slice(0, 8) || "-",
      `$${Number(p.amount || 0).toFixed(2)}`,
      p.status || "-",
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const maintenanceRows = maintenance.map((m) => [
      (m.bike_id || "")?.toString?.().slice(0, 8) || "-",
      m.issue ? (m.issue.length > 60 ? m.issue.substring(0, 57) + "..." : m.issue) : "-",
      m.status || "-",
      `$${Number(m.cost || 0).toFixed(2)}`,
    ]);

    const userRows = users.map((u) => [
      (u._id || "")?.toString?.().slice(0, 8) || "-",
      u.name || u.email || "-",
      new Date(u.createdAt).toLocaleDateString(),
    ]);

    // Draw the tables; each one will paginate if necessary.
    drawSimpleTable("Rental Sessions", ["Session", "User", "Bike", "Status", "Cost"], sessionRows);
    drawSimpleTable("Payments", ["Payment", "User", "Amount", "Status", "Date"], paymentRows);
    drawSimpleTable("Maintenance Records", ["Bike", "Issue", "Status", "Cost"], maintenanceRows);
    drawSimpleTable("New Users", ["User", "Name/Email", "Joined"], userRows);

    // ---------------- ADD PAGE NUMBERS ----------------
    const range = doc.bufferedPageRange(); // { start: 0, count: n }
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).fillColor("#718096").text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 40, {
        align: "center",
      });
    }

    // finalize PDF
    doc.end();
  });

  // return PDF as an attachment
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CycleChain_Report_${now.getMonth() + 1}_${now.getFullYear()}.pdf"`,
    },
  });
}

// tiny helper used inside drawSimpleTable to switch value for fontSize if desired
function fourteenOr12(v) {
  return v;
}
