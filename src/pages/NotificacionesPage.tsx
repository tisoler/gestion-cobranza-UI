import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck, Loader2, User } from 'lucide-react';
import api, { fetcher } from '../lib/api';
import { useSWRConfig } from 'swr';
import useSWR from 'swr';
import type { Entidad } from '../types';
import { useNotificacionesFiltered } from '../hooks/use-notificaciones';

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificacionesPage() {
  const [entidadFilterId, setEntidadFilterId] = useState<number | null>(null); // null = todas
  const { mutate: globalMutate } = useSWRConfig();

  const { data: entidades, isLoading: entidadesLoading } = useSWR<Entidad[]>(
    '/entidades',
    fetcher,
    { revalidateOnFocus: false },
  );

  const { notificaciones, isLoading, mutate } =
    useNotificacionesFiltered(entidadFilterId);

  const revalidateCounts = () => {
    globalMutate('/notificaciones/no-leidas/count');
    mutate();
  };

  const handleMarkRead = async (id: number) => {
    await api.patch(`/notificaciones/${id}/leida`, undefined, {
      headers:
        entidadFilterId == null
          ? { 'x-entidad-id': null as any }
          : { 'x-entidad-id': String(entidadFilterId) },
    });
    revalidateCounts();
  };

  const handleMarkAllRead = async () => {
    await api.patch('/notificaciones/leer-todas', undefined, {
      headers:
        entidadFilterId == null
          ? { 'x-entidad-id': null as any }
          : { 'x-entidad-id': String(entidadFilterId) },
    });
    revalidateCounts();
  };

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col items-start justify-center gap-4">
        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className="pl-10 md:pl-0 inline-flex items-center gap-2 text-md font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
          <div className="mt-2">
            <h1 className="flex items-center gap-2 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-primary to-indigo-400 bg-clip-text text-transparent">
              <div className="flex size-12 items-center justify-center text-indigo-500">
                <Bell className="size-6" />
              </div>
              Notificaciones
            </h1>
            <p className="text-muted-foreground mt-1 font-medium italic">Menciones en gestiones de cobranza.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">
              Entidad
            </label>
            <select
              value={entidadFilterId ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                setEntidadFilterId(raw === '' ? null : Number(raw));
              }}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-sm outline-none transition-colors hover:border-primary/30"
              disabled={entidadesLoading}
            >
              <option value="">Todas</option>
              {(entidades ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CheckCheck className="size-4" />
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
          <p className="text-sm font-bold text-muted-foreground">
            No tenés notificaciones
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notificaciones.map((notif) => (
            <li key={notif.id}>
              <Link
                to={`/?persona=${notif.id_persona}`}
                onClick={() => {
                  if (!notif.leida) handleMarkRead(notif.id);
                }}
                className={`block rounded-2xl border p-5 transition-all hover:border-primary/30 hover:shadow-md ${notif.leida
                  ? 'border-border bg-card opacity-80'
                  : 'border-primary/25 bg-primary/5 shadow-sm'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {notif.mensaje}
                  </p>
                  {!notif.leida && (
                    <span className="size-2.5 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>{formatDateTime(notif.fecha_creacion)}</span>
                  {notif.persona_nombre && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{notif.persona_nombre}</span>
                    </>
                  )}
                  {notif.email_emisor && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {notif.email_emisor}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
