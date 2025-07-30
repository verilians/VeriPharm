import { useState, useEffect, useCallback } from 'react';
import { StockService } from '../services/stockService';
import type { Product, CreateProductData, UpdateProductData, ApiResponse } from '../types';

interface UseProductsFilters {
  search?: string;
  category_id?: string;
  status?: 'all' | 'active' | 'inactive' | 'discontinued';
  stock_status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier_id?: string;
  price_min?: number;
  price_max?: number;
  sortBy?: 'name' | 'sku' | 'unit_price' | 'stock_quantity' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface UseProductsReturn {
  products: Product[] | null;
  loading: boolean;
  error: string | null;
  filters: UseProductsFilters;
  setFilters: (filters: UseProductsFilters) => void;
  refreshProducts: () => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<ApiResponse<Product>>;
  updateProduct: (data: UpdateProductData) => Promise<ApiResponse<Product>>;
  deleteProduct: (id: string) => Promise<ApiResponse<boolean>>;
  getProductById: (id: string) => Promise<ApiResponse<Product>>;
}

export const useProducts = (initialFilters?: UseProductsFilters): UseProductsReturn => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseProductsFilters>(initialFilters || {});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await StockService.getProducts(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setProducts(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (data: CreateProductData): Promise<ApiResponse<Product>> => {
    try {
      const response = await StockService.createProduct(data);
      
      if (!response.error && response.data) {
        // Refresh products list after successful creation
        await fetchProducts();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create product',
        loading: false,
      };
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (data: UpdateProductData): Promise<ApiResponse<Product>> => {
    try {
      const response = await StockService.updateProduct(data);
      
      if (!response.error && response.data) {
        // Refresh products list after successful update
        await fetchProducts();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update product',
        loading: false,
      };
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await StockService.deleteProduct(id);
      
      if (!response.error && response.data) {
        // Refresh products list after successful deletion
        await fetchProducts();
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to delete product',
        loading: false,
      };
    }
  }, [fetchProducts]);

  const getProductById = useCallback(async (id: string): Promise<ApiResponse<Product>> => {
    try {
      return await StockService.getProductById(id);
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch product',
        loading: false,
      };
    }
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    filters,
    setFilters,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
}; 