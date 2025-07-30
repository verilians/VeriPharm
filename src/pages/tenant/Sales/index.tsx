import React, { useState, useEffect } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import usersMock from "../Users/mockUsers";
import mockSales from "./mockSales";

// Only allow branches with at least one active salesperson
const activeSalespeople = usersMock.filter(
  (u) => u.status === "Active" && u.role === "Salesperson"
);
// Build a map of branch -> active salesperson
const branchSalespersonMap = {};
activeSalespeople.forEach((u) => {
  branchSalespersonMap[u.branch] = u.name;
});
const activeBranches = ["All Branches", ...Object.keys(branchSalespersonMap)];
const salespeople = ["All Salespeople", ...Object.values(branchSalespersonMap)];
const validSalespeople = Object.values(branchSalespersonMap);

const Sales: React.FC = () => {
  const [branch, setBranch] = useState("All Branches");
  const [salesperson, setSalesperson] = useState("All Salespeople");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredSales, setFilteredSales] = useState<typeof mockSales>([]);
  const [generated, setGenerated] = useState(false);
  const navigate = useNavigate();

  // Automatically update filteredSales whenever filters or mockSales change
  useEffect(() => {
    let sales = mockSales;
    if (branch !== "All Branches") {
      sales = sales.filter((s) => s.branch === branch);
    }
    if (salesperson !== "All Salespeople") {
      sales = sales.filter((s) => s.salesperson === salesperson);
    }
    if (startDate) {
      sales = sales.filter((s) => s.date >= startDate);
    }
    if (endDate) {
      sales = sales.filter((s) => s.date <= endDate);
    }
    setFilteredSales(sales);
    setGenerated(true);
  }, [branch, salesperson, startDate, endDate]);

  // Remove old summary logic and use mockSales directly
  // Summary calculations
  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalItems = filteredSales.reduce((sum, s) => sum + s.items, 0);
  const topSalesperson = (() => {
    if (filteredSales.length === 0) return "-";
    const salesTotals = {};
    filteredSales.forEach((s) => {
      salesTotals[s.salesperson] = (salesTotals[s.salesperson] || 0) + s.total;
    });
    const top = Object.entries(salesTotals).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];
    return top;
  })();

  const handleExportPDF = () => {
    if (!generated || filteredSales.length === 0) return;
    const doc = new jsPDF();
    const columns = [
      "Branch",
      "Date",
      "Salesperson",
      "Total",
      "Items",
      "Status",
    ];
    const rows = filteredSales.map((s) => [
      s.branch,
      s.date,
      s.salesperson,
      `$${s.total}`,
      s.items,
      s.status,
    ]);
    autoTable(doc, { head: [columns], body: rows });
    doc.save(`Sales-summary.pdf`);
  };

  // Generate branch and salesperson options from mockSales
  const branchOptions = [
    "All Branches",
    ...Array.from(new Set(mockSales.map((s) => s.branch))),
  ];
  const salespersonOptions = [
    "All Salespeople",
    ...Array.from(new Set(mockSales.map((s) => s.salesperson))),
  ];

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <h1 className="text-2xl font-bold text-blue-700 mb-8">Sales</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={salesperson}
            onChange={(e) => setSalesperson(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {salespersonOptions.map((s) => (
              <option key={s} value={s}>
                {s}
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
          {/* Remove the Generate Summary button from the UI */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            disabled={!generated || filteredSales.length === 0}
            title="Export as PDF"
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
        {/* Summary Cards */}
        {generated && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <button
              className="bg-white rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-200"
              onClick={() => navigate("/tenant/sales/total-sales")}
            >
              <div className="text-xs text-gray-500 mb-1">Total Sales</div>
              <div className="text-2xl font-bold text-blue-700">
                ${totalSales}
              </div>
            </button>
            <button
              className="bg-white rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-200"
              onClick={() => navigate("/tenant/sales/total-items-sold")}
            >
              <div className="text-xs text-gray-500 mb-1">Total Items Sold</div>
              <div className="text-2xl font-bold text-blue-700">
                {totalItems}
              </div>
            </button>
            <button
              className="bg-white rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-200"
              onClick={() => navigate("/tenant/sales/top-salesperson")}
            >
              <div className="text-xs text-gray-500 mb-1">Top Salesperson</div>
              <div className="text-lg font-semibold text-blue-700">
                {topSalesperson}
              </div>
            </button>
          </div>
        )}
        {/* Sales Table */}
        {generated && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-4">
            {filteredSales.length === 0 ? (
              <div className="text-gray-500 text-center">
                No sales found for the selected filters.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Branch</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Salesperson</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Items</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((s, i) => (
                    <tr key={i} className="border-b hover:bg-blue-50">
                      <td className="py-2">{s.branch}</td>
                      <td className="py-2">{s.date}</td>
                      <td className="py-2">{s.salesperson}</td>
                      <td className="py-2">${s.total}</td>
                      <td className="py-2">{s.items}</td>
                      <td className="py-2">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </TenantDashboardLayout>
  );
};

export default Sales;
