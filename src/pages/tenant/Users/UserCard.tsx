import React from "react";
import { Trash2 } from "lucide-react";
import type { User } from "./types";

interface UserCardProps {
  user: User;
  onOpenDetail: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onOpenDetail, onDelete }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100 group cursor-pointer hover:shadow-lg transition relative"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".delete-user-btn")) return;
        onOpenDetail(user);
      }}
    >
      <img
        src={user.image}
        alt={user.name}
        className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blue-100 shadow"
      />
      <h2 className="text-lg font-semibold text-blue-800 group-hover:text-blue-600 mb-1">
        {user.name}
      </h2>
      <div className="text-xs text-gray-500 mb-2">
        {user.role} | {user.branch}
      </div>
      <div className="text-xs text-gray-500 mb-2">ID: {user.id}</div>
      <div className="text-xs text-gray-500 mb-2">
        Status:{" "}
        <span
          className={
            user.status === "Active" ? "text-green-600" : "text-red-500"
          }
        >
          {user.status}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-2">Email: {user.email}</div>
      <div className="text-xs text-gray-500 mb-2">Phone: {user.phone}</div>
      <div className="text-xs text-gray-500 mb-2">Salary: ${user.salary}</div>
      <button
        className="delete-user-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-lg font-bold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-200 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(user);
        }}
        aria-label="Delete user"
        type="button"
        title="Delete user"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default UserCard;
