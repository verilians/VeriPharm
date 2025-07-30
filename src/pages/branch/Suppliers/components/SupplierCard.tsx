import React from 'react';
import type { Supplier } from '../types';

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onView: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onEdit,
  onDelete,
  onView,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {supplier.name}
          </h3>
          {supplier.contact_person && (
            <p className="text-sm text-gray-600 mb-2">
              Contact: {supplier.contact_person}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(supplier)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => onEdit(supplier)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(supplier.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {supplier.email && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 mr-2">📧</span>
            <span>{supplier.email}</span>
          </div>
        )}
        
        {supplier.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 mr-2">📞</span>
            <span>{supplier.phone}</span>
          </div>
        )}

        {supplier.address && (
          <div className="flex items-start text-sm text-gray-600">
            <span className="w-4 mr-2 mt-0.5">📍</span>
            <span className="line-clamp-2">{supplier.address}</span>
          </div>
        )}

        {supplier.tax_number && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 mr-2">🏢</span>
            <span>Tax: {supplier.tax_number}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
            {supplier.status}
          </span>
        </div>
        
        <div className="text-right">
          {supplier.credit_limit && (
            <div>
              <p className="text-xs text-gray-500">Credit Limit</p>
              <p className="text-sm font-medium text-gray-900">
                UGX {supplier.credit_limit.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {supplier.payment_terms && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Payment Terms</p>
          <p className="text-sm font-medium text-gray-900">
            {supplier.payment_terms}
          </p>
        </div>
      )}

      {supplier.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Notes</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {supplier.notes}
          </p>
        </div>
      )}
    </div>
  );
}; 