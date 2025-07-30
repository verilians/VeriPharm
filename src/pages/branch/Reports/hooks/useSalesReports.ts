import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../services/reportsService';
import type { SalesReport, ReportFilters } from '../types';

interface UseSalesReportsReturn {
  salesReport: SalesReport | null;
  loading: boolean;
  error: string | null;
  filters: ReportFilters;
  setFilters: (filters: ReportFilters) => void;
  generateReport: () => Promise<void>;
  refreshReport: () => Promise<void>;
}

export const useSalesReports = (initialFilters?: ReportFilters): UseSalesReportsReturn => {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters || {});

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ReportsService.generateSalesReport(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSalesReport(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshReport = useCallback(async () => {
    await generateReport();
  }, [generateReport]);

  // Generate report when filters change
  useEffect(() => {
    if (filters.date_from || filters.date_to) {
      generateReport();
    }
  }, [filters, generateReport]);

  return {
    salesReport,
    loading,
    error,
    filters,
    setFilters,
    generateReport,
    refreshReport,
  };
}; 