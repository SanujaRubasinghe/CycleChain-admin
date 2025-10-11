// app/api/payments/generate-pdf/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";

    const now = new Date();
    const formattedDate = now.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate date ranges
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    
    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() - 30);

    // Get totals
    const weeklyTotal = await Payment.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const monthlyTotal = await Payment.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get daily data based on period
    const startDate = period === "weekly" ? weekStart : monthStart;
    const daily = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get detailed transactions
    const transactions = await Payment.find({ createdAt: { $gte: startDate } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Create PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(17, 24, 39); // gray-950
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("Payment Analysis Report", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(`Period: ${period === "weekly" ? "Last 7 Days" : "Last 30 Days"}`, 105, 28, { align: "center" });
    doc.text(`Generated: ${formattedDate}`, 105, 35, { align: "center" });

    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Summary", 14, 50);

    // Summary boxes
    const summaryY = 58;
    
    // Weekly Total Box
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(14, summaryY, 85, 25, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("WEEKLY TOTAL", 18, summaryY + 8);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(`LKR ${(weeklyTotal[0]?.total || 0).toLocaleString()}`, 18, summaryY + 18);

    // Monthly Total Box
    doc.setFillColor(59, 130, 246); // blue-500
    doc.roundedRect(109, summaryY, 85, 25, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("MONTHLY TOTAL", 113, summaryY + 8);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(`LKR ${(monthlyTotal[0]?.total || 0).toLocaleString()}`, 113, summaryY + 18);

    // Daily Breakdown Table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Daily Breakdown", 14, 95);

    const dailyTableData = daily.map(item => [
      item._id,
      item.count.toString(),
      `LKR ${item.total.toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 100,
      head: [["Date", "Transactions", "Total Amount"]],
      body: dailyTableData,
      theme: "grid",
      headStyles: {
        fillColor: [31, 41, 55], // gray-800
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // gray-50
      },
      margin: { left: 14, right: 14 }
    });

    // Recent Transactions Table
    let finalY = doc.lastAutoTable.finalY + 15;
    
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Recent Transactions (Last 50)", 14, finalY);

    const transactionTableData = transactions.map(txn => [
      new Date(txn.createdAt).toLocaleDateString(),
      txn.userId?.toString().substring(0, 8) || "N/A",
      txn.method || "N/A",
      txn.status || "N/A",
      `LKR ${txn.amount.toLocaleString()}`
    ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [["Date", "User ID", "Method", "Status", "Amount"]],
      body: transactionTableData,
      theme: "grid",
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
      doc.text(
        "CycleChain Admin - Payment Management System",
        105,
        doc.internal.pageSize.height - 5,
        { align: "center" }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="payment-analysis-${period}-${Date.now()}.pdf"`
      }
    });

  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
