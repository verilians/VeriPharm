import React, { useState, useEffect } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { Download } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import mockPurchases from "./mockPurchases";

const branches = [
  "All Branches",
  "Main Branch",
  "Westside Branch",
  "Eastside Branch",
];
const suppliers = ["All Suppliers", "Medico Ltd.", "PharmaPro", "HealthPlus"];

const PurchasesSummary: React.FC = () => {
  const [branch, setBranch] = useState("All Branches");
  const [supplier, setSupplier] = useState("All Suppliers");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredPurchases, setFilteredPurchases] = useState<typeof mockPurchases>([]);
  const navigate = useNavigate();

  // Automatically update filteredPurchases whenever filters change
  useEffect(() => {
    let purchases = mockPurchases;
    if (branch !== "All Branches") {
      purchases = purchases.filter((p) => p.branch === branch);
    }
    if (supplier !== "All Suppliers") {
      purchases = purchases.filter((p) => p.supplier === supplier);
    }
    if (startDate) {
      purchases = purchases.filter((p) => p.date >= startDate);
    }
    if (endDate) {
      purchases = purchases.filter((p) => p.date <= endDate);
    }
    setFilteredPurchases(purchases);
  }, [branch, supplier, startDate, endDate]);

  // Summary calculations
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.total, 0);
  const totalItems = filteredPurchases.reduce((sum, p) => sum + p.items, 0);
  const topSupplier = (() => {
    if (filteredPurchases.length === 0) return "-";
    const supplierTotals: { [key: string]: number } = {};
    filteredPurchases.forEach((p) => {
      supplierTotals[p.supplier] = (supplierTotals[p.supplier] || 0) + p.total;
    });
    return Object.entries(supplierTotals).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const handleExportPDF = () => {
    if (filteredPurchases.length === 0) return;
    const doc = new jsPDF();
    const columns = ["Branch", "Date", "Supplier", "Total", "Items", "Status"];
    const rows = filteredPurchases.map((p) => [
      p.branch,
      p.date,
      p.supplier,
      `$${p.total}`,
      p.items,
      p.status,
    ]);
    autoTable(doc, { head: [columns], body: rows });
    doc.save(`Purchases-summary.pdf`);
  };

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <h1 className="text-2xl font-bold text-blue-700 mb-8">
          Purchases Summary
        </h1>
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
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {suppliers.map((s) => (
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
          {/* Remove Generate Summary button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            disabled={filteredPurchases.length === 0}
            title="Export as PDF"
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <button
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-200"
            onClick={() => navigate("/tenant/purchases-summary/total-purchase")}
          >
            <div className="text-xs text-gray-500 mb-1">Total Purchases</div>
            <div className="text-2xl font-bold text-blue-700">
              ${totalPurchases}
            </div>
          </button>
          <button
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-200"
            onClick={() => navigate("/tenant/purchases-summary/items-purchased")}
          >
            <div className="text-xs text-gray-500 mb-1">
              Total Items Purchased
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {totalItems}
            </div>
          </button>
          <button
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-200"
            onClick={() => navigate("/tenant/purchases-summary/suppliers")}
          >
            <div className="text-xs text-gray-500 mb-1">Top Supplier</div>
            <div className="text-lg font-semibold text-blue-700">
              {topSupplier}
            </div>
          </button>
        </div>
        {/* Purchases Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-4">
          {filteredPurchases.length === 0 ? (
            <div className="text-gray-500 text-center">
              No purchases found for the selected filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Supplier</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Items</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((p, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50">
                    <td className="py-2">{p.branch}</td>
                    <td className="py-2">{p.date}</td>
                    <td className="py-2">{p.supplier}</td>
                    <td className="py-2">${p.total}</td>
                    <td className="py-2">{p.items}</td>
                    <td className="py-2">{p.status}</td>
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

export default PurchasesSummary;
