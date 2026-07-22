import { useState } from 'react';
import { Search } from 'lucide-react';

export function ResumenTab({ data, formatCurrency }: { data: any[], formatCurrency: (v: number) => string }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.cuit && item.cuit.includes(searchTerm))
  );

  return (
    <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-black uppercase tracking-widest text-primary">Resumen de Deuda por Titular (Top 100)</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar titular o doc/cuit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left text-sm relative">
          <thead className="bg-muted/30 sticky top-0 backdrop-blur-md z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-12">#</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Titular</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Doc / CUIT</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Capital</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Intereses</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Total Adeudado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.map((row, idx) => (
              <tr key={row.personaId} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                <td className="px-6 py-4 font-black text-foreground">{row.nombre}</td>
                <td className="px-6 py-4 font-bold text-muted-foreground">{row.cuit || '-'}</td>
                <td className="px-6 py-4 text-right text-xs font-medium">{formatCurrency(row.capital)}</td>
                <td className="px-6 py-4 text-right text-xs font-medium">{formatCurrency(row.interes)}</td>
                <td className="px-6 py-4 text-right font-black text-destructive">{formatCurrency(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
