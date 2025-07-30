import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseAdmin } from '../supabase/supabaseClient';
import type { 
  PostgrestError,
  RealtimeChannel,
  RealtimePostgresChangesPayload
} from '@supabase/supabase-js';

interface UseSupabaseQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: PostgrestError) => void;
  useAdminClient?: boolean;
  filters?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: PostgrestError | null;
  refetch: () => Promise<void>;
}

export function useSupabaseQuery<T>(
  table: string,
  query?: string,
  options: UseSupabaseQueryOptions = {}
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    useAdminClient = false,
    filters,
    orderBy
  } = options;

  const client = useAdminClient ? supabaseAdmin : supabase;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let dbQuery = client
        .from(table)
        .select(query || '*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          dbQuery = dbQuery.eq(key, value);
        });
      }

      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          dbQuery = dbQuery.order(key, { ascending: value === 'asc' });
        });
      }

      const { data: result, error: queryError } = await dbQuery;

      if (queryError) {
        setError(queryError);
        onError?.(queryError);
        return;
      }

      setData(result as T);
      onSuccess?.(result);
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [client, enabled, table, query, filters, orderBy, onSuccess, onError]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => void fetchData(), refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for mutations (insert, update, delete)
interface UseSupabaseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: PostgrestError) => void;
  useAdminClient?: boolean;
}

interface UseSupabaseMutationResult {
  mutate: (data: any) => Promise<void>;
  loading: boolean;
  error: PostgrestError | null;
}

export function useSupabaseMutation(
  table: string,
  options: UseSupabaseMutationOptions = {}
): UseSupabaseMutationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const { onSuccess, onError, useAdminClient = false } = options;
  const client = useAdminClient ? supabaseAdmin : supabase;

  const mutate = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      let response;

      // Check if data has an id - if so, it's a delete operation
      if (data && typeof data === 'object' && 'id' in data) {
        const { id } = data;
        response = await client
          .from(table)
          .delete()
          .eq('id', id);
      } else {
        response = await client
          .from(table)
          .insert(data)
          .select();
      }

      const { data: result, error: mutationError } = response;

      if (mutationError) {
        setError(mutationError);
        onError?.(mutationError);
        return;
      }

      onSuccess?.(result);
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}

// Hook for real-time subscriptions
interface UseSupabaseSubscriptionOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onData?: (payload: RealtimePostgresChangesPayload<Record<string, any>>) => void;
  onError?: (error: Error) => void;
}

export function useSupabaseSubscription(
  table: string,
  options: UseSupabaseSubscriptionOptions = {}
) {
  const { event = '*', filter, onData, onError } = options;

  useEffect(() => {
    let isSubscribed = true;
    const channel: RealtimeChannel = supabase.channel(`${table}_changes`);
    
    const subscription = channel
      .on<RealtimePostgresChangesPayload<Record<string, any>>>(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        } as any,
        (payload) => {
          if (isSubscribed) {
            onData?.(payload);
          }
        }
      )
      .subscribe((_status, err) => {
        if (isSubscribed && err) {
          onError?.(err);
        }
      });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      channel.unsubscribe();
    };
  }, [table, event, filter, onData, onError]);
}

// Hook for pagination
interface UseSupabasePaginationOptions {
  pageSize?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: PostgrestError) => void;
  filters?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

interface UseSupabasePaginationResult<T> {
  data: T[];
  loading: boolean;
  error: PostgrestError | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSupabasePagination<T>(
  table: string,
  query?: string,
  options: UseSupabasePaginationOptions = {}
): UseSupabasePaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const { pageSize = 20, onSuccess, onError, filters, orderBy } = options;

  const fetchData = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const from = isLoadMore ? page * pageSize : 0;
      const to = from + pageSize - 1;

      let dbQuery = supabaseAdmin
        .from(table)
        .select(query || '*')
        .range(from, to);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          dbQuery = dbQuery.eq(key, value);
        });
      }

      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          dbQuery = dbQuery.order(key, { ascending: value === 'asc' });
        });
      }

      const { data: result, error: queryError } = await dbQuery;

      if (queryError) {
        setError(queryError);
        onError?.(queryError);
        return;
      }

      if (isLoadMore) {
        setData(prev => [...prev, ...(result as T[])]);
      } else {
        setData(result as T[]);
      }
      
      setHasMore((result as T[]).length === pageSize);
      setPage(isLoadMore ? page + 1 : 1);
      onSuccess?.(result);

    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [table, query, page, pageSize, filters, orderBy, onSuccess, onError]);

  useEffect(() => {
    void fetchData();
  }, [table, query]);

  const loadMore = () => fetchData(true);
  const refresh = () => {
    setPage(0);
    setData([]);
    return fetchData();
  };

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
