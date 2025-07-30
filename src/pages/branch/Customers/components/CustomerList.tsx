import React from 'react';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import type { Customer, CustomerFilters, CustomerListProps } from '../types';

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading,
  error,
  onEdit,
  onDelete,
  onView,
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {status}
      </span>
    );
  };

  const getGenderBadge = (gender?: string) => {
    if (!gender) return null;
    
    const colors = {
      male: 'bg-blue-100 text-blue-800',
      female: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[gender as keyof typeof colors] || colors.other}`}>
        {gender}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="name">Name</option>
              <option value="created_at">Date Created</option>
              <option value="total_sales">Total Sales</option>
            </select>
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Customers ({customers.length})
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <FiPlus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">{customer.email}</div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.city}, {customer.state}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getGenderBadge(customer.gender)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(customer)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(customer.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg font-medium mb-2">No customers found</div>
            <div className="text-gray-400">Get started by adding your first customer</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList; 