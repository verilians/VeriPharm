import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiPrinter,
  FiShoppingCart,
  FiTruck,
  FiCheckCircle,
} from "react-icons/fi";
import { useSupabaseQuery } from "../../../lib/hooks/useSupabaseQuery";
import { useAuthStore } from "../../../stores/authStore";
import { formatCurrency, formatDateTime } from "../../../lib/utils";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";

interface Product {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
  generic_name?: string;
  dosage?: string;
  form?: string;
  manufacturer?: string;
  therapeutic_class?: string;
}

interface Supplier {
  id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
}

interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  product: Product;
}

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  purchase_date: string;
  expected_delivery_date?: string;
  delivery_date?: string;
  status: 'pending' | 'ordered' | 'partial' | 'received' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  supplier: Supplier;
  purchase_order_items: PurchaseOrderItem[];
}

const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    data: purchaseData,
    loading,
    error,
  } = useSupabaseQuery<PurchaseOrder[]>(
    "purchase_orders",
    `*,
     supplier:suppliers(*),
     purchase_order_items:purchase_order_items(
       *,
       product:products(*)
     )`,
    {
      filters: {
        id: id,
        tenant_id: user?.tenant_id,
        branch_id: user?.branch_id
      }
    }
  );

  const purchase = purchaseData?.[0];

  const summary = useMemo(() => {
    if (!purchase?.purchase_order_items) return null;
    
    const totalItems = purchase.purchase_order_items.reduce(
      (sum, item) => sum + item.quantity_ordered, 
      0
    );
    const totalReceived = purchase.purchase_order_items.reduce(
      (sum, item) => sum + item.quantity_received, 
      0
    );
    const pendingItems = totalItems - totalReceived;
    const fulfillmentRate = totalItems > 0 ? (totalReceived / totalItems) * 100 : 0;

    return {
      totalItems,
      totalReceived,
      pendingItems,
      fulfillmentRate,
    };
  }, [purchase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/branch/purchases/edit/${id}`);
  };

  const handleMarkReceived = () => {
    // Implement mark as received functionality
    console.log("Mark order as received:", id);
  };

  if (loading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </BranchDashboardLayout>
    );
  }

  if (error || !purchase) {
    return (
      <BranchDashboardLayout>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {error ? "Error loading purchase order details" : "Purchase order not found"}
          </div>
          <button
            onClick={() => navigate("/branch/purchases")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchase Orders
          </button>
        </div>
      </BranchDashboardLayout>
    );
  }

  const items = purchase.purchase_order_items || [];

  return (
    <BranchDashboardLayout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/branch/purchases")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchase Orders
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <FiPrinter className="mr-2 h-4 w-4" />
              Print Order
            </button>
            {purchase.status !== 'received' && purchase.status !== 'cancelled' && (
              <button
                onClick={handleMarkReceived}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"
              >
                <FiCheckCircle className="mr-2 h-4 w-4" />
                Mark Received
              </button>
            )}
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md shadow-sm hover:bg-emerald-700"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit Order
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Amount"
              value={formatCurrency(purchase.total_amount)}
            />
            <DashboardCard
              title="Items Ordered"
              value={summary.totalItems.toString()}
            />
            <DashboardCard
              title="Items Received"
              value={summary.totalReceived.toString()}
            />
            <DashboardCard
              title="Fulfillment Rate"
              value={`${summary.fulfillmentRate.toFixed(1)}%`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <ContentCard title="Order Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Order Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{purchase.order_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Purchase Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDateTime(purchase.purchase_date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      purchase.status
                    )}`}
                  >
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {purchase.supplier?.company_name}
                  </p>
                </div>
                {purchase.expected_delivery_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expected Delivery
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDateTime(purchase.expected_delivery_date)}
                    </p>
                  </div>
                )}
                {purchase.delivery_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivered Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDateTime(purchase.delivery_date)}
                    </p>
                  </div>
                )}
                {purchase.notes && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{purchase.notes}</p>
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Items Ordered */}
            <ContentCard title="Items Ordered">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.product?.sku}
                            </div>
                            {item.product?.generic_name && (
                              <div className="text-sm text-gray-500">
                                Generic: {item.product.generic_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity_ordered}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`${
                              item.quantity_received === item.quantity_ordered
                                ? 'text-green-600'
                                : item.quantity_received > 0
                                ? 'text-orange-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {item.quantity_received}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.total_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentCard>

            {/* Payment Summary */}
            <ContentCard title="Payment Summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(purchase.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(purchase.tax_amount)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(purchase.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>

          <div className="space-y-6">
            {/* Supplier Information */}
            <ContentCard title="Supplier Information">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {purchase.supplier?.company_name}
                  </p>
                </div>
                {purchase.supplier?.contact_person && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {purchase.supplier.contact_person}
                    </p>
                  </div>
                )}
                {purchase.supplier?.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {purchase.supplier.email}
                    </p>
                  </div>
                )}
                {purchase.supplier?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {purchase.supplier.phone}
                    </p>
                  </div>
                )}
                {purchase.supplier?.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {purchase.supplier.address}
                    </p>
                  </div>
                )}
                {purchase.supplier?.payment_terms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {purchase.supplier.payment_terms}
                    </p>
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Order Timeline */}
            <ContentCard title="Order Timeline">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Order Created</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(purchase.created_at)}
                    </p>
                  </div>
                </div>
                
                {purchase.purchase_date !== purchase.created_at && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <FiShoppingCart className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(purchase.purchase_date)}
                      </p>
                    </div>
                  </div>
                )}

                {purchase.delivery_date && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <FiTruck className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(purchase.delivery_date)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Actions */}
            <ContentCard title="Actions">
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <FiEdit className="mr-2 h-4 w-4" />
                  Edit Order
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiPrinter className="mr-2 h-4 w-4" />
                  Print Order
                </button>
                {purchase.status !== 'received' && purchase.status !== 'cancelled' && (
                  <button
                    onClick={handleMarkReceived}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <FiCheckCircle className="mr-2 h-4 w-4" />
                    Mark as Received
                  </button>
                )}
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </BranchDashboardLayout>
  );
};

export default PurchaseOrderDetails;
