import React, { useState } from 'react';
import type { ExportOptions } from '../types';

interface ExportButtonsProps {
  onExport: (options: ExportOptions) => Promise<void>;
  loading?: boolean;
  reportType: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExport,
  loading = false,
  reportType,
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  const handleExport = async (): Promise<void> => {
    setExporting(true);
    try {
      const options: ExportOptions = {
        format: exportFormat,
        include_charts: includeCharts,
        include_summary: includeSummary,
      };
      await onExport(options);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getFormatIcon = (format: 'pdf' | 'excel' | 'csv'): string => {
    switch (format) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'csv':
        return '📋';
      default:
        return '📄';
    }
  };

  const getFormatLabel = (format: 'pdf' | 'excel' | 'csv'): string => {
    switch (format) {
      case 'pdf':
        return 'PDF Document';
      case 'excel':
        return 'Excel Spreadsheet';
      case 'csv':
        return 'CSV File';
      default:
        return 'Document';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
        <div className="text-sm text-gray-500">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        </div>
      </div>

      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['pdf', 'excel', 'csv'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportFormat === format
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{getFormatIcon(format)}</div>
                <div className="text-sm font-medium">{getFormatLabel(format)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeCharts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeCharts" className="ml-2 text-sm text-gray-700">
              Include charts and graphs
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeSummary"
              checked={includeSummary}
              onChange={(e) => setIncludeSummary(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeSummary" className="ml-2 text-sm text-gray-700">
              Include summary and key metrics
            </label>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleExport}
            disabled={loading || exporting}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>{getFormatIcon(exportFormat)}</span>
                <span>Export as {getFormatLabel(exportFormat)}</span>
              </>
            )}
          </button>
        </div>

        {/* Export Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• PDF exports include formatted charts and tables</p>
          <p>• Excel exports include raw data for further analysis</p>
          <p>• CSV exports are optimized for data processing</p>
          <p>• Large reports may take a few moments to generate</p>
        </div>
      </div>
    </div>
  );
}; 