import React, { useState } from 'react';
import {
  useInventoryReports,
  useFinancialReports,
  useCustomerReports,
  usePurchaseReports,
  useReportExports,
  useReportStats,
  useDashboardSummary,
} from '../hooks';
import {
  ReportFilters,
  FinancialSummary,
  ExportButtons,
} from '../components';
import type { ReportFilters as ReportFiltersType, ExportOptions } from '../types';

export const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'financial' | 'customer' | 'purchase'>('overview');
  const [currentFilters, setCurrentFilters] = useState<ReportFiltersType>({});

  // Hooks for different report types
  const {
    inventoryReport,
    loading: inventoryLoading,
    error: inventoryError,
    setFilters: setInventoryFilters,
  } = useInventoryReports();

  const {
    financialReport,
    loading: financialLoading,
    error: financialError,
    setFilters: setFinancialFilters,
  } = useFinancialReports();

  const {
    customerReport,
    loading: customerLoading,
    error: customerError,
    setFilters: setCustomerFilters,
  } = useCustomerReports();

  const {
    purchaseReport,
    loading: purchaseLoading,
    error: purchaseError,
    setFilters: setPurchaseFilters,
  } = usePurchaseReports();

  const {
    exporting,
    exportReport,
  } = useReportExports();

  const {
    stats,
  } = useReportStats();

  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
  } = useDashboardSummary();

  const handleFiltersChange = (filters: ReportFiltersType) => {
    setCurrentFilters(filters);
    
    // Update filters for the active tab
    switch (activeTab) {
      case 'sales':
        // setSalesFilters(filters); // Removed as per edit hint
        break;
      case 'inventory':
        setInventoryFilters(filters);
        break;
      case 'financial':
        setFinancialFilters(filters);
        break;
      case 'customer':
        setCustomerFilters(filters);
        break;
      case 'purchase':
        setPurchaseFilters(filters);
        break;
    }
  };

  const handleExport = async (options: ExportOptions) => {
    let reportData: unknown = null;
    let reportType = '';

    switch (activeTab) {
      case 'sales':
        // reportData = salesReport; // Removed as per edit hint
        reportType = 'sales';
        break;
      case 'inventory':
        reportData = inventoryReport;
        reportType = 'inventory';
        break;
      case 'financial':
        reportData = financialReport;
        reportType = 'financial';
        break;
      case 'customer':
        reportData = customerReport;
        reportType = 'customer';
        break;
      case 'purchase':
        reportData = purchaseReport;
        reportType = 'purchase';
        break;
    }

    if (reportData) {
      await exportReport(reportType, reportData, options);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sales', label: 'Sales Reports', icon: '💰' },
    { id: 'inventory', label: 'Inventory Reports', icon: '📦' },
    { id: 'financial', label: 'Financial Reports', icon: '💳' },
    { id: 'customer', label: 'Customer Reports', icon: '👥' },
    { id: 'purchase', label: 'Purchase Reports', icon: '🛒' },
  ];

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'sales':
        return false; // salesLoading removed
      case 'inventory':
        return inventoryLoading;
      case 'financial':
        return financialLoading;
      case 'customer':
        return customerLoading;
      case 'purchase':
        return purchaseLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'sales':
        return null; // salesError removed
      case 'inventory':
        return inventoryError;
      case 'financial':
        return financialError;
      case 'customer':
        return customerError;
      case 'purchase':
        return purchaseError;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'sales' | 'inventory' | 'financial' | 'customer' | 'purchase')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
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
              {summaryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading dashboard...</p>
                </div>
              ) : summaryError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{summaryError}</p>
                </div>
              ) : summary ? (
                <div className="space-y-6">
                  {/* Dashboard Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">
                            UGX {summary.sales_summary.today_revenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-2xl">💰</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Products</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {summary.inventory_summary.total_products}
                          </p>
                        </div>
                        <div className="text-2xl">📦</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Customers</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {summary.customer_summary.total_customers}
                          </p>
                        </div>
                        <div className="text-2xl">👥</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Net Profit</p>
                          <p className="text-2xl font-bold text-gray-900">
                            UGX {summary.financial_summary.net_profit.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-2xl">💳</div>
                      </div>
                    </div>
                  </div>

                  {/* Report Statistics */}
                  {stats && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{stats.total_reports_generated}</p>
                          <p className="text-sm text-gray-500">Total Reports Generated</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{stats.reports_this_month}</p>
                          <p className="text-sm text-gray-500">Reports This Month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{stats.most_popular_report}</p>
                          <p className="text-sm text-gray-500">Most Popular Report</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Report Tabs */}
          {activeTab !== 'overview' && (
            <div className="space-y-6">
              {/* Filters */}
              <ReportFilters
                filters={currentFilters}
                onFiltersChange={handleFiltersChange}
                reportType={activeTab}
                loading={getCurrentLoading()}
              />

              {/* Report Content */}
              {getCurrentError() ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{getCurrentError()}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Report Content */}
                  <div className="lg:col-span-2">
                    {activeTab === 'financial' && financialReport && (
                      <FinancialSummary financialReport={financialReport} loading={financialLoading} />
                    )}
                    {activeTab === 'inventory' && inventoryReport && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Report</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{inventoryReport.total_products}</p>
                              <p className="text-sm text-gray-500">Total Products</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                UGX {inventoryReport.total_stock_value.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">Stock Value</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-yellow-600">{inventoryReport.low_stock_products}</p>
                              <p className="text-sm text-gray-500">Low Stock</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{inventoryReport.out_of_stock_products}</p>
                              <p className="text-sm text-gray-500">Out of Stock</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'customer' && customerReport && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Report</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{customerReport.total_customers}</p>
                              <p className="text-sm text-gray-500">Total Customers</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{customerReport.active_customers}</p>
                              <p className="text-sm text-gray-500">Active Customers</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">{customerReport.new_customers}</p>
                              <p className="text-sm text-gray-500">New Customers</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">
                                UGX {Math.round(customerReport.average_customer_value).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">Avg Customer Value</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'purchase' && purchaseReport && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Report</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{purchaseReport.total_purchases}</p>
                              <p className="text-sm text-gray-500">Total Purchases</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                UGX {purchaseReport.total_spent.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">Total Spent</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">
                                UGX {Math.round(purchaseReport.average_order_value).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">Avg Order Value</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">
                                {purchaseReport.top_suppliers.length}
                              </p>
                              <p className="text-sm text-gray-500">Top Suppliers</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Export Panel */}
                  <div className="lg:col-span-1">
                    <ExportButtons
                      onExport={handleExport}
                      loading={exporting}
                      reportType={activeTab}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 