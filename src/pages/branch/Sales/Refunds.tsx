import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiArrowLeft,
  FiCheck,
  FiFileText,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiEye,
  FiCreditCard,
  FiSmartphone,
  FiClock,
  FiBarChart,
} from "react-icons/fi";
import { useTable, useSortBy } from "react-table";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";
import { formatCurrency, formatDateTime } from "../../../lib/utils";

// Types
interface Sale {
  id: string;
  transaction_number?: string;
  customer_id?: string;
  total_amount: number;
  payment_method?: string;
  status: string;
  created_at: string;
  customer?: Customer;
  sale_items?: SaleItem[];
}

interface Customer {
  id: string;
  first_name: string; // Use correct field names from schema
  last_name: string;
  phone?: string;
  email?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

interface Product {
  id: string;
  name: string;
  manufacturer_name?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  quantity: number;
  min_stock_level?: number;
  category?: string;
  status: string;
  expiry_date?: string;
  batch_number?: string;
  description?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}



interface Refund {
  id?: string;
  sale_id: string;
  created_by: string; // Use correct field name from schema
  branch_id: string;
  tenant_id: string;
  refund_amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  refund_method?: string;
  created_at?: string;
  updated_at?: string;
  sale?: Sale; // Added for sale details
}


interface RefundStats {
  totalRefunds: number;
  totalAmount: number;
  pendingRefunds: number;
  completedRefunds: number;
  averageRefundAmount: number;
}

const Refunds: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RefundStats>({
    totalRefunds: 0,
    totalAmount: 0,
    pendingRefunds: 0,
    completedRefunds: 0,
    averageRefundAmount: 0,
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("🔄 [Refunds] Loading data...");

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Load refunds - using service role to bypass RLS
        const { data: refundsData, error: refundsError } = await supabaseAdmin
          .from('refunds')
          .select(`
            *,
            sale:sales(
              *,
              customer:customers(*)
            )
          `)
          .eq('branch_id', user.branch_id)
          .eq('tenant_id', user.tenant_id)
          .order('created_at', { ascending: false });

        if (refundsError) throw refundsError;

        setRefunds(refundsData || []);
        
        // Calculate stats
        const stats = calculateStats(refundsData || []);
        setStats(stats);

        console.log("✅ [Refunds] Data loaded successfully");
      } catch (error) {
        console.error("❌ [Refunds] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filtered refunds
  const filteredRefunds = useMemo(() => {
    return refunds.filter(refund => {
      const customer = refund.sale?.customer;
      const customerName = customer ? `${customer.first_name} ${customer.last_name}`.trim() : '';
      
      const matchesSearch = searchTerm === "" || 
        refund.sale?.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [refunds, searchTerm, statusFilter]);

  // Table columns
  const columns = useMemo(() => [
    {
      Header: 'Refund ID',
      accessor: 'id' as const,
      Cell: ({ value }: any) => (
        <span className="font-medium text-gray-900">{value || 'N/A'}</span>
      ),
    },
    {
      Header: 'Sale #',
      id: 'saleNumber',
      accessor: (row: Refund) => row.sale?.transaction_number || 'N/A',
      Cell: ({ value }: any) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      Header: 'Customer',
      id: 'customerName',
      accessor: (row: Refund) => {
        const customer = row.sale?.customer;
        if (customer) {
          return `${customer.first_name} ${customer.last_name}`.trim();
        }
        return 'Walk-in Customer';
      },
      Cell: ({ value }: any) => (
        <div className="flex items-center">
          <FiUser className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      Header: 'Amount',
      accessor: 'refund_amount' as const,
      Cell: ({ value }: any) => (
        <span className="font-semibold text-red-600">{formatCurrency(value)}</span>
      ),
    },
    {
      Header: 'Reason',
      accessor: 'reason' as const,
      Cell: ({ value }: any) => (
        <span className="text-gray-700 truncate max-w-xs">{value}</span>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status' as const,
      Cell: ({ value }: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(value)}`}>
          {getStatusText(value)}
        </span>
      ),
    },
    {
      Header: 'Method',
      accessor: 'refund_method' as const,
      Cell: ({ value }: any) => (
        <div className="flex items-center">
          {getPaymentMethodIcon(value)}
          <span className="ml-2 text-gray-700">{getPaymentMethodDisplay(value)}</span>
        </div>
      ),
    },
    {
      Header: 'Date',
      accessor: 'created_at' as const,
      Cell: ({ value }: any) => (
        <div className="flex items-center">
          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-600">{formatDateTime(value)}</span>
        </div>
      ),
    },
    {
      Header: 'Actions',
      id: 'actions',
      accessor: () => null,
      Cell: ({ row }: any) => {
        const refund = row.original;
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewRefund(refund.id || '')}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="View Details"
            >
              <FiEye className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ], []);

  // React Table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: filteredRefunds,
    },
    useSortBy
  );

  // Helper functions
  const calculateStats = (refunds: Refund[]): RefundStats => {
    const totalRefunds = refunds.length;
    const totalAmount = refunds.reduce((sum, refund) => sum + refund.refund_amount, 0);
    const pendingRefunds = refunds.filter(refund => refund.status === 'pending').length;
    const completedRefunds = refunds.filter(refund => refund.status === 'completed').length;
    const averageRefundAmount = totalRefunds > 0 ? totalAmount / totalRefunds : 0;

    return {
      totalRefunds,
      totalAmount,
      pendingRefunds,
      completedRefunds,
      averageRefundAmount,
    };
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getPaymentMethodDisplay = (method: string): string => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method || 'N/A';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <FiDollarSign className="w-4 h-4 text-green-600" />;
      case 'card': return <FiCreditCard className="w-4 h-4 text-blue-600" />;
      case 'mobile_money': return <FiSmartphone className="w-4 h-4 text-purple-600" />;
      case 'bank_transfer': return <FiDollarSign className="w-4 h-4 text-orange-600" />;
      default: return <FiDollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleViewRefund = (refundId: string) => {
    console.log("👁️ [Refunds] View refund:", refundId);
    // Navigate to refund details
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Refunds</h1>
              <p className="text-gray-600">Process and manage customer refunds</p>
            </div>
            <button
              onClick={() => navigate('/branch/sales/history')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Sales
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="refunds-kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRefunds}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiFileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="refunds-kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="refunds-kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingRefunds}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="refunds-kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedRefunds}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="refunds-kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Refund</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averageRefundAmount)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiBarChart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="refunds-content-card mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search refunds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                <FiFilter className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                <FiDownload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="refunds-content-card">
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="w-full">
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()} className="border-b border-gray-200">
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          {column.render('Header')}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50 border-b border-gray-100">
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {filteredRefunds.length} of {refunds.length} refunds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refunds; 