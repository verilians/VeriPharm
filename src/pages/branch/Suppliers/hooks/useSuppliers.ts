import { useState, useEffect, useCallback } from 'react';
import { SupplierService } from '../services/supplierService';
import type { Supplier, CreateSupplierData, UpdateSupplierData, SupplierFilters, ApiResponse } from '../types';

interface UseSuppliersReturn {
  suppliers: Supplier[] | null;
  loading: boolean;
  error: string | null;
  filters: SupplierFilters;
  setFilters: (filters: SupplierFilters) => void;
  refreshSuppliers: () => Promise<void>;
  createSupplier: (data: CreateSupplierData) => Promise<ApiResponse<Supplier>>;
  updateSupplier: (data: UpdateSupplierData) => Promise<ApiResponse<Supplier>>;
  deleteSupplier: (id: string) => Promise<ApiResponse<boolean>>;
  getSupplierById: (id: string) => Promise<ApiResponse<Supplier>>;
}

export const useSuppliers = (initialFilters?: SupplierFilters): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupplierFilters>(initialFilters || {});

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SupplierService.getSuppliers(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuppliers(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshSuppliers = useCallback(async () => {
    await fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = useCallback(async (data: CreateSupplierData): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await SupplierService.createSupplier(data);
      
      if (!response.error && response.data) {
        // Refresh suppliers list after successful creation
        await fetchSuppliers();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create supplier',
        loading: false,
      };
    }
  }, [fetchSuppliers]);

  const updateSupplier = useCallback(async (data: UpdateSupplierData): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await SupplierService.updateSupplier(data);
      
      if (!response.error && response.data) {
        // Refresh suppliers list after successful update
        await fetchSuppliers();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update supplier',
        loading: false,
      };
    }
  }, [fetchSuppliers]);

  const deleteSupplier = useCallback(async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await SupplierService.deleteSupplier(id);
      
      if (!response.error && response.data) {
        // Refresh suppliers list after successful deletion
        await fetchSuppliers();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to delete supplier',
        loading: false,
      };
    }
  }, [fetchSuppliers]);

  const getSupplierById = useCallback(async (id: string): Promise<ApiResponse<Supplier>> => {
    try {
      return await SupplierService.getSupplierById(id);
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch supplier',
        loading: false,
      };
    }
  }, []);

  // Fetch suppliers when filters change
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    filters,
    setFilters,
    refreshSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
  };
};

export const useSupplier = (id: string) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await SupplierService.getSupplierById(id);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSupplier(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const updateSupplier = async (supplierData: UpdateSupplierData): Promise<boolean> => {
    if (!id) return false;

    setLoading(true);
    setError(null);

    try {
      const result = await SupplierService.updateSupplier({ ...supplierData, id });
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        setSupplier(result.data);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update supplier');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    supplier,
    loading,
    error,
    updateSupplier,
    refetch: fetchSupplier,
  };
}; 