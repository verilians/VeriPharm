/**
 * Combined Dashboard Data Hook
 * Custom hook that combines all dashboard data fetching for better performance
 */

import { useState, useCallback, useEffect } from 'react';
import { supabaseAdmin } from '../../../../lib/supabase/supabaseClient';
import { useAuthStore } from '../../../../stores/authStore';
import type { 
  CustomerData, 
  StockAlert, 
  CategoryPerformance, 
  PaymentMethodData,
  DashboardDataState
} from '../types/dashboard';
import {
  generateSampleCustomersData,
  generateSampleStockAlerts,
  generateSampleCategoryData,
  generateSamplePaymentMethodsData
} from '../utils/sampleData';

interface CombinedDashboardData {
  customers: CustomerData[];
  stockAlerts: StockAlert[];
  categories: CategoryPerformance[];
  paymentMethods: PaymentMethodData[];
}

export const useDashboardData = (refreshTrigger?: number): DashboardDataState<CombinedDashboardData> => {
  const { user } = useAuthStore();
  const [data, setData] = useState<CombinedDashboardData>({
    customers: [],
    stockAlerts: [],
    categories: [],
    paymentMethods: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomersData = useCallback(async () => {
    const { data: salesData, error } = await supabaseAdmin
      .from('sales')
      .select(`
        total_amount,
        sale_date,
        customer:customers(first_name, last_name)
      `)
      .eq('tenant_id', user!.tenant_id)
      .eq('branch_id', user!.branch_id)
      .eq('status', 'completed')
      .order('sale_date', { ascending: false });

    if (error) throw error;

    // Aggregate customer data
    const customerStats = (salesData || []).reduce((acc: Record<string, CustomerData>, sale: { total_amount: number; sale_date: string; customer?: { first_name: string; last_name: string } }) => {
      const customerName = sale.customer
        ? `${sale.customer.first_name} ${sale.customer.last_name}`
        : 'Walk-in Customer';

      if (!acc[customerName]) {
        acc[customerName] = {
          name: customerName,
          total_spent: 0,
          transactions: 0,
          last_purchase: sale.sale_date
        };
      }
      acc[customerName].total_spent += sale.total_amount;
      acc[customerName].transactions += 1;
      return acc;
    }, {});

    const customersData = (Object.values(customerStats) as CustomerData[])
      .sort((a: CustomerData, b: CustomerData) => b.total_spent - a.total_spent)
      .slice(0, 5);
    
    // If no real data, use sample data for testing
    return customersData.length > 0 ? customersData : generateSampleCustomersData();
  }, [user]);

  const fetchStockAlerts = useCallback(async () => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        name,
        quantity,
        min_stock_level
      `)
      .eq('tenant_id', user!.tenant_id)
      .eq('branch_id', user!.branch_id)
      .eq('status', 'active');

    if (error) throw error;

    const alerts = (data || [])
      .filter((product: { quantity: number; min_stock_level: number }) =>
        product.quantity <= product.min_stock_level
      )
      .map((product: { name: string; quantity: number; min_stock_level: number }) => ({
        product_name: product.name,
        current_stock: product.quantity,
        min_stock_level: product.min_stock_level,
        alert_type: product.quantity === 0 ? 'out_of_stock' : 'low_stock'
      }))
      .slice(0, 10) as StockAlert[];
    
    // If no real data, use sample data for testing
    return alerts.length > 0 ? alerts : generateSampleStockAlerts();
  }, [user]);

  const fetchCategoryPerformance = useCallback(async () => {
    // Get products with categories
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        category_id,
        categories(name)
      `)
      .eq('tenant_id', user!.tenant_id)
      .eq('branch_id', user!.branch_id)
      .eq('status', 'active');

    if (productsError) throw productsError;

    // Get sale items through sales table to filter by tenant/branch
    const productIds = (productsData || []).map((p: { id: string }) => p.id);
    
    if (productIds.length === 0) {
      return []; // No products, return empty array
    }

    const { data: saleItemsData, error: saleItemsError } = await supabaseAdmin
      .from('sale_items')
      .select(`
        product_id,
        quantity,
        total_price,
        sale:sales!inner(
          tenant_id,
          branch_id,
          status
        )
      `)
      .in('product_id', productIds)
      .eq('sale.tenant_id', user!.tenant_id)
      .eq('sale.branch_id', user!.branch_id)
      .eq('sale.status', 'completed');

    if (saleItemsError) throw saleItemsError;

    // Create product lookup
    const productLookup = (productsData || []).reduce((acc: Record<string, { name: string; category: string }>, product: { id: string; name: string; categories?: { name: string } }) => {
      acc[product.id] = {
        name: product.name,
        category: product.categories?.name || 'Uncategorized'
      };
      return acc;
    }, {});

    // Aggregate category performance
    const categoryStats = (saleItemsData || []).reduce((acc: Record<string, CategoryPerformance>, item: { product_id: string; quantity: number; total_price: number }) => {
      const product = productLookup[item.product_id];
      if (!product) return acc;

      const categoryName = product.category;
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, sales: 0, revenue: 0, percentage: 0 };
      }
      acc[categoryName].sales += item.quantity;
      acc[categoryName].revenue += item.total_price;
      return acc;
    }, {});

    const totalRevenue = (Object.values(categoryStats) as CategoryPerformance[])
      .reduce((sum: number, cat: CategoryPerformance) => sum + cat.revenue, 0);

    const categoriesData = (Object.values(categoryStats) as CategoryPerformance[])
      .map((cat: CategoryPerformance) => ({
        ...cat,
        percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a: CategoryPerformance, b: CategoryPerformance) => b.revenue - a.revenue);
    
    // If no real data, use sample data for testing
    return categoriesData.length > 0 ? categoriesData : generateSampleCategoryData();
  }, [user]);

  const fetchPaymentMethods = useCallback(async () => {
    const { data, error } = await supabaseAdmin
      .from('sales')
      .select(`
        total_amount,
        payment_method
      `)
      .eq('tenant_id', user!.tenant_id)
      .eq('branch_id', user!.branch_id)
      .eq('status', 'completed');

    if (error) throw error;

    // Aggregate payment methods
    const paymentStats = (data || []).reduce((acc: Record<string, PaymentMethodData>, sale: { total_amount: number; payment_method?: string }) => {
      const method = sale.payment_method || 'Unknown';
      if (!acc[method]) {
        acc[method] = { method, count: 0, amount: 0, percentage: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += sale.total_amount;
      return acc;
    }, {});

    const totalAmount = (Object.values(paymentStats) as PaymentMethodData[])
      .reduce((sum: number, pm: PaymentMethodData) => sum + pm.amount, 0);

    const paymentData = (Object.values(paymentStats) as PaymentMethodData[])
      .map((pm: PaymentMethodData) => ({
        ...pm,
        percentage: totalAmount > 0 ? (pm.amount / totalAmount) * 100 : 0
      }));
    
    // If no real data, use sample data for testing
    return paymentData.length > 0 ? paymentData : generateSamplePaymentMethodsData();
  }, [user]);

  const fetchAllData = useCallback(async () => {
    if (!user?.tenant_id || !user?.branch_id) {
      setError('Missing user authentication data');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [customers, stockAlerts, categories, paymentMethods] = await Promise.all([
        fetchCustomersData(),
        fetchStockAlerts(),
        fetchCategoryPerformance(),
        fetchPaymentMethods()
      ]);

      setData({
        customers,
        stockAlerts,
        categories,
        paymentMethods
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, user?.branch_id, fetchCustomersData, fetchStockAlerts, fetchCategoryPerformance, fetchPaymentMethods]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, refreshTrigger]);

  return {
    data,
    loading,
    error,
    refetch: fetchAllData
  };
};