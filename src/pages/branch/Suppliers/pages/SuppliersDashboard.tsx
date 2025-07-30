import React, { useState } from 'react';
import { useSuppliers, usePurchaseOrders, useSupplierStats } from '../hooks';
import { SupplierCard, SupplierForm, SupplierStatsComponent } from '../components';
import type { Supplier, CreateSupplierData, UpdateSupplierData } from '../types';

export const SuppliersDashboard: React.FC = () => {
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'purchase_orders'>('overview');

  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
    filters: supplierFilters,
    setFilters: setSupplierFilters,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSuppliers();

  const {
    purchaseOrders,
    loading: ordersLoading,
    error: ordersError,
  } = usePurchaseOrders();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useSupplierStats();

  const handleCreateSupplier = async (data: CreateSupplierData) => {
    try {
      const response = await createSupplier(data);
      if (!response.error) {
        setShowSupplierForm(false);
      }
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleUpdateSupplier = async (data: UpdateSupplierData) => {
    try {
      const response = await updateSupplier(data);
      if (!response.error) {
        setShowSupplierForm(false);
        setEditingSupplier(null);
      }
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier);
  };

  const handleCancelForm = () => {
    setShowSupplierForm(false);
    setEditingSupplier(null);
  };

  const handleSubmitSupplier = async (data: CreateSupplierData | UpdateSupplierData) => {
    try {
      if (editingSupplier) {
        const response = await updateSupplier(data as UpdateSupplierData);
        if (!response.error) {
          setShowSupplierForm(false);
          setEditingSupplier(null);
        }
      } else {
        const response = await createSupplier(data as CreateSupplierData);
        if (!response.error) {
          setShowSupplierForm(false);
        }
      }
    } catch (error) {
      console.error('Failed to save supplier:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏢' },
    { id: 'purchase_orders', label: 'Purchase Orders', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading statistics...</p>
                </div>
              ) : statsError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{statsError}</p>
                </div>
              ) : stats ? (
                <SupplierStatsComponent stats={stats} />
              ) : null}
            </div>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={supplierFilters.search || ''}
                    onChange={(e) => setSupplierFilters({ ...supplierFilters, search: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowSupplierForm(true)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Supplier
                </button>
              </div>

              {suppliersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading suppliers...</p>
                </div>
              ) : suppliersError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{suppliersError}</p>
                </div>
              ) : suppliers && suppliers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suppliers.map((supplier) => (
                    <SupplierCard
                      key={supplier.id}
                      supplier={supplier}
                      onEdit={handleEditSupplier}
                      onDelete={handleDeleteSupplier}
                      onView={handleViewSupplier}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No suppliers found</p>
                </div>
              )}
            </div>
          )}

          {/* Purchase Orders Tab */}
          {activeTab === 'purchase_orders' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Orders</h3>
              {ordersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : ordersError ? (
                <p className="text-red-600">{ordersError}</p>
              ) : purchaseOrders && purchaseOrders.length > 0 ? (
                <div className="space-y-4">
                  {purchaseOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{order.order_number}</h4>
                          <p className="text-sm text-gray-600">
                            {order.supplier?.name} • {new Date(order.order_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            UGX {order.total_amount.toLocaleString()}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            order.status === 'delivered' 
                              ? 'text-green-600 bg-green-100'
                              : order.status === 'pending'
                              ? 'text-yellow-600 bg-yellow-100'
                              : 'text-gray-600 bg-gray-100'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No purchase orders found</p>
              )}
            </div>
          )}
        </div>

        {/* Supplier Form Modal */}
        {showSupplierForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <SupplierForm
                  supplier={editingSupplier || undefined}
                  onSubmit={handleSubmitSupplier}
                  onCancel={handleCancelForm}
                  loading={suppliersLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Supplier View Modal */}
        {viewingSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {viewingSupplier.name}
                  </h2>
                  <button
                    onClick={() => setViewingSupplier(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {viewingSupplier.contact_person && (
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="font-medium">{viewingSupplier.contact_person}</p>
                      </div>
                    )}
                    {viewingSupplier.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{viewingSupplier.email}</p>
                      </div>
                    )}
                    {viewingSupplier.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{viewingSupplier.phone}</p>
                      </div>
                    )}
                    {viewingSupplier.tax_number && (
                      <div>
                        <p className="text-sm text-gray-500">Tax Number</p>
                        <p className="font-medium">{viewingSupplier.tax_number}</p>
                      </div>
                    )}
                  </div>
                  {viewingSupplier.address && (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{viewingSupplier.address}</p>
                    </div>
                  )}
                  {viewingSupplier.credit_limit && (
                    <div>
                      <p className="text-sm text-gray-500">Credit Limit</p>
                      <p className="font-medium">UGX {viewingSupplier.credit_limit.toLocaleString()}</p>
                    </div>
                  )}
                  {viewingSupplier.payment_terms && (
                    <div>
                      <p className="text-sm text-gray-500">Payment Terms</p>
                      <p className="font-medium">{viewingSupplier.payment_terms}</p>
                    </div>
                  )}
                  {viewingSupplier.notes && (
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium">{viewingSupplier.notes}</p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        handleEditSupplier(viewingSupplier);
                        setViewingSupplier(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setViewingSupplier(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 