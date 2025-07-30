import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { branchAPI } from "../../../lib/api/branches/api";
import { useAuthStore } from "../../../stores/authStore";

export type StaffMember = { id: string; name: string; role: string; salary?: number };
export type Sale = { id: string; date: string; amount: number };
export type Audit = { id: string; date: string; result: string };

export type Branch = {
  id: string;
  name: string;
  location: string; // Keep for backward compatibility, but new branches will use address fields
  manager: string;
  performance: string;
  staff: StaffMember[];
  sales: Sale[];
  audits: Audit[];
  
  // Extended fields from our analysis (optional for backward compatibility)
  branch_code?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  branch_type?: 'retail' | 'wholesale' | 'hospital' | 'clinic';
  license_number?: string;
  contact_person?: string;
  contact_phone?: string;
  tenant_id?: string;
  status?: 'active' | 'inactive';
};

const initialBranches: Branch[] = [
  {
    id: "1",
    name: "Main Branch",
    location: "Downtown",
    manager: "John Doe",
    performance: "Excellent",
    staff: [
      { id: "s1", name: "Alice Smith", role: "Pharmacist", salary: 75000 },
      { id: "s2", name: "Bob Brown", role: "Cashier", salary: 35000 },
    ],
    sales: [
      { id: "sale1", date: "2024-06-01", amount: 1200 },
      { id: "sale2", date: "2024-06-02", amount: 950 },
    ],
    audits: [
      { id: "a1", date: "2024-05-20", result: "Pass" },
      { id: "a2", date: "2024-06-01", result: "Pass" },
    ],
  },
  {
    id: "2",
    name: "Westside Branch",
    location: "West City",
    manager: "Jane Lee",
    performance: "Good",
    staff: [
      { id: "s3", name: "Carlos Green", role: "Pharmacist", salary: 72000 },
      { id: "s4", name: "Diana White", role: "Cashier", salary: 33000 },
    ],
    sales: [
      { id: "sale3", date: "2024-06-01", amount: 800 },
      { id: "sale4", date: "2024-06-02", amount: 1100 },
    ],
    audits: [
      { id: "a3", date: "2024-05-18", result: "Pass" },
      { id: "a4", date: "2024-06-01", result: "Fail" },
    ],
  },
  {
    id: "3",
    name: "Eastside Branch",
    location: "East City",
    manager: "Sam Patel",
    performance: "Average",
    staff: [{ id: "s5", name: "Emily Black", role: "Pharmacist", salary: 70000 }],
    sales: [
      { id: "sale5", date: "2024-06-01", amount: 600 },
      { id: "sale6", date: "2024-06-02", amount: 700 },
    ],
    audits: [
      { id: "a5", date: "2024-05-15", result: "Pass" },
      { id: "a6", date: "2024-06-01", result: "Pass" },
    ],
  },
];

type BranchContextType = {
  branches: Branch[];
  addBranch: (branch: Omit<Branch, "id">) => void;
  editBranch: (id: string, branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  search: string;
  setSearch: (s: string) => void;
  filter: string;
  setFilter: (f: string) => void;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const { user } = useAuthStore();

  // Load real branches from database
  useEffect(() => {
    const loadBranches = async () => {
      if (!user?.tenant_id) {
        console.log('BranchContext - No tenant_id available, skipping branch load');
        return;
      }
      
      console.log('BranchContext - Loading branches for tenant:', user.tenant_id);
      try {
        const result = await branchAPI.getBranches(user.tenant_id);
        console.log('BranchContext - getBranches result:', result);
        
        if (result.success && result.data) {
          console.log('BranchContext - Raw branch data from API:', result.data);
          // Transform API response to match our Branch interface
          const transformedBranches: Branch[] = result.data.map(branch => ({
            id: branch.id,
            name: branch.name,
            location: `${branch.address}, ${branch.city}, ${branch.state}`,
            manager: "Pending Assignment", // Default value
            performance: "New",
            staff: [],
            sales: [],
            audits: [],
            branch_code: branch.branch_code,
            email: branch.email,
            phone: branch.phone,
            address: branch.address,
            city: branch.city,
            state: branch.state,
            country: branch.country,
            branch_type: branch.branch_type as 'retail' | 'wholesale' | 'hospital' | 'clinic',
            license_number: branch.license_number,
            contact_person: branch.contact_person,
            contact_phone: branch.contact_phone,
            tenant_id: branch.tenant_id,
            status: branch.status as 'active' | 'inactive'
          }));
          console.log('BranchContext - Transformed branches:', transformedBranches);
          setBranches(transformedBranches);
        } else {
          console.error('BranchContext - Failed to load branches:', result.error);
        }
      } catch (error) {
        console.error('BranchContext - Exception loading branches:', error);
        // Keep using mock data as fallback
      }
    };

    loadBranches();
  }, [user?.tenant_id]);

  const addBranch = (branch: Omit<Branch, "id">) => {
    setBranches((prev) => [
      ...prev,
      { ...branch, id: (Math.random() * 100000).toFixed(0) },
    ]);
  };

  const editBranch = (id: string, branch: Partial<Branch>) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...branch } : b))
    );
  };

  const deleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        addBranch,
        editBranch,
        deleteBranch,
        search,
        setSearch,
        filter,
        setFilter,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranches = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranches must be used within BranchProvider");
  return ctx;
};
