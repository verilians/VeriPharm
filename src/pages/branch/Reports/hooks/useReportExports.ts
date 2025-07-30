import { useState, useCallback } from 'react';
import { ReportsService } from '../services/reportsService';
import type { ExportOptions, ApiResponse } from '../types';

interface UseReportExportsReturn {
  exporting: boolean;
  error: string | null;
  exportReport: (reportType: string, reportData: unknown, options: ExportOptions) => Promise<ApiResponse<string>>;
}

export const useReportExports = (): UseReportExportsReturn => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = useCallback(async (
    reportType: string,
    reportData: unknown,
    options: ExportOptions
  ): Promise<ApiResponse<string>> => {
    setExporting(true);
    setError(null);
    
    try {
      const response = await ReportsService.exportReport(reportType, reportData, options);
      
      if (response.error) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export report';
      setError(errorMessage);
      return {
        data: null,
        error: errorMessage,
        loading: false,
      };
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exporting,
    error,
    exportReport,
  };
}; 