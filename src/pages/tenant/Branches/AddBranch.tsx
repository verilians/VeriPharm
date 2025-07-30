import React, { useState, useEffect } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useBranches } from "./BranchContext";
import { useNavigate, useParams } from "react-router-dom";

const AddBranch: React.FC = () => {
  const { addBranch, editBranch, branches, deleteBranch } = useBranches();
  const navigate = useNavigate();
  const { branchId } = useParams();
  const editing = Boolean(branchId);
  const branch = editing ? branches.find((b) => b.id === branchId) : undefined;

  const [name, setName] = useState(branch?.name || "");
  const [location, setLocation] = useState(branch?.location || "");
  const [manager, setManager] = useState(branch?.manager || "");
  const [staff, setStaff] = useState<
    { name: string; title: string; salary: string }[]
  >(
    branch?.staff?.map((s) => ({
      name: s.name,
      title: s.role,
      salary: (s as any).salary || "",
    })) || []
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (editing && branch) {
      setName(branch.name);
      setLocation(branch.location);
      setManager(branch.manager);
      setStaff(
        branch.staff?.map((s) => ({
          name: s.name,
          title: s.role,
          salary: (s as any).salary || "",
        })) || []
      );
    }
  }, [editing, branch]);

  const handleStaffChange = (idx: number, field: string, value: string) => {
    setStaff((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const addStaffMember = () => {
    setStaff((prev) => [...prev, { name: "", title: "", salary: "" }]);
  };

  const removeStaffMember = (idx: number) => {
    setStaff((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !location || !manager) {
      setError("All fields are required.");
      return;
    }
    for (const s of staff) {
      if (!s.name || !s.title || !s.salary) {
        setError("All staff fields are required.");
        return;
      }
    }
    const staffData = staff.map((s, i) => ({
      id:
        editing && branch?.staff[i]?.id
          ? branch.staff[i].id
          : Math.random().toString(36).slice(2, 10),
      name: s.name,
      role: s.title,
      salary: typeof s.salary === 'string' ? parseFloat(s.salary) || 0 : s.salary,
    }));
    if (editing && branch) {
      editBranch(branch.id, { name, location, manager, staff: staffData });
    } else {
      addBranch({
        name,
        location,
        manager,
        performance: "Good",
        staff: staffData,
        sales: [],
        audits: [],
      });
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate("/tenant/branches");
    }, 1000);
  };

  const handleDelete = () => {
    if (editing && branch) {
      deleteBranch(branch.id);
      setShowDeleteModal(false);
      navigate("/tenant/branches");
    }
  };

  return (
    <TenantDashboardLayout>
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
        <button
          onClick={() => navigate("/tenant/branches")}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to all branches
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          {editing ? "Edit Branch" : "Add New Branch"}
        </h1>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              placeholder="Enter branch name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              placeholder="Enter location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              placeholder="Enter manager name"
            />
          </div>
          {/* Staff Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-blue-700">
                Staff Members
              </label>
              <button
                type="button"
                onClick={addStaffMember}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                + Add Staff
              </button>
            </div>
            {staff.length === 0 && (
              <div className="text-gray-400 text-sm mb-2">
                No staff added yet.
              </div>
            )}
            {staff.map((s, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) =>
                      handleStaffChange(idx, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 mb-1"
                    placeholder="Staff Name"
                  />
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) =>
                      handleStaffChange(idx, "title", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 mb-1"
                    placeholder="Title"
                  />
                  <input
                    type="number"
                    value={s.salary}
                    onChange={(e) =>
                      handleStaffChange(idx, "salary", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                    placeholder="Salary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeStaffMember(idx)}
                  className="text-red-500 hover:underline text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm">
              Branch {editing ? "updated" : "added"} successfully!
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition mt-2"
          >
            {editing ? "Update Branch" : "Add Branch"}
          </button>
        </form>
        {editing && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Delete Branch
          </button>
        )}
        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
              <h2 className="text-xl font-bold mb-4 text-red-700">
                Delete Branch
              </h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete <b>{branch?.name}</b>? This
                action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TenantDashboardLayout>
  );
};

export default AddBranch;
