import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, BranchOption } from "./types";
import { createEmptyUser } from "./types";
import { useBranches } from "../Branches/BranchContext";
import { useLocation, useNavigate } from "react-router-dom";
import { userAPI } from "../../../lib/api/users/api";
import { branchAPI } from "../../../lib/api/branches/api";
import { useAuthStore } from "../../../stores/authStore";

interface UserContextType {
  users: User[];
  deletedUsers: User[];
  search: string;
  selectedBranch: string;
  selectedRole: string;
  selectedStatus: string;
  modalOpen: boolean;
  editMode: boolean;
  form: User;
  detailModalOpen: boolean;
  selectedUser: User | null;
  deleteConfirmUser: User | null;
  showDeleted: boolean;
  salesModalOpen: boolean;
  salesDateFilter: string;
  availableBranches: BranchOption[];
  
  // Actions
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setDeletedUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setSearch: (search: string) => void;
  setSelectedBranch: (branch: string) => void;
  setSelectedRole: (role: string) => void;
  setSelectedStatus: (status: string) => void;
  setModalOpen: (open: boolean) => void;
  setEditMode: (edit: boolean) => void;
  setForm: (form: User) => void;
  setDetailModalOpen: (open: boolean) => void;
  setSelectedUser: (user: User | null) => void;
  setDeleteConfirmUser: (user: User | null) => void;
  setShowDeleted: (show: boolean) => void;
  setSalesModalOpen: (open: boolean) => void;
  setSalesDateFilter: (filter: string) => void;
  
  // Complex Actions
  openAddModal: () => void;
  openDetailModal: (user: User) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteUser: (user: User) => void;
  confirmDeleteUser: () => void;
  cancelDeleteUser: () => void;
  handleRestoreUser: (user: User) => void;
  handleDeactivate: () => void;
  handleAssignLeave: () => void;
  getFilteredUsers: () => User[];
  createManagerWithServiceRole: (managerData: User) => Promise<{ success: boolean; password?: string; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { branches } = useBranches();
  const availableBranches = branches.map(branch => ({
    id: branch.id,
    name: branch.name
  }));
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<User>(createEmptyUser(availableBranches));
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [salesDateFilter, setSalesDateFilter] = useState("");

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      if (!user?.tenant_id) return;
      
      try {
        const result = await userAPI.getUsers(user.tenant_id);
        if (result.success && result.data) {
          // Transform API response to match UI format
          const transformedUsers = result.data.map(apiUser => ({
            id: apiUser.id,
            tenant_id: apiUser.tenant_id,
            auth_user_id: apiUser.auth_user_id,
            branch_id: apiUser.branch_id,
            first_name: apiUser.first_name,
            last_name: apiUser.last_name,
            email: apiUser.email,
            phone: apiUser.phone,
            role: apiUser.role,
            status: apiUser.status,
            name: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
            branch: 'Unknown Branch', // Will be updated when branches are loaded
            image: `https://ui-avatars.com/api/?name=${apiUser.first_name}+${apiUser.last_name}&background=random`,
            created_at: apiUser.created_at,
            updated_at: apiUser.updated_at
          }));
          setUsers(transformedUsers);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, [user?.tenant_id]);

  // Handle URL parameters for manager creation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const createManager = urlParams.get('createManager');
    const branchName = urlParams.get('branchName');
    
    if (createManager === 'true' && branchName) {
      // Auto-open modal for manager creation
      const managerForm = {
        ...createEmptyUser(availableBranches),
        id: `U${Math.floor(Math.random() * 10000)}`,
        role: "manager",
        branch: branchName,
      };
      setForm(managerForm);
      setEditMode(false);
      setModalOpen(true);
      
      // Clean URL parameters
      navigate('/tenant/users', { replace: true });
    }
  }, [location.search, availableBranches, navigate]);

  // Update form when branches change
  useEffect(() => {
    if (availableBranches.length > 0 && !form.branch) {
      setForm(prev => ({ 
        ...prev, 
        branch: availableBranches[0].name,
        branch_id: availableBranches[0].id
      }));
    }
  }, [availableBranches, form.branch]);

  const openAddModal = () => {
    setForm({ ...createEmptyUser(availableBranches), id: `U${Math.floor(Math.random() * 10000)}` });
    setEditMode(false);
    setModalOpen(true);
  };

  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update the full name when first_name or last_name changes
      if (name === 'first_name' || name === 'last_name') {
        updated.name = `${updated.first_name} ${updated.last_name}`.trim();
      }
      
      // Update branch_id when branch name changes
      if (name === 'branch') {
        const selectedBranch = availableBranches.find(b => b.name === value);
        if (selectedBranch) {
          updated.branch_id = selectedBranch.id;
        }
      }
      
      return updated;
    });
  };

  const createManagerWithServiceRole = async (managerData: User): Promise<{ success: boolean; password?: string; error?: string }> => {
    try {
      if (!user?.tenant_id) {
        return { success: false, error: 'No tenant ID found. Please log in again.' };
      }

      // Find branch by name to get branch_id
      const targetBranch = branches.find(b => b.name === managerData.branch);
      
      if (!targetBranch || !targetBranch.id) {
        return { success: false, error: 'Branch not found or branch ID is missing. Please refresh and try again.' };
      }

      // Prepare user data for API call
      const userData = {
        tenant_id: user.tenant_id,
        branch_id: targetBranch.id,
        first_name: managerData.first_name,
        last_name: managerData.last_name,
        email: managerData.email,
        phone: managerData.phone || undefined, // Ensure undefined if empty string
        role: 'manager' as const,
        status: 'active' as const
      };

      // Call real API
      const result = await userAPI.createManagerWithServiceRole(userData);
      
      if (result.success && result.data) {
        // Update branch manager in the database
        try {
          await branchAPI.updateBranchManager(targetBranch.id, result.data.id);
        } catch (updateError) {
          console.warn('Failed to update branch manager reference:', updateError);
          // Don't fail the entire operation for this
        }
        
        return { 
          success: true, 
          password: result.data.temporary_password 
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to create manager account'
        };
      }
    } catch (error) {
      console.error('Error in createManagerWithServiceRole:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this is a manager creation
    const isManagerCreation = !editMode && form.role === "manager";
    
    if (isManagerCreation) {
      // Handle manager creation with service role
      const result = await createManagerWithServiceRole(form);
      
      if (result.success) {
        // Add user to the list
        const newUser = {
          ...form,
          id: `U${Math.floor(Math.random() * 10000)}`,
          name: `${form.first_name} ${form.last_name}`.trim(),
        };
        setUsers((prev) => [...prev, newUser]);
        setModalOpen(false);
        
        // Show detailed success confirmation
        const confirmMessage = `Manager Account Created Successfully!

📧 Email: ${form.email}
👤 Name: ${form.first_name} ${form.last_name}
🏢 Branch: ${form.branch}
🔑 Temporary Password: ${result.password}

IMPORTANT NOTES:
• The manager account has been created in the database
• Email confirmation is NOT required (service role used)
• The manager should change this password on first login
• The account is immediately active and ready to use

Would you like to:
• Go back to Branches page to see the updated branch
• Stay here to create more users
• Send password details via email (optional)`;

        const shouldRedirect = window.confirm(confirmMessage);
        
        if (shouldRedirect) {
          navigate('/tenant/branches');
        }
      } else {
        // TODO: Replace with proper error handling/toast notification
        console.error('Failed to create manager account:', result.error);
      }
    } else {
      // Handle regular user creation/edit
      if (editMode) {
        setUsers((prev) => prev.map((u) => (u.id === form.id ? { ...form, name: `${form.first_name} ${form.last_name}`.trim() } : u)));
        // TODO: Replace with proper toast notification
      } else {
        // Validate required fields
        if (!user) {
          console.error('User session not found');
          return;
        }
        
        if (!form.branch_id) {
          console.error('Please select a branch');
          return;
        }
        
        if (!form.password) {
          console.error('Please enter a password');
          return;
        }
        
        // Create user with API call
        const userData = {
          tenant_id: user.tenant_id || '',
          branch_id: form.branch_id || '',
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          role: form.role as 'owner' | 'manager' | 'cashier' | 'pharmacist' | 'staff',
          status: form.status as 'active' | 'inactive' | 'suspended',
          password: form.password
        };
        
        const result = await userAPI.createUser(userData);
        
        if (result.success && result.data) {
          const newUser = {
            ...result.data,
            name: `${result.data.first_name} ${result.data.last_name}`.trim(),
            branch: form.branch // Keep UI branch name
          };
          setUsers((prev) => [...prev, newUser]);
          // TODO: Replace with proper toast notification
        } else {
          // TODO: Replace with proper error handling/toast notification
          console.error('Failed to create user:', result.error);
          return; // Don't close modal on error
        }
      }
      setModalOpen(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const confirmDeleteUser = () => {
    if (!deleteConfirmUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id));
    setDeletedUsers((prev) => [...prev, deleteConfirmUser]);
    setDeleteConfirmUser(null);
    setDetailModalOpen(false);
  };

  const cancelDeleteUser = () => {
    setDeleteConfirmUser(null);
  };

  const handleRestoreUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
    setDeletedUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u
      )
    );
    setDetailModalOpen(false);
  };

  const handleAssignLeave = () => {
    // TODO: Implement leave assignment functionality
    console.log(`Assign leave for user: ${selectedUser?.name}`);
  };

  const getFilteredUsers = (): User[] => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase());
      const matchesBranch = selectedBranch === "All Branches" || user.branch === selectedBranch;
      const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
      const matchesStatus = selectedStatus === "All Statuses" || user.status === selectedStatus;
      return matchesSearch && matchesBranch && matchesRole && matchesStatus;
    });
  };

  const value: UserContextType = {
    users,
    deletedUsers,
    search,
    selectedBranch,
    selectedRole,
    selectedStatus,
    modalOpen,
    editMode,
    form,
    detailModalOpen,
    selectedUser,
    deleteConfirmUser,
    showDeleted,
    salesModalOpen,
    salesDateFilter,
    availableBranches,
    
    setUsers,
    setDeletedUsers,
    setSearch,
    setSelectedBranch,
    setSelectedRole,
    setSelectedStatus,
    setModalOpen,
    setEditMode,
    setForm,
    setDetailModalOpen,
    setSelectedUser,
    setDeleteConfirmUser,
    setShowDeleted,
    setSalesModalOpen,
    setSalesDateFilter,
    
    openAddModal,
    openDetailModal,
    handleFormChange,
    handleFormSubmit,
    handleDeleteUser,
    confirmDeleteUser,
    cancelDeleteUser,
    handleRestoreUser,
    handleDeactivate,
    handleAssignLeave,
    getFilteredUsers,
    createManagerWithServiceRole,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
