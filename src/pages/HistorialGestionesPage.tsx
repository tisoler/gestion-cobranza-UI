import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, User } from 'lucide-react';
import api, { fetcher } from '../lib/api';
import useSWR from 'swr';
import type { Entidad, GestionHistorial, UsuarioEntidad } from '../types';
import { formatObservacionesConMenciones } from '../lib/mentions';

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">
        {label}
      </label>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            const el = e.currentTarget as HTMLInputElement & {
              showPicker?: () => void;
            };
            el.showPicker?.();
          }}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm font-bold shadow-sm outline-none transition-colors hover:border-primary/30"
        />
      </div>
    </div>
  );
}

export default function HistorialGestionesPage() {
  const [entidadFilterId, setEntidadFilterId] = useState<number | null>(null); // null = todas
  const [gestorFilter, setGestorFilter] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const { data: entidades, isLoading: entidadesLoading } = useSWR<Entidad[]>(
    '/entidades',
    fetcher,
    { revalidateOnFocus: false },
  );

  const {
    data: gestoresData,
    isLoading: gestoresLoading,
  } = useSWR<UsuarioEntidad[]>(
    entidadFilterId == null ? null : ['/usuarios/entidad', entidadFilterId],
    async ([url, idEntidad]) => {
      const { data } = await api.get(url, {
        headers: { 'x-entidad-id': String(idEntidad) },
      });
      return data;
    },
    { revalidateOnFocus: false },
  );

  const gestorOptions = useMemo(() => {
    const usuarios = gestoresData ?? [];
    return usuarios
      .map((u) => u.email)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [gestoresData]);

  const swrKey = useMemo<readonly [string, number | null, string, string, string]>(
    () => ['/gestiones', entidadFilterId, gestorFilter, fechaDesde, fechaHasta],
    [entidadFilterId, gestorFilter, fechaDesde, fechaHasta],
  );

  const {
    data: gestionesData,
    isLoading,
  } = useSWR<GestionHistorial[]>(
    swrKey,
    async ([
      url,
      idEntidad,
      gestor,
      desde,
      hasta,
    ]: readonly [string, number | null, string, string, string]) => {
      const params: Record<string, string> = { limit: '200' };
      if (idEntidad == null) params.todas = 'true';
      if (gestor) params.gestor = gestor;
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;

      if (idEntidad == null) {
        const { data } = await api.get(url, {
          params,
          headers: { 'x-entidad-id': null as any },
        });
        return data;
      }

      const { data } = await api.get(url, {
        params,
        headers: { 'x-entidad-id': String(idEntidad) },
      });
      return data;
    },
    { revalidateOnFocus: true },
  );

  const gestiones = gestionesData ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
              Historial de Gestiones
            </h1>
            <p className="text-muted-foreground mt-1 font-medium italic">Listado global.</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">
              Entidad
            </label>
            <select
              value={entidadFilterId ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                const next = raw === '' ? null : Number(raw);
                setEntidadFilterId(next);
                setGestorFilter('');
              }}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-sm outline-none transition-colors hover:border-primary/30 sm:min-w-[260px]"
              disabled={entidadesLoading}
            >
              <option value="">Todas</option>
              {(entidades ?? []).map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">
              Gestor
            </label>
            <select
              value={gestorFilter}
              onChange={(e) => setGestorFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-sm outline-none transition-colors hover:border-primary/30 sm:min-w-[260px]"
              disabled={entidadFilterId == null || gestoresLoading}
              title={
                entidadFilterId == null
                  ? 'Seleccioná una entidad para filtrar por gestor'
                  : undefined
              }
            >
              <option value="">
                {entidadFilterId == null ? 'Seleccioná una entidad…' : 'Todos'}
              </option>
              {gestorOptions.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          <DatePickerField
            label="Fecha desde"
            value={fechaDesde}
            onChange={setFechaDesde}
          />

          <DatePickerField
            label="Fecha hasta"
            value={fechaHasta}
            onChange={setFechaHasta}
          />

          {(fechaDesde || fechaHasta) && (
            <button
              type="button"
              onClick={() => {
                setFechaDesde('');
                setFechaHasta('');
              }}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
              title="Limpiar filtro de fechas"
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : gestiones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
          <p className="text-sm font-bold text-muted-foreground">
            No hay gestiones para los filtros seleccionados
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {gestiones.map((g) => (
            <li key={g.id}>
              <Link
                to={`/?persona=${g.idPersona}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-primary/40">
                      {g.accion} — {g.contacto}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {g.persona?.apellidoNombre ?? `Persona #${g.idPersona}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>{formatDateTime(g.fecha_hora)}</span>
                    {g.usuario && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {g.usuario}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {g.observaciones && (
                  <div className="mt-3 rounded-lg bg-muted/30 border-l-4 border-primary/20 p-3">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {formatObservacionesConMenciones(g.observaciones)}
                    </p>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
