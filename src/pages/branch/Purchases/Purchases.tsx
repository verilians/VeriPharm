import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiTruck,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiRefreshCw,
  FiFileText
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types
interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string;
  user_id: string;
  branch_id: string;
  tenant_id: string;
  subtotal: number;
  tax?: number;
  discount?: number;
  total_amount: number;
  status: string;
  purchase_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  purchase_items?: PurchaseItem[];
}

interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
}

interface PurchaseItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PurchaseStats {
  totalPurchases: number;
  pendingPurchases: number;
  totalAmount: number;
  thisMonthAmount: number;
}

const Purchases: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Load purchases
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        console.log("🔄 [Purchases] Loading purchases...");
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data: purchasesData, error: purchasesError } = await supabaseAdmin
          .from('purchases')
          .select(`
            *,
            supplier:suppliers(*),
            purchase_items(*)
          `)
          .eq('branch_id', (user as any).branch_id)
          .order('created_at', { ascending: false });

        if (purchasesError) throw purchasesError;

        console.log("✅ [Purchases] Loaded purchases:", purchasesData?.length || 0);
        setPurchases(purchasesData || []);
      } catch (error) {
        console.error("❌ [Purchases] Error loading purchases:", error);
        setPurchases([]);
        setError(error instanceof Error ? error.message : 'Failed to load purchases');
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [user]);

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    let filtered = purchases;

    // Search filter
    if (search) {
      filtered = filtered.filter(purchase =>
        purchase.purchase_number.toLowerCase().includes(search.toLowerCase()) ||
        purchase.supplier?.name.toLowerCase().includes(search.toLowerCase()) ||
        purchase.created_by.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(purchase => purchase.status === statusFilter);
    }

    return filtered;
  }, [purchases, search, statusFilter]);

  // Calculate stats
  const stats = useMemo((): PurchaseStats => {
    const totalPurchases = purchases.length;
    const pendingPurchases = purchases.filter(p => p.status === 'pending').length;
    const totalAmount = purchases.reduce((sum, p) => sum + p.total_amount, 0);
    
    // Calculate this month's purchases
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthAmount = purchases
      .filter(p => {
        const purchaseDate = new Date(p.purchase_date);
        return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.total_amount, 0);
    
    return {
      totalPurchases,
      pendingPurchases,
      totalAmount,
      thisMonthAmount,
    };
  }, [purchases]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: purchasesData, error } = await supabaseAdmin
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(*),
          purchase_items(*)
        `)
        .eq('branch_id', (user as any).branch_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(purchasesData || []);
    } catch (error) {
      console.error("❌ [Purchases] Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm("Are you sure you want to delete this purchase order?")) return;
    
    try {
      const { error } = await supabaseAdmin
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;

      setPurchases(purchases.filter(p => p.id !== purchaseId));
    } catch (error) {
      console.error("❌ [Purchases] Error deleting purchase:", error);
      alert("Error deleting purchase order. Please try again.");
    }
  };

  const handleExportPurchases = () => {
    // TODO: Implement export functionality
    console.log("Export purchases");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-3 h-3" />;
      case 'pending':
        return <FiClock className="w-3 h-3" />;
      case 'cancelled':
        return <FiAlertTriangle className="w-3 h-3" />;
      default:
        return <FiFileText className="w-3 h-3" />;
    }
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
              onClick={handleExportPurchases}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate("/branch/purchases/create")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              New Purchase Order
            </button>
          </div>
        </div>

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
              title="Total Orders"
              value={stats.totalPurchases}
              icon={<FiFileText className="w-5 h-5 text-emerald-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Pending Orders"
              value={stats.pendingPurchases}
              icon={<FiClock className="w-5 h-5 text-yellow-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Total Amount"
              value={`UGX ${stats.totalAmount.toLocaleString()}`}
              icon={<FiDollarSign className="w-5 h-5 text-green-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="This Month"
              value={`UGX ${stats.thisMonthAmount.toLocaleString()}`}
              icon={<FiCalendar className="w-5 h-5 text-blue-600" />}
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
              placeholder="Search by order number, supplier, or created by..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Purchases List */}
        <ContentCard 
          title="Purchase Orders"
          subtitle={`${filteredPurchases.length} orders found`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
              <p className="text-gray-500 mb-6">
                {search || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by creating your first purchase order"
                }
              </p>
              {(!search && statusFilter === "all") && (
                <button
                  onClick={() => navigate("/branch/purchases/create")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                >
                  Create First Order
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                        <FiFileText className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{purchase.purchase_number}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                          {getStatusIcon(purchase.status)}
                          <span className="ml-1">{purchase.status}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => navigate(`/branch/purchases/${purchase.id}`)}
                        className="p-1 text-gray-400 hover:text-emerald-600 transition"
                        title="View purchase order"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/branch/purchases/${purchase.id}/edit`)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        title="Edit purchase order"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePurchase(purchase.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Delete purchase order"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {purchase.supplier && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiTruck className="w-3 h-3" />
                        <span>{purchase.supplier.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiDollarSign className="w-3 h-3" />
                      <span>UGX {purchase.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="w-3 h-3" />
                      <span>
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUser className="w-3 h-3" />
                      <span>Created by {purchase.created_by}</span>
                    </div>
                    {purchase.purchase_items && purchase.purchase_items.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPackage className="w-3 h-3" />
                        <span>{purchase.purchase_items.length} items</span>
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

export default Purchases;
