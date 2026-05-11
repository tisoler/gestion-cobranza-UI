import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, ArrowLeft, Loader2, Import, AlertCircle, UserX, UserCheck, ChevronDown, Car } from 'lucide-react';
import { EntidadSelector } from '../components/EntidadSelector';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import useSWR from 'swr';
import api, { fetcher } from '../lib/api';
import type { Entidad } from '../types';

const CAMPOS_PERSONA = [
  { key: 'tipo_doc', label: 'Tipo Doc.' },
  { key: 'nro_doc', label: 'Nro Doc.' },
  { key: 'cuit', label: 'CUIT' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'calle_domicilio', label: 'Calle' },
  { key: 'numero_domicilio', label: 'Numero' },
  { key: 'piso_domicilio', label: 'Piso' },
  { key: 'depto_domicilio', label: 'Depto' },
  { key: 'localidad', label: 'Localidad' },
  { key: 'provincia', label: 'Provincia' },
  { key: 'telefono', label: 'Telefono' },
  { key: 'email', label: 'Email' },
];

const CAMPOS_PATENTE = [
  { key: 'numero_patente', label: 'Dominio/Patente' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'tipo_doc', label: 'Tipo Doc.' },
  { key: 'nro_doc', label: 'Nro Doc.' },
  { key: 'cuit', label: 'CUIT' },
  { key: 'domicilio', label: 'Domicilio' },
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'tipo', label: 'Tipo (Auto, Camion, etc)' },
  { key: 'capital', label: 'Capital' },
  { key: 'intereses', label: 'Intereses' },
  { key: 'cantidad_cuotas', label: 'Cant. Cuotas' },
  { key: 'tramo', label: 'Tramo' },
];

const LETRAS_COLUMNAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type ColumnMapping = Record<string, string>;

type PreviewResult = {
  headers: string[];
  totalFilas: number;
  nuevas: Record<string, any>[];
  existentes: Record<string, any>[];
  sinPersona?: Record<string, any>[];
  cantidadNuevas: number;
  cantidadExistentes: number;
  cantidadSinPersona?: number;
};

// --- COMPONENTE DE VISTA PREVIA DE PATENTES ---
function PatentesPreview({ preview, onSelectPersona, currentPage, onPageChange, isNameUnified, isVehicleUnified }: {
  preview: PreviewResult;
  onSelectPersona: (rowIndex: number, personaId: number, nombre: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  isNameUnified: boolean;
  isVehicleUnified: boolean;
}) {
  const ITEMS_PER_PAGE = 20;

  const totalItems = preview.sinPersona?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = preview.sinPersona?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  return (
    <div className="space-y-6">
      {/* VEHÍCULOS SIN PERSONA (REQUIEREN ATENCION) */}
      <div className="overflow-x-auto border-t border-border">
        <div className="px-6 py-4 bg-destructive/5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-destructive animate-pulse" />
            <UserX className="size-5 text-destructive" />
            <h4 className="text-sm font-black uppercase tracking-widest text-destructive">
              Sin Persona Encontrada ({totalItems})
            </h4>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-md">
              Página {currentPage} de {totalPages}
            </p>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">#</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nombre en Planilla</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Referencia CSV</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vehículo</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vincular con Existente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedItems.map((row) => {
              const actualIndex = row.originalIndex; // Usamos el index original del CSV
              const nombreCSV = isNameUnified ? row.apellido_nombre : `${row.nombre || ''} ${row.apellido || ''}`;

              return (
                <tr key={actualIndex} className="bg-destructive/[0.01] hover:bg-destructive/[0.03] transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{actualIndex + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-black text-destructive/90 uppercase tracking-tight">
                      {nombreCSV || <span className="text-muted-foreground/40 italic">Sin datos</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.nro_doc ? (
                      <span className="text-[9px] font-bold border border-border px-1.5 py-0.5 rounded uppercase">DNI: {row.nro_doc}</span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground italic">Sin Doc.</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 uppercase text-[11px] font-bold">
                      <Car className="size-3 text-amber-600" />
                      {isVehicleUnified ? row.marca : `${row.marca || ''} ${row.modelo || ''}`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative max-w-sm">
                      <select
                        className="w-full h-9 pl-3 pr-8 text-xs bg-background border border-border rounded-lg appearance-none cursor-pointer hover:border-primary transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                        value={row.manualPersonaId || ""}
                        onChange={(e) => {
                          const option = e.target.options[e.target.selectedIndex];
                          onSelectPersona(actualIndex, Number(e.target.value), option.text);
                        }}
                      >
                        <option value="">-- {row.sugerencias?.length ? 'Sugerencias Inteligentes' : 'Sin coincidencias'} --</option>
                        {row.sugerencias?.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINACION */}
        {totalPages > 1 && (
          <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de {totalItems}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted disabled:opacity-30"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1 mx-2">
                <span className="text-xs font-bold text-primary">{currentPage}</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-muted-foreground">{totalPages}</span>
              </div>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImportacionesPage() {
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

  const [target, setTarget] = useState<string>('personas');
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ cantidadAgregadas: number; cantidadCuotasAgregadas?: number; mensaje?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [personLinks, setPersonLinks] = useState<Record<number, { id: number; nombre: string }>>({}); // Map: rowIndex -> persona data
  const [step, setStep] = useState<number>(1); // 1: Upload, 2: Mapping, 3: Personas, 4: Patentes

  const isSysAdmin = user?.roles?.includes('sys-admin');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Solo se permiten archivos CSV');
      return;
    }
    setFile(selectedFile);
    setPreview(null);
    setPreviewPage(1);
    setImportResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const firstLine = text.split('\n')[0];
      const headers = firstLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      setCsvHeaders(headers);

      // --- INFERENCIA DE MAPEO ---
      const newMapping: ColumnMapping = {};

      const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

      const camposActuales = target === 'personas' ? CAMPOS_PERSONA : CAMPOS_PATENTE;

      camposActuales.forEach(campo => {
        const index = headers.findIndex(h => {
          const hn = normalizar(h);
          const ln = normalizar(campo.label);
          const kn = normalizar(campo.key.replace('_', ' '));

          return hn === ln ||
            hn === kn ||
            hn.includes(ln) ||
            ln.includes(hn) ||
            (campo.key === 'nro_doc' && (hn.includes('dni') || hn.includes('doc'))) ||
            (campo.key === 'cuit' && hn.includes('cuit')) ||
            (campo.key === 'email' && hn.includes('mail')) ||
            (campo.key === 'numero_patente' && (hn.includes('dominio') || hn.includes('patente'))) ||
            (campo.key === 'cantidad_cuotas' && (hn.includes('cuota') || hn.includes('cant')));
        });

        if (index !== -1 && index < LETRAS_COLUMNAS.length) {
          newMapping[campo.key] = LETRAS_COLUMNAS[index];
        }
      });

      setColumnMapping(newMapping);
      setStep(2); // Avanzar al paso de mapeo automáticamente
    };
    reader.readAsText(selectedFile);
  };

  const handleColumnMappingChange = (campo: string, letra: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [campo]: letra,
    }));
    setPreview(null);
    setPreviewPage(1);
    setImportResult(null);
  };

  const hasMapping = Object.values(columnMapping).some(v => v !== '');
  const canPreview = file && hasMapping;

  const handlePreviewPersonas = async () => {
    if (!canPreview || !file) return;
    setLoading(true);
    setError(null);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target', target);
      formData.append('columnMapping', JSON.stringify(columnMapping));

      const response = await api.post('/importaciones/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (target === 'patentes') {
        const autoLinks: Record<number, { id: number; nombre: string }> = {};
        response.data.existentes?.forEach((row: any) => {
          if (row.idPersona) {
            autoLinks[row.originalIndex] = {
              id: row.idPersona,
              nombre: row.personaMatch?.apellidoNombre || `${row.personaMatch?.nombre || ''} ${row.personaMatch?.apellido || ''}`.trim()
            };
          }
        });
        setPersonLinks(autoLinks);
      }

      setPreview(response.data);
      setStep(3);
    } catch (err: unknown) {
      const mensaje = (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
      if (Array.isArray(mensaje)) {
        setError(mensaje.join(', '));
      } else if (typeof mensaje === 'string') {
        setError(mensaje);
      } else {
        setError('Error al generar la vista previa');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPatentes = () => {
    setStep(4);
    setPreviewPage(1);
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('target', target);
      formData.append('columnMapping', JSON.stringify(columnMapping));

      if (target === 'patentes') {
        const idMap: Record<number, number> = {};
        Object.entries(personLinks).forEach(([idx, data]) => {
          idMap[Number(idx)] = data.id;
        });
        formData.append('personLinks', JSON.stringify(idMap));
      }

      const url = target === 'patentes' ? '/importaciones/patentes' : '/importaciones/personas';

      const response = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImportResult(response.data);
      setStep(1);
    } catch (err: unknown) {
      const mensaje = (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
      if (Array.isArray(mensaje)) {
        setError(mensaje.join(', '));
      } else if (typeof mensaje === 'string') {
        setError(mensaje);
      } else {
        setError('Error al importar los datos');
      }
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvHeaders([]);
    setColumnMapping({});
    setPreview(null);
    setPreviewPage(1);
    setStep(1);
    setPersonLinks({});
    setImportResult(null);
    setError(null);
  };

  if (user && !user.roles?.includes('admin') && !user.roles?.includes('sys-admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
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
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-primary to-indigo-400 bg-clip-text text-transparent">
                  Importacion de Datos
                </h1>
                <p className="text-muted-foreground mt-1 font-medium italic">Carga masiva de datos desde archivos CSV.</p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {isSysAdmin ? (
                <EntidadSelector
                  entidades={entidades}
                  isLoading={entidadesLoading}
                  selectedId={selectedEntidadId}
                  onChange={(id) => {
                    localStorage.setItem('currentEntidadId', String(id));
                    setEntidadOverride(id);
                    handleReset();
                  }}
                  className="w-full sm:min-w-[280px]"
                />
              ) : (
                <div className="relative min-w-[200px] lg:max-w-[300px]">
                  <label className="absolute -top-[6px] left-3 z-10 bg-card px-1 text-[9px] font-black uppercase tracking-widest text-primary">
                    Entidad
                  </label>
                  <div className="h-11 w-full rounded-xl border border-border bg-card/50 px-4 text-sm font-semibold shadow-sm flex items-center">
                    {entidades?.find(e => e.id === selectedEntidadId)?.nombre || 'Cargando...'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- SELECTOR DE TARGET --- */}
        <div className="mb-8">
          <div className="relative flex-1 lg:max-w-lg">
            <div className="group relative">
              <label className="absolute -top-[6px] left-3 z-10 bg-background px-1 text-[9px] font-black uppercase tracking-widest text-primary">
                Destino de Importacion
              </label>
              <select
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  handleReset();
                }}
                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card/50 py-2 pl-4 pr-11 text-sm font-semibold shadow-sm transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="personas">Personas</option>
                <option value="patentes">Patentes</option>
                <option value="tgi_urbano" disabled>TGI Urbano (proximamente)</option>
                <option value="tgi_rural" disabled>TGI Rural (proximamente)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- ERROR --- */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* --- PASO 1: UPLOAD --- */}
        {step === 1 && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Paso 1: Subir archivo CSV</h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/50 hover:bg-primary/5">
                <Upload className="size-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-bold text-muted-foreground">
                    {file ? file.name : 'Hacer clic para seleccionar archivo CSV'}
                  </p>
                  {file && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* --- PASO 2: MAPEO --- */}
        {step === 2 && csvHeaders.length > 0 && (
          <div className="mb-8 space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Paso 2: Mapear columnas del CSV</h3>
              </div>

              <div className="mb-4 rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground">Columnas detectadas en el archivo:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {csvHeaders.map((h, i) => (
                    <span key={i} className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {LETRAS_COLUMNAS[i]}: {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-4">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  <strong>Nota:</strong> Si Nombre y Apellido tienen la misma letra de columna, se poblara el campo Apellido Nombre automáticamente. {target === 'patentes' ? 'Si Marca y Modelo tienen la misma letra de columna, se poblara el campo Marca Modelo automáticamente.' : ''}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(target === 'personas' ? CAMPOS_PERSONA : CAMPOS_PATENTE).map((campo) => {
                  const currentLetter = columnMapping[campo.key] || '';

                  return (
                    <div key={campo.key} className="space-y-1.5">
                      <div className="group relative">
                        <label className="absolute -top-[6px] left-3 z-10 bg-card px-1 text-[9px] font-black uppercase tracking-widest text-primary">
                          {campo.label}
                        </label>
                        <select
                          value={currentLetter}
                          onChange={(e) => handleColumnMappingChange(campo.key, e.target.value)}
                          className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-background/50 py-2 pl-4 pr-11 text-sm font-semibold shadow-sm transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">-- Sin asignar --</option>
                          {csvHeaders.map((h, i) => (
                            <option key={i} value={LETRAS_COLUMNAS[i]}>
                              {LETRAS_COLUMNAS[i]}: {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center bg-card border border-border p-4 rounded-2xl">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="size-4" />
                Volver
              </button>
              <button
                onClick={handlePreviewPersonas}
                disabled={!canPreview || loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-5" />
                )}
                {loading ? 'Generando vista previa...' : `Vista Previa ${target === 'patentes' ? 'Personas' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* --- PASO 3 Y 4: VISTA PREVIA Y CONSOLIDACION --- */}
        {preview && step >= 3 && (
          <div className="mb-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="mb-4 flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">
                  {target === 'personas' ? 'Paso 3: Revisar Personas' : step === 3 ? 'Paso 3: Consolidar Personas' : 'Paso 4: Revisar Patentes Inexistentes'}
                </h3>
              </div>

              {target === 'personas' ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total filas</p>
                    <p className="text-2xl font-black text-primary">{preview.totalFilas}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Personas nuevas</p>
                    <p className="text-2xl font-black text-emerald-600">{preview.cantidadNuevas}</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ya existentes</p>
                    <p className="text-2xl font-black text-amber-600">{preview.cantidadExistentes}</p>
                  </div>
                </div>
              ) : step === 3 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Listos para vincular</p>
                    <p className="text-2xl font-black text-emerald-600">{preview.cantidadExistentes}</p>
                  </div>
                  <div className="rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sin persona encontrada</p>
                    <p className="text-2xl font-black text-destructive">{preview.cantidadSinPersona}</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Vehículos a Procesar</p>
                    <p className="text-2xl font-black text-primary">
                      {[...preview.existentes, ...(preview.sinPersona?.filter(r => r.manualPersonaId) || [])].length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nuevas Patentes</p>
                    <p className="text-2xl font-black text-emerald-600">
                      {[...preview.existentes, ...(preview.sinPersona?.filter(r => r.manualPersonaId) || [])].length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ya en Sistema</p>
                    <p className="text-2xl font-black text-amber-600">0</p>
                  </div>
                </div>
              )}
            </div>

            {target === 'personas' ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">#</th>
                    {columnMapping.nombre && columnMapping.apellido && columnMapping.nombre === columnMapping.apellido ? (
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Apellido y Nombre</th>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nombre</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Apellido</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">DNI</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CUIT</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...preview.nuevas, ...preview.existentes].slice(0, 20).map((row, i) => {
                    const isNameUnified = columnMapping.nombre && columnMapping.apellido && columnMapping.nombre === columnMapping.apellido;
                    return (
                      <tr key={i} className="transition-colors hover:bg-primary/[0.02]">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                        {isNameUnified ? (
                          <td className="px-4 py-3 font-bold text-primary">
                            {String(row.apellido_nombre || '')}
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-medium">{String(row.nombre ?? '')}</td>
                            <td className="px-4 py-3 font-medium">{String(row.apellido ?? '')}</td>
                          </>
                        )}
                        <td className="px-4 py-3">{String(row.nro_doc ?? '')}</td>
                        <td className="px-4 py-3">{String(row.cuit ?? '')}</td>
                        <td className="px-4 py-3 text-center">
                          {row.existente ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600">
                              <XCircle className="size-3" /> Existente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              <CheckCircle className="size-3" /> Nueva
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : step === 3 ? (
              <PatentesPreview
                preview={preview}
                isNameUnified={columnMapping.nombre && columnMapping.apellido && columnMapping.nombre === columnMapping.apellido}
                isVehicleUnified={columnMapping.marca && columnMapping.modelo && columnMapping.marca === columnMapping.modelo}
                currentPage={previewPage}
                onPageChange={setPreviewPage}
                onSelectPersona={(index, personId, personName) => {
                  setPersonLinks(prev => {
                    const next = { ...prev };
                    if (personId) next[index] = { id: personId, nombre: personName };
                    else delete next[index];
                    return next;
                  });
                  setPreview(prev => {
                    if (!prev || !prev.sinPersona) return prev;
                    const newSinPersona = prev.sinPersona.map(r =>
                      r.originalIndex === index ? { ...r, manualPersonaId: personId } : r
                    );
                    return { ...prev, sinPersona: newSinPersona };
                  });
                }}
              />
            ) : (
              <div className="bg-background">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">#</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patente</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vehículo</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Propietario</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Cuotas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(() => {
                      const rowsWithPersona = [...preview.existentes, ...(preview.sinPersona?.filter(r => r.manualPersonaId) || [])];
                      const paginated = rowsWithPersona.slice((previewPage - 1) * 20, previewPage * 20);

                      return paginated.map((row, i) => {
                        return (
                          <tr key={i} className="hover:bg-primary/[0.02]">
                            <td className="px-4 py-3 text-xs text-muted-foreground">{(previewPage - 1) * 20 + i + 1}</td>
                            <td className="px-4 py-3 font-black text-primary uppercase">{row.numero_patente || <span className="text-[9px] text-muted-foreground italic">Sin dato</span>}</td>
                            <td className="px-4 py-3 text-xs uppercase">{row.marca} {row.modelo}</td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-xs">
                                {personLinks[row.originalIndex]?.nombre || '-'}
                              </p>
                              <p className="text-[9px] text-muted-foreground uppercase">
                                {row.personaMatch ? 'Automático' : <span className="text-amber-600">Vínculo Manual</span>}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-black text-emerald-600">{row.cantidad_cuotas || 0}</span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
                {/* Paginación con totales para el Paso 4 */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {(() => {
                      const rowsWithPersona = [...preview.existentes, ...(preview.sinPersona?.filter(r => r.manualPersonaId) || [])];
                      const total = rowsWithPersona.length;
                      const start = total === 0 ? 0 : (previewPage - 1) * 20 + 1;
                      const end = Math.min(previewPage * 20, total);
                      return `Mostrando ${start}-${end} de ${total}`;
                    })()}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewPage(p => p - 1)} disabled={previewPage === 1} className="px-3 py-1.5 rounded-lg border border-border bg-background text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted disabled:opacity-30">Anterior</button>
                    <div className="flex items-center gap-1 mx-2">
                      <span className="text-xs font-bold text-primary">{previewPage}</span>
                      <span className="text-xs text-muted-foreground">/</span>
                      <span className="text-xs text-muted-foreground">
                        {(() => {
                          const total = [...preview.existentes, ...(preview.sinPersona?.filter(r => r.manualPersonaId) || [])].length;
                          return Math.ceil(total / 20) || 1;
                        })()}
                      </span>
                    </div>
                    <button onClick={() => setPreviewPage(p => p + 1)} disabled={(() => {
                      const total = [...preview.existentes, ...(preview.sinPersona?.filter(r => r.manualPersonaId) || [])].length;
                      return previewPage >= (Math.ceil(total / 20) || 1);
                    })()} className="px-3 py-1.5 rounded-lg border border-border bg-background text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted disabled:opacity-30">Siguiente</button>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de Navegación del Wizard */}
            <div className="p-6 border-t border-border flex justify-between gap-4">
              <button
                onClick={() => {
                  if (step === 3) { setPreview(null); setStep(2); }
                  else if (step === 4) { setStep(3); setPreviewPage(1); }
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-muted/50 px-6 py-3 text-sm font-black text-muted-foreground transition-all hover:bg-muted active:scale-95"
              >
                <ArrowLeft className="size-4" />
                Volver
              </button>

              <div className="flex gap-4">
                {target === 'patentes' && step === 3 ? (
                  <button
                    onClick={handlePreviewPatentes}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95"
                  >
                    <FileSpreadsheet className="size-5" />
                    Vista Previa Patentes
                  </button>
                ) : (
                  <button
                    onClick={handleImport}
                    disabled={importing || (target === 'personas' ? (preview?.cantidadNuevas === 0) : step === 3)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Import className="size-5" />
                    )}
                    {importing ? 'Importando...' : 'Importar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- RESULTADO DE IMPORTACION --- */}
        {importResult && (
          <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-8 text-emerald-600" />
              <div>
                <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Importacion completada</h3>
                {target === 'patentes' ? (
                  <>
                    <p className="text-3xl font-black text-emerald-600 mt-1">
                      Cantidad de patentes agregadas: {importResult.cantidadAgregadas}
                    </p>
                    {importResult.cantidadCuotasAgregadas !== undefined && (
                      <p className="text-xl font-bold text-emerald-700/80 mt-1">
                        Cantidad de cuotas patentes agregadas: {importResult.cantidadCuotasAgregadas}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-3xl font-black text-emerald-600 mt-1">
                    Cantidad de personas agregadas: {importResult.cantidadAgregadas}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
