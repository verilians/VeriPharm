import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useNavigate } from "react-router-dom";

const branches = [
  "All Branches",
  "Main Branch",
  "Westside Branch",
  "Eastside Branch",
];
const mockPurchases = [
  {
    id: 1,
    branch: "Main Branch",
    date: "2024-06-01",
    supplier: "Medico Ltd.",
    total: 900,
    items: 25,
    status: "Received",
  },
  {
    id: 2,
    branch: "Westside Branch",
    date: "2024-06-01",
    supplier: "PharmaPro",
    total: 700,
    items: 18,
    status: "Pending",
  },
  {
    id: 3,
    branch: "Main Branch",
    date: "2024-06-02",
    supplier: "HealthPlus",
    total: 1200,
    items: 30,
    status: "Received",
  },
];

const TotalPurchase: React.FC = () => {
  const [branch, setBranch] = useState("All Branches");
  const navigate = useNavigate();

  const filtered =
    branch === "All Branches"
      ? mockPurchases
      : mockPurchases.filter((p) => p.branch === branch);
  const amountPerSupplier = (() => {
    const result: { [key: string]: number } = {};
    filtered.forEach((p) => {
      result[p.supplier] = (result[p.supplier] || 0) + p.total;
    });
    return result;
  })();

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1 mx-auto">
        <button
          onClick={() => navigate("/tenant/purchases-summary")}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to Summary
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Amount Spent per Supplier{" "}
          {branch !== "All Branches" && `in ${branch}`}
        </h1>
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-full"
        >
          {branches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <ul className="divide-y">
          {Object.entries(amountPerSupplier).length === 0 ? (
            <li className="py-2 text-gray-500 text-center">
              No data for current filters.
            </li>
          ) : (
            Object.entries(amountPerSupplier).map(([supplier, amount]) => (
              <li key={supplier} className="py-2 flex justify-between text-sm">
                <span>{supplier}</span>
                <span className="font-bold text-blue-700">${amount}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </TenantDashboardLayout>
  );
};

export default TotalPurchase;
