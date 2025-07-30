import { useState, useEffect } from 'react';
import { CustomerService } from '../services/customerService';
import { CustomerSale, ApiResponse } from '../types';

export const useCustomerSales = (customerId: string) => {
  const [sales, setSales] = useState<CustomerSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.getCustomerSales(customerId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSales(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [customerId]);

  const createSale = async (saleData: any): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.createCustomerSale(saleData);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Add to local state
        setSales(prev => [result.data!, ...prev]);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    loading,
    error,
    createSale,
    refetch: fetchSales,
  };
};

export const useCustomerStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.getCustomerStats();
      
      if (result.error) {
        setError(result.error);
      } else {
        setStats(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.getActiveProducts();
      
      if (result.error) {
        setError(result.error);
      } else {
        setProducts(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}; 