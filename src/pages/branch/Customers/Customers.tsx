import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiDownload,
  FiUser,
  FiDollarSign,
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
  FiMail,
  FiPhone
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";
import { useTenantCurrency } from "../../../lib/hooks/useTenantCurrency";
import type { Customer, CustomerFilters } from "./types";

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  averageSpending: number;
}

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { formatCurrency } = useTenantCurrency();
  
  // State
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: 'all',
    gender: 'all',
    sortBy: 'first_name',
    sortOrder: 'asc'
  });

  // Load customers data
  useEffect(() => {
    const loadCustomers = async () => {
      if (!user?.branch_id || !user?.tenant_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data: customersData, error: customersError } = await supabaseAdmin
          .from('customers')
          .select(`
            id,
            tenant_id,
            branch_id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            country,
            date_of_birth,
            gender,
            registration_date,
            status,
            total_purchases,
            total_spent,
            last_purchase_date,
            loyalty_points,
            notes,
            created_by,
            created_at,
            updated_at
          `)
          .eq('branch_id', user.branch_id)
          .eq('tenant_id', user.tenant_id)
          .order('created_at', { ascending: false });

        if (customersError) {
          console.error("❌ [Customers] Error loading customers:", customersError);
          throw customersError;
        }

        setCustomers(customersData || []);

      } catch (error) {
        console.error("❌ [Customers] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [user?.branch_id, user?.tenant_id]);

  const refetch = () => {
    // Trigger re-fetch by updating the dependency
    if (user?.branch_id && user?.tenant_id) {
      const loadCustomers = async () => {
        try {
          setLoading(true);
          const { data: customersData, error: customersError } = await supabaseAdmin
            .from('customers')
            .select(`
              id,
              tenant_id,
              branch_id,
              first_name,
              last_name,
              email,
              phone,
              address,
              city,
              state,
              country,
              date_of_birth,
              gender,
              registration_date,
              status,
              total_purchases,
              total_spent,
              last_purchase_date,
              loyalty_points,
              notes,
              created_by,
              created_at,
              updated_at
            `)
            .eq('branch_id', user.branch_id)
            .eq('tenant_id', user.tenant_id)
            .order('created_at', { ascending: false });

          if (customersError) throw customersError;
          setCustomers(customersData || []);
        } catch (error) {
          console.error("❌ [Customers] Error refreshing data:", error);
        } finally {
          setLoading(false);
        }
      };
      loadCustomers();
    }
  };

  // Filter customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers || [];
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(customer =>
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.phone?.includes(filters.search)
      );
    }
    
    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }
    
    return filtered;
  }, [customers, filters.search, filters.status]);

  // Calculate stats
  const stats = useMemo((): CustomerStats => {
    const customersList = customers || [];
    const totalCustomers = customersList.length;
    const activeCustomers = customersList.filter(c => c.status === 'active').length;
    const totalRevenue = customersList.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const averageSpending = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      averageSpending,
    };
  }, [customers]);

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      // TODO: Implement delete functionality
      console.log("Delete customer:", customerId);
    }
  };

  const handleExportCustomers = () => {
    // TODO: Implement export functionality
    console.log("Export customers");
  };

  return (
    <BranchDashboardLayout>
      <div className="w-full h-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleExportCustomers}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate("/branch/customers/add")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DashboardCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<FiUser className="w-5 h-5 text-emerald-600" />}
            className="bg-white"
          />
          <DashboardCard
            title="Active Customers"
            value={stats.activeCustomers}
            icon={<FiUser className="w-5 h-5 text-blue-600" />}
            className="bg-white"
          />
          <DashboardCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<FiDollarSign className="w-5 h-5 text-green-600" />}
            className="bg-white"
          />
          <DashboardCard
            title="Avg. Spending"
            value={formatCurrency(stats.averageSpending)}
            icon={<FiTrendingUp className="w-5 h-5 text-purple-600" />}
            className="bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search customers by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'active' | 'inactive' }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Customers List */}
        <ContentCard 
          title="Customers"
          subtitle={`${filteredCustomers?.length || 0} customers found`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (filteredCustomers?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 mb-6">
                {filters.search || filters.status !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first customer"
                }
              </p>
              {(!filters.search && filters.status === "all") && (
                <button
                  onClick={() => navigate("/branch/customers/add")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                >
                  Add First Customer
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers?.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => navigate(`/branch/customers/${customer.id}`)}
                        className="p-1 text-gray-400 hover:text-emerald-600 transition"
                        title="View customer"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/branch/customers/${customer.id}/edit`)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        title="Edit customer"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Delete customer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMail className="w-3 h-3" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="w-3 h-3" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin className="w-3 h-3" />
                        <span>{customer.address}</span>
                        {customer.city && <span>, {customer.city}</span>}
                        {customer.state && <span>, {customer.state}</span>}
                      </div>
                    )}
                    {customer.gender && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-xs">👤</span>
                        <span className="capitalize">{customer.gender}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="w-3 h-3" />
                      <span>
                        Joined {customer.registration_date ? 
                          new Date(customer.registration_date).toLocaleDateString() : 
                          new Date(customer.created_at).toLocaleDateString()
                        }
                      </span>
                    </div>
                    {customer.total_spent !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiDollarSign className="w-3 h-3" />
                        <span>Total spent: {formatCurrency(customer.total_spent)}</span>
                      </div>
                    )}
                    {customer.last_purchase_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-xs">🛒</span>
                        <span>Last purchase: {new Date(customer.last_purchase_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {customer.loyalty_points !== undefined && customer.loyalty_points > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-xs">⭐</span>
                        <span>{customer.loyalty_points} loyalty points</span>
                      </div>
                    )}
                    {customer.notes && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-xs">📝</span>
                        <span className="text-xs italic">{customer.notes}</span>
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

export default Customers;
