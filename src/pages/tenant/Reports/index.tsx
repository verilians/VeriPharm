import React, { useState, useEffect } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const branches = [
  "All Branches",
  "Main Branch",
  "Westside Branch",
  "Eastside Branch",
];
const reportTypes = ["Sales", "Purchases", "Stock", "Audits"];

// Simulated report data
const mockReports = {
  Sales: [
    {
      id: 1,
      branch: "Main Branch",
      date: "2024-06-01",
      total: 1200,
      items: 45,
    },
    {
      id: 2,
      branch: "Westside Branch",
      date: "2024-06-01",
      total: 800,
      items: 30,
    },
    {
      id: 3,
      branch: "Eastside Branch",
      date: "2024-06-01",
      total: 600,
      items: 20,
    },
  ],
  Purchases: [
    { id: 1, branch: "Main Branch", date: "2024-06-01", total: 900, items: 25 },
    {
      id: 2,
      branch: "Westside Branch",
      date: "2024-06-01",
      total: 700,
      items: 18,
    },
  ],
  Stock: [
    { id: 1, branch: "Main Branch", date: "2024-06-01", stockLevel: 1200 },
    { id: 2, branch: "Westside Branch", date: "2024-06-01", stockLevel: 800 },
  ],
  Audits: [
    { id: 1, branch: "Main Branch", date: "2024-06-01", result: "Pass" },
    { id: 2, branch: "Westside Branch", date: "2024-06-01", result: "Fail" },
  ],
};

const Reports: React.FC = () => {
  const [branch, setBranch] = useState("All Branches");
  const [reportType, setReportType] = useState("Sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredReports, setFilteredReports] = useState<any[]>([]);

  // Automatically update filteredReports whenever filters change
  useEffect(() => {
    type ReportType = keyof typeof mockReports;
    type SalesReport = (typeof mockReports)["Sales"][number];
    type PurchasesReport = (typeof mockReports)["Purchases"][number];
    type StockReport = (typeof mockReports)["Stock"][number];
    type AuditsReport = (typeof mockReports)["Audits"][number];
    type ReportItem =
      | SalesReport
      | PurchasesReport
      | StockReport
      | AuditsReport;

    const reportsArray =
      (mockReports[reportType as ReportType] as ReportItem[]) || [];
    let reports = reportsArray;
    if (branch !== "All Branches") {
      reports = reports.filter((r: ReportItem) => r.branch === branch);
    }
    if (startDate) {
      reports = reports.filter((r: ReportItem) => r.date >= startDate);
    }
    if (endDate) {
      reports = reports.filter((r) => r.date <= endDate);
    }
    setFilteredReports(reports);
  }, [branch, reportType, startDate, endDate]);

  const handleExportPDF = () => {
    if (filteredReports.length === 0) return;
    const doc = new jsPDF();
    let columns: any[] = ["Branch", "Date"];
    let rows: any[] = [];
    if (reportType === "Sales") {
      columns = ["Branch", "Date", "Total Sales", "Items Sold"];
      rows = filteredReports.map((r) => [
        r.branch,
        r.date,
        `$${r.total}`,
        r.items,
      ]);
    } else if (reportType === "Purchases") {
      columns = ["Branch", "Date", "Total Purchases", "Items Purchased"];
      rows = filteredReports.map((r) => [
        r.branch,
        r.date,
        `$${r.total}`,
        r.items,
      ]);
    } else if (reportType === "Stock") {
      columns = ["Branch", "Date", "Stock Level"];
      rows = filteredReports.map((r) => [r.branch, r.date, r.stockLevel]);
    } else if (reportType === "Audits") {
      columns = ["Branch", "Date", "Result"];
      rows = filteredReports.map((r) => [r.branch, r.date, r.result]);
    }
    autoTable(doc, { head: [columns], body: rows });
    doc.save(`${reportType}-report.pdf`);
  };

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <h1 className="text-2xl font-bold text-blue-700 mb-8">Reports</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {reportTypes.map((t) => (
              <option key={t} value={t}>
                {t} Report
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
            placeholder="End Date"
          />
          {/* Remove Generate Report button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            disabled={filteredReports.length === 0}
            title="Export as PDF"
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 mt-4">
          {filteredReports.length === 0 ? (
            <div className="text-gray-500 text-center">
              No reports found for the selected filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Date</th>
                  {reportType === "Sales" && (
                    <th className="py-2">Total Sales</th>
                  )}
                  {reportType === "Sales" && (
                    <th className="py-2">Items Sold</th>
                  )}
                  {reportType === "Purchases" && (
                    <th className="py-2">Total Purchases</th>
                  )}
                  {reportType === "Purchases" && (
                    <th className="py-2">Items Purchased</th>
                  )}
                  {reportType === "Stock" && (
                    <th className="py-2">Stock Level</th>
                  )}
                  {reportType === "Audits" && <th className="py-2">Result</th>}
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50">
                    <td className="py-2">{r.branch}</td>
                    <td className="py-2">{r.date}</td>
                    {reportType === "Sales" && (
                      <td className="py-2">${r.total}</td>
                    )}
                    {reportType === "Sales" && (
                      <td className="py-2">{r.items}</td>
                    )}
                    {reportType === "Purchases" && (
                      <td className="py-2">${r.total}</td>
                    )}
                    {reportType === "Purchases" && (
                      <td className="py-2">{r.items}</td>
                    )}
                    {reportType === "Stock" && (
                      <td className="py-2">{r.stockLevel}</td>
                    )}
                    {reportType === "Audits" && (
                      <td className="py-2 font-bold {r.result === 'Pass' ? 'text-green-600' : 'text-red-500'}">
                        {r.result}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </TenantDashboardLayout>
  );
};

export default Reports;
