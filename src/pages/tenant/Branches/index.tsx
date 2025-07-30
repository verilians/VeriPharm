import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { Link, useNavigate } from "react-router-dom";
import { useBranches } from "./BranchContext";

const performanceOptions = ["", "Excellent", "Good", "Average"];

const Branches: React.FC = () => {
  const navigate = useNavigate();
  const { branches, deleteBranch, search, setSearch, filter, setFilter } =
    useBranches();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(search.toLowerCase()) ||
      branch.location.toLowerCase().includes(search.toLowerCase()) ||
      branch.manager.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? branch.performance === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold text-blue-700">Branches</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/tenant/branches/create-workflow")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              + Create Branch + Manager
            </button>
            <button
              onClick={() => navigate("/tenant/branches/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              + Add Branch Only
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location, or manager"
            className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Performance</option>
            {performanceOptions.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.length === 0 && (
            <div className="col-span-2 text-center text-gray-500">
              No branches found.
            </div>
          )}
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100 group"
            >
              <Link to={`/tenant/branches/${branch.id}`} className="block">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-blue-800 group-hover:text-blue-600">
                    {branch.name}
                  </h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {branch.performance}
                  </span>
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  {branch.location}
                </div>
                <div className="text-gray-700 text-xs">
                  Manager: {branch.manager}
                </div>
              </Link>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/tenant/branches/${branch.id}/edit`)}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(branch.id)}
                  className="text-red-500 hover:underline text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              {/* Confirm Delete Modal */}
              {confirmDelete === branch.id && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                  <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                    <p className="mb-4 text-gray-700">
                      Delete <b>{branch.name}</b>?
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          deleteBranch(branch.id);
                          setConfirmDelete(null);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </TenantDashboardLayout>
  );
};

export default Branches;
