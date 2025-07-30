// Utility functions for the Elith Pharmacy application

export const formatCurrency = (amount: number, currency: string = 'UGX'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Function to get tenant currency - this will be used by components
export const getTenantCurrency = async (): Promise<string> => {
  try {
    // Import dynamically to avoid circular dependencies
    const { useAuthStore } = await import('../../stores/authStore');
    const { supabaseAdmin } = await import('../supabase/supabaseClient');
    
    const { user } = useAuthStore.getState();
    
    if (!user?.tenant_id) {
      return 'UGX'; // Default fallback
    }

    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('currency')
      .eq('id', user.tenant_id)
      .single();

    if (error || !tenant) {
      return 'UGX'; // Default fallback
    }

    return tenant.currency || 'UGX';
  } catch (error) {
    console.error('Error fetching tenant currency:', error);
    return 'UGX'; // Default fallback
  }
};

// Function to format currency with tenant currency
export const formatCurrencyWithTenant = async (amount: number): Promise<string> => {
  const currency = await getTenantCurrency();
  return formatCurrency(amount, currency);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStockStatus = (quantity: number, minStockLevel: number = 0) => {
  if (quantity === 0) {
    return {
      status: 'out-of-stock' as const,
      color: 'text-red-600',
      bg: 'bg-red-100',
      text: 'Out of Stock',
    };
  }
  if (quantity <= minStockLevel) {
    return {
      status: 'low-stock' as const,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      text: 'Low Stock',
    };
  }
  return {
    status: 'in-stock' as const,
    color: 'text-green-600',
    bg: 'bg-green-100',
    text: 'In Stock',
  };
};

export const generatePurchaseNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PO-${year}${month}${day}-${random}`;
};

export const generateSaleNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SO-${year}${month}${day}-${random}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const downloadCSV = (data: any[], filename: string): void => {
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const downloadJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void => {
  // This would integrate with your notification system
  console.log(`${type.toUpperCase()}: ${message}`);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};
