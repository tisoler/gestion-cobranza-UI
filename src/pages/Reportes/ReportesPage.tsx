import { useState } from 'react';
import { ArrowLeft, BarChart3, FileText, LayoutDashboard, PieChart, Table } from 'lucide-react';
import { EntidadSelector } from '../../components/EntidadSelector';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../../lib/api';
import type { Entidad } from '../../types';

import { ConsolidadoTab } from './ConsolidadoTab';
import { DetalleTab } from './DetalleTab';
import { ResumenTab } from './ResumenTab';
import { EjecutivoTab } from './EjecutivoTab';
import { OperativoTab } from './OperativoTab';

export default function ReportesPage() {
  const { user } = useAuth();
  const [entidadOverride, setEntidadOverride] = useState<number | null>(null);

  const { data: entidades, isLoading: entidadesLoading } = useSWR<Entidad[]>(
    '/entidades',
    fetcher,
    { revalidateOnFocus: false }
  );

  const selectedEntidadId = (() => {
    if (!entidades || entidades.length === 0) return null;
    const ids = new Set(entidades.map((e) => e.id));
    if (entidadOverride != null && ids.has(entidadOverride)) return entidadOverride;
    const storedRaw = localStorage.getItem('currentEntidadId');
    const stored = storedRaw != null ? parseInt(storedRaw, 10) : NaN;
    if (Number.isFinite(stored) && ids.has(stored)) return stored;
    const fromUser = user?.idEntidad != null ? Number(user.idEntidad) : NaN;
    if (Number.isFinite(fromUser) && ids.has(fromUser)) return fromUser;
    return entidades[0].id;
  })();

  const { data: dashboardData, isLoading: dashboardLoading } = useSWR(
    selectedEntidadId ? `/reportes/dashboard?idEntidad=${selectedEntidadId}` : null,
    fetcher
  );

  const [activeTab, setActiveTab] = useState('consolidado');

  if (!user) return <Navigate to="/login" />;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {/* --- HEADER --- */}
        <div className="mb-10 flex flex-col gap-8 border-b border-border pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="pl-10 md:pl-0 inline-flex items-center gap-2 text-md font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="size-4" />
                Volver
              </Link>
              <div className="mt-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
                  <BarChart3 className="size-8 text-amber-500" />
                  Reportería
                </h1>
                <p className="text-muted-foreground mt-1 font-medium italic">Análisis y estado de deuda</p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <EntidadSelector
                entidades={entidades || []}
                isLoading={entidadesLoading}
                selectedId={selectedEntidadId}
                onChange={(id) => {
                  localStorage.setItem('currentEntidadId', String(id));
                  setEntidadOverride(id);
                }}
                className="w-full sm:min-w-[280px]"
              />
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex p-1 bg-muted/50 rounded-2xl border border-border min-w-max">
            <TabButton 
              active={activeTab === 'consolidado'} 
              onClick={() => setActiveTab('consolidado')} 
              icon={<Table className="size-4" />} 
              label="Consolidado" 
            />
            <TabButton 
              active={activeTab === 'detalle'} 
              onClick={() => setActiveTab('detalle')} 
              icon={<FileText className="size-4" />} 
              label="Detalle" 
            />
            <TabButton 
              active={activeTab === 'resumen'} 
              onClick={() => setActiveTab('resumen')} 
              icon={<BarChart3 className="size-4" />} 
              label="Resumen" 
            />
            <TabButton 
              active={activeTab === 'ejecutivo'} 
              onClick={() => setActiveTab('ejecutivo')} 
              icon={<PieChart className="size-4" />} 
              label="Dash. Ejecutivo" 
            />
            <TabButton 
              active={activeTab === 'operativo'} 
              onClick={() => setActiveTab('operativo')} 
              icon={<LayoutDashboard className="size-4" />} 
              label="Dash. Operativo" 
            />
          </div>
        </div>

        {/* --- CONTENT --- */}
        {dashboardLoading ? (
          <div className="flex justify-center py-20">
            <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : !dashboardData ? (
          <div className="py-20 text-center text-muted-foreground">No hay datos disponibles</div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {activeTab === 'consolidado' && <ConsolidadoTab data={dashboardData.consolidado} formatCurrency={formatCurrency} />}
            {activeTab === 'detalle' && <DetalleTab data={dashboardData.detalle} formatCurrency={formatCurrency} />}
            {activeTab === 'resumen' && <ResumenTab data={dashboardData.resumen} formatCurrency={formatCurrency} />}
            {activeTab === 'ejecutivo' && <EjecutivoTab data={dashboardData} formatCurrency={formatCurrency} />}
            {activeTab === 'operativo' && <OperativoTab data={dashboardData} formatCurrency={formatCurrency} />}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 px-6 text-sm font-black uppercase tracking-widest transition-all rounded-xl whitespace-nowrap ${
        active 
          ? 'bg-background text-amber-600 shadow-lg ring-1 ring-border' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon} {label}
    </button>
  );
}
