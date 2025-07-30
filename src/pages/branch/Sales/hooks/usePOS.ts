import { useState, useEffect } from 'react';
import { SalesService } from '../services/salesService';
import { POSProduct, POSCustomer, SalesStats, ApiResponse } from '../types';

export const usePOSProducts = () => {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.getActiveProducts();
      
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

export const usePOSCustomers = () => {
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.getActiveCustomers();
      
      if (result.error) {
        setError(result.error);
      } else {
        setCustomers(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
  };
};

export const useSalesStats = () => {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.getSalesStats();
      
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