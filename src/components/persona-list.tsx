import { ChevronRight, User, History, Loader2 } from 'lucide-react';
import { useSWRConfig } from 'swr';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { Patente, Persona, TgiRural, TgiUrbano } from '../types';

interface PersonaListProps {
  personas: Persona[];
  isLoading?: boolean;
  onSelectPersona: (persona: Persona) => void;
}

export function PersonaList({ personas, isLoading = false, onSelectPersona }: PersonaListProps) {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const isSysAdminOrAdmin = user?.roles?.includes('sys-admin') || user?.roles?.includes('admin');

  const handleToggle = async (e: React.MouseEvent, persona: Persona) => {
    e.stopPropagation();

    // Toggle state optimism (we predict the new state)
    const optimisticVal = !persona.habilitado;

    try {
      // 1. UPDATE CACHE OPTIMISTICALLY WITHOUT REVALIDATING YET
      mutate(
        // A. La key indica a qué caches aplica la inyección del segundo param ((currentData: any) => {...)
        (key: unknown) => {
          if (typeof key === 'string' && key.startsWith('/personas')) return true;
          if (Array.isArray(key) && typeof key[0] === 'string' && key[0].startsWith('/personas')) return true;
          return false;
        },
        // B. inyección de datos (optimistic UI) em ñas cachés que tengan keys incluidas en A
        (currentData: any) => {
          if (!currentData || !currentData.data) return currentData;
          return {
            ...currentData,
            data: currentData.data.map((p: Persona) =>
              p.id === persona.id ? { ...p, habilitado: optimisticVal } : p
            )
          };
        },
        { revalidate: false } // C. No genera los refetches de las cachés que tienen key incluida en A
      );

      // 2. FIRE BACKGROUND REQUEST
      await api.patch(`/personas/${persona.id}/habilitado`);

    } catch (err) {
      console.error('Error al cambiar estado', err);
      // In a more robust setup, we'd revert the mutation here 
      // by doing another mutate to force fetch or revert to original
      mutate(
        (key: unknown) => {
          if (typeof key === 'string' && key.startsWith('/personas')) return true;
          if (Array.isArray(key) && typeof key[0] === 'string' && key[0].startsWith('/personas')) return true;
          return false;
        }
      );
    }
  };

  if (isLoading && (!personas || personas.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mb-3 size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">Cargando personas...</p>
      </div>
    );
  }

  if (!personas || personas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted/50 mb-6">
          <User className="size-10" />
        </div>
        <p className="text-lg font-bold">No se encontraron resultados</p>
        <p className="text-sm">Pruebe con otros criterios de búsqueda.</p>
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  const getPersonaStats = (persona: Persona) => {
    const patentesItems = persona.patentes || [];
    const tgiUrbanosItems = persona.tgiUrbanos || [];
    const tgiRuralesItems = persona.tgiRurales || [];

    const getProductStats = (items: (Patente | TgiUrbano | TgiRural)[]) => {
      let sumatoriaCuotas = 0;
      let maxCuotasEnUnItem = 0;

      items.forEach(item => {
        // Sumamos el valor de cantidad_cuotas de todas las cuotas asociadas al item
        const itemSumaCuotas = item.cuotas?.reduce((acc, c) => acc + (Number(c.cantidad_cuotas) || 0), 0) || 0;
        sumatoriaCuotas += itemSumaCuotas;

        // Buscamos el mayor valor individual de cantidad_cuotas entre las cuotas del item
        const itemMaxIndividual = item.cuotas?.reduce((max, c) => Math.max(max, Number(c.cantidad_cuotas) || 0), 0) || 0;
        if (itemMaxIndividual > maxCuotasEnUnItem) maxCuotasEnUnItem = itemMaxIndividual;
      });

      return { totalCuotas: sumatoriaCuotas, maxCuotasItem: maxCuotasEnUnItem };
    };

    const patentesStats = getProductStats(patentesItems);
    const tgiUrbanoStats = getProductStats(tgiUrbanosItems);
    const tgiRuralStats = getProductStats(tgiRuralesItems);

    const totalDeuda = [
      ...patentesItems.flatMap(p => p.cuotas || []),
      ...tgiUrbanosItems.flatMap(p => p.cuotas || []),
      ...tgiRuralesItems.flatMap(p => p.cuotas || []),
    ].reduce((acc, c) => acc + Number(c.capital) + Number(c.intereses), 0);

    const lastGestion = persona.gestiones && persona.gestiones.length > 0
      ? [...persona.gestiones].sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0]
      : null;

    return {
      patentesStats,
      tgiUrbanoStats,
      tgiRuralStats,
      totalDeuda,
      lastGestion,
    };
  };

  return (
    <div className="relative space-y-4">
      {/* --- VISTA MOBILE (TARJETAS) --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {personas.map((persona) => {
          const stats = getPersonaStats(persona);
          return (
            <div
              key={persona.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 active:scale-95"
              onClick={() => onSelectPersona(persona)}
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="flex items-start">
                <div className="mr-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:rotate-6">
                  <User className="size-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="truncate text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {persona.apellidoNombre || `${persona.apellido}, ${persona.nombre}`}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{persona.tipoDoc || 'DNI'}</span>
                    <span className="text-sm font-mono font-medium">{persona.nroDoc}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-2 text-center">
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60">Deuda Total</p>
                      <p className="text-sm font-black text-destructive">{formatCurrency(stats.totalDeuda)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-2 text-center">
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60">Prod/Cuotas</p>
                      <p className="text-[10px] font-bold text-primary">
                        PAT: {stats.patentesStats.totalCuotas} | TGI-U: {stats.tgiUrbanoStats.totalCuotas} | TGI-R: {stats.tgiRuralStats.totalCuotas}
                      </p>
                    </div>
                  </div>

                  {stats.lastGestion && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                      <History className="size-3 text-amber-500" />
                      Ult. contacto: {formatDate(stats.lastGestion.fecha_hora)} ({stats.lastGestion.accion})
                    </div>
                  )}
                  {isSysAdminOrAdmin && (
                    <div className="mt-4 flex items-center justify-end">
                      <button
                        onClick={(e) => handleToggle(e, persona)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${persona.habilitado ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        title={persona.habilitado ? 'Deshabilitar' : 'Habilitar'}
                      >
                        <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${persona.habilitado ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="ml-2 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary group-hover:translate-x-1">
                  <ChevronRight className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- VISTA DESKTOP (TABLA) --- */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Grouped Header */}
            <tr className="bg-muted/50">
              <th colSpan={2}></th>
              <th colSpan={3} className="px-6 pt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center bg-primary/[0.08]">
                Cuotas adeudadas
              </th>
              <th colSpan={isSysAdminOrAdmin ? 3 : 2}></th>
            </tr>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Persona</th>
              <th className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground text-left">Deuda</th>
              <th className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center bg-primary/[0.08]">Patentes</th>
              <th className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center bg-primary/[0.08]">TGI Urbano</th>
              <th className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center bg-primary/[0.08]">TGI Rural</th>
              <th className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Último Contacto</th>
              {isSysAdminOrAdmin && (
                <th className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Habilitado</th>
              )}
              <th className="px-6 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {personas.map((persona) => {
              const stats = getPersonaStats(persona);

              const ProductCell = ({ productStats }: { productStats: { totalCuotas: number, maxCuotasItem: number } }) => (
                <td className="px-4 py-4 text-center">
                  <div className={`flex flex-col items-center justify-center p-1.5 rounded-xl border ${productStats.totalCuotas > 0 ? 'bg-primary/[0.03] border-primary/20' : 'bg-muted/30 border-transparent opacity-40'}`}>
                    <span className={`text-sm font-black ${productStats.totalCuotas > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {productStats.totalCuotas}
                    </span>
                    {productStats.totalCuotas > 0 && (
                      <span className="text-[9px] font-bold text-muted-foreground tracking-tighter uppercase">
                        Máx: {productStats.maxCuotasItem}
                      </span>
                    )}
                  </div>
                </td>
              );

              return (
                <tr
                  key={persona.id}
                  className="group cursor-pointer transition-colors hover:bg-primary/[0.02]"
                  onClick={() => onSelectPersona(persona)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-3 transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <User className="size-5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {persona.apellidoNombre || `${persona.apellido}, ${persona.nombre}`}
                        </div>
                        <div className="text-[12px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          {persona.tipoDoc || 'DNI'} {persona.nroDoc}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-destructive group-hover:scale-105 transition-transform origin-right">
                      {formatCurrency(stats.totalDeuda)}
                    </div>
                  </td>

                  <ProductCell productStats={stats.patentesStats} />
                  <ProductCell productStats={stats.tgiUrbanoStats} />
                  <ProductCell productStats={stats.tgiRuralStats} />

                  <td className="px-6 py-4">
                    {stats.lastGestion ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <History className="size-3 text-amber-500" />
                          {stats.lastGestion.accion}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-4.5">
                          {formatDate(stats.lastGestion.fecha_hora)} — {stats.lastGestion.contacto}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Sin contacto</span>
                    )}
                  </td>
                  {isSysAdminOrAdmin && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => handleToggle(e, persona)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${persona.habilitado ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        title={persona.habilitado ? 'Deshabilitar' : 'Habilitar'}
                      >
                        <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${persona.habilitado ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary group-hover:translate-x-1">
                      <ChevronRight className="size-5" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
            <Loader2 className="size-4 animate-spin text-primary" />
            Actualizando grilla...
          </div>
        </div>
      )}
    </div>
  );
}
