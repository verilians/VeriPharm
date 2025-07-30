import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useNavigate } from "react-router-dom";

const suppliers = ["All Suppliers", "Medico Ltd.", "PharmaPro", "HealthPlus"];
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

const Suppliers: React.FC = () => {
  const [supplier, setSupplier] = useState("All Suppliers");
  const navigate = useNavigate();

  const itemsPerSupplier = (() => {
    const result: { [key: string]: number } = {};
    mockPurchases.forEach((p) => {
      if (supplier !== "All Suppliers" && p.supplier !== supplier) return;
      result[p.supplier] = (result[p.supplier] || 0) + p.items;
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
          Suppliers with Total Items Supplied
        </h1>
        <select
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          className="mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-full"
        >
          {suppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ul className="divide-y">
          {Object.entries(itemsPerSupplier).length === 0 ? (
            <li className="py-2 text-gray-500 text-center">
              No data for current filters.
            </li>
          ) : (
            Object.entries(itemsPerSupplier).map(([supplier, items]) => (
              <li key={supplier} className="py-2 flex justify-between text-sm">
                <span>{supplier}</span>
                <span className="font-bold text-blue-700">{items} items</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </TenantDashboardLayout>
  );
};

export default Suppliers;
