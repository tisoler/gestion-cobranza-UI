import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, Loader2, Import, UserCheck, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../../../lib/api';
import { useSWRConfig } from 'swr';

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

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LETRAS_COLUMNAS = [
  ...ALFABETO.split(''),
  ...ALFABETO.split('').flatMap(l1 => ALFABETO.split('').map(l2 => l1 + l2))
];

type ColumnMapping = Record<string, string>;

type PreviewResult = {
  headers: string[];
  totalFilas: number;
  nuevas: Record<string, any>[];
  existentes: Record<string, any>[];
  cantidadNuevas: number;
  cantidadExistentes: number;
};

export function ImportacionPersonas() {
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ cantidadAgregadas: number; mensaje?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const { mutate } = useSWRConfig();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Solo se permiten archivos CSV');
      return;
    }
    setFile(selectedFile);
    setPreview(null);
    setImportResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const firstLine = text.split('\n')[0];
      const headers = firstLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      setCsvHeaders(headers);

      const newMapping: ColumnMapping = {};
      const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

      CAMPOS_PERSONA.forEach(campo => {
        const index = headers.findIndex(h => {
          const hn = normalizar(h);
          const ln = normalizar(campo.label);
          const kn = normalizar(campo.key.replace('_', ' '));
          return hn === ln || hn === kn || hn.includes(ln) || (campo.key === 'nro_doc' && hn.includes('dni'));
        });
        if (index !== -1) newMapping[campo.key] = LETRAS_COLUMNAS[index];
      });
      setColumnMapping(newMapping);
      setStep(2);
    };
    reader.readAsText(selectedFile);
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target', 'personas');
      formData.append('columnMapping', JSON.stringify(columnMapping));
      const response = await api.post('/importaciones/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(response.data);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar vista previa');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target', 'personas');
      formData.append('columnMapping', JSON.stringify(columnMapping));
      const response = await api.post('/importaciones/personas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(response.data);
      setStep(1);
      mutate((key: unknown) => {
        const keyStr = Array.isArray(key) ? key[0] : key;
        return typeof keyStr === 'string' && (keyStr.startsWith('/personas') || keyStr.startsWith('/patentes'));
      }, undefined, { revalidate: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 p-12 hover:border-primary/40 hover:bg-primary/10 transition-all">
          <Upload className="mb-4 size-12 text-primary" />
          <h3 className="mb-2 text-xl font-bold">Subir archivo de Personas</h3>
          <p className="mb-6 text-sm text-muted-foreground">Seleccione un archivo .csv para comenzar el proceso.</p>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="file-upload-personas" />
          <label htmlFor="file-upload-personas" className="cursor-pointer rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg active:scale-95">
            Seleccionar Archivo
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <FileSpreadsheet className="size-5" /> Mapeo de Columnas
            </h3>
            <div className="p-4 rounded-xl bg-orange-100 border border-orange-400 my-4">
              <p className="text-xs text-orange-800 font-bold">Si nombre y apellido apuntan a la misma columna será considerada una sola como Nombre y Apellido.</p>
            </div>
          </div>
          <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAMPOS_PERSONA.map(campo => (
              <div key={campo.key} className="relative group">
                <label className="absolute -top-[6px] left-3 z-10 bg-card px-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">{campo.label}</label>
                <select
                  value={columnMapping[campo.key] || ''}
                  onChange={(e) => setColumnMapping(prev => ({ ...prev, [campo.key]: e.target.value }))}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="">-- No incluir --</option>
                  {csvHeaders.map((header, idx) => (
                    <option key={idx} value={LETRAS_COLUMNAS[idx]}>{LETRAS_COLUMNAS[idx]} - {header}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-4 size-4 text-muted-foreground pointer-events-none" />
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-border flex justify-end gap-4">
            <button onClick={() => setStep(1)} className="rounded-2xl border border-border px-6 py-3 text-sm font-bold">Atrás</button>
            <button onClick={handlePreview} disabled={loading} className="rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg">
              {loading ? <Loader2 className="size-5 animate-spin" /> : 'Vista Previa'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && preview && (
        <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="text-lg font-black uppercase tracking-widest text-primary">Vista Previa Personas Nuevas</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserCheck className="size-5 text-emerald-600" />
              <h4 className="font-bold text-emerald-700">Se detectaron {preview.cantidadNuevas} personas nuevas</h4>
            </div>
            <table className="w-full text-left text-sm border-t border-border">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground">Nombre / Razón Social</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground">Documento / CUIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.nuevas.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-bold">
                      {row.apellido_nombre || `${row.nombre || ''} ${row.apellido || ''}`.trim() || (
                        <span className="text-muted-foreground/40 italic">Sin nombre</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">{row.nro_doc || row.cuit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.cantidadNuevas > 10 && <p className="mt-4 text-xs text-muted-foreground italic">... y {preview.cantidadNuevas - 10} más.</p>}
          </div>
          <div className="p-6 border-t border-border flex justify-between">
            <button onClick={() => setStep(2)} className="rounded-2xl border border-border px-6 py-3 text-sm font-bold">Atrás</button>
            <button onClick={handleImport} disabled={importing} className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20">
              {importing ? <Loader2 className="size-5 animate-spin" /> : <Import className="size-5" />} Importar {preview.cantidadNuevas} Personas
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-center gap-3 text-destructive">
          <AlertCircle className="size-5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {importResult && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <CheckCircle className="size-10 text-emerald-600" />
            <div>
              <h3 className="text-xl font-bold text-emerald-700">Importación completada</h3>
              <p className="text-3xl font-black text-emerald-600 mt-2">Agregadas: {importResult.cantidadAgregadas}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
