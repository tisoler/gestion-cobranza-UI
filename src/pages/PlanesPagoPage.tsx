import { useState, useEffect } from 'react';
import { Plus, Calculator, X, Loader2, ArrowLeft, Edit2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { usePlanesPago } from '../hooks/use-planes-pago';
import api from '../lib/api';
import type { PlanPago } from '../types';

export default function PlanesPagoPage() {
  const { user } = useAuth();
  const [filterProducto, setFilterProducto] = useState<string>('');
  const { planes, isLoading, mutate } = usePlanesPago(filterProducto);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanPago | null>(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    nombre: '',
    producto: 'tgi_urbano',
    numeroCuotas: 12,
    descuentoIntereses: 0.8,
    porcentajeAnticipo: 0.3,
    activo: true
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
        activo: editingPlan.activo
      });
      setIsAdding(true);
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
      handleCancel();
    } catch (err) {
      console.error('Error saving plan', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingPlan(null);
    setFormData(initialForm);
  };

  if (user && !user.roles?.includes('admin') && !user.roles?.includes('sys-admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6 invisible md:visible">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver al Panel
          </Link>
        </div>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-primary to-indigo-400 bg-clip-text text-transparent">
              Configuración de Planes
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Define las facilidades de financiación para cada producto.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="size-5" /> Nuevo Plan
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80">Criterio</p>
            <p className="text-sm text-muted-foreground">
              Filtra los planes de pago por tipo de producto.
            </p>
          </div>
          <div className="relative w-full min-w-0 md:max-w-md">
            <select
              value={filterProducto}
              onChange={(e) => setFilterProducto(e.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-background py-2 pl-4 pr-11 text-sm font-semibold shadow-sm ring-offset-background transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="">Todos los productos</option>
              <option value="tgi_urbano">TGI Urbano</option>
              <option value="tgi_rural">TGI Rural</option>
              <option value="patente">Patentes</option>
            </select>
          </div>
        </div>

        {isAdding && (
          <div className="mb-10 rounded-[2.5rem] border border-border bg-background/50 shadow-xl backdrop-blur-sm p-8 animate-in slide-in-from-top-10 duration-500">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-black text-foreground">
                {editingPlan ? 'Editar Plan de Pago' : 'Configurar Nuevo Plan'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Nombre del Plan</label>
                <input
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="Ej: Plan Verano 12 cuotas"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Producto</label>
                <select
                  value={formData.producto}
                  onChange={e => setFormData({ ...formData, producto: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10"
                >
                  <option value="tgi_urbano">TGI Urbano</option>
                  <option value="tgi_rural">TGI Rural</option>
                  <option value="patente">Patente</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Número de cuotas</label>
                <input
                  type="number"
                  required
                  value={formData.numeroCuotas}
                  onChange={e => setFormData({ ...formData, numeroCuotas: +e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Descuento Intereses (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  max="1"
                  min="0"
                  required
                  value={formData.descuentoIntereses}
                  onChange={e => setFormData({ ...formData, descuentoIntereses: +e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">Porcentaje Anticipo (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  max="1"
                  min="0"
                  required
                  value={formData.porcentajeAnticipo}
                  onChange={e => setFormData({ ...formData, porcentajeAnticipo: +e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="flex items-end gap-3 lg:col-span-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-40 active:scale-95"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {editingPlan ? 'Actualizar Plan' : 'Guardar Nuevo Plan'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center rounded-xl border border-border bg-muted p-3 text-muted-foreground hover:bg-muted/80 transition-all active:scale-90"
                >
                  <X className="size-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="size-10 animate-spin text-indigo-600 mb-4" />
              <p className="font-bold text-muted-foreground">Cargando planes de pago...</p>
            </div>
          ) : planes.length === 0 ? (
            <div className="col-span-full text-center py-20 rounded-[2.5rem] border border-dashed border-border bg-card font-bold text-muted-foreground">
              No se encontraron planes para este criterio.
            </div>
          ) : (
            [...planes]
              .sort((a, b) => a.producto.localeCompare(b.producto) || a.numeroCuotas - b.numeroCuotas)
              .map(plan => (
                <div
                  key={plan.id}
                  className={`group relative overflow-hidden rounded-[2rem] border bg-background/50 p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/30 cursor-pointer 
                    ${!plan.activo ? 'opacity-50 grayscale' : 'border-border'}`}
                  onClick={() => setEditingPlan(plan)}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <Calculator className="size-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlan(plan);
                        }}
                        className="rounded-full p-2 bg-muted/60 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                        title="Editar plan"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleToggle(e, plan)}
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer ${plan.activo ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-neutral-300/10 text-neutral-300 hover:bg-neutral-300/20'}`}
                      >
                        {plan.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-lg font-black text-foreground mb-1.5 truncate transition-colors group-hover:text-primary">{plan.nombre}</h4>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="rounded-lg bg-muted/80 px-2.5 py-1 text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest border border-border/50">
                      {plan.producto.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Cuotas</p>
                      <p className="text-base font-black text-primary">{plan.numeroCuotas}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Dto. Int.</p>
                      <p className="text-base font-black text-amber-500">{plan.descuentoIntereses * 100}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Anticipo</p>
                      <p className="text-base font-black text-rose-500">{plan.porcentajeAnticipo * 100}%</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
