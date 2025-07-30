import React from "react";
import { useUsers } from "./UserContext";

const DeleteConfirmModal: React.FC = () => {
  const {
    deleteConfirmUser,
    confirmDeleteUser,
    cancelDeleteUser,
  } = useUsers();

  if (!deleteConfirmUser) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <h2 className="text-xl font-bold mb-4 text-red-700">Delete User</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete <b>{deleteConfirmUser.name}</b>? This
          action can be undone from deleted user history.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={confirmDeleteUser}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Delete
          </button>
          <button
            onClick={cancelDeleteUser}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
