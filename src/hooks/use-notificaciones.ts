import useSWR from 'swr';
import api from '../lib/api';
import type { Notificacion } from '../types';

export function useNotificacionesNoLeidasCount() {
  const { data, error, isLoading, mutate } = useSWR<{ count: number }>(
    '/notificaciones/no-leidas/count',
    (url: string) =>
      api
        // Importante: sin x-entidad-id para contar todas las entidades
        .get(url, { headers: { 'x-entidad-id': null as any } })
        .then((res) => res.data),
    { refreshInterval: 30000, revalidateOnFocus: true },
  );

  return {
    count: data?.count ?? 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useNotificacionesFiltered(entidadId: number | null) {
  const key = ['/notificaciones', entidadId] as const;
  const { data, error, isLoading, mutate } = useSWR<Notificacion[]>(
    key,
    async ([url, idEntidad]) => {
      if (idEntidad == null) {
        const { data } = await api.get(url, {
          headers: { 'x-entidad-id': null as any },
        });
        return data;
      }
      const { data } = await api.get(url, { headers: { 'x-entidad-id': String(idEntidad) } });
      return data;
    },
    { revalidateOnFocus: true },
  );

  return {
    notificaciones: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
