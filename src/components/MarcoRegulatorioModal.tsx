import React from 'react';
import {
  X,
  Scale,
  BookOpen,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Database,
  AlertCircle
} from 'lucide-react';

interface MarcoRegulatorioModalProps {
  onClose: () => void;
}

export function MarcoRegulatorioModal({ onClose }: MarcoRegulatorioModalProps) {
  // Manejar cierre con ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-background shadow-2xl flex flex-col border border-border animate-in slide-in-from-bottom-10 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 md:size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/5">
              <Scale className="size-6 md:size-8" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                Marco Regulatorio
              </h2>
              <p className="text-xs md:text-sm font-medium text-muted-foreground mt-0.5">
                Normativa principal y restricciones de cobranza en Argentina
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-muted p-2 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-90"
            aria-label="Cerrar"
          >
            <X className="size-5 md:size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1">
          {/* Section 1: Normativa Principal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-4 md:size-5" />
              </div>
              <h3 className="text-base md:text-lg font-black tracking-tight uppercase text-primary/95">
                Normativa principal
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              La cobranza extrajudicial en Argentina está regida principalmente por:
            </p>
            
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                <span className="inline-block rounded-lg bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary mb-2">
                  Ley 24.240
                </span>
                <h4 className="text-sm font-bold text-foreground">Ley de Defensa del Consumidor</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Establece los derechos básicos del deudor consumidor y prohíbe prácticas abusivas o engañosas.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                <span className="inline-block rounded-lg bg-indigo-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                  Ley 26.994
                </span>
                <h4 className="text-sm font-bold text-foreground">Código Civil y Comercial de la Nación</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Regula las relaciones contractuales y las obligaciones de pago.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                <span className="inline-block rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                  Ley 25.326
                </span>
                <h4 className="text-sm font-bold text-foreground">Ley de Protección de Datos Personales</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Regula el tratamiento de datos de deudores en los procesos de cobranza.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                <span className="inline-block rounded-lg bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                  BCRA
                </span>
                <h4 className="text-sm font-bold text-foreground">Comunicaciones del BCRA</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Las circulares del Banco Central regulan específicamente las prácticas de cobranza de entidades financieras reguladas.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 md:col-span-2 transition-all hover:border-primary/20 hover:shadow-sm">
                <span className="inline-block rounded-lg bg-purple-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                  Secretaría de Comercio
                </span>
                <h4 className="text-sm font-bold text-foreground">Resoluciones de la Secretaría de Comercio</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Complementan la protección al consumidor en materia de cobros extrajudiciales.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Restricciones Específicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <AlertTriangle className="size-4 md:size-5" />
              </div>
              <h3 className="text-base md:text-lg font-black tracking-tight uppercase text-amber-600">
                Restricciones específicas en Argentina
              </h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Horario de contacto */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition-all hover:border-amber-500/20 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <Clock className="size-4 shrink-0" />
                    <h4 className="text-sm font-bold text-foreground">Horario de contacto</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Las comunicaciones de cobranza deben realizarse en días y horarios hábiles (lunes a viernes 8am-9pm; sábados 9am-2pm en muchas jurisdicciones). Fuera de ese horario está prohibido.
                  </p>
                </div>
              </div>

              {/* Identificación obligatoria */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition-all hover:border-amber-500/20 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <UserCheck className="size-4 shrink-0" />
                    <h4 className="text-sm font-bold text-foreground">Identificación obligatoria</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Quien realiza la gestión debe identificarse correctamente, incluyendo la entidad que representa.
                  </p>
                </div>
              </div>

              {/* Prohibición de hostigamiento */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition-all hover:border-amber-500/20 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <AlertTriangle className="size-4 shrink-0" />
                    <h4 className="text-sm font-bold text-foreground">Prohibición de hostigamiento</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No está permitida la comunicación reiterada con el propósito de presionar, intimidar o avergonzar al deudor.
                  </p>
                </div>
              </div>

              {/* Información precisa */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition-all hover:border-amber-500/20 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <h4 className="text-sm font-bold text-foreground">Información precisa</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El monto comunicado al deudor debe ser correcto y detallado. No se pueden comunicar montos inflados o no acordados.
                  </p>
                </div>
              </div>

              {/* Contacto a terceros */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition-all hover:border-amber-500/20 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <Users className="size-4 shrink-0" />
                    <h4 className="text-sm font-bold text-foreground">Contacto a terceros</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Está prohibido comunicar la situación de mora a familiares, empleadores u otras personas que no sean partes de la obligación.
                  </p>
                </div>
              </div>

              {/* Datos personales */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between transition-all hover:border-amber-500/20 hover:shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <Database className="size-4 shrink-0" />
                    <h4 className="text-sm font-bold text-foreground">Datos personales</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Solo pueden utilizarse los datos que el deudor proporcionó en el contrato original, o los que están disponibles en fuentes públicas y lícitas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Sanciones */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="size-6 shrink-0" />
              <h3 className="text-base md:text-lg font-black tracking-tight uppercase">
                Sanciones en Argentina
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las sanciones por incumplimiento de la Ley de Defensa del Consumidor van desde multas de entre{' '}
              <strong className="text-foreground">$100 y $5,000,000 ARS</strong> (actualizables por inflación), hasta la suspensión de actividades para reincidentes.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La Secretaría de Comercio tiene capacidad de aplicar estas sanciones y publicar el incumplimiento (daño reputacional).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
