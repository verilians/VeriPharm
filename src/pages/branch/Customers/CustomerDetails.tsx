import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiClock,
  FiStar,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import { useAuthStore } from "../../../stores/authStore";
import { useTenantCurrency } from "../../../lib/hooks/useTenantCurrency";
import { formatDate } from "../../../lib/utils";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";
import LoyaltyPointsManager from "./components/LoyaltyPointsManager";

// Types based on schema - Updated to match exactly
interface Customer {
  id: string;
  tenant_id: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  registration_date: string;
  status?: string;
  total_purchases: number;
  total_spent: number;
  last_purchase_date?: string;
  loyalty_points: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  sales?: Sale[];
}

interface Sale {
  id: string;
  transaction_number: string;
  sale_date: string;
  customer_id: string;
  cashier_id: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes?: string;
  created_at: string;
  sale_items?: SaleItem[];
}

interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number;
  discount_amount: number;
  created_at: string;
}

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { formatCurrency } = useTenantCurrency();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id || !user?.tenant_id || !user?.branch_id) return;

      try {
        const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");
        
        const { data, error } = await supabaseAdmin
          .from("customers")
          .select(`
            *,
            sales:sales(
              id, transaction_number, sale_date, customer_id, cashier_id, 
              subtotal, tax, discount, total_amount, payment_method, 
              payment_status, status, notes, created_at,
              sale_items:sale_items(
                id, sale_id, product_id, product_name, quantity, 
                unit_price, total_price, cost_price, discount_amount, created_at
              )
            )
          `)
          .eq("id", id)
          .eq("tenant_id", user.tenant_id)
          .eq("branch_id", user.branch_id)
          .single();

        if (error) throw error;
        setCustomer(data);
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch customer");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id, user?.tenant_id, user?.branch_id]);

  // Calculate customer statistics
  const customerStats = useMemo(() => {
    if (!customer || !customer.sales) {
      return {
        recentSales: [],
        salesThisMonth: 0,
        salesThisYear: 0,
        avgOrderValue: 0,
        totalItems: 0,
        lastPurchase: null,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Sort sales by date (most recent first)
    const recentSales = customer.sales
      .sort((a: Sale, b: Sale) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
      .slice(0, 5);

    const lastPurchase = recentSales[0] || null;

    const salesThisMonth = customer.sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).length;

    const salesThisYear = customer.sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getFullYear() === currentYear;
    }).length;

    const avgOrderValue = customer.sales.length > 0 
      ? customer.total_spent / customer.sales.length 
      : 0;

    const totalItems = customer.sales.reduce((sum: number, sale: Sale) =>
      sum + (sale.sale_items?.reduce((itemSum: number, item: SaleItem) => itemSum + item.quantity, 0) || 0), 0
    );

    return {
      recentSales,
      salesThisMonth,
      salesThisYear,
      avgOrderValue,
      totalItems,
      lastPurchase,
    };
  }, [customer]);

  const handleDelete = async () => {
    if (!customer) return;

    if (!confirm(`Are you sure you want to delete customer ${customer.first_name} ${customer.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");

      const { error } = await supabaseAdmin
        .from("customers")
        .delete()
        .eq("id", customer.id)
        .eq("tenant_id", user?.tenant_id)
        .eq("branch_id", user?.branch_id);

      if (error) throw error;

      navigate("/branch/customers");
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer. Please try again.");
    }
  };

  if (error) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <FiUser className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Customer</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/branch/customers")}
              className="text-emerald-600 hover:text-emerald-800"
            >
              ← Back to Customers
            </button>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  if (!customer) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <FiUser className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Not Found</h3>
            <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate("/branch/customers")}
              className="text-emerald-600 hover:text-emerald-800"
            >
              ← Back to Customers
            </button>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/branch/customers")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.first_name} {customer.last_name}
              </h1>
              <p className="text-gray-600 mt-1">
                Customer since {formatDate(customer.registration_date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/branch/customers/edit/${customer.id}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit Customer
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Spent"
            value={formatCurrency(customer.total_spent)}
            subtitle="Lifetime value"
          />
          <DashboardCard
            title="Total Orders"
            value={customer.total_purchases.toString()}
            subtitle={`${customerStats.salesThisMonth} this month`}
          />
          <DashboardCard
            title="Avg Order Value"
            value={formatCurrency(customerStats.avgOrderValue)}
            subtitle="Per transaction"
          />
          <DashboardCard
            title="Loyalty Points"
            value={customer.loyalty_points.toString()}
            subtitle="Points earned"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-6">
            <ContentCard title="Personal Information">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.last_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 flex items-center">
                      <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{customer.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <div className="mt-1 flex items-center">
                      <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{customer.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {customer.date_of_birth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(customer.date_of_birth)}
                    </p>
                  </div>
                )}

                {customer.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{customer.gender}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(customer.registration_date)}
                  </p>
                </div>

                {customer.last_purchase_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Purchase</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(customer.last_purchase_date)}
                    </p>
                  </div>
                )}

                {customer.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="mt-1 flex items-start">
                      <FiMapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div className="text-sm text-gray-900">
                        <p>{customer.address}</p>
                        {(customer.city || customer.country) && (
                          <p className="text-gray-600">
                            {[customer.city, customer.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {customer.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.notes}</p>
                  </div>
                )}

                {customer.state && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.state}</p>
                  </div>
                )}

                {customer.status && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : customer.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Loyalty Points Management */}
            <ContentCard title="Loyalty Points">
              <LoyaltyPointsManager
                customerId={customer.id}
                currentPoints={customer.loyalty_points}
                onPointsUpdate={(newPoints) => setCustomer({ ...customer, loyalty_points: newPoints })}
              />
            </ContentCard>
          </div>

          {/* Sales History */}
          <div className="space-y-6">
            <ContentCard title="Sales History">
              <div className="space-y-4">
                {customerStats.recentSales.length > 0 ? (
                  <>
                    {customerStats.recentSales.map((sale: Sale) => (
                      <div key={sale.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <FiShoppingCart className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {sale.transaction_number || `Sale #${sale.id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatDate(sale.sale_date)} • {sale.payment_method}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(sale.total_amount)}
                          </span>
                          <button
                            onClick={() => navigate(`/branch/sales/view/${sale.id}`)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3">
                      <button
                        onClick={() => navigate(`/branch/sales?customer=${customer.id}`)}
                        className="w-full text-center text-sm text-emerald-600 hover:text-emerald-800"
                      >
                        View all sales →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <FiShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No sales yet</p>
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Recent Activity */}
            <ContentCard title="Recent Activity">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 py-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUser className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer registered</p>
                    <p className="text-xs text-gray-600">{formatDate(customer.registration_date)}</p>
                  </div>
                </div>
                {customerStats.lastPurchase && (
                  <div className="flex items-center space-x-3 py-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Latest purchase</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(customerStats.lastPurchase.sale_date)} • {formatCurrency(customerStats.lastPurchase.total_amount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ContentCard>
          </div>

          {/* Quick Stats */}
          <ContentCard title="Quick Stats">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customerStats.salesThisMonth}</div>
                <div className="text-sm text-gray-600">Sales this month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customerStats.salesThisYear}</div>
                <div className="text-sm text-gray-600">Sales this year</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customerStats.totalItems}</div>
                <div className="text-sm text-gray-600">Total items bought</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customer.loyalty_points}</div>
                <div className="text-sm text-gray-600">Loyalty points</div>
              </div>
            </div>
          </ContentCard>

          {/* Actions */}
          <ContentCard title="Actions">
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/branch/sales/new?customer=${customer.id}`)}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <FiShoppingCart className="mr-2 h-4 w-4" />
                Create New Sale
              </button>
              <button
                onClick={() => navigate(`/branch/customers/edit/${customer.id}`)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiEdit className="mr-2 h-4 w-4" />
                Edit Customer
              </button>
              <button
                onClick={() => navigate(`/branch/sales?customer=${customer.id}`)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiEye className="mr-2 h-4 w-4" />
                View All Sales
              </button>
            </div>
          </ContentCard>
        </div>
      </div>
    </BranchDashboardLayout>
  );
};

export default CustomerDetails;
