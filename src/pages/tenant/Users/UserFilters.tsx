import React from "react";
import { useUsers } from "./UserContext";
import { ROLES, STATUSES } from "./types";

const UserFilters: React.FC = () => {
  const {
    search,
    selectedBranch,
    selectedRole,
    selectedStatus,
    availableBranches,
    setSearch,
    setSelectedBranch,
    setSelectedRole,
    setSelectedStatus,
  } = useUsers();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, ID, or role"
        className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
      />
      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        className="w-full sm:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
      >
        <option value="All Branches">All Branches</option>
        {availableBranches.map((branch) => (
          <option key={branch.id} value={branch.name}>
            {branch.name}
          </option>
        ))}
      </select>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="w-full sm:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
      >
        <option value="All Roles">All Roles</option>
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="w-full sm:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
      >
        <option value="All Statuses">All Statuses</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserFilters;
