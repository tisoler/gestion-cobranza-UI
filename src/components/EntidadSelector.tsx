import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import type { Entidad } from '../types';

interface EntidadSelectorProps {
  entidades: Entidad[] | undefined;
  isLoading: boolean;
  selectedId: number | null;
  onChange: (id: number) => void;
  className?: string;
}

export function EntidadSelector({ entidades, isLoading, selectedId, onChange, className = "" }: EntidadSelectorProps) {
  return (
    <div className={`relative min-w-[200px] lg:max-w-[300px] ${className}`}>
      {/* Label "flotante" sobre el borde */}
      <label className="absolute -top-[6px] left-3 z-10 bg-card px-1 text-[9px] font-black uppercase tracking-widest text-primary">
        Entidad
      </label>

      {isLoading ? (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-3 text-[10px] text-muted-foreground">
          <Loader2 className="size-3 animate-spin text-primary" />
          Sincronizando...
        </div>
      ) : (
        <div className="relative group">
          <select
            aria-label="Seleccionar Entidad"
            value={selectedId ?? ''}
            onChange={(e) => {
              const id = parseInt(e.target.value, 10);
              if (Number.isFinite(id)) onChange(id);
            }}
            className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card pl-9 pr-9 text-[11px] font-bold uppercase tracking-wider text-foreground shadow-sm transition-all hover:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
          >
            {entidades?.map((en) => (
              <option key={en.id} value={en.id} className="bg-card text-foreground py-2">
                {en.nombre}
              </option>
            ))}
          </select>
          <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-hover:text-primary/60" />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-hover:text-primary/40" />

          {/* Sutil resplandor interno en hover */}
          <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 ring-1 ring-primary/20" />
        </div>
      )}
    </div>
  );
}
