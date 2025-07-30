import { useState, useEffect } from 'react';
import { SalesService } from '../services/salesService';
import { Sale, CreateSaleData, SalesFilters, ApiResponse } from '../types';

export const useSales = (filters?: SalesFilters) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.getSales(filters);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSales(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const createSale = async (saleData: CreateSaleData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.createSale(saleData);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Refresh the list
        await fetchSales();
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

export const useSale = (id: string) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSale = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.getSaleById(id);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSale(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sale');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSale();
  }, [id]);

  return {
    sale,
    loading,
    error,
    refetch: fetchSale,
  };
}; 