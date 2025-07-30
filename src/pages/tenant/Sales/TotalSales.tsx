import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useNavigate } from "react-router-dom";
import mockSales from "./mockSales";

const branches = [
  "All Branches",
  "Main Branch",
  "Westside Branch",
  "Eastside Branch",
];
const salespeople = [
  "All Salespeople",
  ...mockSales.filter(s => s.salesperson === "All Salespeople").map(s => s.salesperson),
];

const TotalSales: React.FC = () => {
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

  // Sales per branch
  const salesPerBranch = (() => {
    const result: { [key: string]: number } = {};
    filtered.forEach((s) => {
      result[s.branch] = (result[s.branch] || 0) + s.total;
    });
    return result;
  })();

  // Sales per salesperson
  const salesPerSalesperson = (() => {
    const result: { [key: string]: number } = {};
    filtered.forEach((s) => {
      result[s.salesperson] = (result[s.salesperson] || 0) + s.total;
    });
    return result;
  })();

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
          Total Sales Breakdown
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
            onChange={e => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-1/2"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-1/2"
            placeholder="End Date"
          />
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            Sales per Branch
          </h2>
          <ul className="divide-y">
            {Object.entries(salesPerBranch).length === 0 ? (
              <li className="py-2 text-gray-500 text-center">
                No data for current filters.
              </li>
            ) : (
              Object.entries(salesPerBranch).map(([branch, total]) => (
                <li key={branch} className="py-2 flex justify-between text-sm">
                  <span>{branch}</span>
                  <span className="font-bold text-blue-700">${total}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            Sales per Salesperson
          </h2>
          <ul className="divide-y">
            {Object.entries(salesPerSalesperson).length === 0 ? (
              <li className="py-2 text-gray-500 text-center">
                No data for current filters.
              </li>
            ) : (
              Object.entries(salesPerSalesperson).map(([sp, total]) => (
                <li key={sp} className="py-2 flex justify-between text-sm">
                  <span>{sp}</span>
                  <span className="font-bold text-blue-700">${total}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </TenantDashboardLayout>
  );
};

export default TotalSales;
 