import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { Download } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { getStockMovements } from "./mockStockUtils";
import { useMemo } from "react";

const branches = [
  "All Branches",
  "Main Branch",
  "Westside Branch",
  "Eastside Branch",
];
const items = [
  "All Items",
  "Paracetamol",
  "Ibuprofen",
  "Amoxicillin",
  "Cough Syrup",
  "Vitamin C",
  "Antacid",
  "Aspirin",
  "Multivitamin",
  "Metformin",
  "Lisinopril",
  "Atorvastatin",
  "Simvastatin",
  "Amlodipine",
  "Omeprazole",
];

// Mock stock data
const Stock = () => {
  const [branch, setBranch] = useState("All Branches");
  const [item, setItem] = useState("All Items");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const movements = useMemo(() => getStockMovements(), []);
  // Generate stock summary: latest stock per branch/item
  const stockMap = {};
  movements.forEach((m) => {
    const key = `${m.branch}|${m.item}`;
    if (!stockMap[key])
      stockMap[key] = {
        branch: m.branch,
        item: m.item,
        stockLevel: 0,
        unit: "boxes",
        lastDate: m.date,
      };
    stockMap[key].stockLevel += m.type === "in" ? m.quantity : -m.quantity;
    if (m.date > stockMap[key].lastDate) stockMap[key].lastDate = m.date;
  });
  const mockStock = Object.values(stockMap).map((s: any) => ({
    ...s,
    date: s.lastDate,
  }));

  const filtered = mockStock.filter(
    (s) =>
      (branch === "All Branches" || s.branch === branch) &&
      (item === "All Items" || s.item === item) &&
      (!date || s.date === date)
  );

  const handleExportPDF = () => {
    if (filtered.length === 0) return;
    const doc = new jsPDF();
    const columns = ["Branch", "Date", "Item", "Stock Level", "Unit"];
    const rows = filtered.map((s) => [
      s.branch,
      s.date,
      s.item,
      s.stockLevel,
      s.unit,
    ]);
    autoTable(doc, { head: [columns], body: rows });
    doc.save("stock-summary.pdf");
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    let csv = "Branch,Date,Item,Stock Level,Unit\n";
    filtered.forEach((s) => {
      csv += `${s.branch},${s.date},${s.item},${s.stockLevel},${s.unit}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock-summary.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasNegativeStock = mockStock.some((s) => s.stockLevel < 0);

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <h1 className="text-2xl font-bold text-blue-700 mb-8">Stock Summary</h1>
        {hasNegativeStock && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg font-semibold flex items-center gap-2">
            <span role="img" aria-label="warning">
              ⚠️
            </span>
            Warning: Some items have negative stock levels. Please investigate
            and correct inventory records.
          </div>
        )}
        <button
          onClick={() => navigate("/tenant/stock/movement-history")}
          className="mb-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-lg shadow transition"
        >
          View Stock Movement History
        </button>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full sm:w-1/3 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full sm:w-1/3 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {items.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-1/3 border rounded-lg focus:ring-2 focus:ring-blue-200"
            placeholder="Date"
          />
        </div>
        {/* Export buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            disabled={filtered.length === 0}
            title="Export as PDF"
          >
            <Download size={18} /> Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            disabled={filtered.length === 0}
            title="Export as CSV"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 mt-4">
          {filtered.length === 0 ? (
            <div className="text-gray-500 text-center">
              No stock data for the selected filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Stock Level</th>
                  <th className="py-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={i}
                    className={`border-b hover:bg-blue-50 ${s.stockLevel < 0 ? "bg-red-50 text-red-700 font-semibold" : ""}`}
                  >
                    <td className="py-2">{s.branch}</td>
                    <td className="py-2">{s.date}</td>
                    <td className="py-2">
                      <button
                        className="text-blue-700 hover:underline font-semibold"
                        onClick={() =>
                          navigate(
                            `/tenant/stock/item/${encodeURIComponent(s.item)}`
                          )
                        }
                      >
                        {s.item}
                      </button>
                    </td>
                    <td className="py-2">{s.stockLevel}</td>
                    <td className="py-2">{s.unit}</td>
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

export default Stock;
 