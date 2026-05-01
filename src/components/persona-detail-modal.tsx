import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  Plus,
  Save,
  XCircle,
  Car,
  Home,
  TreePine,
  CreditCard,
  History,
  User,
  ChevronDown,
  ChevronUp,
  Receipt,
  Calendar,
  Loader2,
} from "lucide-react";
import type { Persona, GestionUI, Cuota } from "../types";
import api from "../lib/api";
import { useSWRConfig } from "swr";
import { PlanPagoSection } from "./plan-pago-section";

function contactListsFromPersona(p: Persona) {
  const phones =
    p.listaTelefonos && p.listaTelefonos.length > 0
      ? [...p.listaTelefonos]
      : p.telefono?.trim()
        ? [p.telefono.trim()]
        : [];
  const emails =
    p.listaEmails && p.listaEmails.length > 0
      ? [...p.listaEmails]
      : p.email?.trim()
        ? [p.email.trim()]
        : [];
  return { phones, emails };
}

interface PersonaDetailModalProps {
  persona: Persona;
  onClose: () => void;
  onPersonaUpdated?: (p: Persona) => void;
}

function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg fill="currentColor" viewBox="0 0 32 32" className={className}>
      <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path>
    </svg>
  );
}

// Sub-componente para listado de cuotas colapsable
function CuotasList({ cuotas }: { cuotas?: Cuota[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!cuotas || cuotas.length === 0) {
    return (
      <div className="mt-3 py-2 px-4 rounded-xl bg-muted/30 border border-dashed border-border text-[10px] font-bold text-muted-foreground/60 uppercase text-center">
        Sin cuotas adeudadas
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR");
  };

  return (
    <div className="mt-4 border-t border-border/50 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between group/btn"
      >
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/70">
          <Receipt className="size-3" />
          Cuotas adeudadas ({cuotas.length})
        </div>
        <div className="flex size-6 items-center justify-center rounded-full bg-primary/5 text-primary group-hover/btn:bg-primary/10 transition-colors">
          {isExpanded ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
          <div className="overflow-hidden rounded-xl border border-border bg-background/50">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-2 font-black text-muted-foreground uppercase">
                    Cuota
                  </th>
                  <th className="px-3 py-2 font-black text-muted-foreground uppercase">
                    Vencimiento
                  </th>
                  <th className="px-3 py-2 font-black text-muted-foreground uppercase text-right">
                    Capital
                  </th>
                  <th className="px-3 py-2 font-black text-muted-foreground uppercase text-right">
                    Intereses
                  </th>
                  <th className="px-3 py-2 font-black text-muted-foreground uppercase text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cuotas.map((cuota) => (
                  <tr
                    key={cuota.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-bold text-primary">
                      {cuota.numero_cuota}
                    </td>
                    <td className="px-3 py-2 flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Calendar className="size-3 text-muted-foreground/40" />
                      {formatDate(cuota.vencimiento)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-foreground/80 text-[12px]">
                      {formatCurrency(Number(cuota.capital))}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-foreground/80 text-[12px]">
                      {formatCurrency(Number(cuota.intereses))}
                    </td>
                    <td className="px-3 py-2 text-right font-black text-foreground text-[13px]">
                      {formatCurrency(
                        Number(cuota.capital) + Number(cuota.intereses),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-5 gap-2 px-2 text-[10px] font-black uppercase text-muted-foreground/60">
            <div className="col-span-2"></div>
            <div className="flex flex-col text-right">
              <span>Subt. Cap.</span>
              <span className="text-foreground text-[12px]">
                {formatCurrency(cuotas.reduce((acc, c) => acc + Number(c.capital), 0))}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span>Subt. Int.</span>
              <span className="text-foreground text-[12px]">
                {formatCurrency(cuotas.reduce((acc, c) => acc + Number(c.intereses), 0))}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span>Total Adeudado</span>
              <span className="text-destructive text-[14px]">
                {formatCurrency(
                  cuotas.reduce(
                    (acc, c) => acc + Number(c.capital) + Number(c.intereses),
                    0,
                  ),
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PersonaDetailModal({
  persona,
  onClose,
  onPersonaUpdated,
}: PersonaDetailModalProps) {
  const { mutate } = useSWRConfig();
  const [gestiones, setGestiones] = useState<GestionUI[]>(
    persona.gestiones || [],
  );
  const [isAddingGestion, setIsAddingGestion] = useState(false);
  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingContacto, setSavingContacto] = useState(false);
  const [historialTelOpen, setHistorialTelOpen] = useState(false);
  const [historialMailOpen, setHistorialMailOpen] = useState(false);
  const [contactoOpen, setContactoOpen] = useState(true);
  const [productosOpen, setProductosOpen] = useState(true);
  const [formData, setFormData] = useState({
    accion: "",
    contacto: "",
    observaciones: "",
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { phones: telefonosLista, emails: emailsLista } =
    contactListsFromPersona(persona);

  const totalProductos =
    (persona.tgiUrbanos?.length ?? 0) +
    (persona.tgiRurales?.length ?? 0) +
    (persona.patentes?.length ?? 0);

  const openWhatsApp = (rawPhone: string | undefined) => {
    const phone = (rawPhone || "").replace(/\D/g, "");
    if (!phone) return;
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = isMobile
      ? `whatsapp://send?phone=${phone}`
      : `https://web.whatsapp.com/send?phone=${phone}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAddContacto = async () => {
    const tel = newTelefono.trim();
    const mail = newEmail.trim();
    if (!tel && !mail) return;
    setSavingContacto(true);
    try {
      const body: { telefono?: string; email?: string } = {};
      if (tel) body.telefono = tel;
      if (mail) body.email = mail;
      const { data } = await api.patch<Persona>(
        `/personas/${persona.id}/contacto`,
        body,
      );
      onPersonaUpdated?.(data);
      setNewTelefono("");
      setNewEmail("");
      mutate(`/personas/${persona.id}`);
      mutate((key: unknown) => {
        if (typeof key === "string" && key.startsWith("/personas")) return true;
        if (
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/personas")
        )
          return true;
        return false;
      });
    } catch (error) {
      console.error("Error al actualizar contacto:", error);
    } finally {
      setSavingContacto(false);
    }
  };

  const handleAddGestion = async () => {
    try {
      const response = await api.post("/gestiones", {
        idPersona: persona.id,
        ...formData,
      });
      const newGestion = response.data;
      setGestiones([newGestion, ...gestiones]);
      setFormData({ accion: "", contacto: "", observaciones: "" });
      mutate(`/personas/${persona.id}`);
      mutate((key: unknown) => {
        if (typeof key === "string" && key.startsWith("/personas")) return true;
        if (
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          key[0].startsWith("/personas")
        )
          return true;
        return false;
      });
      setIsAddingGestion(false);
    } catch (error) {
      console.error("Error adding gestión:", error);
    }
  };

  const renderSectionHeader = (
    icon: React.ReactNode,
    title: string,
    colorClass: string,
  ) => (
    <div className="mb-4 flex items-center gap-3">
      <div className={`p-2 rounded-xl ${colorClass}`}>{icon}</div>
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:items-center md:px-3 md:py-1 animate-in fade-in duration-300"
      onClick={() => {
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-[95vw] max-h-[98vh] overflow-hidden rounded-t-[2.5rem] bg-background shadow-2xl md:rounded-[2.5rem] flex flex-col border border-border animate-in slide-in-from-bottom-10 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-8 py-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <User className="size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                {persona.apellido}, {persona.nombre}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <span className="rounded bg-muted px-2 py-0.5">
                  DNI {persona.dni}
                </span>
                <span className="rounded bg-muted px-2 py-0.5">
                  CUIT {persona.cuit}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-muted p-2.5 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-90"
            aria-label="Cerrar"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 space-y-10 flex-1">
          {/* Contacto — colapsable, expandido por defecto */}
          <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-primary/5 shadow-sm">
            <button
              type="button"
              onClick={() => setContactoOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-primary/5"
              aria-expanded={contactoOpen}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Phone className="size-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight">Contacto</h3>
                  <p className="text-xs font-medium text-muted-foreground">
                    Teléfonos y correos actuales e históricos
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${contactoOpen ? "rotate-180" : ""}`}
              />
            </button>

            {contactoOpen && (
              <div className="grid gap-6 border-t border-primary/10 p-6 lg:grid-cols-2 animate-in slide-in-from-top-1 duration-200">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                      <Phone className="size-3.5 text-primary" />
                      Teléfonos
                    </div>
                    {telefonosLista.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Sin teléfonos registrados.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="rounded-xl border border-primary/25 bg-background p-3 shadow-sm">
                          <div className="relative">
                            <input
                              type="text"
                              value={telefonosLista[0]}
                              readOnly
                              className="w-full rounded-lg border border-border bg-background py-2.5 pl-3 pr-11 text-sm font-bold text-foreground"
                            />
                            <button
                              type="button"
                              onClick={() => openWhatsApp(telefonosLista[0])}
                              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:opacity-40 cursor-pointer"
                              title="Enviar WhatsApp"
                              disabled={!telefonosLista[0]}
                            >
                              <WhatsAppIcon className="size-6" />
                            </button>
                          </div>
                          <div className="mt-2">
                            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                              Actual
                            </span>
                          </div>
                        </div>
                        {telefonosLista.length > 1 && (
                          <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/15">
                            <button
                              type="button"
                              onClick={() => setHistorialTelOpen((o) => !o)}
                              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                              aria-expanded={historialTelOpen}
                            >
                              <span className="uppercase tracking-wider">
                                Teléfonos anteriores (
                                {telefonosLista.length - 1})
                              </span>
                              <ChevronDown
                                className={`size-4 shrink-0 text-muted-foreground/70 transition-transform duration-200 ${historialTelOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {historialTelOpen && (
                              <ul className="space-y-2 border-t border-border/50 px-3 py-3 animate-in slide-in-from-top-1 duration-200">
                                {telefonosLista.slice(1).map((tel, i) => (
                                  <li
                                    key={`tel-prev-${i}-${tel}`}
                                    className="rounded-lg border border-dashed border-border/70 bg-background/60 px-3 py-2 text-sm font-medium text-muted-foreground"
                                  >
                                    {tel}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                      <Mail className="size-3.5 text-primary" />
                      Correos
                    </div>
                    {emailsLista.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Sin correos registrados.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-background px-4 py-3 text-base font-bold text-foreground shadow-sm break-all">
                          <span>{emailsLista[0]}</span>
                          <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary shrink-0">
                            Actual
                          </span>
                        </div>
                        {emailsLista.length > 1 && (
                          <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/15">
                            <button
                              type="button"
                              onClick={() => setHistorialMailOpen((o) => !o)}
                              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                              aria-expanded={historialMailOpen}
                            >
                              <span className="uppercase tracking-wider">
                                Correos anteriores ({emailsLista.length - 1})
                              </span>
                              <ChevronDown
                                className={`size-4 shrink-0 text-muted-foreground/70 transition-transform duration-200 ${historialMailOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {historialMailOpen && (
                              <ul className="space-y-2 border-t border-border/50 px-3 py-3 animate-in slide-in-from-top-1 duration-200">
                                {emailsLista.slice(1).map((em, i) => (
                                  <li
                                    key={`mail-prev-${i}-${em}`}
                                    className="rounded-lg border border-dashed border-border/70 bg-background/60 px-3 py-2 text-sm font-medium text-muted-foreground break-all"
                                  >
                                    {em}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-border bg-card p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    Agregar contacto actual
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        Nuevo teléfono
                      </label>
                      <input
                        type="text"
                        value={newTelefono}
                        onChange={(e) => setNewTelefono(e.target.value)}
                        placeholder="Ej. +54 9 11 …"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        Nuevo e-mail
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={
                        savingContacto ||
                        (!newTelefono.trim() && !newEmail.trim())
                      }
                      onClick={() => void handleAddContacto()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]"
                    >
                      {savingContacto ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Guardando…
                        </>
                      ) : (
                        <>
                          <Save className="size-4" />
                          Guardar contacto
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Properties/Vehicles — colapsable, expandido por defecto */}
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card/50 shadow-sm">
            <button
              type="button"
              onClick={() => setProductosOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/20"
              aria-expanded={productosOpen}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
                  <CreditCard className="size-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight">
                    Productos
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground">
                    {totalProductos === 0
                      ? "Sin productos asociados"
                      : `${totalProductos} ítem${totalProductos === 1 ? "" : "s"}`}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${productosOpen ? "rotate-180" : ""}`}
              />
            </button>

            {productosOpen && (
              <div className="space-y-8 border-t border-border/60 px-6 pb-6 pt-2 animate-in slide-in-from-top-1 duration-200">
                {totalProductos === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-10 text-center text-sm font-medium text-muted-foreground">
                    No hay productos asociados a esta persona.
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {/* TGI Urbano */}
                    {persona.tgiUrbanos && persona.tgiUrbanos.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                          <Home className="size-4" /> TGI Urbano
                        </h5>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {persona.tgiUrbanos.map((item) => (
                            <div
                              key={item.id}
                              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                            >
                              <p className="font-extrabold text-primary text-[18px]">
                                {item.domicilio}
                              </p>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-[14px] font-bold text-muted-foreground">
                                <span className="rounded bg-muted px-2 py-1">
                                  Padrón: {item.numero_padron}
                                </span>
                                <span className="rounded bg-muted px-2 py-1 text-center">
                                  Web: {item.codigo_web}
                                </span>
                              </div>
                              <p className="mt-2 text-[14px]">
                                {item.direccion_padron}
                              </p>
                              <div className="mt-3 flex gap-4 text-[12px] font-black uppercase tracking-tighter text-indigo-500/80">
                                <span>SUP: {item.sup_terreno} M²</span>
                                <span>FRENTE: {item.mts_frente} M</span>
                              </div>

                              <CuotasList cuotas={item.cuotas} />
                              <PlanPagoSection producto="tgi_urbano" cuotas={item.cuotas} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TGI Rural */}
                    {persona.tgiRurales && persona.tgiRurales.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                          <TreePine className="size-4" /> TGI Rural
                        </h5>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {persona.tgiRurales.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-emerald-500/30 hover:shadow-md"
                            >
                              <p className="font-extrabold text-emerald-600 text-[18px]">
                                {item.domicilio}
                              </p>
                              <div className="mt-2 flex gap-2 text-[14px] font-bold text-muted-foreground">
                                <span className="rounded bg-muted px-2 py-1">
                                  Padrón: {item.numero_padron}
                                </span>
                              </div>
                              <p className="mt-3 text-[12px] font-black uppercase text-emerald-500/80">
                                SUP. CAMPO: {item.sup_campo} M²
                              </p>

                              <CuotasList cuotas={item.cuotas} />
                              <PlanPagoSection producto="tgi_rural" cuotas={item.cuotas} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Patentes */}
                    {persona.patentes && persona.patentes.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                          <Car className="size-4" /> Patentes
                        </h5>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {persona.patentes.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-amber-500/30 hover:shadow-md"
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-black text-amber-600 text-lg uppercase tracking-tighter">
                                  {item.numero_patente}
                                </p>
                                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                                  {item.tipo}
                                </span>
                              </div>
                              <p className="mt-1 font-bold text-[16px]">
                                {item.marca} {item.modelo}
                              </p>
                              <p className="mt-1 text-[14px] text-muted-foreground">
                                {item.domicilio}
                              </p>

                              <CuotasList cuotas={item.cuotas} />
                              <PlanPagoSection producto="patente" cuotas={item.cuotas} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gestiones */}
          <div className="space-y-6 pt-6 border-t border-border">
            {renderSectionHeader(
              <History className="size-6" />,
              "Historial de Gestiones",
              "bg-amber-500/10 text-amber-600",
            )}

            <div className="flex items-center justify-between">
              {!isAddingGestion && (
                <button
                  onClick={() => setIsAddingGestion(true)}
                  className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  <Plus className="size-4" /> Nueva Gestión
                </button>
              )}
            </div>

            {isAddingGestion && (
              <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/5 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-700/60 ml-1">
                      Acción
                    </label>
                    <select
                      value={formData.accion}
                      onChange={(e) =>
                        setFormData({ ...formData, accion: e.target.value })
                      }
                      className="w-full rounded-xl border border-amber-500/20 bg-background px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Llamada">Llamada</option>
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Visita">Visita</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-700/60 ml-1">
                      Resultado
                    </label>
                    <select
                      value={formData.contacto}
                      onChange={(e) =>
                        setFormData({ ...formData, contacto: e.target.value })
                      }
                      className="w-full rounded-xl border border-amber-500/20 bg-background px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Contactado">Contactado</option>
                      <option value="No contesta">No contesta</option>
                      <option value="Promesa Pago">Promesa Pago</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-700/60 ml-1">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-xl border border-amber-500/20 bg-background px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 outline-none resize-none"
                    placeholder="Escribe los detalles aquí..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddGestion}
                    disabled={!formData.accion || !formData.contacto}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-700 disabled:opacity-50"
                  >
                    <Save className="size-4" /> Guardar Gestión
                  </button>
                  <button
                    onClick={() => setIsAddingGestion(false)}
                    className="flex items-center gap-2 rounded-xl border border-amber-500/20 px-6 py-3 text-sm font-bold text-amber-700 hover:bg-amber-500/10"
                  >
                    <XCircle className="size-4" /> Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {gestiones.length === 0 ? (
                <div className="py-12 text-center rounded-[2rem] border border-dashed border-border bg-muted/30">
                  <p className="text-sm font-bold text-muted-foreground/60">
                    No se registran gestiones anteriores
                  </p>
                </div>
              ) : (
                gestiones.map((gestion) => (
                  <div
                    key={gestion.id}
                    className="relative group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-primary/40 mb-1">
                          Resultado
                        </span>
                        <span className="font-black text-primary text-base">
                          {gestion.accion} — {gestion.contacto}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground bg-muted px-2 py-1 rounded">
                        {formatDateTime(gestion.fecha_hora)}
                      </span>
                    </div>
                    {gestion.observaciones && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/30 border-l-4 border-primary/20">
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                          {gestion.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
