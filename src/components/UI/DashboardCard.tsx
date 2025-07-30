import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  children
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children ? (
        children
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {icon && (
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{value}</span>
                  {trend && (
                    <div className={`flex items-center gap-1 text-sm ${
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.isPositive ? (
                        <FiTrendingUp className="w-4 h-4" />
                      ) : (
                        <FiTrendingDown className="w-4 h-4" />
                      )}
                      <span>{trend.value}</span>
                    </div>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard; 