export interface Persona {
  id: number;
  tipoDoc?: string;
  nroDoc?: string;
  cuit: string;
  apellidoNombre?: string;
  nombre: string;
  apellido: string;
  calleDomicilio?: string;
  numeroDomicilio?: string;
  pisoDomicilio?: string;
  deptoDomicilio?: string;
  localidad?: string;
  provincia?: string;
  telefono: string;
  email: string;
  /** [actual más reciente, … anteriores] */
  listaTelefonos?: string[];
  /** [actual más reciente, … anteriores] */
  listaEmails?: string[];
  idEntidad?: number | null;
  habilitado?: boolean;
  tgiUrbanos?: TgiUrbano[];
  tgiRurales?: TgiRural[];
  patentes?: Patente[];
  gestiones?: GestionUI[];
}

export interface Cuota {
  id: number;
  numero_cuota: number;
  cantidad_cuotas: number;
  capital: number;
  intereses: number;
  vencimiento: string;
}

export interface TgiUrbano {
  id: number;
  domicilio: string;
  numero_padron: string;
  codigo_web: string;
  sup_terreno: number;
  mts_frente: number;
  manzana: string;
  cuotas?: Cuota[];
}

export interface TgiRural {
  id: number;
  domicilio: string;
  numero_padron: string;
  codigo_web: string;
  sup_hectarea: number;
  manzana: string;
  cuotas?: Cuota[];
}

export interface Patente {
  id: number;
  domicilio: string;
  numero_patente: string;
  marca?: string;
  modelo?: string;
  marcaModelo?: string;
  tipo: string;
  tramo?: string;
  cuotas?: Cuota[];
}

export interface GestionUI {
  id: number;
  idPersona?: number;
  fecha_hora: string;
  accion: string;
  contacto: string;
  observaciones: string;
  usuario?: string;
  mencionado_uid?: string;
}

export interface GestionHistorial {
  id: number;
  idPersona: number;
  fecha_hora: string;
  accion: string;
  contacto: string;
  observaciones: string;
  usuario?: string;
  persona: {
    id: number;
    idEntidad: number;
    apellidoNombre: string;
  } | null;
}

export interface UsuarioEntidad {
  uid: string;
  email: string;
  nombre: string;
}

export interface Notificacion {
  id: number;
  id_destinatario: string;
  id_emisor: string;
  email_emisor?: string;
  id_entidad: number;
  id_gestion?: number;
  id_persona: number;
  persona_nombre?: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

export interface PlanPago {
  id: number;
  nombre: string;
  producto: 'tgi_urbano' | 'tgi_rural' | 'patente';
  numeroCuotas: number;
  descuentoIntereses: number;
  porcentajeAnticipo: number;
  idEntidad?: number | null;
  activo: boolean;
}

export type SortOption = 'deudaDesc' | 'patentesDesc' | 'tgiUrbanoDesc' | 'tgiRuralDesc' | 'contactoDesc' | 'contactoAsc';

export interface Entidad {
  id: number;
  nombre: string;
  activo: boolean;
}
