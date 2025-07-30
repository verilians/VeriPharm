import React from "react";
import { useUsers } from "./UserContext";
import { ROLES, STATUSES } from "./types";

const UserModal: React.FC = () => {
  const {
    modalOpen,
    editMode,
    form,
    availableBranches,
    setModalOpen,
    handleFormChange,
    handleFormSubmit,
  } = useUsers();

  // Check if this is a manager creation flow
  const isManagerCreation = !editMode && form.role === "Manager";

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 text-2xl font-bold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-200"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-700">
          {editMode ? "Edit User" : isManagerCreation ? "Create Branch Manager" : "Add User"}
        </h2>
        
        {isManagerCreation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Creating manager for:</strong> {form.branch}<br />
              This user will be assigned as the branch manager with appropriate permissions.<br />
              <span className="text-blue-600">A temporary password will be generated and sent to the user.</span>
            </p>
          </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="first_name"
              value={form.first_name || ''}
              onChange={handleFormChange}
              placeholder="First Name"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              required
            />
            <input
              type="text"
              name="last_name"
              value={form.last_name || ''}
              onChange={handleFormChange}
              placeholder="Last Name"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleFormChange}
            placeholder="Email Address"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
            required
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleFormChange}
            placeholder="Phone Number"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          />
          
          {isManagerCreation && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Password:</strong> A secure password will be automatically generated and sent to the user's email.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Branch:</strong> {form.branch} (Manager Role)
              </p>
            </div>
          )}
          
          {!isManagerCreation && (
            <>
              <select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              <select
                name="branch"
                value={form.branch}
                onChange={handleFormChange}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="">Select Branch</option>
                {availableBranches.map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <input
                type="password"
                name="password"
                value={form.password || ''}
                onChange={handleFormChange}
                placeholder="Password"
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                required={!editMode}
                minLength={6}
              />
            </>
          )}
          <select
            name="status"
            value={form.status}
            onChange={handleFormChange}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          {!isManagerCreation && !editMode && (
            <input
              type="number"
              name="salary"
              value={form.salary || ''}
              onChange={handleFormChange}
              placeholder="Salary (optional)"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              min="0"
              step="0.01"
            />
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            {editMode ? "Update User" : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
