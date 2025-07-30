import { useState, useEffect } from 'react';
import { CustomerService } from '../services/customerService';
import { Customer, CreateCustomerData, UpdateCustomerData, CustomerFilters, ApiResponse } from '../types';

export const useCustomers = (filters?: CustomerFilters) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.getCustomers(filters);
      
      if (result.error) {
        setError(result.error);
      } else {
        setCustomers(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const createCustomer = async (customerData: CreateCustomerData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.createCustomer(customerData);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Refresh the list
        await fetchCustomers();
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: string, customerData: UpdateCustomerData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.updateCustomer(id, customerData);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Update the local state
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === id ? { ...customer, ...customerData } : customer
          )
        );
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.deleteCustomer(id);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Remove from local state
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
};

export const useCustomer = (id: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.getCustomerById(id);
      
      if (result.error) {
        setError(result.error);
      } else {
        setCustomer(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const updateCustomer = async (customerData: UpdateCustomerData): Promise<boolean> => {
    if (!id) return false;

    setLoading(true);
    setError(null);

    try {
      const result = await CustomerService.updateCustomer(id, customerData);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        setCustomer(result.data);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    customer,
    loading,
    error,
    updateCustomer,
    refetch: fetchCustomer,
  };
}; 