import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiUsers, 
  FiPackage, 
  FiDownload, 
  FiAlertTriangle,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';
import BranchDashboardLayout from '../../../components/Layout/BranchDashboardLayout';
import { ContentCard, DashboardCard } from '../../../components/UI';
import { useDashboardSummary } from '../Reports/hooks/useDashboardSummary';
import { useTenantCurrency } from '../../../lib/hooks/useTenantCurrency';
import { supabaseAdmin } from '../../../lib/supabase/supabaseClient';
import { useAuthStore } from '../../../stores/authStore';
import type { StockAlert } from '../Reports/types';
import { DashboardGraphs } from './components';

const SalesDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { summary, loading, error, refreshSummary } = useDashboardSummary();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { formatCurrency } = useTenantCurrency();
  const { user } = useAuthStore();

  // Recent sales and low stock alerts state
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<StockAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  const fetchRecentSales = useCallback(async () => {
    if (!user?.tenant_id || !user?.branch_id) {
      console.log('Missing user data:', { tenant_id: user?.tenant_id, branch_id: user?.branch_id });
      return;
    }
    
    setSalesLoading(true);
    setSalesError(null);
    try {
      console.log('Fetching sales with:', { tenant_id: user.tenant_id, branch_id: user.branch_id });
      
      // Query recent sales with proper filtering
      const { data: salesData, error: salesError } = await supabaseAdmin
        .from('sales')
        .select(`
          id,
          sale_date,
          total_amount,
          customer:customers(first_name, last_name)
        `)
        .eq('tenant_id', user.tenant_id)
        .eq('branch_id', user.branch_id)
        .eq('status', 'completed')
        .order('sale_date', { ascending: false })
        .limit(3);

      if (salesError) {
        console.error('Sales query error:', salesError);
        setSalesError(salesError.message);
        setRecentSales([]);
      } else {
        console.log('Sales data fetched:', salesData);
        setRecentSales(salesData || []);
      }
    } catch (err) {
      console.error('Sales fetch error:', err);
      setSalesError(err instanceof Error ? err.message : 'Failed to fetch recent sales');
      setRecentSales([]);
    } finally {
      setSalesLoading(false);
    }
  }, [user?.tenant_id, user?.branch_id]);

  const fetchLowStockAlerts = useCallback(async () => {
    if (!user?.tenant_id || !user?.branch_id) {
      console.log('Missing user data for low stock alerts:', { tenant_id: user?.tenant_id, branch_id: user?.branch_id });
      return;
    }
    
    setAlertsLoading(true);
    setAlertsError(null);
    try {
      console.log('Fetching low stock alerts with:', { tenant_id: user.tenant_id, branch_id: user.branch_id });
      
      // Query products with low stock - fetch all active products first, then filter in JS
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('products')
        .select(`
          id,
          name,
          quantity,
          min_stock_level,
          status
        `)
        .eq('tenant_id', user.tenant_id)
        .eq('branch_id', user.branch_id)
        .eq('status', 'active')
        .order('quantity', { ascending: true })
        .limit(10);

      if (productsError) {
        console.error('Products query error:', productsError);
        setAlertsError(productsError.message);
        setLowStockAlerts([]);
      } else {
        console.log('Products data fetched:', productsData);
        
        // Filter products with low stock in JavaScript
        const lowStockProducts = (productsData || []).filter((product: any) => 
          product.quantity <= product.min_stock_level
        ).slice(0, 3);
        
        console.log('Low stock products found:', lowStockProducts);
        
        // Transform to StockAlert format
        const alerts = lowStockProducts.map((product: any) => ({
          product_id: product.id,
          product_name: product.name,
          current_stock: product.quantity,
          min_stock_level: product.min_stock_level,
          alert_type: product.quantity === 0 ? 'out_of_stock' : 'low_stock'
        }));
        setLowStockAlerts(alerts);
      }
    } catch (err) {
      console.error('Low stock alerts fetch error:', err);
      setAlertsError(err instanceof Error ? err.message : 'Failed to fetch low stock alerts');
      setLowStockAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, [user?.tenant_id, user?.branch_id]);

  useEffect(() => {
    fetchRecentSales();
    fetchLowStockAlerts();
  }, [fetchRecentSales, fetchLowStockAlerts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSummary();
    await Promise.all([fetchRecentSales(), fetchLowStockAlerts()]);
    setIsRefreshing(false);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Export report");
  };

  return (
    <BranchDashboardLayout>
      <div className="w-full h-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-sm text-gray-600">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
              {(loading || isRefreshing) ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export Report
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

        {/* KPI Cards */}
        {!loading && summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Today's Sales"
              value={formatCurrency(summary.sales_summary.today_revenue)}
              icon={<FiDollarSign className="w-5 h-5 text-blue-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="This Month's Sales"
              value={formatCurrency(summary.sales_summary.this_month_revenue)}
              icon={<FiShoppingCart className="w-5 h-5 text-green-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Total Customers"
              value={summary.customer_summary.total_customers}
              icon={<FiUsers className="w-5 h-5 text-yellow-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Low Stock Items"
              value={summary.inventory_summary.low_stock_count}
              icon={<FiPackage className="w-5 h-5 text-orange-600" />}
              className="bg-white"
            />
          </div>
        )}

        {/* No Data State */}
        {!loading && !summary && !error && (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboard data available</h3>
            <p className="text-gray-500">Dashboard data will appear once you start making sales.</p>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Sales Card */}
          <ContentCard 
            title="Recent Sales"
            subtitle="Latest transactions"
          >
            {salesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            ) : salesError ? (
              <div className="text-center py-8 text-red-600">{salesError}</div>
            ) : recentSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent sales found.</div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                        <FiCalendar className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'Walk-in Customer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          <FiCalendar className="w-3 h-3 inline mr-1" />
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(sale.total_amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>

          {/* Low Stock Alerts Card */}
          <ContentCard 
            title="Low Stock Alerts"
            subtitle="Items needing restock"
          >
            {alertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            ) : alertsError ? (
              <div className="text-center py-8 text-red-600">{alertsError}</div>
            ) : lowStockAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No low stock alerts.</div>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.alert_type === 'out_of_stock' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        alert.alert_type === 'out_of_stock' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        <FiAlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{alert.product_name}</div>
                        <div className="text-sm text-gray-500">Min: {alert.min_stock_level} units</div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      alert.alert_type === 'out_of_stock' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {alert.current_stock} left
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>
        </div>

        {/* Dashboard Graphs */}
        <DashboardGraphs refreshTrigger={isRefreshing ? Date.now() : undefined} />
      </div>
    </BranchDashboardLayout>
  );
};

export default SalesDashboard; 