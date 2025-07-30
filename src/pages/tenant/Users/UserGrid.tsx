import React from "react";
import { useUsers } from "./UserContext";
import UserCard from "./UserCard";

const UserGrid: React.FC = () => {
  const {
    getFilteredUsers,
    openDetailModal,
    handleDeleteUser,
  } = useUsers();

  const filteredUsers = getFilteredUsers();

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {filteredUsers.length === 0 && (
        <div className="col-span-full text-center text-gray-500">
          No users found.
        </div>
      )}
      {filteredUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onOpenDetail={openDetailModal}
          onDelete={handleDeleteUser}
        />
      ))}
    </div>
  );
};

export default UserGrid;
