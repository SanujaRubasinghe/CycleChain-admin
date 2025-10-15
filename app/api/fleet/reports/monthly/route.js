import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { jsPDF } from "jspdf";
import RentalSession from "@/models/RentalSession";
import Payment from "@/models/Payment";
import MaintenanceRecord from "@/models/MaintenanceRecord";

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

  // create simple PDF with jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let y = 20; // starting y position

  // Title
  doc.setFontSize(18);
  doc.text("CycleChain Monthly Fleet Analytics Report", 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(12);
  doc.text(`Report Period: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`, 105, y, { align: "center" });
  y += 5;
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, y, { align: "center" });
  y += 15;

  // Summary
  doc.setFontSize(14);
  doc.text("Executive Summary", 20, y);
  y += 10;

  const summaryData = [
    { label: "Rental Sessions", value: sessions.length },
    { label: "Total Revenue", value: `LKR ${totalRevenue.toFixed(2)}` },
    { label: "Maintenance Issues", value: maintenance.length },
    { label: "Popular Locations", value: locationArray.length },
  ];

  doc.setFontSize(10);
  summaryData.forEach((item) => {
    doc.text(`${item.label}: ${item.value}`, 20, y);
    y += 5;
  });
  y += 10;

  // Tables
  function drawTable(title, headers, rows) {
    if (y > 250) { // if near bottom, add page
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text(title, 20, y);
    y += 8;

    // Headers
    doc.setFontSize(9);
    const colWidth = 35;
    headers.forEach((h, i) => {
      doc.text(h, 20 + i * colWidth, y);
    });
    y += 5;
    doc.line(20, y, 20 + headers.length * colWidth, y);
    y += 5;

    // Rows
    rows.forEach((row) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      row.forEach((cell, i) => {
        const text = cell == null ? "" : String(cell);
        doc.text(text, 20 + i * colWidth, y, { maxWidth: colWidth - 2 });
      });
      y += 5;
    });
    y += 10;
  }

  // Prepare all rows
  const sessionRows = sessions.map((s) => [
    (s.session_id || s._id)?.toString?.().slice(0, 8) || "-",
    (s.user_id || s.user)?.toString?.().slice(0, 8) || "-",
    (s.bike_id || s.bike)?.toString?.().slice(0, 8) || "-",
    s.status || "-",
    `LKR ${Number(s.cost || 0).toFixed(2)}`,
  ]);

  const paymentRows = payments.map((p) => [
    (p._id || "")?.toString?.().slice(0, 8) || "-",
    (p.user_id || p.user)?.toString?.().slice(0, 8) || "-",
    `LKR ${Number(p.amount || 0).toFixed(2)}`,
    p.status || "-",
    new Date(p.createdAt).toLocaleDateString(),
  ]);

  const maintenanceRows = maintenance.map((m) => [
    (m.bike_id || "")?.toString?.().slice(0, 8) || "-",
    m.issue ? (m.issue.length > 40 ? m.issue.substring(0, 37) + "..." : m.issue) : "-",
    m.status || "-",
    `LKR ${Number(m.cost || 0).toFixed(2)}`,
  ]);

  const bikeUsageRows = bikeUsageArray.map((bike) => [
    bike.bikeId.toString().slice(0, 8),
    bike.totalRides,
    `LKR ${bike.totalRevenue.toFixed(2)}`,
    `${Math.round(bike.totalTime)} min`,
  ]);

  const locationRows = locationArray.map((location, index) => [
    index + 1,
    location.coordinates,
    location.totalRentals,
    `LKR ${location.totalRevenue.toFixed(2)}`,
  ]);

  // Draw tables
  drawTable("Rental Sessions", ["Session", "User", "Bike", "Status", "Cost"], sessionRows);
  drawTable("Payments", ["Payment", "User", "Amount", "Status", "Date"], paymentRows);
  drawTable("Maintenance Records", ["Bike", "Issue", "Status", "Cost"], maintenanceRows);
  drawTable("Bike Usage Summary", ["Bike ID", "Rides", "Revenue", "Time"], bikeUsageRows);
  drawTable("Top Rental Locations", ["Rank", "Coords", "Rentals", "Revenue"], locationRows);

  // Get PDF as buffer
  const pdfBuffer = doc.output('arraybuffer');

  // return PDF as an attachment
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CycleChain_Monthly_Report_${dateStr}.pdf"`,
    },
  });
}
