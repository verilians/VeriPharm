import { useState, useEffect, useCallback } from 'react';
import { SupplierService } from '../services/supplierService';
import type { PurchaseOrder, CreatePurchaseOrderData, UpdatePurchaseOrderData, PurchaseOrderFilters, ApiResponse } from '../types';

interface UsePurchaseOrdersReturn {
  purchaseOrders: PurchaseOrder[] | null;
  loading: boolean;
  error: string | null;
  filters: PurchaseOrderFilters;
  setFilters: (filters: PurchaseOrderFilters) => void;
  refreshPurchaseOrders: () => Promise<void>;
  createPurchaseOrder: (data: CreatePurchaseOrderData) => Promise<ApiResponse<PurchaseOrder>>;
  updatePurchaseOrder: (data: UpdatePurchaseOrderData) => Promise<ApiResponse<PurchaseOrder>>;
  deletePurchaseOrder: (id: string) => Promise<ApiResponse<boolean>>;
  getPurchaseOrderById: (id: string) => Promise<ApiResponse<PurchaseOrder>>;
}

export const usePurchaseOrders = (initialFilters?: PurchaseOrderFilters): UsePurchaseOrdersReturn => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PurchaseOrderFilters>(initialFilters || {});

  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SupplierService.getPurchaseOrders(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setPurchaseOrders(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshPurchaseOrders = useCallback(async () => {
    await fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const createPurchaseOrder = useCallback(async (data: CreatePurchaseOrderData): Promise<ApiResponse<PurchaseOrder>> => {
    try {
      const response = await SupplierService.createPurchaseOrder(data);
      
      if (!response.error && response.data) {
        // Refresh purchase orders list after successful creation
        await fetchPurchaseOrders();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create purchase order',
        loading: false,
      };
    }
  }, [fetchPurchaseOrders]);

  const updatePurchaseOrder = useCallback(async (data: UpdatePurchaseOrderData): Promise<ApiResponse<PurchaseOrder>> => {
    try {
      const response = await SupplierService.updatePurchaseOrder(data);
      
      if (!response.error && response.data) {
        // Refresh purchase orders list after successful update
        await fetchPurchaseOrders();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update purchase order',
        loading: false,
      };
    }
  }, [fetchPurchaseOrders]);

  const deletePurchaseOrder = useCallback(async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await SupplierService.deletePurchaseOrder(id);
      
      if (!response.error && response.data) {
        // Refresh purchase orders list after successful deletion
        await fetchPurchaseOrders();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to delete purchase order',
        loading: false,
      };
    }
  }, [fetchPurchaseOrders]);

  const getPurchaseOrderById = useCallback(async (id: string): Promise<ApiResponse<PurchaseOrder>> => {
    try {
      return await SupplierService.getPurchaseOrderById(id);
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch purchase order',
        loading: false,
      };
    }
  }, []);

  // Fetch purchase orders when filters change
  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  return {
    purchaseOrders,
    loading,
    error,
    filters,
    setFilters,
    refreshPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
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
      // TODO: Implement getActiveProducts method in SupplierService
      // const result = await SupplierService.getActiveProducts();
      
      // Temporary mock data for build purposes
      setProducts([]);
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