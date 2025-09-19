"use client";

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function PDFGenerator() {
    const [dateRange, setDateRange] = useState('30d');
    const [reportType, setReportType] = useState('summary');
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeData, setIncludeData] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const pdfRef = useRef();

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/reservation/reports?dateRange=${dateRange}&reportType=${reportType}`);
                const result = await response.json();

                if (result.success) {
                    setAnalyticsData(result.data);
                } else {
                    console.error('Failed to fetch data:', result.error);
                    setAnalyticsData(getMockData());
                }
            } catch (error) {
                console.error('Error fetching report data:', error);
                setAnalyticsData(getMockData());
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dateRange, reportType]);

    // Mock data as fallback
    const getMockData = () => ({
        totalReservations: 1248,
        completedReservations: 1024,
        pendingReservations: 124,
        cancelledReservations: 100,
        revenue: 45890,
        averageBookingValue: 145,
        occupancyRate: 78,
        popularServices: [
            { name: 'Mountain Bike', count: 284 },
            { name: 'Road Bike', count: 192 },
            { name: 'Hybrid Bike', count: 176 },
            { name: 'Electric Bike', count: 152 },
        ],
        reservationSources: [
            { name: 'Website', value: 45 },
            { name: 'Mobile App', value: 30 },
            { name: 'Phone', value: 15 },
            { name: 'Email', value: 10 },
        ],
        dailyBookings: [
            { day: 'Mon', bookings: 45 },
            { day: 'Tue', bookings: 52 },
            { day: 'Wed', bookings: 48 },
            { day: 'Thu', bookings: 67 },
            { day: 'Fri', bookings: 59 },
            { day: 'Sat', bookings: 75 },
            { day: 'Sun', bookings: 80 },
        ],
        monthlyTrend: [
            { month: 'Jan', revenue: 38500, bookings: 245 },
            { month: 'Feb', revenue: 41200, bookings: 268 },
            { month: 'Mar', revenue: 39800, bookings: 254 },
            { month: 'Apr', revenue: 43100, bookings: 278 },
            { month: 'May', revenue: 45890, bookings: 312 },
        ]
    });

    const handleDownload = () => {
        if (!analyticsData) return;

        setIsGenerating(true);

        // Create a print-friendly version of the content
        const printContent = pdfRef.current;

        // Style for printing
        const printStyles = `
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #e2e8f0; 
          background: #1a202c;
        }
        .print-container { 
          width: 100%; 
          max-width: 1000px;
          margin: 0 auto;
        }
        .print-header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #4a5568; 
          padding-bottom: 20px; 
        }
        .print-header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          color: #63b3ed;
        }
        .print-header p {
          margin: 5px 0;
          color: #a0aec0;
        }
        .print-section { 
          margin-bottom: 25px; 
        }
        .print-section h2 {
          font-size: 20px;
          color: #63b3ed;
          border-bottom: 1px solid #4a5568;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .print-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 15px; 
          margin-bottom: 20px; 
        }
        .print-card { 
          border: 1px solid #4a5568; 
          padding: 15px; 
          border-radius: 5px; 
          text-align: center;
          background-color: #2d3748;
        }
        .print-card p:first-child {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #a0aec0;
        }
        .print-card p:last-child {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #e2e8f0;
        }
        .print-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
          font-size: 14px;
        }
        .print-table th, .print-table td { 
          border: 1px solid #4a5568; 
          padding: 10px; 
          text-align: left; 
        }
        .print-table th { 
          background-color: #2d3748; 
          font-weight: bold;
          color: #e2e8f0;
        }
        .print-table td {
          background-color: #2d3748;
          color: #e2e8f0;
        }
        .print-chart { 
          margin-bottom: 25px; 
        }
        .print-chart h3 {
          font-size: 16px;
          margin: 0 0 15px 0;
          color: #e2e8f0;
        }
        .print-footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #4a5568; 
          text-align: center; 
          font-size: 12px; 
          color: #a0aec0; 
        }
        .chart-container {
          display: flex;
          align-items: flex-end;
          height: 200px;
          gap: 10px;
          margin: 15px 0;
        }
        .chart-bar {
          flex: 1;
          background-color: #4299e1;
          border-radius: 3px 3px 0 0;
          position: relative;
        }
        .chart-label {
          text-align: center;
          font-size: 12px;
          margin-top: 5px;
          color: #e2e8f0;
        }
        .pie-chart {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        .pie-legend {
          flex: 1;
        }
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .legend-color {
          width: 15px;
          height: 15px;
          border-radius: 3px;
          margin-right: 10px;
        }
        @media print {
          body { 
            padding: 15px; 
            background: #1a202c;
          }
          .no-print { 
            display: none !important; 
          }
          .print-container {
            width: 100%;
          }
        }
        @page {
          margin: 1cm;
        }
      </style>
    `;

        // Create a print-friendly version of the content
        const printContentHTML = `
      <div class="print-container">
        <div class="print-header">
          <h1>Bike Reservation Analytics Report</h1>
          <p>Generated on ${getCurrentDate()}</p>
          <p>${getReportTypeText()} • ${getDateRangeText()}</p>
        </div>
        
        <!-- Key Metrics -->
        <div class="print-section">
          <h2>Key Performance Indicators</h2>
          <div class="print-grid">
            <div class="print-card">
              <p>Total Reservations</p>
              <p>${analyticsData.totalReservations}</p>
            </div>
            <div class="print-card">
              <p>Completed Reservations</p>
              <p>${analyticsData.completedReservations}</p>
            </div>
            <div class="print-card">
              <p>Revenue</p>
              <p>$${analyticsData.revenue.toLocaleString()}</p>
            </div>
            <div class="print-card">
              <p>Occupancy Rate</p>
              <p>${analyticsData.occupancyRate}%</p>
            </div>
          </div>
        </div>
        
        <!-- Charts Section -->
        ${includeCharts ? `
        <div class="print-section">
          <h2>Performance Trends</h2>
          
          <div class="print-chart">
            <h3>Monthly Revenue</h3>
            <div class="chart-container">
              ${analyticsData.monthlyTrend.map((month, index) => `
                <div>
                  <div class="chart-bar" style="height: ${month.revenue / 250}px;"></div>
                  <div class="chart-label">${month.month}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="print-chart">
            <h3>Reservation Sources</h3>
            <div class="pie-chart">
              <div style="width: 200px; height: 200px; position: relative;">
                <!-- Pie chart representation using CSS -->
                <div style="
                  width: 200px; 
                  height: 200px; 
                  border-radius: 50%; 
                  background: conic-gradient(
                    #4299e1 0% ${analyticsData.reservationSources[0].value}%,
                    #48bb78 ${analyticsData.reservationSources[0].value}% ${analyticsData.reservationSources[0].value + analyticsData.reservationSources[1].value}%,
                    #ecc94b ${analyticsData.reservationSources[0].value + analyticsData.reservationSources[1].value}% ${analyticsData.reservationSources[0].value + analyticsData.reservationSources[1].value + analyticsData.reservationSources[2].value}%,
                    #f56565 ${analyticsData.reservationSources[0].value + analyticsData.reservationSources[1].value + analyticsData.reservationSources[2].value}% 100%
                  );
                "></div>
              </div>
              
              <div class="pie-legend">
                ${analyticsData.reservationSources.map((source, index) => `
                  <div class="legend-item">
                    <div class="legend-color" style="background-color: ${
            index === 0 ? '#4299e1' :
                index === 1 ? '#48bb78' :
                    index === 2 ? '#ecc94b' : '#f56565'
        }"></div>
                    <span style="color: #e2e8f0;">${source.name}</span>
                    <span style="margin-left: auto; color: #e2e8f0;">${source.value}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Data Tables -->
        ${includeData ? `
        <div class="print-section">
          <h2>Detailed Data</h2>
          
          <div class="print-chart">
            <h3>Popular Bike Types</h3>
            <table class="print-table">
              <thead>
                <tr>
                  <th>Bike Type</th>
                  <th>Reservations</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${analyticsData.popularServices.map((service, index) => `
                  <tr>
                    <td>${service.name}</td>
                    <td>${service.count}</td>
                    <td>${((service.count / analyticsData.totalReservations) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="print-chart">
            <h3>Monthly Performance</h3>
            <table class="print-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Bookings</th>
                  <th>Avg. Value</th>
                </tr>
              </thead>
              <tbody>
                ${analyticsData.monthlyTrend.map((month, index) => `
                  <tr>
                    <td>${month.month}</td>
                    <td>$${month.revenue.toLocaleString()}</td>
                    <td>${month.bookings}</td>
                    <td>$${Math.round(month.revenue / month.bookings)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}
        
        <div class="print-footer">
          <p>Confidential Report - For Internal Use Only</p>
          <p>Generated by Bike Reservation Management System</p>
        </div>
      </div>
    `;

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>Bike Reservation Analytics Report</title>
          ${printStyles}
        </head>
        <body>
          ${printContentHTML}
        </body>
      </html>
    `);

        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = function() {
                printWindow.close();
                setIsGenerating(false);
            };

            // Fallback in case onafterprint doesn't fire
            setTimeout(() => {
                setIsGenerating(false);
            }, 1000);
        };
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReportTypeText = () => {
        switch(reportType) {
            case 'summary': return 'Summary Report';
            case 'detailed': return 'Detailed Report';
            case 'financial': return 'Financial Report';
            case 'performance': return 'Performance Report';
            default: return 'Report';
        }
    };

    const getDateRangeText = () => {
        switch(dateRange) {
            case '7d': return 'Last 7 days';
            case '30d': return 'Last 30 days';
            case '90d': return 'Last 90 days';
            case 'ytd': return 'Year to Date';
            case '12m': return 'Last 12 months';
            default: return '';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading report data...</p>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400">Failed to load report data</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Head>
                <title>PDF Report Generator | Admin Panel</title>
                <meta name="description" content="Generate PDF reports for reservation analytics" />
            </Head>

            {/* Sidebar and Main Content */}
            <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-8">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-white">PDF Report Generator</h1>
                        <p className="text-gray-400">Generate and download professional reports for your reservation analytics</p>
                    </header>

                    {/* Report Configuration */}
                    <div className="bg-gray-800 rounded-lg shadow p-6 mb-8 no-print">
                        <h2 className="text-lg font-semibold text-white mb-4">Report Configuration</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-700 text-white"
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                >
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d">Last 30 days</option>
                                    <option value="90d">Last 90 days</option>
                                    <option value="ytd">Year to Date</option>
                                    <option value="12m">Last 12 months</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-700 text-white"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option value="summary">Summary Report</option>
                                    <option value="detailed">Detailed Report</option>
                                    <option value="financial">Financial Report</option>
                                    <option value="performance">Performance Report</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Report Options</label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={includeCharts}
                                        onChange={() => setIncludeCharts(!includeCharts)}
                                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                                    />
                                    <span className="ml-2 text-sm text-gray-300">Include Charts</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={includeData}
                                        onChange={() => setIncludeData(!includeData)}
                                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                                    />
                                    <span className="ml-2 text-sm text-gray-300">Include Raw Data</span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleDownload}
                                disabled={isGenerating}
                                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating Report...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Generate & Download PDF Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* PDF Preview */}
                    <div className="bg-gray-800 rounded-lg shadow p-6 no-print">
                        <h2 className="text-lg font-semibold text-white mb-4">Report Preview</h2>
                        <p className="text-sm text-gray-400 mb-4">This is a preview of how your PDF report will look</p>

                        <div className="border-2 border-dashed border-gray-600 p-4 rounded-lg">
                            {/* PDF Content with ref */}
                            <div ref={pdfRef} className="bg-gray-900 p-8 pdf-content">
                                {/* Key Metrics */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-white mb-4">Key Performance Indicators</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-gray-700 p-4 rounded bg-gray-800">
                                            <p className="text-sm text-gray-400">Total Reservations</p>
                                            <p className="text-2xl font-bold text-white">{analyticsData.totalReservations}</p>
                                        </div>
                                        <div className="border border-gray-700 p-4 rounded bg-gray-800">
                                            <p className="text-sm text-gray-400">Completed Reservations</p>
                                            <p className="text-2xl font-bold text-white">{analyticsData.completedReservations}</p>
                                        </div>
                                        <div className="border border-gray-700 p-4 rounded bg-gray-800">
                                            <p className="text-sm text-gray-400">Revenue</p>
                                            <p className="text-2xl font-bold text-white">${analyticsData.revenue.toLocaleString()}</p>
                                        </div>
                                        <div className="border border-gray-700 p-4 rounded bg-gray-800">
                                            <p className="text-sm text-gray-400">Occupancy Rate</p>
                                            <p className="text-2xl font-bold text-white">{analyticsData.occupancyRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Section */}
                                {includeCharts && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-white mb-4">Performance Trends</h2>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-white mb-2">Monthly Revenue</h3>
                                            <div className="h-48 flex items-end space-x-2">
                                                {analyticsData.monthlyTrend.map((month, index) => (
                                                    <div key={index} className="flex flex-col items-center flex-1">
                                                        <div
                                                            className="w-full bg-blue-500 rounded-t"
                                                            style={{ height: `${month.revenue / 500}px` }}
                                                        ></div>
                                                        <span className="text-xs text-gray-400 mt-2">{month.month}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-white mb-2">Reservation Sources</h3>
                                            <div className="flex items-center">
                                                <div className="w-48 h-48 relative mr-6">
                                                    {/* Pie chart representation */}
                                                    <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
                                                    <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'inset(0 0 0 50%)' }}></div>
                                                    <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 0%, 50% 50%, 100% 50%, 100% 0%)' }}></div>
                                                    <div className="absolute inset-0 rounded-full border-8 border-red-500" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 50%)' }}></div>
                                                </div>

                                                <div className="flex-1">
                                                    {analyticsData.reservationSources.map((source, index) => (
                                                        <div key={index} className="flex items-center mb-2">
                                                            <div className={`w-4 h-4 rounded-full mr-2 ${
                                                                index === 0 ? 'bg-blue-500' :
                                                                    index === 1 ? 'bg-green-500' :
                                                                        index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}></div>
                                                            <span className="text-sm text-gray-300">{source.name}</span>
                                                            <span className="ml-auto text-sm font-medium text-white">{source.value}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Data Tables */}
                                {includeData && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-4">Detailed Data</h2>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-white mb-2">Popular Bike Types</h3>
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Bike Type</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Reservations</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Percentage</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                {analyticsData.popularServices.map((service, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-sm text-white">{service.name}</td>
                                                        <td className="px-4 py-2 text-sm text-white">{service.count}</td>
                                                        <td className="px-4 py-2 text-sm text-white">
                                                            {((service.count / analyticsData.totalReservations) * 100).toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-white mb-2">Monthly Performance</h3>
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Month</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Revenue</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Bookings</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Avg. Value</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                {analyticsData.monthlyTrend.map((month, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-sm text-white">{month.month}</td>
                                                        <td className="px-4 py-2 text-sm text-white">${month.revenue.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-sm text-white">{month.bookings}</td>
                                                        <td className="px-4 py-2 text-sm text-white">${Math.round(month.revenue / month.bookings)}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}