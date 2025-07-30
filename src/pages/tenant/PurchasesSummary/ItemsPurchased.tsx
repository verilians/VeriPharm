import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useNavigate } from "react-router-dom";
import { Download } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import mockPurchases from "./mockPurchases";

const branches = [
  "All Branches",
  "Main Branch",
  "Westside Branch",
  "Eastside Branch",
];
const suppliers = ["All Suppliers", "Medico Ltd.", "PharmaPro", "HealthPlus"];

const ItemsPurchased: React.FC = () => {
  const [branch, setBranch] = useState("All Branches");
  const [supplier, setSupplier] = useState("All Suppliers");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const filtered = mockPurchases.filter(
    (p) =>
      (branch === "All Branches" || p.branch === branch) &&
      (supplier === "All Suppliers" || p.supplier === supplier) &&
      (!startDate || p.date >= startDate) &&
      (!endDate || p.date <= endDate)
  );

  const handleExportPDF = () => {
    if (filtered.length === 0) return;
    const doc = new jsPDF();
    filtered.forEach((p, idx) => {
      doc.text(`${p.branch} - ${p.supplier} (${p.date})`, 10, 10 + idx * 60);
      autoTable(doc, {
        startY: 15 + idx * 60,
        head: [["Item", "Price", "Qty", "Total"]],
        body: p.itemsList.map((item) => [
          item.name,
          `$${item.price}`,
          item.quantity,
          `$${item.price * item.quantity}`,
        ]),
      });
      // doc.text(`Total: $${p.total}`, 150, doc.lastAutoTable.finalY + 5); // jsPDF compatibility issue
    });
    doc.save("items-purchased.pdf");
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    let csv = "Sale Date,Branch,Supplier,Item,Price,Quantity,Total\n";
    filtered.forEach((p) => {
      p.itemsList.forEach((item) => {
        csv += `${p.date},${p.branch},${p.supplier},${item.name},${item.price},${item.quantity},${item.price * item.quantity}\n`;
      });
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items-purchased.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <button
          onClick={() => navigate("/tenant/purchases-summary")}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to Summary
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Items Purchased per Branch from Supplier
        </h1>
        <div className="flex gap-2 mb-4">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-1/2"
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
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-1/2"
          >
            {suppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-1/2"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-1/2"
            placeholder="End Date"
          />
        </div>
        {/* Export buttons for mobile */}
        <div className="flex gap-2 mb-4 sm:hidden">
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
        {filtered.length === 0 ? (
          <div className="py-2 text-gray-500 text-center">
            No data for current filters.
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="mb-8 bg-white rounded-xl shadow p-4">
              <div className="mb-2 font-semibold text-blue-700">
                {p.branch} - {p.supplier}{" "}
                <span className="text-xs text-gray-500">({p.date})</span>
              </div>
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr className="border-b">
                    <th className="py-1 text-left">Item</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {p.itemsList.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 text-right">${item.price}</td>
                      <td className="py-1 text-right">{item.quantity}</td>
                      <td className="py-1 text-right">
                        ${item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right text-sm font-bold text-blue-700">
                Total: ${p.total}
              </div>
            </div>
          ))
        )}
        {/* Export buttons for desktop */}
        <div className="hidden sm:flex gap-2 mb-4">
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
      </div>
    </TenantDashboardLayout>
  );
};

export default ItemsPurchased;
 