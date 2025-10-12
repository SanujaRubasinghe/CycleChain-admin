"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { FiDownload } from "react-icons/fi";

export default function PaymentDashboard() {
  const [data, setData] = useState({ weeklyTotal: 0, monthlyTotal: 0, daily: [] });
  const [period, setPeriod] = useState("monthly"); // 'weekly' or 'monthly'
  const [isDownloading, setIsDownloading] = useState(false);
  const [distributionData, setDistributionData] = useState({
    methodDistribution: [],
    statusDistribution: [],
    recentTrends: [],
    currencyDistribution: []
  });
  const [cryptoPortfolio, setCryptoPortfolio] = useState({
    portfolio: {
      totalEthValue: 0,
      totalLkrValue: 0,
      recentEthValue: 0,
      recentLkrValue: 0,
      growthPercentage: 0,
      ethPrice: 0,
      lkrToEthRate: 0
    },
    chartData: [],
    recentPayments: [],
    lastUpdated: null
  });

  useEffect(() => {
    fetch(`/api/payments/analytics?period=${period}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, [period]);

  useEffect(() => {
    fetch('/api/payments/distribution')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDistributionData(data);
        }
      })
      .catch((err) => console.error('Error fetching distribution data:', err));
  }, []);

  useEffect(() => {
    fetch('/api/crypto/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCryptoPortfolio(data);
        }
      })
      .catch((err) => console.error('Error fetching crypto portfolio:', err));
  }, []);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      console.log("Starting PDF generation...");
      console.log("Current data:", data);
      
      // Use existing data instead of fetching again
      const analyticsData = data;
      
      // Load jsPDF dynamically
      const jsPDF = (await import("jspdf")).jsPDF;
      
      // Try to load autoTable
      try {
        await import("jspdf-autotable");
        console.log("jspdf-autotable loaded successfully");
      } catch (e) {
        console.log("jspdf-autotable failed to load:", e);
      }
      
      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log("Creating PDF document...");
      // Create PDF
      const doc = new jsPDF();
      
      console.log("autoTable check:", typeof doc.autoTable);
      
      // Header
      doc.setFillColor(17, 24, 39);
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
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(14, summaryY, 85, 25, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("WEEKLY TOTAL", 18, summaryY + 8);
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text(`LKR ${(analyticsData.weeklyTotal || 0).toLocaleString()}`, 18, summaryY + 18);

      // Monthly Total Box
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(109, summaryY, 85, 25, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("MONTHLY TOTAL", 113, summaryY + 8);
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text(`LKR ${(analyticsData.monthlyTotal || 0).toLocaleString()}`, 113, summaryY + 18);

      // Daily Breakdown Table
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Daily Breakdown", 14, 95);

      const dailyTableData = (analyticsData.daily || []).map(item => [
        item._id || "N/A",
        `LKR ${(item.total || 0).toLocaleString()}`
      ]);

      console.log("Table data prepared:", dailyTableData);
      console.log("autoTable available:", typeof doc.autoTable);
      
      // Add the table using autoTable
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 100,
          head: [["Date", "Total Amount"]],
          body: dailyTableData.length > 0 ? dailyTableData : [["No data available", "-"]],
          theme: "grid",
          headStyles: {
            fillColor: [31, 41, 55],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { left: 14, right: 14 }
        });
        console.log("Table added, finalY:", doc.lastAutoTable?.finalY);
      } else {
        // Fallback: manually draw table if autoTable doesn't work
        console.log("autoTable not available, drawing manually");
        let tableY = 105;
        doc.setFontSize(9);
        doc.setFont(undefined, "bold");
        doc.text("Date", 20, tableY);
        doc.text("Total Amount", 100, tableY);
        
        tableY += 5;
        doc.setFont(undefined, "normal");
        
        dailyTableData.forEach((row, index) => {
          if (tableY > 270) {
            doc.addPage();
            tableY = 20;
          }
          doc.text(row[0], 20, tableY);
          doc.text(row[1], 100, tableY);
          tableY += 5;
        });
      }

      // Add chart visualization as text summary
      let chartY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 180;
      
      if (chartY > 250) {
        doc.addPage();
        chartY = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Payment Trends", 14, chartY);
      
      // Add simple bar representation
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      let barY = chartY + 10;
      
      // Calculate max bar width to fit within page (page width 210mm, margins 14mm each side)
      const maxBarWidth = 100; // Maximum bar width in mm
      const maxValue = Math.max(...(analyticsData.daily || []).map(d => d.total));
      
      (analyticsData.daily || []).slice(0, 10).forEach((item, index) => {
        // Scale bar width proportionally but cap at maxBarWidth
        const barWidth = maxValue > 0 ? (item.total / maxValue) * maxBarWidth : 0;
        
        // Date label (left side)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(item._id, 14, barY);
        
        // Bar (starts at x=55)
        doc.setFillColor(period === "weekly" ? 16 : 59, period === "weekly" ? 185 : 130, period === "weekly" ? 129 : 246);
        doc.rect(55, barY - 3, barWidth, 5, "F");
        
        // Amount label (right side, after bar)
        doc.setFontSize(8);
        doc.text(`LKR ${item.total.toLocaleString()}`, 158, barY);
        
        barY += 8;
        
        if (barY > 270) {
          doc.addPage();
          barY = 20;
          // Re-add section title on new page
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.text("Payment Trends (continued)", 14, barY);
          barY += 10;
          doc.setFontSize(9);
          doc.setFont(undefined, "normal");
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

      console.log("Saving PDF...");
      // Save PDF
      const filename = `payment-analysis-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      console.log("PDF saved successfully as:", filename);
      
    } catch (error) {
      console.error("Detailed error generating PDF:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      alert(`Failed to download PDF: ${error.message}\n\nCheck console for details.`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-gray-100">
      {/* Page heading with download button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 tracking-tight">
          Transaction Overview
        </h1>
        
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="text-lg" />
          {isDownloading ? "Generating PDF..." : "Download PDF Report"}
        </button>
      </div>

      {/* Stats + chart grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly total */}
        <Card className="shadow-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
          <CardContent className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-400">Weekly Total</h2>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              LKR {data.weeklyTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Monthly total */}
        <Card className="shadow-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
          <CardContent className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-400">Monthly Total</h2>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              LKR {data.monthlyTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-xl col-span-1 md:col-span-3 bg-gray-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold text-gray-200">
                Payments ({period === "weekly" ? "Last 7 Days" : "Last 30 Days"})
              </h2>
              
              {/* Filter buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod("weekly")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    period === "weekly"
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setPeriod("monthly")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    period === "monthly"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.daily}>
                <XAxis
                  dataKey="_id"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                    color: "#f9fafb",
                  }}
                />
                <Bar 
                  dataKey="total" 
                  fill={period === "weekly" ? "#10b981" : "#3b82f6"} 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Distribution Charts */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-100 mb-6">Payment Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Payment Methods Distribution */}
          <Card className="shadow-xl bg-gray-900 border border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Payment Methods</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distributionData.methodDistribution.map(item => ({
                      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
                      value: item.count,
                      amount: item.totalAmount
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.methodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[
                        '#10b981', // emerald
                        '#3b82f6', // blue
                        '#f59e0b'  // amber
                      ][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#f9fafb",
                    }}
                    formatter={(value, name, props) => [
                      `${value} payments (LKR ${props.payload.amount?.toLocaleString() || 0})`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Status Distribution */}
          <Card className="shadow-xl bg-gray-900 border border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Payment Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distributionData.statusDistribution.map(item => ({
                      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
                      value: item.count,
                      amount: item.totalAmount
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[
                        '#10b981', // emerald - completed
                        '#f59e0b', // amber - pending
                        '#ef4444'  // red - failed
                      ][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#f9fafb",
                    }}
                    formatter={(value, name, props) => [
                      `${value} payments (LKR ${props.payload.amount?.toLocaleString() || 0})`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Payment Trends by Method */}
          <Card className="shadow-xl bg-gray-900 border border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Trends by Method</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={distributionData.recentTrends}>
                  <XAxis
                    dataKey="_id"
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    axisLine={{ stroke: "#4b5563" }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    axisLine={{ stroke: "#4b5563" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#f9fafb",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="crypto"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Crypto"
                  />
                  <Line
                    type="monotone"
                    dataKey="card"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Card"
                  />
                  <Line
                    type="monotone"
                    dataKey="qr"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="QR"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Currency Distribution */}
        {distributionData.currencyDistribution.length > 1 && (
          <div className="mt-6">
            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Currency Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {distributionData.currencyDistribution.map((currency, index) => (
                    <div key={currency._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-blue-400">{currency._id}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {currency.count} payments • LKR {currency.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Crypto Portfolio Section */}
      {cryptoPortfolio.portfolio.totalEthValue > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <span className="text-orange-400">₿</span> Crypto Portfolio (ETH)
          </h2>

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-sm uppercase tracking-wide text-gray-400">Total ETH Value</h3>
                <p className="text-3xl font-bold text-orange-400 mt-2">
                  {cryptoPortfolio.portfolio.totalEthValue.toFixed(4)} ETH
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  LKR {cryptoPortfolio.portfolio.totalLkrValue.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-sm uppercase tracking-wide text-gray-400">ETH Price</h3>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  LKR {cryptoPortfolio.portfolio.ethPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  1 ETH = LKR {cryptoPortfolio.portfolio.ethPrice.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-sm uppercase tracking-wide text-gray-400">30-Day Growth</h3>
                <p className={`text-3xl font-bold mt-2 ${
                  cryptoPortfolio.portfolio.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {cryptoPortfolio.portfolio.growthPercentage >= 0 ? '+' : ''}
                  {cryptoPortfolio.portfolio.growthPercentage.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Recent: {cryptoPortfolio.portfolio.recentEthValue.toFixed(4)} ETH
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-sm uppercase tracking-wide text-gray-400">Total Transactions</h3>
                <p className="text-3xl font-bold text-blue-400 mt-2">
                  {cryptoPortfolio.recentPayments.length}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Crypto Portfolio Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ETH Value Over Time */}
            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">ETH Accumulation Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cryptoPortfolio.chartData}>
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      axisLine={{ stroke: "#4b5563" }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      axisLine={{ stroke: "#4b5563" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                        color: "#f9fafb",
                      }}
                      formatter={(value) => [`${Number(value).toFixed(4)} ETH`, 'Accumulated Value']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="ethAmount"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent ETH Transactions */}
            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent ETH Transactions</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cryptoPortfolio.recentPayments.map((payment, index) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          ₿
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-200">
                            {payment.ethAmount.toFixed(4)} ETH
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300">
                          LKR {payment.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.transactionId ? payment.transactionId.slice(-8) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {cryptoPortfolio.recentPayments.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      No recent ETH transactions
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Portfolio Performance Summary */}
          <div className="mt-6">
            <Card className="shadow-xl bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Portfolio Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400 mb-2">
                      {cryptoPortfolio.portfolio.totalEthValue.toFixed(4)} ETH
                    </div>
                    <div className="text-sm text-gray-400">Total Portfolio Value</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ≈ LKR {cryptoPortfolio.portfolio.totalLkrValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${
                      cryptoPortfolio.portfolio.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {cryptoPortfolio.portfolio.growthPercentage >= 0 ? '+' : ''}
                      {cryptoPortfolio.portfolio.growthPercentage.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-400">30-Day Growth</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Portfolio performance
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {cryptoPortfolio.portfolio.recentEthValue.toFixed(4)} ETH
                    </div>
                    <div className="text-sm text-gray-400">Recent Accumulation</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last 30 days
                    </div>
                  </div>
                </div>
                {cryptoPortfolio.lastUpdated && (
                  <div className="text-xs text-gray-500 text-center mt-4">
                    Last updated: {new Date(cryptoPortfolio.lastUpdated).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
