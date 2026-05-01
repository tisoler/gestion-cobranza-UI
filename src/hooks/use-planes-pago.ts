import useSWR from 'swr';
import { fetcher } from '../lib/api';
import type { PlanPago } from '../types';

export function usePlanesPago(producto?: string) {
  const { data, error, isLoading, mutate } = useSWR<PlanPago[]>(
    producto ? `/planes-pago?producto=${producto}` : '/planes-pago',
    fetcher
  );

  return {
    planes: data || [],
    isLoading,
    isError: error,
    mutate
  };
}
