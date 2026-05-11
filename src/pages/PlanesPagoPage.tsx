import { useState, useEffect } from 'react';
import { Plus, Calculator, X, Loader2, ArrowLeft, Edit2, Save } from 'lucide-react';
import { EntidadSelector } from '../components/EntidadSelector';
import useSWR from 'swr';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { usePlanesPago } from '../hooks/use-planes-pago';
import api, { fetcher } from '../lib/api';
import type { PlanPago, Entidad } from '../types';

export default function PlanesPagoPage() {
  const { user } = useAuth();
  const [filterProducto, setFilterProducto] = useState<string>('');
  const { planes, isLoading, mutate } = usePlanesPago(filterProducto);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanPago | null>(null);
  const [saving, setSaving] = useState(false);
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

  const initialForm = {
    nombre: '',
    producto: 'tgi_urbano',
    numeroCuotas: 12,
    descuentoIntereses: 0.8,
    porcentajeAnticipo: 0.3,
    activo: true,
    idEntidad: selectedEntidadId || undefined
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        nombre: editingPlan.nombre,
        producto: editingPlan.producto,
        numeroCuotas: editingPlan.numeroCuotas,
        descuentoIntereses: editingPlan.descuentoIntereses,
        porcentajeAnticipo: editingPlan.porcentajeAnticipo,
        activo: editingPlan.activo,
        idEntidad: editingPlan.idEntidad
      });
      setIsModalOpen(true);
    }
  }, [editingPlan]);

  const handleToggle = async (e: React.MouseEvent, plan: PlanPago) => {
    e.stopPropagation();

    // Optimistic UI
    const updatedPlanes = planes.map(p =>
      p.id === plan.id ? { ...p, activo: !p.activo } : p
    );

    mutate(updatedPlanes, false);

    try {
      await api.patch(`/planes-pago/${plan.id}/toggle`);
    } catch (err) {
      console.error('Error toggling plan', err);
      mutate(); // Revert on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        await api.patch(`/planes-pago/${editingPlan.id}`, formData);
      } else {
        await api.post('/planes-pago', formData);
      }
      mutate();
      closeModal();
    } catch (err) {
      console.error('Error saving plan', err);
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData({ ...initialForm, idEntidad: selectedEntidadId || undefined });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData(initialForm);
  };

  if (user && !user.roles?.includes('admin') && !user.roles?.includes('sys-admin')) {
    return <Navigate to="/" replace />;
  }

  const sortedPlanes = [...planes].sort((a, b) =>
    a.producto.localeCompare(b.producto) || a.numeroCuotas - b.numeroCuotas
  );

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">

        {/* --- HEADER SUPERIOR --- */}
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
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-primary to-indigo-400 bg-clip-text text-transparent">
                  Configuración de Planes
                </h1>
                <p className="text-muted-foreground mt-1 font-medium italic">Define las facilidades para la entidad activa.</p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <EntidadSelector
                entidades={entidades}
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

        {/* --- BARRA DE ACCIONES (Filtro + Agregar) --- */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 lg:max-w-lg">
            <div className="group relative">
              <label className="absolute -top-[6px] left-3 z-10 bg-background px-1 text-[9px] font-black uppercase tracking-widest text-primary">
                Filtrar por Producto
              </label>
              <select
                value={filterProducto}
                onChange={(e) => setFilterProducto(e.target.value)}
                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card/50 py-2 pl-4 pr-11 text-sm font-semibold shadow-sm transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todos los productos</option>
                <option value="tgi_urbano">TGI Urbano</option>
                <option value="tgi_rural">TGI Rural</option>
                <option value="patente">Patentes</option>
              </select>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="size-5" /> Nuevo Plan
          </button>
        </div>

        {/* --- MODAL DE AGREGAR/EDITAR --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 sm:items-center animate-in fade-in duration-300">
            <div className="fixed inset-0" onClick={closeModal} />

            <div className="relative my-auto w-full max-w-2xl rounded-[2rem] border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-300 md:p-10 sm:rounded-[2.5rem]">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors md:right-6 md:top-6"
              >
                <X className="size-5 md:size-6" />
              </button>

              <div className="mb-8 border-b border-border pb-6">
                <h3 className="text-3xl font-black text-foreground">
                  {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
                </h3>
                <p className="mt-2 text-muted-foreground font-medium">Configura los parámetros de financiación del plan.</p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Nombre del Plan</label>
                  <input
                    required
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                    placeholder="Ej: Plan Verano 12 cuotas"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Producto</label>
                  <select
                    value={formData.producto}
                    onChange={e => setFormData({ ...formData, producto: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10 appearance-none"
                  >
                    <option value="tgi_urbano">TGI Urbano</option>
                    <option value="tgi_rural">TGI Rural</option>
                    <option value="patente">Patente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Número de cuotas</label>
                  <input
                    type="number"
                    required
                    value={formData.numeroCuotas}
                    onChange={e => setFormData({ ...formData, numeroCuotas: +e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Descuento Intereses (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    max="1"
                    min="0"
                    required
                    value={formData.descuentoIntereses}
                    onChange={e => setFormData({ ...formData, descuentoIntereses: +e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Porcentaje Anticipo (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    max="1"
                    min="0"
                    required
                    value={formData.porcentajeAnticipo}
                    onChange={e => setFormData({ ...formData, porcentajeAnticipo: +e.target.value })}
                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* Selección de Entidad (solo sys-admin puede cambiarla manualmente) */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Entidad Asignada</label>
                  <select
                    value={formData.idEntidad ?? ''}
                    disabled={!user?.roles?.includes('sys-admin')}
                    onChange={e => setFormData({ ...formData, idEntidad: parseInt(e.target.value, 10) })}
                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10 appearance-none disabled:opacity-50"
                  >
                    {entidades?.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex gap-4 md:col-span-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-2xl border border-border bg-muted/50 py-4 text-sm font-black text-muted-foreground transition-all hover:bg-muted active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:opacity-40 active:scale-95"
                  >
                    {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                    {editingPlan ? 'Actualizar Cambios' : 'Crear Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- VISTA MOBILE --- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="size-10 animate-spin text-primary mb-4" />
              <p className="font-bold text-muted-foreground">Cargando planes...</p>
            </div>
          ) : sortedPlanes.length === 0 ? (
            <div className="col-span-full text-center py-20 rounded-[2.5rem] border border-dashed border-border bg-card font-bold text-muted-foreground">
              No se encontraron planes para esta entidad.
            </div>
          ) : sortedPlanes.map(plan => (
            <div
              key={plan.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-background/50 p-4 shadow-sm transition-all hover:border-primary/50 group-hover:shadow-md"
              onClick={() => setEditingPlan(plan)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className='flex justify-start items-center gap-3 text-xs w-full min-w-0'>
                  <div className="flex-shrink-0 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calculator className="size-5" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                    <h4 className="font-black text-[10px] text-muted-foreground/70 uppercase truncate w-full">{plan.producto.replace('_', ' ')}</h4>
                    <p className="text-[13px] text-foreground font-bold tracking-tight truncate w-full">
                      {plan.nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggle(e, plan)}
                  className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${plan.activo ? 'bg-emerald-500/10 text-emerald-600' : 'bg-neutral-300/30 text-neutral-500'}`}
                >
                  {plan.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-3">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase">Cuotas</p>
                  <p className="text-xs font-black text-primary">{plan.numeroCuotas}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase">Dto.</p>
                  <p className="text-xs font-black text-amber-500">{plan.descuentoIntereses * 100}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase">Antic.</p>
                  <p className="text-xs font-black text-rose-500">{plan.porcentajeAnticipo * 100}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- VISTA DESKTOP --- */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Producto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Plan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Cuotas</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Descuento</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Anticipo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Estado</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Loader2 className="mx-auto size-8 animate-spin text-primary mb-2" />
                    <span className="font-bold text-muted-foreground">Cargando planes...</span>
                  </td>
                </tr>
              ) : sortedPlanes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center font-bold text-muted-foreground">
                    No se encontraron planes para esta entidad.
                  </td>
                </tr>
              ) : sortedPlanes.map(plan => (
                <tr
                  key={plan.id}
                  className="group cursor-pointer transition-colors hover:bg-primary/[0.02]"
                  onClick={() => setEditingPlan(plan)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3 transition-all group-hover:bg-primary group-hover:text-white">
                        <Calculator className="size-5" />
                      </div>
                      <span className="rounded-lg bg-muted px-2 py-1 text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
                        {plan.producto.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {plan.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                      {plan.numeroCuotas}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-amber-500">
                      {plan.descuentoIntereses * 100}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-rose-500">
                      {plan.porcentajeAnticipo * 100}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => handleToggle(e, plan)}
                      className={`rounded-full cursor-pointer px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${plan.activo ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-neutral-300/30 text-neutral-500 hover:bg-neutral-300/60'}`}
                    >
                      {plan.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary">
                      <Edit2 className="size-4" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
