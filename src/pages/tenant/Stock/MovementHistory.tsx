import { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { getStockMovements } from "./mockStockUtils";

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

const MovementHistory = () => {
  const [branch, setBranch] = useState("All Branches");
  const [item, setItem] = useState("All Items");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const mockMovements = getStockMovements();

  const filtered = mockMovements.filter(
    (m) =>
      (branch === "All Branches" || m.branch === branch) &&
      (item === "All Items" || m.item === item) &&
      (!startDate || m.date >= startDate) &&
      (!endDate || m.date <= endDate)
  );

  const handleExportPDF = () => {
    if (filtered.length === 0) return;
    const doc = new jsPDF();
    const columns = ["Branch", "Date", "Item", "Type", "Quantity", "Reason"];
    const rows = filtered.map((m) => [
      m.branch,
      m.date,
      m.item,
      m.type,
      m.quantity,
      m.reason,
    ]);
    autoTable(doc, { head: [columns], body: rows });
    doc.save("stock-movement-history.pdf");
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    let csv = "Branch,Date,Item,Type,Quantity,Reason\n";
    filtered.forEach((m) => {
      csv += `${m.branch},${m.date},${m.item},${m.type},${m.quantity},${m.reason}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock-movement-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <button
          onClick={() => navigate("/tenant/stock")}
          className="mb-6 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-lg shadow transition"
        >
          &larr; Back to Stock Summary
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-8">
          Stock Movement History
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
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full sm:w-1/4 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {items.map((i) => (
              <option key={i} value={i}>
                {i}
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
              No stock movement data for the selected filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Branch</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50">
                    <td className="py-2">{m.branch}</td>
                    <td className="py-2">{m.date}</td>
                    <td className="py-2">
                      <button
                        className="text-blue-700 hover:underline font-semibold"
                        onClick={() =>
                          navigate(
                            `/tenant/stock/item/${encodeURIComponent(m.item)}`
                          )
                        }
                      >
                        {m.item}
                      </button>
                    </td>
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

export default MovementHistory;
