import React from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { UserProvider, useUsers } from "./UserContext";
import UserFilters from "./UserFilters";
import UserGrid from "./UserGrid";
import UserModal from "./UserModal";
import UserDetailModal from "./UserDetailModal";
import DeletedUsersPanel from "./DeletedUsersPanel";
import DeleteConfirmModal from "./DeleteConfirmModal";

const UsersContent: React.FC = () => {
  const { openAddModal } = useUsers();

  return (
    <TenantDashboardLayout>
      <div className="w-full h-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold text-blue-700">User management</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            + Add User
          </button>
        </div>

        <UserFilters />
        <UserGrid />
        <DeletedUsersPanel />

        {/* Modals */}
        <UserModal />
        <UserDetailModal />
        <DeleteConfirmModal />
      </div>
    </TenantDashboardLayout>
  );
};

const Users: React.FC = () => {
  return (
    <UserProvider>
      <UsersContent />
    </UserProvider>
  );
};

export default Users;
