import { useState } from 'react';
import { UserPlus, Loader2, X, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export type NuevaPersonaInitialData = {
  nombre?: string;
  apellido?: string;
  apellidoNombre?: string;
  tipoDoc?: string;
  nroDoc?: string;
  cuit?: string;
  domicilio?: string;
};

export type PersonaCreada = {
  id: number;
  nombre: string;
  apellido: string;
  apellidoNombre?: string;
};

interface NuevaPersonaModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (persona: PersonaCreada) => void;
  initialData?: NuevaPersonaInitialData;
}

type FormState = {
  nombre: string;
  apellido: string;
  tipoDoc: string;
  nroDoc: string;
  cuit: string;
  domicilio: string;
};

function splitApellidoNombre(value: string): { apellido: string; nombre: string } {
  const limpio = (value || '').trim();
  if (!limpio) return { apellido: '', nombre: '' };
  if (limpio.includes(',')) {
    const [apellido, ...rest] = limpio.split(',');
    return { apellido: apellido.trim(), nombre: rest.join(',').trim() };
  }
  const partes = limpio.split(/\s+/);
  if (partes.length === 1) return { apellido: partes[0], nombre: '' };
  // Heurística: en las planillas suele venir "APELLIDO NOMBRE"
  return { apellido: partes[0], nombre: partes.slice(1).join(' ') };
}

function buildInitialForm(initialData?: NuevaPersonaInitialData): FormState {
  if (!initialData) {
    return { nombre: '', apellido: '', tipoDoc: 'DNI', nroDoc: '', cuit: '', domicilio: '' };
  }

  let nombre = (initialData.nombre || '').trim();
  let apellido = (initialData.apellido || '').trim();

  if (!nombre && !apellido && initialData.apellidoNombre) {
    const partido = splitApellidoNombre(initialData.apellidoNombre);
    nombre = partido.nombre;
    apellido = partido.apellido;
  }

  return {
    nombre,
    apellido,
    tipoDoc: (initialData.tipoDoc || 'DNI').trim() || 'DNI',
    nroDoc: (initialData.nroDoc || '').trim(),
    cuit: (initialData.cuit || '').trim(),
    domicilio: (initialData.domicilio || '').trim(),
  };
}

export function NuevaPersonaModal({ open, onClose, onCreated, initialData }: NuevaPersonaModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(initialData));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInitialData, setLastInitialData] = useState(initialData);

  // Si el modal se reabre con datos de otra fila, reiniciar el formulario
  // (ajuste de estado durante el render, patrón recomendado por React).
  if (initialData !== lastInitialData) {
    setLastInitialData(initialData);
    setForm(buildInitialForm(initialData));
    setError(null);
    setSaving(false);
  }

  if (!open) return null;

  const setField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    if (!nombre && !apellido) {
      setError('Ingrese al menos un nombre o un apellido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, string> = {
        nombre: nombre || '-',
        apellido: apellido || '-',
        // Se construye siempre desde los valores actuales del formulario
        // (misma convención que el importador: "Apellido, Nombre")
        apellidoNombre: `${apellido}, ${nombre}`.replace(/^, |, $/, '').trim(),
      };
      if (form.tipoDoc.trim()) payload.tipoDoc = form.tipoDoc.trim();
      if (form.nroDoc.trim()) payload.nroDoc = form.nroDoc.trim();
      if (form.cuit.trim()) payload.cuit = form.cuit.trim();
      if (form.domicilio.trim()) payload.calleDomicilio = form.domicilio.trim();

      const response = await api.post('/personas', payload);
      onCreated(response.data);
      onClose();
    } catch (err) {
      const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : msg || 'Error al crear la persona');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold shadow-sm transition-all hover:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none';
  const labelClass =
    'absolute -top-[6px] left-3 z-10 bg-card px-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <UserPlus className="size-5" /> Nueva Persona
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid gap-5 grid-cols-2">
            <div className="relative group">
              <label className={labelClass}>Apellido *</label>
              <input autoFocus className={inputClass} value={form.apellido} onChange={setField('apellido')} placeholder="Apellido" />
            </div>
            <div className="relative group">
              <label className={labelClass}>Nombre *</label>
              <input className={inputClass} value={form.nombre} onChange={setField('nombre')} placeholder="Nombre" />
            </div>
            <div className="relative group">
              <label className={labelClass}>Tipo Doc.</label>
              <select className={`${inputClass} appearance-none cursor-pointer`} value={form.tipoDoc} onChange={setField('tipoDoc')}>
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="LC">LC</option>
                <option value="LE">LE</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </div>
            <div className="relative group">
              <label className={labelClass}>Nro Doc.</label>
              <input className={inputClass} value={form.nroDoc} onChange={setField('nroDoc')} placeholder="Número de documento" />
            </div>
            <div className="relative group">
              <label className={labelClass}>CUIT</label>
              <input className={inputClass} value={form.cuit} onChange={setField('cuit')} placeholder="CUIT" />
            </div>
            <div className="relative group">
              <label className={labelClass}>Domicilio</label>
              <input className={inputClass} value={form.domicilio} onChange={setField('domicilio')} placeholder="Domicilio" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border px-6 py-2.5 text-sm font-bold transition-all hover:bg-muted cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Crear y vincular
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
