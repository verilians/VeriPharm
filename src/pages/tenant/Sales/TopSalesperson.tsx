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
  ...mockSales
    .filter((s) => s.salesperson !== "All Salespeople")
    .map((s) => s.salesperson),
];

const TopSalesperson: React.FC = () => {
  const [branch, setBranch] = useState("All Branches");
  const navigate = useNavigate();

  const filtered = mockSales.filter(
    (s) => branch === "All Branches" || s.branch === branch
  );

  // Sales and items per salesperson
  const salesStats = (() => {
    const result: { [key: string]: { total: number; items: number } } = {};
    filtered.forEach((s) => {
      if (!result[s.salesperson])
        result[s.salesperson] = { total: 0, items: 0 };
      result[s.salesperson].total += s.total;
      result[s.salesperson].items += s.items;
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
          Top Salesperson
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
        </div>
        <ul className="divide-y">
          {Object.entries(salesStats).length === 0 ? (
            <li className="py-2 text-gray-500 text-center">
              No data for current filters.
            </li>
          ) : (
            Object.entries(salesStats)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([sp, stats]) => (
                <li key={sp} className="py-2 flex justify-between text-sm">
                  <span>{sp}</span>
                  <span className="font-bold text-blue-700">
                    ${stats.total} ({stats.items} items)
                  </span>
                </li>
              ))
          )}
        </ul>
      </div>
    </TenantDashboardLayout>
  );
};

export default TopSalesperson;
 