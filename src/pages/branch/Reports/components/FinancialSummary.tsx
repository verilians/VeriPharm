import React from 'react';
import type { FinancialReport } from '../types';

interface FinancialSummaryProps {
  financialReport: FinancialReport;
  loading?: boolean;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  financialReport,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!financialReport) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No financial data available</p>
      </div>
    );
  }

  const getProfitColor = (profit: number): string => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getProfitIcon = (profit: number): string => {
    return profit >= 0 ? '📈' : '📉';
  };

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                UGX {financialReport.total_revenue.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                UGX {financialReport.total_expenses.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">💸</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Gross Profit</p>
              <p className={`text-2xl font-bold ${getProfitColor(financialReport.gross_profit)}`}>
                UGX {financialReport.gross_profit.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">{getProfitIcon(financialReport.gross_profit)}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className={`text-2xl font-bold ${getProfitColor(financialReport.net_profit)}`}>
                UGX {financialReport.net_profit.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">{getProfitIcon(financialReport.net_profit)}</div>
          </div>
        </div>
      </div>

      {/* Profit Margin */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Margin</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  financialReport.profit_margin >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(financialReport.profit_margin), 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getProfitColor(financialReport.profit_margin)}`}>
              {financialReport.profit_margin.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Profit Margin</p>
          </div>
        </div>
      </div>

      {/* Revenue by Month */}
      {financialReport.revenue_by_month.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h3>
          <div className="space-y-3">
            {financialReport.revenue_by_month.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <p className="text-sm text-gray-500">{month.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    UGX {month.revenue.toLocaleString()}
                  </p>
                  <p className={`text-sm ${month.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {month.growth_percentage >= 0 ? '+' : ''}{month.growth_percentage.toFixed(1)}% growth
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Flow Summary */}
      {financialReport.cash_flow && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Opening Balance</p>
              <p className="text-xl font-bold text-blue-900">
                UGX {financialReport.cash_flow.opening_balance.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Cash In</p>
              <p className="text-xl font-bold text-green-900">
                UGX {financialReport.cash_flow.cash_in.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-600">Cash Out</p>
              <p className="text-xl font-bold text-red-900">
                UGX {financialReport.cash_flow.cash_out.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Closing Balance</p>
              <p className="text-xl font-bold text-purple-900">
                UGX {financialReport.cash_flow.closing_balance.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-lg font-semibold ${getProfitColor(financialReport.cash_flow.net_cash_flow)}`}>
              Net Cash Flow: UGX {financialReport.cash_flow.net_cash_flow.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Report Period */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Report Period</h3>
            <p className="text-gray-600">{financialReport.report_period}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Generated on</p>
            <p className="font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 