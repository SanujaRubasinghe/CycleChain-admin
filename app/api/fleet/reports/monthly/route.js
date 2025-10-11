import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import RentalSession from "@/models/RentalSession";
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
  const [sessions, payments, maintenance] = await Promise.all([
    RentalSession.find({ start_time: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
    Payment.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
    MaintenanceRecord.find({ reported_at: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
  ]);

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Calculate bike usage statistics
  const bikeUsage = {};
  sessions.forEach(session => {
    const bikeId = session.bike_id || session.bike;
    if (bikeId) {
      if (!bikeUsage[bikeId]) {
        bikeUsage[bikeId] = {
          bikeId: bikeId.toString(),
          totalRides: 0,
          totalRevenue: 0,
          totalTime: 0,
        };
      }
      bikeUsage[bikeId].totalRides += 1;
      bikeUsage[bikeId].totalRevenue += Number(session.cost || 0);

      // Calculate session duration if available
      if (session.start_time && session.end_time) {
        const duration = new Date(session.end_time) - new Date(session.start_time);
        bikeUsage[bikeId].totalTime += Math.max(0, duration / (1000 * 60)); // minutes
      }
    }
  });

  // Convert to array and sort by total rides (most used first)
  const bikeUsageArray = Object.values(bikeUsage).sort((a, b) => b.totalRides - a.totalRides);

  // Calculate rental locations
  const locationClusters = {};
  sessions.forEach(session => {
    if (session.gps && session.gps.lat && session.gps.lng) {
      // Create location clusters by rounding coordinates (group nearby locations)
      const lat = Math.round(session.gps.lat * 100) / 100; // Round to 2 decimal places (~1km precision)
      const lng = Math.round(session.gps.lng * 100) / 100;
      const locationKey = `${lat},${lng}`;

      if (!locationClusters[locationKey]) {
        locationClusters[locationKey] = {
          lat: lat,
          lng: lng,
          totalRentals: 0,
          totalRevenue: 0,
          coordinates: `${lat}, ${lng}`,
        };
      }
      locationClusters[locationKey].totalRentals += 1;
      locationClusters[locationKey].totalRevenue += Number(session.cost || 0);
    }
  });

  // Convert to array and sort by total rentals (most popular locations first)
  const locationArray = Object.values(locationClusters)
    .sort((a, b) => b.totalRentals - a.totalRentals)
    .slice(0, 10); // Top 10 locations

  // create PDF with buffered pages so we can add page numbers at the end
  const doc = new PDFDocument({
    size: "A4",
    margin: 60,
    bufferPages: true,
    font: "./public/fonts/Roboto-Regular.ttf"
  });

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

  // Color scheme
  const colors = {
    primary: "#06B6D4", // cyan-500
    primaryLight: "#67E8F9", // cyan-300
    primaryDark: "#0891B2", // cyan-600
    secondary: "#3B82F6", // blue-500
    accent: "#10B981", // emerald-500
    text: "#1F2937", // gray-800
    textLight: "#6B7280", // gray-500
    textMuted: "#9CA3AF", // gray-400
    background: "#FFFFFF",
    backgroundLight: "#F9FAFB", // gray-50
    border: "#E5E7EB", // gray-200
  };

  // Stream buffers
  const buffers = [];
  const pdfBuffer = await new Promise((resolve, reject) => {
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // ---------------- COVER PAGE ----------------
    // Modern cover design with gradient background
    const logoPath = publicPath("logo.png");
    if (fs.existsSync(logoPath)) {
      // center the logo with shadow effect
      const logoWidth = 140;
      const logoX = doc.page.width / 2 - logoWidth / 2;
      const logoY = 150;

      // Add subtle background gradient
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.primary + "10");

      // Logo container with shadow
      doc.circle(logoX + logoWidth/2, logoY + 70, logoWidth/2 + 5).fill(colors.primary + "20");
      doc.image(logoPath, logoX, logoY, { width: logoWidth });
    } else {
      // Fallback gradient background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.primary + "10");
    }

    // Modern title design with gradient text effect
    const titleY = 350;
    doc
      .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
      .fontSize(42)
      .fillColor(colors.primary)
      .text("CycleChain", doc.page.width / 2 - 120, titleY, { align: "center", lineGap: 8 });

    // Subtitle with modern styling
    doc
      .font(fs.existsSync(fonts.medium) ? "Roboto-Medium" : "Helvetica")
      .fontSize(20)
      .fillColor(colors.textLight)
      .text("Monthly Performance Report", { align: "center" });

    // Decorative line
    const lineY = titleY + 120;
    doc
      .moveTo(doc.page.width / 2 - 100, lineY)
      .lineTo(doc.page.width / 2 + 100, lineY)
      .lineWidth(3)
      .stroke(colors.primary);

    // Report period in modern card style
    const periodY = lineY + 40;
    const periodWidth = 300;
    const periodHeight = 50;
    const periodX = doc.page.width / 2 - periodWidth / 2;

    // Card background
    doc
      .roundedRect(periodX, periodY, periodWidth, periodHeight, 8)
      .fill(colors.background);

    // Card border
    doc
      .roundedRect(periodX, periodY, periodWidth, periodHeight, 8)
      .stroke(colors.border);

    // Period text
    doc
      .font(fs.existsSync(fonts.medium) ? "Roboto-Medium" : "Helvetica")
      .fontSize(14)
      .fillColor(colors.text)
      .text(`Report Period: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`,
           periodX + 20, periodY + 18, { width: periodWidth - 40, align: "center" });

    // Generated date
    doc
      .font(fs.existsSync(fonts.regular) ? "Roboto-Regular" : "Helvetica")
      .fontSize(10)
      .fillColor(colors.textMuted)
      .text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
           0, periodY + periodHeight + 20, { align: "center" });

    // move to next page (summary)
    doc.addPage();

    // ---------------- SUMMARY PAGE ----------------
    // Add page background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

    // Page header with modern design
    const headerHeight = 80;
    doc
      .rect(0, 0, doc.page.width, headerHeight)
      .fill(colors.primary);

    doc
      .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
      .fontSize(24)
      .fillColor(colors.background)
      .text("Executive Summary", 60, 30);

    doc.moveDown(2);

    const summaryData = [
      { label: "Rental Sessions", value: sessions.length, icon: "🚲", color: colors.primary },
      { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "💰", color: colors.accent },
      { label: "Maintenance Issues", value: maintenance.length, icon: "🔧", color: "#F59E0B" },
      { label: "Popular Locations", value: locationArray.length, icon: "📍", color: colors.secondary },
    ];

    // Modern summary cards layout
    const cardWidth = (doc.page.width - 120) / 2; // 2 cards per row
    const cardHeight = 80;
    const cardMargin = 20;

    summaryData.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 60 + col * (cardWidth + cardMargin);
      const y = 120 + row * (cardHeight + cardMargin);

      // Card background with subtle shadow effect
      doc
        .roundedRect(x, y, cardWidth, cardHeight, 12)
        .fill(colors.background);

      // Card border
      doc
        .roundedRect(x, y, cardWidth, cardHeight, 12)
        .stroke(colors.border);

      // Icon and label
      doc
        .font(fs.existsSync(fonts.medium) ? "Roboto-Medium" : "Helvetica")
        .fontSize(14)
        .fillColor(colors.textLight)
        .text(item.icon + " " + item.label, x + 20, y + 20);

      // Value with accent color
      doc
        .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
        .fontSize(20)
        .fillColor(item.color)
        .text(String(item.value), x + 20, y + 45);
    });

    // move to the next page which will contain simple tables
    doc.addPage();

    // ---------------- MODERN TABLES ----------------
    // Helper to draw a modern table that paginates
    function drawModernTable(title, headers, rows) {
      const margin = doc.options.margin;
      const tableHeaderHeight = 60;
      const headerHeight = 30;
      const rowHeight = 25;
      const minRowsToShow = 3; // Minimum rows to show before pagination

      // Check if we have enough space on current page for table header + min rows
      const requiredSpace = tableHeaderHeight + headerHeight + (minRowsToShow * rowHeight) + 50; // +50 for margins
      const availableSpace = doc.page.height - doc.y - margin - 40; // -40 for page numbers

      // If not enough space, start a new page
      if (availableSpace < requiredSpace) {
        doc.addPage();
      }

      // Page background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

      // Table header with gradient background
      doc
        .rect(0, 0, doc.page.width, tableHeaderHeight)
        .fill(colors.primary);

      doc
        .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
        .fontSize(20)
        .fillColor(colors.background)
        .text(title, 60, 25);

      doc.moveDown(1);

      const usableWidth = doc.page.width - margin * 2;
      const colCount = Math.max(headers.length, 1);
      const colWidth = usableWidth / colCount;

      // Modern header row with gradient
      let y = doc.y;
      function drawHeader() {
        // Header background with gradient effect
        doc
          .roundedRect(margin, y, usableWidth, headerHeight, 6)
          .fill(colors.primaryDark);

        // Header border
        doc
          .roundedRect(margin, y, usableWidth, headerHeight, 6)
          .stroke(colors.primary);

        doc.fillColor(colors.background);
        doc.font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold").fontSize(11);
        headers.forEach((h, i) => {
          doc.text(h, margin + i * colWidth + 8, y + 9, { width: colWidth - 16, align: "center" });
        });
        y += headerHeight + 5; // Add spacing after header
      }

      drawHeader();

      doc.font(fs.existsSync(fonts.regular) ? "Roboto-Regular" : "Helvetica").fontSize(10).fillColor(colors.text);

      rows.forEach((row, rIdx) => {
        // Check if we need to paginate within the table
        if (y + rowHeight > doc.page.height - margin - 40) { // Leave room for page numbers
          doc.addPage();
          // Redraw page background and header
          doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);
          doc
            .rect(0, 0, doc.page.width, tableHeaderHeight)
            .fill(colors.primary);
          doc
            .font(fs.existsSync(fonts.bold) ? "Roboto-Bold" : "Helvetica-Bold")
            .fontSize(20)
            .fillColor(colors.background)
            .text(title, 60, 25);
          doc.moveDown(1);
          y = doc.y;
          drawHeader();
        }

        // Alternate row colors for better readability
        const fill = rIdx % 2 === 0 ? colors.background : colors.backgroundLight;

        // Row background
        doc
          .roundedRect(margin, y, usableWidth, rowHeight, 4)
          .fill(fill);

        // Subtle row border
        doc
          .roundedRect(margin, y, usableWidth, rowHeight, 4)
          .stroke(colors.border);

        row.forEach((cell, cIdx) => {
          const text = cell == null ? "" : String(cell);
          const isNumeric = typeof cell === "number" || (typeof text === "string" && text.startsWith("$"));

          doc.fillColor(colors.text);
          doc.text(text, margin + cIdx * colWidth + 8, y + 7, {
            width: colWidth - 16,
            align: isNumeric ? "right" : "center",
          });
        });

        y += rowHeight + 2; // Add spacing between rows
      });

      // Set doc.y so subsequent content starts after table
      doc.y = y + 20;
      doc.moveDown(1);
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

    const bikeUsageRows = bikeUsageArray.map((bike) => [
      bike.bikeId.toString().slice(0, 8),
      bike.totalRides,
      `$${bike.totalRevenue.toFixed(2)}`,
      `${Math.round(bike.totalTime)} min`,
    ]);

    const locationRows = locationArray.map((location, index) => [
      index + 1,
      location.coordinates,
      location.totalRentals,
      `$${location.totalRevenue.toFixed(2)}`,
    ]);

    // Draw the tables; check space before creating new pages
    drawModernTable("Rental Sessions", ["Session", "User", "Bike", "Status", "Cost"], sessionRows);
    drawModernTable("Payments", ["Payment", "User", "Amount", "Status", "Date"], paymentRows);
    drawModernTable("Maintenance Records", ["Bike", "Issue", "Status", "Cost"], maintenanceRows);
    drawModernTable("Bike Usage Summary", ["Bike ID", "Total Rides", "Revenue Generated", "Total Time"], bikeUsageRows);
    drawModernTable("Top Rental Locations", ["Rank", "Coordinates", "Total Rentals", "Revenue"], locationRows);

    // ---------------- ADD PAGE NUMBERS ----------------
    const range = doc.bufferedPageRange(); // { start: 0, count: n }
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).fillColor(colors.textMuted).text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 40, {
        align: "center",
      });
    }

    // finalize PDF
    doc.end();
  });

  // return PDF as an attachment
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CycleChain_Monthly_Report_${dateStr}.pdf"`,
    },
  });
}
