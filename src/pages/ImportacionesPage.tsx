import { useState } from 'react';
import { ArrowLeft, User, Car, House, Wheat } from 'lucide-react';
import { EntidadSelector } from '../components/EntidadSelector';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../lib/api';
import type { Entidad } from '../types';
import { ImportacionPersonas } from '../components/importaciones/components/ImportacionPersonas';
import { ImportacionPatentes } from '../components/importaciones/components/ImportacionPatentes';
import { ImportacionTgiUrbano } from '../components/importaciones/components/ImportacionTgiUrbano';
import { ImportacionTgiRural } from '../components/importaciones/components/ImportacionTgiRural';

export default function ImportacionesPage() {
  const { user } = useAuth();
  const [entidadOverride, setEntidadOverride] = useState<number | null>(null);

  const { data: entidades, isLoading: entidadesLoading } = useSWR<Entidad[]>(
    '/entidades',
    fetcher,
    { revalidateOnFocus: false }
  );

  const selectedEntidadId = (() => {
    if (!entidades || entidades.length === 0) return null;
    const ids = new Set(entidades.map((e) => e.id));
    if (entidadOverride != null && ids.has(entidadOverride)) return entidadOverride;
    const storedRaw = localStorage.getItem('currentEntidadId');
    const stored = storedRaw != null ? parseInt(storedRaw, 10) : NaN;
    if (Number.isFinite(stored) && ids.has(stored)) return stored;
    const fromUser = user?.idEntidad != null ? Number(user.idEntidad) : NaN;
    if (Number.isFinite(fromUser) && ids.has(fromUser)) return fromUser;
    return entidades[0].id;
  })();

  const [target, setTarget] = useState<string>('personas');

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">

        {/* --- HEADER --- */}
        <div className="mb-10 flex flex-col gap-8 border-b border-border pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="pl-10 md:pl-0 inline-flex items-center gap-2 text-md font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="size-4" />
                Volver
              </Link>
              <div className="mt-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-primary to-indigo-400 bg-clip-text text-transparent">
                  Importación de Datos
                </h1>
                <p className="text-muted-foreground mt-1 font-medium italic">Carga masiva de datos desde archivos CSV.</p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <EntidadSelector
                entidades={entidades || []}
                isLoading={entidadesLoading}
                selectedId={selectedEntidadId}
                onChange={(id) => {
                  localStorage.setItem('currentEntidadId', String(id));
                  setEntidadOverride(id);
                }}
                className="w-full sm:min-w-[280px]"
              />
            </div>
          </div>
        </div>

        {/* --- SELECTOR DE TARGET --- */}
        <div className="mb-8">
          <div className="relative flex-1 ">
            <div className="flex p-1 bg-muted/50 rounded-2xl border border-border">
              <button
                onClick={() => setTarget('personas')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-widest transition-all rounded-xl ${target === 'personas' ? 'bg-background text-primary shadow-lg ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <User className="size-4" /> Personas
              </button>
              <button
                onClick={() => setTarget('patentes')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-widest transition-all rounded-xl ${target === 'patentes' ? 'bg-background text-primary shadow-lg ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Car className="size-4" /> Patentes
              </button>
              <button
                onClick={() => setTarget('tgi_urbano')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-widest transition-all rounded-xl ${target === 'tgi_urbano' ? 'bg-background text-primary shadow-lg ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <House className="size-4" /> TGI Urbano
              </button>
              <button
                onClick={() => setTarget('tgi_rural')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-widest transition-all rounded-xl ${target === 'tgi_rural' ? 'bg-background text-primary shadow-lg ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Wheat className="size-4" /> TGI Rural
              </button>
            </div>
          </div>
        </div>

        {/* --- COMPONENTE SEGUN SELECCION --- */}
        {target === 'personas' && (
          <ImportacionPersonas />
        )}
        {target === 'patentes' && (
          <ImportacionPatentes />
        )}
        {target === 'tgi_urbano' && (
          <ImportacionTgiUrbano />
        )}
        {target === 'tgi_rural' && (
          <ImportacionTgiRural />
        )}
      </div>
    </div>
  );
}
