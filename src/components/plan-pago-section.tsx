import { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { usePlanesPago } from '../hooks/use-planes-pago';
import type { Cuota } from '../types';

interface PlanPagoSectionProps {
  producto: 'tgi_urbano' | 'tgi_rural' | 'patente';
  cuotas?: Cuota[];
}

export function PlanPagoSection({ producto, cuotas }: PlanPagoSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { planes, isLoading } = usePlanesPago(producto);

  if (!cuotas || cuotas.length === 0) return null;

  const totalCapital = cuotas.reduce((acc, c) => acc + Number(c.capital), 0);
  const totalIntereses = cuotas.reduce((acc, c) => acc + Number(c.intereses), 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const activePlanes = planes.filter(p => p.activo);

  return (
    <div className="mt-4 border-t border-border/50 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between group/btn text-primary hover:text-primary/80 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/70">
          <Calculator className="size-3" />
          Escenarios de Financiación
        </div>
        <div className="flex size-6 items-center justify-center rounded-full bg-primary/5 text-primary group-hover/btn:bg-primary/10 transition-colors">
          {isOpen ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {isLoading ? (
            <p className="text-[10px] font-bold text-muted-foreground text-center animate-pulse">Cargando planes...</p>
          ) : activePlanes.length === 0 ? (
            <p className="text-[12px] font-bold text-muted-foreground text-center italic">No hay planes activos para este producto</p>
          ) : (
            activePlanes.sort((a, b) => a.numeroCuotas - b.numeroCuotas).map((plan) => {
              const tc = totalCapital + (totalIntereses * (1 - plan.descuentoIntereses));
              const anticipo = plan.porcentajeAnticipo * tc;
              const valorCuota = ((1 - plan.porcentajeAnticipo) * tc) / (plan.numeroCuotas > 0 ? plan.numeroCuotas : 1);

              return (
                <div key={plan.id} className="rounded-xl border border-border bg-background/50 p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-foreground uppercase tracking-tight">{plan.nombre}</span>
                      <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                        -{plan.descuentoIntereses * 100}% INT
                      </span>
                    </div>
                    <span className="text-[10px] font-black bg-muted px-2 py-1 rounded text-muted-foreground uppercase tracking-widest border border-border/50">
                      {plan.numeroCuotas} cuotas
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border/40">
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">Total Final</p>
                      <p className="text-[14px] font-black text-foreground">{formatCurrency(tc)}</p>
                    </div>
                    {plan.porcentajeAnticipo > 0 && (
                      <div className="bg-muted/30 p-2.5 rounded-lg border border-border/40">
                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">Anticipo ({plan.porcentajeAnticipo * 100}%)</p>
                        <p className="text-[14px] font-black text-destructive">{formatCurrency(anticipo)}</p>
                      </div>
                    )}
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 col-span-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black uppercase text-primary/60 mb-1">Valor de Cuota</p>
                          <p className="text-[18px] font-black text-primary leading-none">{formatCurrency(valorCuota)}</p>
                        </div>
                        <div className="text-[10px] font-black text-primary/40 uppercase">Aprox.</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
