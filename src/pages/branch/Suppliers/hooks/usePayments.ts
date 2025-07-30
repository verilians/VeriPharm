import { useState, useEffect } from 'react';
import { SupplierService } from '../services/supplierService';
import type { SupplierPayment, CreatePaymentData, ApiResponse } from '../types';

export const useSupplierPayments = (supplierId: string) => {
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!supplierId) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement getSupplierPayments method in SupplierService
      // const result = await SupplierService.getSupplierPayments(supplierId);
      
      // Temporary mock data for build purposes
      setPayments([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [supplierId]);

  const createPayment = async (paymentData: CreatePaymentData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement createPayment method in SupplierService
      // const result = await SupplierService.createPayment(paymentData);
      
      // Temporary mock implementation for build purposes
      return true;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    loading,
    error,
    createPayment,
    refetch: fetchPayments,
  };
};

export const useSupplierStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SupplierService.getSupplierStats();
      
      if (result.error) {
        setError(result.error);
      } else {
        setStats(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}; 