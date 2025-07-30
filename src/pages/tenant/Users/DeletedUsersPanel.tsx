import React from "react";
import { useUsers } from "./UserContext";

const DeletedUsersPanel: React.FC = () => {
  const {
    deletedUsers,
    showDeleted,
    setShowDeleted,
    handleRestoreUser,
  } = useUsers();

  return (
    <div className="mt-8">
      <button
        onClick={() => setShowDeleted(!showDeleted)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition mb-2"
      >
        {showDeleted
          ? "Hide Deleted Users"
          : `Show Deleted Users (${deletedUsers.length})`}
      </button>
      {showDeleted && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-6 mt-2">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            Deleted Users
          </h2>
          {deletedUsers.length === 0 ? (
            <div className="text-gray-400 text-center">
              No deleted users.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {deletedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-200 rounded-xl shadow-inner p-6 flex flex-col items-center border border-gray-300 opacity-70 relative"
                >
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-300"
                  />
                  <h3 className="text-base font-semibold text-gray-600 mb-1">
                    {user.name}
                  </h3>
                  <div className="text-xs text-gray-500 mb-1">
                    {user.role} | {user.branch}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    ID: {user.id}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Email: {user.email}
                  </div>
                  <button
                    onClick={() => handleRestoreUser(user)}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1 rounded shadow text-xs transition"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeletedUsersPanel;
