import { useState, useEffect, useCallback } from 'react';
import { StockService } from '../services/stockService';
import type { StockAudit, CreateStockAuditData, UpdateStockAuditData, StockAuditItem, CreateStockAuditItemData, ApiResponse } from '../types';

interface UseStockAuditsFilters {
  search?: string;
  status?: 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date_from?: string;
  date_to?: string;
  sortBy?: 'audit_date' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface UseStockAuditsReturn {
  audits: StockAudit[] | null;
  loading: boolean;
  error: string | null;
  filters: UseStockAuditsFilters;
  setFilters: (filters: UseStockAuditsFilters) => void;
  refreshAudits: () => Promise<void>;
  createAudit: (data: CreateStockAuditData) => Promise<ApiResponse<StockAudit>>;
  updateAudit: (data: UpdateStockAuditData) => Promise<ApiResponse<StockAudit>>;
  getAuditItems: (auditId: string) => Promise<ApiResponse<StockAuditItem[]>>;
  createAuditItem: (data: CreateStockAuditItemData, auditId: string) => Promise<ApiResponse<StockAuditItem>>;
}

export const useStockAudits = (initialFilters?: UseStockAuditsFilters): UseStockAuditsReturn => {
  const [audits, setAudits] = useState<StockAudit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseStockAuditsFilters>(initialFilters || {});

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await StockService.getStockAudits(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setAudits(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock audits');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshAudits = useCallback(async () => {
    await fetchAudits();
  }, [fetchAudits]);

  const createAudit = useCallback(async (data: CreateStockAuditData): Promise<ApiResponse<StockAudit>> => {
    try {
      const response = await StockService.createStockAudit(data);
      
      if (!response.error && response.data) {
        // Refresh audits list after successful creation
        await fetchAudits();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create stock audit',
        loading: false,
      };
    }
  }, [fetchAudits]);

  const updateAudit = useCallback(async (data: UpdateStockAuditData): Promise<ApiResponse<StockAudit>> => {
    try {
      const response = await StockService.updateStockAudit(data);
      
      if (!response.error && response.data) {
        // Refresh audits list after successful update
        await fetchAudits();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update stock audit',
        loading: false,
      };
    }
  }, [fetchAudits]);

  const getAuditItems = useCallback(async (auditId: string): Promise<ApiResponse<StockAuditItem[]>> => {
    try {
      return await StockService.getStockAuditItems(auditId);
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch audit items',
        loading: false,
      };
    }
  }, []);

  const createAuditItem = useCallback(async (data: CreateStockAuditItemData, auditId: string): Promise<ApiResponse<StockAuditItem>> => {
    try {
      const response = await StockService.createStockAuditItem(data, auditId);
      
      if (!response.error && response.data) {
        // Refresh audits list after successful creation
        await fetchAudits();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create audit item',
        loading: false,
      };
    }
  }, [fetchAudits]);

  // Fetch audits when filters change
  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  return {
    audits,
    loading,
    error,
    filters,
    setFilters,
    refreshAudits,
    createAudit,
    updateAudit,
    getAuditItems,
    createAuditItem,
  };
}; 