export function ConsolidadoTab({ data, formatCurrency }: { data: any[], formatCurrency: (v: number) => string }) {
  if (!data || data.length === 0) return <div>No hay datos.</div>;

  const totalCapital = data.reduce((acc, item) => acc + item.capital, 0);
  const totalInteres = data.reduce((acc, item) => acc + item.interes, 0);
  const totalGeneral = data.reduce((acc, item) => acc + item.total, 0);
  const totalCantidad = data.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/30">
        <h3 className="text-lg font-black uppercase tracking-widest text-primary">Deuda Consolidada por Producto</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Producto</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Cant. Ítems</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Capital</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Intereses</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Total Adeudado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-black uppercase text-foreground">{row.producto}</td>
                <td className="px-6 py-4 font-bold text-center text-muted-foreground">{row.cantidad}</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(row.capital)}</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(row.interes)}</td>
                <td className="px-6 py-4 text-right font-black text-primary">{formatCurrency(row.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-primary/5">
            <tr>
              <td className="px-6 py-4 font-black uppercase text-primary">Totales Generales</td>
              <td className="px-6 py-4 font-black text-center text-primary">{totalCantidad}</td>
              <td className="px-6 py-4 text-right font-black text-primary">{formatCurrency(totalCapital)}</td>
              <td className="px-6 py-4 text-right font-black text-primary">{formatCurrency(totalInteres)}</td>
              <td className="px-6 py-4 text-right font-black text-primary text-lg">{formatCurrency(totalGeneral)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
