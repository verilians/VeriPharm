import { useState, useEffect, useCallback } from 'react';
import { StockService } from '../services/stockService';
import type { StockMovement, CreateStockMovementData, ApiResponse } from '../types';

interface UseStockMovementsFilters {
  search?: string;
  movement_type?: 'all' | 'in' | 'out' | 'adjustment' | 'transfer';
  product_id?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: 'created_at' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

interface UseStockMovementsReturn {
  movements: StockMovement[] | null;
  loading: boolean;
  error: string | null;
  filters: UseStockMovementsFilters;
  setFilters: (filters: UseStockMovementsFilters) => void;
  refreshMovements: () => Promise<void>;
  createMovement: (data: CreateStockMovementData) => Promise<ApiResponse<StockMovement>>;
}

export const useStockMovements = (initialFilters?: UseStockMovementsFilters): UseStockMovementsReturn => {
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseStockMovementsFilters>(initialFilters || {});

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await StockService.getStockMovements(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setMovements(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshMovements = useCallback(async () => {
    await fetchMovements();
  }, [fetchMovements]);

  const createMovement = useCallback(async (data: CreateStockMovementData): Promise<ApiResponse<StockMovement>> => {
    try {
      const response = await StockService.createStockMovement(data);
      
      if (!response.error && response.data) {
        // Refresh movements list after successful creation
        await fetchMovements();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create stock movement',
        loading: false,
      };
    }
  }, [fetchMovements]);

  // Fetch movements when filters change
  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    filters,
    setFilters,
    refreshMovements,
    createMovement,
  };
}; 