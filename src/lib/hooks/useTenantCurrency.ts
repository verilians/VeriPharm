import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabaseAdmin } from '../supabase/supabaseClient';
import { formatCurrency } from '../utils';

export const useTenantCurrency = () => {
  const [currency, setCurrency] = useState<string>('UGX');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTenantCurrency = async () => {
      if (!user?.tenant_id) {
        setCurrency('UGX');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: tenant, error } = await supabaseAdmin
          .from('tenants')
          .select('currency')
          .eq('id', user.tenant_id)
          .single();

        if (error || !tenant) {
          setCurrency('UGX');
        } else {
          setCurrency(tenant.currency || 'UGX');
        }
      } catch (error) {
        console.error('Error fetching tenant currency:', error);
        setCurrency('UGX');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantCurrency();
  }, [user?.tenant_id]);

  const formatCurrencyWithTenant = (amount: number): string => {
    return formatCurrency(amount, currency);
  };

  return {
    currency,
    loading,
    formatCurrency: formatCurrencyWithTenant,
  };
}; 