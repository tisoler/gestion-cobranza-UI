import useSWR from 'swr';
import { fetcher } from '../lib/api';
import type { UsuarioEntidad } from '../types';

export function useUsuariosEntidad() {
  const { data, error, isLoading } = useSWR<UsuarioEntidad[]>(
    '/usuarios/entidad',
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    usuarios: data || [],
    isLoading,
    isError: error,
  };
}
