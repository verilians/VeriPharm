import React from "react";
import { useUsers } from "./UserContext";

// Simulated sales data for salespersons
const salesData: {
  [key: string]: { id: string; date: string; amount: number }[];
} = {
  U005: [
    { id: "S001", date: "2024-06-01", amount: 500 },
    { id: "S002", date: "2024-06-02", amount: 300 },
    { id: "S003", date: "2024-06-03", amount: 700 },
    { id: "S004", date: "2024-06-04", amount: 450 },
    { id: "S005", date: "2024-06-05", amount: 620 },
  ],
};

const UserDetailModal: React.FC = () => {
  const {
    detailModalOpen,
    selectedUser,
    salesModalOpen,
    salesDateFilter,
    setDetailModalOpen,
    setModalOpen,
    setEditMode,
    setForm,
    setSalesModalOpen,
    setSalesDateFilter,
    handleDeactivate,
    handleAssignLeave,
  } = useUsers();

  if (!detailModalOpen || !selectedUser) return null;

  return (
    <>
      {/* Main Detail Modal */}
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
          <button
            onClick={() => setDetailModalOpen(false)}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 text-2xl font-bold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-200"
            aria-label="Close modal"
          >
            &times;
          </button>
          <div className="flex flex-col items-center mb-4">
            <img
              src={selectedUser.image}
              alt={selectedUser.name}
              className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-blue-100 shadow"
            />
            <h2 className="text-xl font-bold text-blue-800 mb-1">
              {selectedUser.name}
            </h2>
            <div className="text-xs text-gray-500 mb-2">
              {selectedUser.role} | {selectedUser.branch}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              ID: {selectedUser.id}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Status:{" "}
              <span
                className={
                  selectedUser.status === "Active"
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                {selectedUser.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Email: {selectedUser.email}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Phone: {selectedUser.phone}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Salary: ${selectedUser.salary}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setForm(selectedUser);
                setEditMode(true);
                setModalOpen(true);
                setDetailModalOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Edit User
            </button>
            <button
              onClick={handleDeactivate}
              className={`${
                selectedUser.status === "Active"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold px-6 py-2 rounded-lg shadow transition`}
            >
              {selectedUser.status === "Active" ? "Deactivate" : "Reactivate"}
            </button>
            <button
              onClick={handleAssignLeave}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Assign on Leave
            </button>
            {/* Show recent activity/sales if role includes sales */}
            {selectedUser.role.toLowerCase().includes("sales") && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-blue-700 mb-0">
                    Recent Sales
                  </h3>
                  <button
                    className="text-blue-600 hover:underline text-xs font-medium ml-2"
                    onClick={() => setSalesModalOpen(true)}
                    type="button"
                  >
                    View all sales
                  </button>
                </div>
                <ul className="text-xs text-gray-600 list-disc list-inside">
                  {salesData[selectedUser.id]?.slice(0, 2).map((sale) => (
                    <li key={sale.id}>
                      Sale #{sale.id}: ${sale.amount} on {sale.date}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Modal */}
      {salesModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              onClick={() => setSalesModalOpen(false)}
              className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 text-2xl font-bold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-200"
              aria-label="Close sales modal"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">
              All Sales for {selectedUser.name}
            </h2>
            <input
              type="date"
              value={salesDateFilter}
              onChange={(e) => setSalesDateFilter(e.target.value)}
              className="mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 w-full"
              placeholder="Filter by date"
            />
            <ul className="divide-y">
              {(salesData[selectedUser.id] || [])
                .filter(
                  (sale) => !salesDateFilter || sale.date === salesDateFilter
                )
                .map((sale) => (
                  <li
                    key={sale.id}
                    className="py-2 flex justify-between text-sm"
                  >
                    <span>Sale #{sale.id}</span>
                    <span>
                      ${sale.amount} on {sale.date}
                    </span>
                  </li>
                ))}
              {(salesData[selectedUser.id] || []).filter(
                (sale) => !salesDateFilter || sale.date === salesDateFilter
              ).length === 0 && (
                <li className="py-2 text-gray-500 text-center">
                  No sales found for selected date.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetailModal;
