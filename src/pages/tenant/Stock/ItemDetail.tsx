import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getStockMovements } from "./mockStockUtils";
import { useMemo } from "react";

const branches = ["Main Branch", "Westside Branch", "Eastside Branch"];

// Mock stock data (should match summary)
const mockStock = [
  {
    branch: "Main Branch",
    item: "Paracetamol",
    date: "2024-06-01",
    stockLevel: 120,
    unit: "boxes",
  },
  {
    branch: "Main Branch",
    item: "Paracetamol",
    date: "2024-06-02",
    stockLevel: 110,
    unit: "boxes",
  },
  {
    branch: "Westside Branch",
    item: "Amoxicillin",
    date: "2024-06-01",
    stockLevel: 60,
    unit: "boxes",
  },
  {
    branch: "Eastside Branch",
    item: "Vitamin C",
    date: "2024-06-01",
    stockLevel: 90,
    unit: "boxes",
  },
  // ... add more as needed
];

// Mock movement data (should match movement page)
const mockMovements = [
  {
    branch: "Main Branch",
    item: "Paracetamol",
    date: "2024-06-01",
    quantity: 50,
    type: "in",
    reason: "Purchase",
  },
  {
    branch: "Main Branch",
    item: "Paracetamol",
    date: "2024-06-02",
    quantity: 10,
    type: "out",
    reason: "Sale",
  },
  // ... add more as needed
];

const ItemDetail = () => {
  const { itemName } = useParams<{ itemName: string }>();
  const navigate = useNavigate();
  const item = itemName || "";

  const movements = useMemo(() => getStockMovements(), []);
  // Current stock per branch (latest sum)
  const stockPerBranch = branches.map((branch) => {
    const branchMovements = movements.filter(
      (m) => m.branch === branch && m.item === item
    );
    const stockLevel = branchMovements.reduce(
      (sum, m) => sum + (m.type === "in" ? m.quantity : -m.quantity),
      0
    );
    return { branch, stockLevel, unit: "boxes" };
  });
  // Movement history for this item
  const movementHistory = movements.filter((m) => m.item === item);

  const handleExportPDF = () => {
    if (movementHistory.length === 0) return;
    const doc = new jsPDF();
    const columns = ["Branch", "Date", "Type", "Quantity", "Reason"];
    const rows = movementHistory.map((m) => [
      m.branch,
      m.date,
      m.type,
      m.quantity,
      m.reason,
    ]);
    autoTable(doc, { head: [columns], body: rows });
    doc.save(`${item}-movement-history.pdf`);
  };

  const handleExportCSV = () => {
    if (movementHistory.length === 0) return;
    let csv = "Branch,Date,Type,Quantity,Reason\n";
    movementHistory.forEach((m) => {
      csv += `${m.branch},${m.date},${m.type},${m.quantity},${m.reason}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item}-movement-history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to Stock
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          {item} Details
        </h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            Current Stock per Branch
          </h2>
          <ul className="divide-y">
            {stockPerBranch.map((s) => (
              <li key={s.branch} className="py-2 flex justify-between text-sm">
                <span>{s.branch}</span>
                <span className="font-bold text-blue-700">
                  {s.stockLevel} {s.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            Movement History
          </h2>
          {/* Export buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              disabled={movementHistory.length === 0}
              title="Export as PDF"
            >
              <Download size={18} /> Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              disabled={movementHistory.length === 0}
              title="Export as CSV"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
          {movementHistory.length === 0 ? (
            <div className="text-gray-500 text-center">
              No movement history for this item.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {movementHistory.map((m, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50">
                    <td className="py-2">{m.branch}</td>
                    <td className="py-2">{m.date}</td>
                    <td className="py-2">{m.type === "in" ? "In" : "Out"}</td>
                    <td className="py-2">{m.quantity}</td>
                    <td className="py-2">{m.reason}</td>
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

export default ItemDetail;
