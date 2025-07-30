/**
 * Top Products Data Hook
 * Custom hook for fetching and managing top performing products data
 */

import { useState, useCallback, useEffect } from 'react';
import { supabaseAdmin } from '../../../../lib/supabase/supabaseClient';
import { useAuthStore } from '../../../../stores/authStore';
import type { ProductPerformance, DashboardDataState } from '../types/dashboard';
import { generateSampleProductsData } from '../utils/sampleData';

export const useTopProducts = (refreshTrigger?: number): DashboardDataState<ProductPerformance[]> => {
  const { user } = useAuthStore();
  const [data, setData] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopProducts = useCallback(async () => {
    if (!user?.tenant_id || !user?.branch_id) {
      setError('Missing user authentication data');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get sale items through sales table to filter by tenant/branch
      const { data: saleItemsData, error: saleItemsError } = await supabaseAdmin
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          unit_price,
          total_price,
          product_name,
          sale:sales!inner(
            tenant_id,
            branch_id,
            status
          )
        `)
        .eq('sale.tenant_id', user.tenant_id)
        .eq('sale.branch_id', user.branch_id)
        .eq('sale.status', 'completed');

      if (saleItemsError) {
        throw new Error(saleItemsError.message);
      }

      // Get current product stock levels
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('products')
        .select(`
          id,
          name,
          quantity,
          status
        `)
        .eq('tenant_id', user.tenant_id)
        .eq('branch_id', user.branch_id)
        .eq('status', 'active');

      if (productsError) {
        throw new Error(productsError.message);
      }

      // Create product lookup for current stock
      const productLookup = (productsData || []).reduce((acc: Record<string, { name: string; stock: number }>, product: { id: string; name: string; quantity: number }) => {
        acc[product.id] = {
          name: product.name,
          stock: product.quantity
        };
        return acc;
      }, {});

      // Aggregate product performance
      const productStats = (saleItemsData || []).reduce((acc: Record<string, ProductPerformance>, item: { product_id: string; quantity: number; total_price: number; product_name?: string; sale?: any }) => {
        const productId = item.product_id;
        const productInfo = productLookup[productId];
        const productName = productInfo?.name || item.product_name || 'Unknown Product';

        if (!acc[productName]) {
          acc[productName] = {
            name: productName,
            sales: 0,
            revenue: 0,
            stock: productInfo?.stock || 0
          };
        }
        acc[productName].sales += item.quantity;
        acc[productName].revenue += item.total_price;
        return acc;
      }, {});

      const topProductsData = (Object.values(productStats) as ProductPerformance[])
        .sort((a: ProductPerformance, b: ProductPerformance) => b.revenue - a.revenue)
        .slice(0, 10);

      // If no real data, use sample data for testing
      const finalData = topProductsData.length > 0 ? topProductsData : generateSampleProductsData();
      setData(finalData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch top products';
      setError(errorMessage);
      console.error('Error fetching top products:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, user?.branch_id]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts, refreshTrigger]);

  return {
    data,
    loading,
    error,
    refetch: fetchTopProducts
  };
};