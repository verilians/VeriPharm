import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiPhone,
  FiMail,
  FiDownload,
  FiUser,
  FiTruck,
  FiDollarSign,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiPackage,
  FiCheck
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types - Updated to match schema exactly
interface Supplier {
  id: string;
  tenant_id: string;
  branch_id?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  tax_id?: string;
  license_number?: string;
  supplier_type?: 'wholesale' | 'manufacturer' | 'distributor' | 'retail';
  payment_terms?: string;
  credit_limit?: number;
  current_balance?: number;
  status?: 'active' | 'inactive' | 'suspended';
  rating?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  totalCreditLimit: number;
  totalCurrentBalance: number;
}

const Suppliers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success message from navigation
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location.state, navigate]);

  // Load suppliers
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        console.log("🔄 [Suppliers] Loading suppliers...");
        setLoading(true);
        setError(null);

        if (!user?.tenant_id || !user?.branch_id) {
          throw new Error("User not authenticated or missing tenant/branch information");
        }

        const { data: suppliersData, error: suppliersError } = await supabaseAdmin
          .from('suppliers')
          .select('id, tenant_id, branch_id, name, contact_person, email, phone, address, city, state, country, tax_id, license_number, supplier_type, payment_terms, credit_limit, current_balance, status, rating, notes, created_by, created_at, updated_at')
          .eq('tenant_id', user.tenant_id)
          .eq('branch_id', user.branch_id)
          .order('created_at', { ascending: false });

        if (suppliersError) throw suppliersError;

        console.log("✅ [Suppliers] Loaded suppliers:", suppliersData?.length || 0);
        setSuppliers(suppliersData || []);
      } catch (error) {
        console.error("❌ [Suppliers] Error loading suppliers:", error);
        setSuppliers([]);
        setError(error instanceof Error ? error.message : 'Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, [user]);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;

    // Search filter
    if (search) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.phone?.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    return filtered;
  }, [suppliers, search, statusFilter]);

  // Calculate stats
  const stats = useMemo((): SupplierStats => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    const totalCreditLimit = suppliers.reduce((sum, s) => sum + (s.credit_limit || 0), 0);
    const totalCurrentBalance = suppliers.reduce((sum, s) => sum + (s.current_balance || 0), 0);
    
    return {
      totalSuppliers,
      activeSuppliers,
      totalCreditLimit,
      totalCurrentBalance,
    };
  }, [suppliers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (!user?.tenant_id || !user?.branch_id) {
        throw new Error("User not authenticated or missing tenant/branch information");
      }

      const { data: suppliersData, error } = await supabaseAdmin
        .from('suppliers')
        .select('id, tenant_id, branch_id, name, contact_person, email, phone, address, city, state, country, tax_id, license_number, supplier_type, payment_terms, credit_limit, current_balance, status, rating, notes, created_by, created_at, updated_at')
        .eq('tenant_id', user.tenant_id)
        .eq('branch_id', user.branch_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(suppliersData || []);
    } catch (error) {
      console.error("❌ [Suppliers] Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    
    try {
      const { error } = await supabaseAdmin
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers(suppliers.filter(s => s.id !== supplierId));
    } catch (error) {
      console.error("❌ [Suppliers] Error deleting supplier:", error);
      alert("Error deleting supplier. Please try again.");
    }
  };

  const handleExportSuppliers = () => {
    // TODO: Implement export functionality
    console.log("Export suppliers");
  };

  return (
    <BranchDashboardLayout>
      <div className="w-full h-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportSuppliers}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate("/branch/suppliers/add")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <FiCheck className="h-5 w-5 text-green-600" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Total Suppliers"
              value={stats.totalSuppliers}
              icon={<FiTruck className="w-5 h-5 text-emerald-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Active Suppliers"
              value={stats.activeSuppliers}
              icon={<FiCheckCircle className="w-5 h-5 text-green-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Credit Limit"
              value={`UGX ${stats.totalCreditLimit.toLocaleString()}`}
              icon={<FiPackage className="w-5 h-5 text-blue-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Current Balance"
              value={`UGX ${stats.totalCurrentBalance.toLocaleString()}`}
              icon={<FiDollarSign className="w-5 h-5 text-purple-600" />}
              className="bg-white"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suppliers by name, contact, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Suppliers List */}
        <ContentCard 
          title="Suppliers"
          subtitle={`${filteredSuppliers.length} suppliers found`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-500 mb-6">
                {search || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first supplier"
                }
              </p>
              {(!search && statusFilter === "all") && (
                <button
                  onClick={() => navigate("/branch/suppliers/add")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                >
                  Add First Supplier
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                        <FiTruck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {supplier.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => navigate(`/branch/suppliers/${supplier.id}`)}
                        className="p-1 text-gray-400 hover:text-emerald-600 transition"
                        title="View supplier"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/branch/suppliers/edit/${supplier.id}`)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        title="Edit supplier"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Delete supplier"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {supplier.contact_person && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiUser className="w-3 h-3" />
                        <span>{supplier.contact_person}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMail className="w-3 h-3" />
                        <span>{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="w-3 h-3" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin className="w-3 h-3" />
                        <span>{supplier.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="w-3 h-3" />
                      <span>
                        Added {new Date(supplier.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {supplier.credit_limit !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPackage className="w-3 h-3" />
                        <span>Credit: UGX {supplier.credit_limit.toLocaleString()}</span>
                        {supplier.current_balance !== undefined && (
                          <span className="text-gray-400">• Balance: UGX {supplier.current_balance.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>
    </BranchDashboardLayout>
  );
};

export default Suppliers;
