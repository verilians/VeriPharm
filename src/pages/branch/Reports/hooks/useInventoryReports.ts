import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../services/reportsService';
import type { InventoryReport, ReportFilters } from '../types';

interface UseInventoryReportsReturn {
  inventoryReport: InventoryReport | null;
  loading: boolean;
  error: string | null;
  filters: ReportFilters;
  setFilters: (filters: ReportFilters) => void;
  generateReport: () => Promise<void>;
  refreshReport: () => Promise<void>;
}

export const useInventoryReports = (initialFilters?: ReportFilters): UseInventoryReportsReturn => {
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters || {});

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ReportsService.generateInventoryReport(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setInventoryReport(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate inventory report');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshReport = useCallback(async () => {
    await generateReport();
  }, [generateReport]);

  // Generate report when filters change
  useEffect(() => {
    generateReport();
  }, [filters, generateReport]);

  return {
    inventoryReport,
    loading,
    error,
    filters,
    setFilters,
    generateReport,
    refreshReport,
  };
}; 