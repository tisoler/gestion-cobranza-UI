import { Activity, Users, FileText } from 'lucide-react';

export function OperativoTab({ data }: { data: any, formatCurrency: (v: number) => string }) {
  const { operativo } = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card shadow-lg p-6 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Personas c/ Deuda</p>
            <p className="text-3xl font-black text-foreground">{operativo.totalPersonasConDeuda}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card shadow-lg p-6 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileText className="size-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Productos c/ Deuda</p>
            <p className="text-3xl font-black text-foreground">{operativo.totalProductos}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card shadow-lg p-6 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Activity className="size-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Gestiones Recientes</p>
            <p className="text-3xl font-black text-foreground">{operativo.gestionesRecientes.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Activity className="size-5" /> Últimas Gestiones Realizadas
          </h3>
        </div>
        <div className="overflow-x-auto">
          {operativo.gestionesRecientes.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No hay gestiones recientes.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fecha</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Persona</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Acción</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {operativo.gestionesRecientes.map((gestion: any) => (
                  <tr key={gestion.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{formatDate(gestion.fecha)}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{gestion.persona}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-black uppercase text-primary">
                        {gestion.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{gestion.contacto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
