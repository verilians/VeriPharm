import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiPlus,
  FiEye,

  FiAlertCircle,
  FiCheck,
  FiX,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiUser,
} from "react-icons/fi";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";
import { formatCurrency, formatDateTime } from "../../../lib/utils";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";

// Types
interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string; // Use correct field name from schema
  tax_id?: string;
  license_number?: string; // Add field from schema
  supplier_type?: string; // Add field from schema
  payment_terms?: string;
  credit_limit?: number; // Add field from schema
  current_balance?: number; // Add field from schema
  status: 'active' | 'inactive' | 'suspended';
  rating?: number; // Add field from schema
  notes?: string; // Add field from schema
  tenant_id: string;
  branch_id?: string; // Make optional as per schema
  created_by?: string; // Add field from schema
  created_at: string;
  updated_at: string;
}

interface PurchaseOrder {
  id: string;
  purchase_number: string; // Use correct field name from schema
  total_amount: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled' | 'returned';
  purchase_date: string; // Use correct field name from schema
  expected_delivery_date?: string; // Use correct field name from schema
  delivery_date?: string; // Use correct field name from schema
  notes?: string;
  supplier_id: string;
  created_by: string; // Use correct field name from schema
  branch_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

interface SupplierPayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  supplier_id: string;
  user_id: string;
  branch_id: string;
  tenant_id: string;
  created_at: string;
}

interface SupplierStats {
  total_orders: number;
  total_spent: number;
  pending_orders: number;
  total_payments: number;
  outstanding_balance: number;
}

type TabType = 'info' | 'orders' | 'payments';

const SupplierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [stats, setStats] = useState<SupplierStats>({
    total_orders: 0,
    total_spent: 0,
    pending_orders: 0,
    total_payments: 0,
    outstanding_balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [error, setError] = useState<string | null>(null);

  // Load supplier data
  const loadSupplierData = async () => {
    if (!id || !user) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 [SupplierDetails] Loading supplier data:", id);

      // Load supplier - using service role to bypass RLS
      const { data: supplierData, error: supplierError } = await supabaseAdmin
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', (user as any).tenant_id) // Add tenant check for security
        .single();

      if (supplierError) {
        if (supplierError.code === 'PGRST116') {
          setError("Supplier not found.");
          return;
        }
        throw supplierError;
      }

      if (!supplierData) {
        setError("Supplier not found.");
        return;
      }

      setSupplier(supplierData);

      // Load purchase orders - using service role to bypass RLS
      const { data: ordersData, error: ordersError } = await supabaseAdmin
        .from('purchases') // Use correct table name from schema
        .select('*')
        .eq('supplier_id', id)
        .eq('tenant_id', (user as any).tenant_id) // Add tenant check
        .eq('branch_id', (user as any).branch_id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setPurchaseOrders(ordersData || []);

      // Load payments - handle gracefully if table doesn't exist
      let paymentsData = [];
      try {
        const { data: paymentsResult, error: paymentsError } = await supabaseAdmin
          .from('supplier_payments') // Note: This table might not exist yet
          .select('*')
          .eq('supplier_id', id)
          .eq('tenant_id', (user as any).tenant_id) // Add tenant check
          .eq('branch_id', (user as any).branch_id)
          .order('payment_date', { ascending: false });

        if (paymentsError && paymentsError.code !== '42P01') {
          throw paymentsError;
        }
        
        paymentsData = paymentsResult || [];
      } catch (error: any) {
        if (error.code === '42P01') {
          console.log("⚠️ [SupplierDetails] Supplier payments table doesn't exist yet");
          paymentsData = [];
        } else {
          throw error;
        }
      }

      setPayments(paymentsData);

      // Calculate stats
      const totalOrders = ordersData?.length || 0;
      const totalSpent = ordersData?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;
      const pendingOrders = ordersData?.filter((order: any) => order.status === 'pending').length || 0;
      const totalPayments = paymentsData?.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) || 0;
      const outstandingBalance = totalSpent - totalPayments;

      setStats({
        total_orders: totalOrders,
        total_spent: totalSpent,
        pending_orders: pendingOrders,
        total_payments: totalPayments,
        outstanding_balance: outstandingBalance,
      });

      console.log("✅ [SupplierDetails] Supplier data loaded successfully");

    } catch (error) {
      console.error("❌ [SupplierDetails] Error loading supplier data:", error);
      setError("Failed to load supplier data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplierData();
  }, [id, user]);

  if (loading) {
    return (
      <BranchDashboardLayout>
        <div className="w-full h-full flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading supplier details...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  if (!supplier) {
    return (
      <BranchDashboardLayout>
        <div className="w-full h-full flex-1 flex items-center justify-center">
          <div className="text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Supplier Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The supplier you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate("/branch/suppliers")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Suppliers
            </button>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <div className="w-full h-full flex-1">
        <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/branch/suppliers")}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft size={16} />
                <span>Back to Suppliers</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {supplier.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Supplier details and history
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/branch/suppliers/${id}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FiEdit className="mr-2 h-4 w-4" />
                Edit Supplier
              </button>
              <button
                onClick={() => navigate(`/branch/suppliers/${id}/orders/create`)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Create Order
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiX className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FiPackage className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_spent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiCheck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_payments)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.outstanding_balance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'info', label: 'Information', icon: FiFileText },
                { id: 'orders', label: 'Purchase Orders', icon: FiPackage },
                { id: 'payments', label: 'Payments', icon: FiDollarSign },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Information Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      {supplier.contact_person && (
                        <div className="flex items-center space-x-3">
                          <FiUser className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{supplier.contact_person}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center space-x-3">
                          <FiPhone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center space-x-3">
                          <FiMail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{supplier.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Address</h4>
                    <div className="space-y-3">
                      {supplier.address && (
                        <div className="flex items-start space-x-3">
                          <FiMapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600">{supplier.address}</span>
                        </div>
                      )}
                      {(supplier.city || supplier.state || supplier.country) && (
                        <div className="flex items-center space-x-3">
                          <div className="w-4"></div>
                          <span className="text-sm text-gray-600">
                            {[supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
                    <div className="space-y-3">
                      {supplier.supplier_type && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Supplier Type:</span>
                          <span className="text-sm text-gray-600 ml-2 capitalize">{supplier.supplier_type}</span>
                        </div>
                      )}
                      {supplier.payment_terms && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Payment Terms:</span>
                          <span className="text-sm text-gray-600 ml-2">{supplier.payment_terms}</span>
                        </div>
                      )}
                      {supplier.credit_limit && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Credit Limit:</span>
                          <span className="text-sm text-gray-600 ml-2">{formatCurrency(supplier.credit_limit)}</span>
                        </div>
                      )}
                      {supplier.current_balance !== undefined && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Current Balance:</span>
                          <span className="text-sm text-gray-600 ml-2">{formatCurrency(supplier.current_balance)}</span>
                        </div>
                      )}
                      {supplier.tax_id && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Tax ID:</span>
                          <span className="text-sm text-gray-600 ml-2">{supplier.tax_id}</span>
                        </div>
                      )}
                      {supplier.license_number && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">License Number:</span>
                          <span className="text-sm text-gray-600 ml-2">{supplier.license_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Status & Rating</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          supplier.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : supplier.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {supplier.status}
                        </span>
                      </div>
                      {supplier.rating && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Rating:</span>
                          <span className="text-sm text-gray-600 ml-2">{supplier.rating}/5 stars</span>
                        </div>
                      )}
                      {supplier.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Notes:</span>
                          <p className="text-sm text-gray-600 mt-1">{supplier.notes}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-700">Created:</span>
                        <span className="text-sm text-gray-600 ml-2">{formatDateTime(supplier.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                        <span className="text-sm text-gray-600 ml-2">{formatDateTime(supplier.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-medium text-gray-900">Purchase Orders</h4>
                  <button
                    onClick={() => navigate(`/branch/suppliers/${id}/orders/create`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Create Order
                  </button>
                </div>

                {purchaseOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders</h3>
                    <p className="text-gray-600 mb-6">This supplier has no purchase orders yet.</p>
                    <button
                      onClick={() => navigate(`/branch/suppliers/${id}/orders/create`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Create First Order
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchaseOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.purchase_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateTime(order.purchase_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'received' ? 'bg-green-100 text-green-800' :
                                order.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(order.total_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => navigate(`/branch/purchases/${order.id}`)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-medium text-gray-900">Payments</h4>
                  <button
                    onClick={() => navigate(`/branch/suppliers/${id}/payments/create`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Record Payment
                  </button>
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <FiDollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments recorded</h3>
                    <p className="text-gray-600 mb-6">No payments have been recorded for this supplier yet.</p>
                    <button
                      onClick={() => navigate(`/branch/suppliers/${id}/payments/create`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Record First Payment
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateTime(payment.payment_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.payment_method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.reference_number || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(payment.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
        </div>
      </div>
    </BranchDashboardLayout>
  );
};

export default SupplierDetails; 