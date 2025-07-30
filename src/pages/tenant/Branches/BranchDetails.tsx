import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useBranches } from "./BranchContext";

const tabList = ["Overview", "Staff", "Sales", "Audits"];

const BranchDetails: React.FC = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { branches } = useBranches();
  const branch = branches.find((b) => b.id === branchId);
  const [tab, setTab] = useState("Overview");

  if (!branch) {
    return (
      <TenantDashboardLayout>
        <div className="max-w-3xl mx-auto mt-8 text-center text-gray-500">
          Branch not found.
        </div>
      </TenantDashboardLayout>
    );
  }

  return (
    <TenantDashboardLayout>
      <div className="max-w-3xl mx-auto mt-8">
        <button
          onClick={() => navigate("/tenant/branches")}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to all branches
        </button>
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h1 className="text-2xl font-bold text-blue-700">{branch.name}</h1>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {branch.performance}
            </span>
          </div>
          <div className="text-gray-600 mb-2">Location: {branch.location}</div>
          <div className="text-gray-600 mb-2">Manager: {branch.manager}</div>
          <button
            onClick={() => navigate(`/tenant/branches/${branch.id}/edit`)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            Edit Branch
          </button>
        </div>
        {/* Tabs/Sections */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex gap-6 border-b mb-4">
            {tabList.map((t) => (
              <button
                key={t}
                className={`pb-2 font-semibold transition ${tab === t ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            {tab === "Overview" && (
              <div>
                <h2 className="text-lg font-bold mb-2">Performance Overview</h2>
                <ul className="text-gray-700 mb-2">
                  <li>Total Staff: {branch.staff.length}</li>
                  <li>Total Sales: {branch.sales.length}</li>
                  <li>Total Audits: {branch.audits.length}</li>
                </ul>
                <p className="text-gray-700">
                  Performance metrics and summary will be shown here...
                </p>
              </div>
            )}
            {tab === "Staff" && (
              <div>
                <h2 className="text-lg font-bold mb-2">Staff Members</h2>
                {branch.staff.length === 0 ? (
                  <p className="text-gray-500">No staff members.</p>
                ) : (
                  <ul className="divide-y">
                    {branch.staff.map((s) => (
                      <li
                        key={s.id}
                        className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-medium">{s.name}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {s.role}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 font-semibold">
                          Salary:{" "}
                          {s.salary
                            ? `$${Number(s.salary).toLocaleString()}`
                            : "N/A"}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {tab === "Sales" && (
              <div>
                <h2 className="text-lg font-bold mb-2">Recent Sales</h2>
                {branch.sales.length === 0 ? (
                  <p className="text-gray-500">No sales data.</p>
                ) : (
                  <ul className="divide-y">
                    {branch.sales.map((sale) => (
                      <li key={sale.id} className="py-2 flex justify-between">
                        <span>{sale.date}</span>
                        <span className="text-xs text-blue-700 font-semibold">
                          ${sale.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {tab === "Audits" && (
              <div>
                <h2 className="text-lg font-bold mb-2">Audit Results</h2>
                {branch.audits.length === 0 ? (
                  <p className="text-gray-500">No audits found.</p>
                ) : (
                  <ul className="divide-y">
                    {branch.audits.map((a) => (
                      <li key={a.id} className="py-2 flex justify-between">
                        <span>{a.date}</span>
                        <span
                          className={`text-xs font-semibold ${a.result === "Pass" ? "text-green-600" : "text-red-500"}`}
                        >
                          {a.result}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TenantDashboardLayout>
  );
};

export default BranchDetails;
