import useSWR, { useSWRConfig } from 'swr';
import { useEffect } from 'react';
import { fetcher } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3070';

export function usePersonas(options: {
  entidadId?: number | null;
  dni?: string;
  cuit?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  numeroPadron?: string;
  codigoWeb?: string;
  patente?: string;
  sort?: string;
  page?: number;
} = {}) {
  const { entidadId, dni, cuit, nombre, apellido, telefono, email, numeroPadron, codigoWeb, patente, sort, page = 1 } = options;
  const { mutate } = useSWRConfig();
  
  // Construir la URL con parámetros para SWR
  const queryParams = new URLSearchParams();
  if (dni && dni.length >= 3) queryParams.append('dni', dni);
  if (cuit && cuit.length >= 3) queryParams.append('cuit', cuit);
  if (nombre && nombre.length >= 3) queryParams.append('nombre', nombre);
  if (apellido && apellido.length >= 3) queryParams.append('apellido', apellido);
  if (telefono && telefono.length >= 3) queryParams.append('telefono', telefono);
  if (email && email.length >= 3) queryParams.append('email', email);
  if (numeroPadron && numeroPadron.length >= 3) queryParams.append('numeroPadron', numeroPadron);
  if (codigoWeb && codigoWeb.length >= 3) queryParams.append('codigoWeb', codigoWeb);
  if (patente && patente.length >= 3) queryParams.append('patente', patente);
  if (sort) queryParams.append('sort', sort);
  if (page > 1) queryParams.append('page', page.toString());
  
  const swrKey = `/personas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const personasEnabled = entidadId != null && Number.isFinite(entidadId);
  const swrCacheKey = personasEnabled ? ([swrKey, entidadId] as const) : null;

  const { data, error, isLoading } = useSWR(swrCacheKey, () => fetcher(swrKey), {
    dedupingInterval: 600000, 
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/gestiones/events`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.idPersona) {
          // Si hay una actualización via SSE, invalidamos todas las versiones de /personas
          mutate((key: unknown) => {
            if (typeof key === 'string' && key.startsWith('/personas')) return true;
            if (Array.isArray(key) && typeof key[0] === 'string' && key[0].startsWith('/personas')) return true;
            return false;
          });
          mutate(`/personas/${payload.idPersona}`);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [mutate]);

  return {
    personas: data?.data || [],
    total: data?.total || 0,
    isLoading: personasEnabled ? isLoading : false,
    isError: error,
  };
}

export function usePersona(id: number | null, entidadId?: number | null) {
  const scope =
    entidadId != null && Number.isFinite(entidadId)
      ? String(entidadId)
      : typeof window !== 'undefined'
        ? localStorage.getItem('currentEntidadId') ?? ''
        : '';
  const { data, error, isLoading } = useSWR(
    id ? ([`/personas/${id}`, scope] as const) : null,
    () => fetcher(`/personas/${id}`),
    {
      dedupingInterval: 600000,
    },
  );

  return {
    persona: data,
    isLoading,
    isError: error,
  };
}
