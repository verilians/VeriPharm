import { useState, useEffect, useCallback } from 'react';
import { StockService } from '../services/stockService';
import type { Category, CreateCategoryData, UpdateCategoryData, ApiResponse } from '../types';

interface UseCategoriesFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  parent_id?: string;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface UseCategoriesReturn {
  categories: Category[] | null;
  loading: boolean;
  error: string | null;
  filters: UseCategoriesFilters;
  setFilters: (filters: UseCategoriesFilters) => void;
  refreshCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<ApiResponse<Category>>;
  updateCategory: (data: UpdateCategoryData) => Promise<ApiResponse<Category>>;
}

export const useCategories = (initialFilters?: UseCategoriesFilters): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseCategoriesFilters>(initialFilters || {});

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await StockService.getCategories(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (data: CreateCategoryData): Promise<ApiResponse<Category>> => {
    try {
      const response = await StockService.createCategory(data);
      
      if (!response.error && response.data) {
        // Refresh categories list after successful creation
        await fetchCategories();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create category',
        loading: false,
      };
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (data: UpdateCategoryData): Promise<ApiResponse<Category>> => {
    try {
      const response = await StockService.updateCategory(data);
      
      if (!response.error && response.data) {
        // Refresh categories list after successful update
        await fetchCategories();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update category',
        loading: false,
      };
    }
  }, [fetchCategories]);

  // Fetch categories when filters change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    filters,
    setFilters,
    refreshCategories,
    createCategory,
    updateCategory,
  };
}; 