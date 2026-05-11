import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Search, RotateCcw, Loader2 } from 'lucide-react';
import { EntidadSelector } from '../components/EntidadSelector';
import { PersonaList } from '../components/persona-list';
import { PersonaDetailModal } from '../components/persona-detail-modal';
import { usePersonas } from '../hooks/use-personas';
import { useAuth } from '../contexts/AuthContext';
import { fetcher } from '../lib/api';
import type { Entidad, Persona, SortOption } from '../types';

const MANUAL_PROCEDIMIENTO_URL =
  'https://tisolercdn.nyc3.cdn.digitaloceanspaces.com/gestion-cobros/manual-procedimiento/MANUAL%20DE%20PROCEDIMIENTO%20DE%20COBRANZAS.pdf';

export default function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    dni: '',
    cuit: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    numeroPadron: '',
    codigoWeb: '',
    patente: '',
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [sortBy, setSortBy] = useState<SortOption>('deudaDesc');
  const [page, setPage] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [entidadOverride, setEntidadOverride] = useState<number | null>(null);

  const { data: entidades, isLoading: entidadesLoading } = useSWR<Entidad[]>(
    '/entidades',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const selectedEntidadId = useMemo(() => {
    if (!entidades || entidades.length === 0) return null;
    const ids = new Set(entidades.map((e) => e.id));
    if (entidadOverride != null && ids.has(entidadOverride)) {
      return entidadOverride;
    }
    const storedRaw = localStorage.getItem('currentEntidadId');
    const stored = storedRaw != null ? parseInt(storedRaw, 10) : NaN;
    if (Number.isFinite(stored) && ids.has(stored)) return stored;
    const fromUser = user?.idEntidad != null ? Number(user.idEntidad) : NaN;
    if (Number.isFinite(fromUser) && ids.has(fromUser)) return fromUser;
    return entidades[0].id;
  }, [entidades, user?.idEntidad, entidadOverride]);

  useEffect(() => {
    if (selectedEntidadId != null) {
      localStorage.setItem('currentEntidadId', String(selectedEntidadId));
    }
  }, [selectedEntidadId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const { personas, isLoading, isError } = usePersonas({
    entidadId: selectedEntidadId,
    ...debouncedFilters,
    sort: sortBy,
    page
  });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const clearFilters = () => {
    setFilters({
      dni: '',
      cuit: '',
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      numeroPadron: '',
      codigoWeb: '',
      patente: '',
    });
  };

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-7 md:px-6 lg:px-8">

        {/* --- CABECERA PRINCIPAL UNIFICADA --- */}
        <div className="mb-10 flex flex-col gap-8 border-b border-border pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl pl-10 md:pl-0 font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                Sr. Cobranza
              </h1>
              <p className="text-base text-muted-foreground pl-10 md:pl-0 font-medium italic">
                {isLoading || entidadesLoading
                  ? 'Sincronizando datos...'
                  : 'Panel de control • Listado de personas'}
              </p>
            </div>

            <div className="flex flex-col gap-7 lg:gap-4 lg:flex-row lg:items-center w-full lg:w-auto">
              <a
                href={MANUAL_PROCEDIMIENTO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl whitespace-nowrap border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95"
              >
                Manual de procedimiento
              </a>

              <EntidadSelector
                entidades={entidades}
                isLoading={entidadesLoading}
                selectedId={selectedEntidadId}
                onChange={(id) => {
                  localStorage.setItem('currentEntidadId', String(id));
                  setEntidadOverride(id);
                  setSelectedPersona(null);
                  setPage(1);
                }}
                className="w-full sm:min-w-[280px]"
              />
            </div>
          </div>
        </div>

        {/* --- FILTROS DE BÚSQUEDA --- */}
        <div className="mb-8 rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Filtros de Búsqueda</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors"
              >
                <RotateCcw className="size-4" />
                Limpiar Filtros
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FilterInput
              label="DNI"
              value={filters.dni}
              onChange={(val) => setFilters(f => ({ ...f, dni: val }))}
              placeholder="Buscar por DNI..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="CUIT"
              value={filters.cuit}
              onChange={(val) => setFilters(f => ({ ...f, cuit: val }))}
              placeholder="Buscar por CUIT..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="Nombre"
              value={filters.nombre}
              onChange={(val) => setFilters(f => ({ ...f, nombre: val }))}
              placeholder="Nombre..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="Apellido"
              value={filters.apellido}
              onChange={(val) => setFilters(f => ({ ...f, apellido: val }))}
              placeholder="Apellido..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="Teléfono"
              value={filters.telefono}
              onChange={(val) => setFilters(f => ({ ...f, telefono: val }))}
              placeholder="Buscar por teléfono..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="E-mail"
              value={filters.email}
              onChange={(val) => setFilters(f => ({ ...f, email: val }))}
              placeholder="Buscar por e-mail..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="Número padrón"
              value={filters.numeroPadron}
              onChange={(val) => setFilters(f => ({ ...f, numeroPadron: val }))}
              placeholder="Buscar por número padrón..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="Código Web"
              value={filters.codigoWeb}
              onChange={(val) => setFilters(f => ({ ...f, codigoWeb: val }))}
              placeholder="Buscar por código web..."
              icon={<Search className="size-4" />}
            />
            <FilterInput
              label="Patente"
              value={filters.patente}
              onChange={(val) => setFilters(f => ({ ...f, patente: val }))}
              placeholder="Buscar por patente..."
              icon={<Search className="size-4" />}
            />
          </div>
        </div>

        {/* Sort and Pagination */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Ordenar por:</span>
            <select
              aria-label="Ordenar por"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setPage(1);
              }}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold shadow-sm outline-none ring-offset-background transition-all hover:border-primary/40 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="deudaDesc">Total deuda (Mayor a menor)</option>
              <option value="cuotasDesc">Cant. cuotas (Mayor a menor)</option>
              <option value="contactoDesc">Último contacto (Más reciente)</option>
              <option value="contactoAsc">Último contacto (Menos reciente)</option>
            </select>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold shadow-sm transition-all hover:bg-muted disabled:opacity-30 active:scale-95"
            >
              Anterior
            </button>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
              {page}
            </div>
            <button
              disabled={!personas || personas.length < 15 || isLoading}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold shadow-sm transition-all hover:bg-muted disabled:opacity-30 active:scale-95"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Content */}
        {entidadesLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mb-4 size-10 animate-spin text-primary" />
            <p className="text-sm font-semibold">Preparando panel...</p>
          </div>
        ) : !entidades?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-bold text-foreground">Sin entidad disponible</p>
            <p className="text-sm">Su usuario no tiene entidades asignadas. Contacte al administrador.</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="text-lg font-bold">Error al cargar datos</p>
            <p className="text-sm opacity-80">Por favor, intente recargar la página.</p>
          </div>
        ) : (
          <PersonaList personas={personas || []} isLoading={isLoading} onSelectPersona={setSelectedPersona} />
        )}
      </div>

      {/* Modal */}
      {selectedPersona && (
        <PersonaDetailModal
          key={selectedPersona.id}
          persona={selectedPersona}
          onClose={() => setSelectedPersona(null)}
          onPersonaUpdated={(p) => setSelectedPersona(p)}
        />
      )}
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder, icon }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, icon?: React.ReactNode }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="group relative">
        <label className="absolute -top-[6px] left-3 z-10 bg-background px-1 text-[9px] font-black uppercase tracking-widest text-primary transition-colors group-focus-within:text-primary">
          {label}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary/60">
            {icon}
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-border bg-card/50 py-2.5 pl-10 pr-4 text-sm font-medium shadow-sm transition-all placeholder:text-muted-foreground/30 focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>
    </div>
  );
}
