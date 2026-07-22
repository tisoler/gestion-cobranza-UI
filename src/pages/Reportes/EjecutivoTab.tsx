import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export function EjecutivoTab({ data, formatCurrency }: { data: any, formatCurrency: (v: number) => string }) {
  const chartData = data.consolidado.map((item: any) => ({
    name: item.producto,
    value: item.total
  }));

  const totalGeneral = chartData.reduce((acc: number, item: any) => acc + item.value, 0);

  const formatTooltip = (value: any) => [formatCurrency(Number(value) || 0), 'Total Deuda'];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card shadow-lg p-6 flex flex-col justify-center text-center">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">Total Deuda Global</p>
          <p className="text-4xl font-black text-primary">{formatCurrency(totalGeneral)}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card shadow-lg p-6 flex flex-col justify-center text-center">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">Total Titulares (Top 100)</p>
          <p className="text-4xl font-black text-amber-600">{data.resumen.length}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card shadow-lg p-6 flex flex-col justify-center text-center">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">Productos Activos</p>
          <p className="text-4xl font-black text-emerald-600">{data.operativo.totalProductos}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card shadow-xl p-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-6">Composición de Deuda</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={formatTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-xl p-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-6">Top 5 Deudores</h3>
          <div className="space-y-4">
            {data.resumen.slice(0, 5).map((row: any, idx: number) => (
              <div key={row.personaId} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="size-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-black text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{row.nombre}</p>
                    <p className="text-xs text-muted-foreground">{row.cuit || 'Sin documento'}</p>
                  </div>
                </div>
                <p className="font-black text-destructive">{formatCurrency(row.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
