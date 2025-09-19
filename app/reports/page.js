"use client";

export default function ReportsPage() {
  const generateReport = async () => {
    const res = await fetch("/api/admin/report");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface p-10">
      <div className="card max-w-lg mx-auto p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Generate Report</h2>
        <p className="text-subtext mb-6">Download full analytics of users, rides, and sales.</p>
        <button onClick={generateReport} className="btn btn-primary w-full">
          Download Report
        </button>
      </div>
    </div>
  );
}
