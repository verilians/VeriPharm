import React from 'react';
import { FiChevronDown, FiFilter } from 'react-icons/fi';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  onExport?: () => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onExport,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-4 mb-6 ${className}`}>
      {/* Filter Chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {filters.map((filter, index) => (
          <div key={index} className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span>{filter.label}</span>
              <FiChevronDown className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Export Button */}
      {onExport && (
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <FiFilter className="w-4 h-4" />
          Export
        </button>
      )}
    </div>
  );
};

export default FilterBar; 