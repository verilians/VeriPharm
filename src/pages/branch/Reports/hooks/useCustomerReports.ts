import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../services/reportsService';
import type { CustomerReport, ReportFilters } from '../types';

interface UseCustomerReportsReturn {
  customerReport: CustomerReport | null;
  loading: boolean;
  error: string | null;
  filters: ReportFilters;
  setFilters: (filters: ReportFilters) => void;
  generateReport: () => Promise<void>;
  refreshReport: () => Promise<void>;
}

export const useCustomerReports = (initialFilters?: ReportFilters): UseCustomerReportsReturn => {
  const [customerReport, setCustomerReport] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters || {});

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ReportsService.generateCustomerReport(filters);
      
      if (response.error) {
        setError(response.error);
      } else {
        setCustomerReport(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate customer report');
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
    customerReport,
    loading,
    error,
    filters,
    setFilters,
    generateReport,
    refreshReport,
  };
}; 