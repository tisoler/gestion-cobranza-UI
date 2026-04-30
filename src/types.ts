export interface Persona {
  id: number;
  dni: string;
  cuit: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  /** [actual más reciente, … anteriores] */
  listaTelefonos?: string[];
  /** [actual más reciente, … anteriores] */
  listaEmails?: string[];
  idEntidad?: number | null;
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
  direccion_padron: string;
  sup_terreno: number;
  mts_frente: number;
  cuotas?: Cuota[];
}

export interface TgiRural {
  id: number;
  domicilio: string;
  numero_padron: string;
  codigo_web: string;
  direccion_padron: string;
  sup_campo: number;
  cuotas?: Cuota[];
}

export interface Patente {
  id: number;
  domicilio: string;
  numero_patente: string;
  marca: string;
  modelo: string;
  tipo: string;
  cuotas?: Cuota[];
}

export interface GestionUI {
  id: number;
  fecha_hora: string;
  accion: string;
  contacto: string;
  observaciones: string;
}

export type SortOption = 'deudaDesc' | 'cuotasDesc' | 'contactoDesc' | 'contactoAsc';

export interface Entidad {
  id: number;
  nombre: string;
  activo: boolean;
}
