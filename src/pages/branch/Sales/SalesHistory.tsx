import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiShoppingCart,
  FiRefreshCw,
  FiSearch,
  FiDownload,
  FiEye,
  FiTrendingUp,
  FiCreditCard,
  FiFilter,
  FiActivity,
  FiEdit,
  FiTrash2,
  FiX
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types - Updated to match database schema
interface Sale {
  id: string;
  transaction_number: string;
  customer_id?: string;
  cashier_id: string; // Fixed: user_id → cashier_id
  sale_date: string; // Added missing field
  subtotal: number; // Added missing field
  tax: number; // Added missing field
  discount: number; // Added missing field
  total_amount: number;
  payment_method: string;
  payment_status: string; // Added missing field
  status: string;
  notes?: string; // Added missing field
  created_at: string;
  updated_at: string;
  customer?: Customer;
  sale_items?: SaleItem[];
}

interface Customer {
  id: string;
  first_name: string; // Fixed: name → first_name
  last_name: string; // Added missing field
  phone?: string;
  email?: string;
}

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
  };
}

interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  totalRevenue: number;
  averageTransaction: number;
}

const SalesHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [error, setError] = useState<string | null>(null);
  const [deletingSale, setDeletingSale] = useState<string | null>(null);

  // Load sales data
  useEffect(() => {
    loadSales();
  }, [user, dateRange]);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setHours(0, 0, 0, 0);
      }

      // Load sales with customer and sale items - using service role to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('sales')
        .select(`
          id,
          transaction_number,
          customer_id,
          cashier_id,
          sale_date,
          subtotal,
          tax,
          discount,
          total_amount,
          payment_method,
          payment_status,
          status,
          notes,
          created_at,
          updated_at,
          customer:customers(id, first_name, last_name, phone, email),
          sale_items:sale_items(
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product:products(name)
          )
        `)
        .eq('branch_id', (user as any).branch_id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("✅ [SalesHistory] Loaded sales:", data?.length || 0);
      setSales(data || []);
    } catch (error) {
      console.error("❌ [SalesHistory] Error loading sales:", error);
      setSales([]);
      setError(error instanceof Error ? error.message : 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSales();
    setIsRefreshing(false);
  };

  // Filter sales
  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Search filter
    if (search) {
      filtered = filtered.filter(sale =>
        sale.transaction_number?.toLowerCase().includes(search.toLowerCase()) ||
        sale.customer?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        sale.customer?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        `${sale.customer?.first_name} ${sale.customer?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        sale.customer?.phone?.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    // Payment method filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(sale => sale.payment_method === paymentFilter);
    }

    // Payment status filter
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(sale => sale.payment_status === paymentStatusFilter);
    }

    return filtered;
  }, [sales, search, statusFilter, paymentFilter, paymentStatusFilter]);

  // Calculate statistics
  const stats = useMemo((): SalesStats => {
    const totalTransactions = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalSales = filteredSales.filter(sale => sale.status === 'completed').length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalSales,
      totalTransactions,
      totalRevenue,
      averageTransaction,
    };
  }, [filteredSales]);

  const handleEditSale = (saleId: string) => {
    navigate(`/branch/sales/edit/${saleId}`);
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm("Are you sure you want to delete this sale? This action cannot be undone.")) {
      return;
    }

    setDeletingSale(saleId);
    try {
      // Delete sale items first (due to foreign key constraint)
      const { error: itemsError } = await supabaseAdmin
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (itemsError) {
        console.error("Error deleting sale items:", itemsError);
        throw itemsError;
      }

      // Delete the sale
      const { error: saleError } = await supabaseAdmin
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (saleError) {
        console.error("Error deleting sale:", saleError);
        throw saleError;
      }

      // Remove from local state
      setSales(prev => prev.filter(sale => sale.id !== saleId));
      console.log("✅ Sale deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting sale:", error);
      setError(error instanceof Error ? error.message : 'Failed to delete sale');
    } finally {
      setDeletingSale(null);
    }
  };

  const handleExportSales = () => {
    // TODO: Implement export functionality
    console.log("Export sales");
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <FiDollarSign className="w-4 h-4" />;
      case 'card':
        return <FiCreditCard className="w-4 h-4" />;
      case 'mobile':
        return <FiCreditCard className="w-4 h-4" />;
      default:
        return <FiDollarSign className="w-4 h-4" />;
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
              onClick={handleExportSales}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate("/branch/sales/pos")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiShoppingCart className="w-4 h-4" />
              New Sale
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
              title="Total Transactions"
              value={stats.totalTransactions}
              icon={<FiActivity className="w-5 h-5 text-blue-600" />}
              className="bg-white"
              subtitle="All transactions"
            />
            <DashboardCard
              title="Completed Sales"
              value={stats.totalSales}
              icon={<FiShoppingCart className="w-5 h-5 text-green-600" />}
              className="bg-white"
              subtitle="Successful sales"
            />
            <DashboardCard
              title="Total Revenue"
              value={`UGX ${stats.totalRevenue.toLocaleString()}`}
              icon={<FiDollarSign className="w-5 h-5 text-purple-600" />}
              className="bg-white"
              subtitle="Total earnings"
            />
            <DashboardCard
              title="Avg. Transaction"
              value={`UGX ${stats.averageTransaction.toFixed(0)}`}
              icon={<FiTrendingUp className="w-5 h-5 text-orange-600" />}
              className="bg-white"
              subtitle="Per transaction"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
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
              placeholder="Search by transaction number, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last year</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Payment Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Sales List */}
        <ContentCard 
          title="Sales Transactions"
          subtitle={`${filteredSales.length} transactions found`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
              <p className="text-gray-500 mb-6">
                {search || statusFilter !== "all" || paymentFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No sales transactions found for the selected period"
                }
              </p>
              <button
                onClick={() => navigate("/branch/sales/pos")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                Create First Sale
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                        <FiShoppingCart className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {sale.transaction_number || `Sale #${sale.id.slice(0, 8)}`}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                            {sale.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            <span>{new Date(sale.sale_date || sale.created_at).toLocaleDateString()}</span>
                          </div>
                          {sale.customer && (
                            <div className="flex items-center gap-1">
                              <FiUser className="w-3 h-3" />
                              <span>{sale.customer.first_name} {sale.customer.last_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {getPaymentMethodIcon(sale.payment_method)}
                            <span className="capitalize">{sale.payment_method}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-1 py-0.5 rounded text-xs ${sale.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {sale.payment_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          UGX {sale.total_amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sale.sale_items?.length || 0} items
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/branch/sales/${sale.id}`)}
                          className="p-2 text-gray-400 hover:text-emerald-600 transition"
                          title="View sale details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSale(sale.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                          title="Edit sale"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          disabled={deletingSale === sale.id}
                          className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete sale"
                        >
                          {deletingSale === sale.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sale Items Preview */}
                  {sale.sale_items && sale.sale_items.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">Items:</div>
                      <div className="flex flex-wrap gap-2">
                        {sale.sale_items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="bg-white px-2 py-1 rounded text-xs text-gray-700">
                            {item.product?.name || 'Unknown Product'} × {item.quantity}
                          </div>
                        ))}
                        {sale.sale_items.length > 3 && (
                          <div className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-600">
                            +{sale.sale_items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>
    </BranchDashboardLayout>
  );
};

export default SalesHistory;
