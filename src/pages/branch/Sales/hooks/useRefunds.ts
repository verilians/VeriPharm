import { useState, useEffect } from 'react';
import { SalesService } from '../services/salesService';
import { Refund, CreateRefundData, RefundFilters, ApiResponse } from '../types';

export const useRefunds = (filters?: RefundFilters) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.getRefunds(filters);
      
      if (result.error) {
        setError(result.error);
      } else {
        setRefunds(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [filters]);

  const createRefund = async (refundData: CreateRefundData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await SalesService.createRefund(refundData);
      
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Add to local state
        setRefunds(prev => [result.data!, ...prev]);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create refund');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    refunds,
    loading,
    error,
    createRefund,
    refetch: fetchRefunds,
  };
}; 