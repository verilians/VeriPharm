import React from 'react';

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerActions
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default ContentCard; 