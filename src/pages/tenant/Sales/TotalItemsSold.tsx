import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import mockSales from "./mockSales";

const branches = [
  "All Branches",
  "Main Branch",
  "Westside Branch",
  "Eastside Branch",
];
const salespeople = [
  "All Salespeople",
  ...mockSales
    .filter((s) => s.salesperson === "All Salespeople")
    .map((s) => s.salesperson),
];

const TotalItemsSold: React.FC = () => {
  const [branch, setBranch] = useState("All Branches");
  const [salesperson, setSalesperson] = useState("All Salespeople");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const filtered = mockSales.filter(
    (s) =>
      (branch === "All Branches" || s.branch === branch) &&
      (salesperson === "All Salespeople" || s.salesperson === salesperson) &&
      (!startDate || s.date >= startDate) &&
      (!endDate || s.date <= endDate)
  );

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    let csv =
      "Sale Date,Branch,Salesperson,Item ID,Item Name,Price,Quantity,Total\n";
    filtered.forEach((s) => {
      s.itemsList.forEach((item) => {
        csv += `${s.date},${s.branch},${s.salesperson},${item.id},${item.name},${item.price},${item.quantity},${item.price * item.quantity}\n`;
      });
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "total-items-sold.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1 mx-auto">
        <button
          onClick={() => navigate("/tenant/sales")}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to Sales Summary
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Total Items Sold
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
            value={salesperson}
            onChange={(e) => setSalesperson(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-1/2"
          >
            {salespeople.map((s) => (
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
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mb-4"
          disabled={filtered.length === 0}
          title="Export as CSV"
        >
          <Download size={18} /> Export CSV
        </button>
        {filtered.length === 0 ? (
          <div className="py-2 text-gray-500 text-center">
            No data for current filters.
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="mb-8 bg-white rounded-xl shadow p-4">
              <div className="mb-2 font-semibold text-blue-700">
                {s.branch} - {s.salesperson}{" "}
                <span className="text-xs text-gray-500">({s.date})</span>
              </div>
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr className="border-b">
                    <th className="py-1 text-left">Item ID</th>
                    <th className="py-1 text-left">Item</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {s.itemsList.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="py-1">{item.id}</td>
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
                Total: ${s.total}
              </div>
            </div>
          ))
        )}
      </div>
    </TenantDashboardLayout>
  );
};

export default TotalItemsSold;
