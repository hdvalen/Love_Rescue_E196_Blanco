import dog1 from "@/assets/pets/dog1.jpg";
import dog2 from "@/assets/pets/dog2.jpg";
import dog3 from "@/assets/pets/dog3.jpg";
import cat1 from "@/assets/pets/cat1.jpg";
import cat2 from "@/assets/pets/cat2.jpg";
import cat3 from "@/assets/pets/cat3.jpg";

export type Species = "Perro" | "Gato";
export type Size = "Pequeño" | "Mediano" | "Grande";
export type Sex = "Macho" | "Hembra";
export type AdoptionStatus = "Disponible" | "En Proceso" | "Adoptado";
export type RequestStatus = "Recibida" | "Evaluación" | "Documentación Cargada" | "Aprobada" | "Rechazada" | "En Seguimiento" | "Adoptada";
export type UserRole = "adoptante" | "fundacion" | "admin";
export type AppointmentStatus = "Pendiente" | "Aceptada" | "Rechazada";
export type NoteVisibility = "Privada" | "Compartida";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;
  size: Size;
  sex: Sex;
  location: string;
  department?: string;
  description: string;
  temperament: string[];
  temperament_ids?: number[];
  vaccinated: boolean;
  sterilized: boolean;
  dewormed: boolean;
  images: string[];
  foundationId: string;
  status: AdoptionStatus;
  adoptionConditions?: string;
  active: boolean;
  kidFriendly?: boolean;
  livesWithAnimals?: boolean;
}

export interface Foundation {
  id: string;
  id_usuario?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  verified: boolean;
  description: string;
  nit?: string;
  socialMedia?: string;
  mission?: string;
  logoUrl?: string;
  city?: string;
  department?: string;
  rejectionReason?: string;
  verificationStatus?: "Pendiente" | "Aprobada" | "Rechazada";
}

export interface StatusHistoryEntry {
  status: RequestStatus;
  date: string;
  note?: string;
}

export interface EvaluationNote {
  id: string;
  text: string;
  visibility: NoteVisibility;
  date: string;
  author: string;
}

export interface PendingTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Appointment {
  id: string;
  requestId: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: "Presencial";
  status: AppointmentStatus;
  createdBy: string;
  rejectionReason?: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: "cedula" | "recibo" | "foto_hogar";
  fileName: string;
  fileSize: number;
  status: "Pendiente" | "Aprobado" | "Rechazado";
  rejectionComment?: string;
  uploadDate: string;
}

export interface AdoptionRequest {
  id: string;
  petId: string;
  adopterId: string;
  adopterName: string;
  adopterEmail?: string;
  adopterPhone?: string;
  adopterFotoUrl?: string;
  adopterHousingType?: string;
  adopterHasPatio?: boolean;
  adopterHoursAlone?: string;
  adopterExperience?: string;
  adopterFamilyComposition?: string;
  status: RequestStatus;
  date: string;
  message: string;
  rejectionReason?: string;
  statusHistory: StatusHistoryEntry[];
  notes: EvaluationNote[];
  pendingTasks: PendingTask[];
  appointments: Appointment[];
  documents: UploadedDocument[];
  verificationChecklist: {
    interview: boolean;
    visit: boolean;
    documents: boolean;
  };
  contractAccepted: boolean;
  contractAcceptedDate?: string;
  contractAcceptedIP?: string;
  datosAdoptante?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Adoptante fields
  housingType?: string;
  hasPatio?: boolean;
  hoursAlone?: string;
  experience?: string;
  familyComposition?: string;
  availability?: string;
  // Fundacion fields
  nit?: string;
  address?: string;
  phone?: string;
  socialMedia?: string;
  mission?: string;
  fotoUrl?: string;
  logoUrl?: string;
  emailVerifiedAt?: string;
}

export interface PendingActivity {
  id: string;
  type: "appointment" | "document_review" | "task";
  title: string;
  description: string;
  date: string;
  relatedRequestId?: string;
  userId: string;
}

export const foundations: Foundation[] = [
  {
    id: "f1",
    name: "Patitas Felices",
    email: "contacto@patitasfelices.org",
    phone: "+57 300 123 4567",
    address: "Calle 45 #12-34, Bogotá, Colombia",
    verified: true,
    description: "Fundación dedicada al rescate y adopción responsable de mascotas desde 2015.",
    nit: "900123456-7",
    socialMedia: "@patitasfelices",
    mission: "Rescatar, rehabilitar y encontrar hogares amorosos para animales abandonados.",
    verificationStatus: "Aprobada",
  },
  {
    id: "f2",
    name: "Huellitas de Amor",
    email: "info@huellitasdeamor.org",
    phone: "+57 310 987 6543",
    address: "Carrera 70 #45-12, Medellín, Colombia",
    verified: true,
    description: "Promovemos la tenencia responsable y la adopción como primera opción.",
    nit: "900987654-3",
    socialMedia: "@huellitasdeamor",
    mission: "Promover la adopción responsable y la tenencia ética de animales de compañía.",
    verificationStatus: "Aprobada",
  },
  {
    id: "f3",
    name: "Refugio Esperanza",
    email: "contacto@refugioesperanza.org",
    phone: "+57 315 555 1234",
    address: "Av. 68 #20-15, Cali, Colombia",
    verified: false,
    description: "Nuevo refugio dedicado al rescate de animales en situación de calle.",
    verificationStatus: "Pendiente",
  },
];

export const pets: Pet[] = [
  {
    id: "p1",
    name: "Max",
    species: "Perro",
    breed: "Golden Retriever",
    age: "2 años",
    size: "Grande",
    sex: "Macho",
    location: "Bogotá",
    description: "Max es un perro increíblemente cariñoso y juguetón. Le encanta correr al aire libre y es excelente con niños. Busca un hogar con patio donde pueda jugar libremente.",
    temperament: ["Cariñoso", "Juguetón", "Sociable"],
    vaccinated: true,
    sterilized: true,
    images: [dog1],
    foundationId: "f1",
    status: "Disponible",
    adoptionConditions: "Requiere casa con patio o jardín amplio.",
    dewormed: true,
    active: true,
    kidFriendly: true,
    livesWithAnimals: true,
  },
  {
    id: "p2",
    name: "Mía",
    species: "Gato",
    breed: "Tabby Naranja",
    age: "1 año",
    size: "Mediano",
    sex: "Hembra",
    location: "Bogotá",
    description: "Mía es una gatita tranquila que disfruta de las siestas largas y los mimos. Ideal para departamentos y personas que buscan una compañera relajada.",
    temperament: ["Tranquila", "Independiente", "Cariñosa"],
    vaccinated: true,
    sterilized: true,
    images: [cat1],
    foundationId: "f1",
    status: "Disponible",
    dewormed: true,
    active: true,
    kidFriendly: false,
  },
  {
    id: "p3",
    name: "Rocky",
    species: "Perro",
    breed: "Border Collie",
    age: "3 años",
    size: "Mediano",
    sex: "Macho",
    location: "Medellín",
    description: "Rocky es un perro muy inteligente y enérgico. Necesita mucha actividad física y mental. Perfecto para familias activas.",
    temperament: ["Inteligente", "Energético", "Leal"],
    vaccinated: true,
    sterilized: false,
    images: [dog2],
    foundationId: "f2",
    status: "En Proceso",
    dewormed: true,
    active: true,
    kidFriendly: true,
  },
  {
    id: "p4",
    name: "Luna",
    species: "Gato",
    breed: "Azul Ruso",
    age: "2 años",
    size: "Mediano",
    sex: "Hembra",
    location: "Medellín",
    description: "Luna es elegante y silenciosa. Se adapta bien a espacios pequeños y es muy limpia. Busca un hogar tranquilo.",
    temperament: ["Elegante", "Silenciosa", "Adaptable"],
    vaccinated: true,
    sterilized: true,
    images: [cat2],
    foundationId: "f2",
    status: "Disponible",
    dewormed: false,
    active: true,
  },
  {
    id: "p5",
    name: "Toby",
    species: "Perro",
    breed: "Dachshund",
    age: "6 meses",
    size: "Pequeño",
    sex: "Macho",
    location: "Bogotá",
    description: "Toby es un cachorrito lleno de energía y curiosidad. Le encanta explorar y jugar con juguetes. Ideal para familias con niños.",
    temperament: ["Curioso", "Juguetón", "Alegre"],
    vaccinated: true,
    sterilized: false,
    images: [dog3],
    foundationId: "f1",
    status: "Disponible",
    dewormed: false,
    active: true,
    kidFriendly: true,
  },
  {
    id: "p6",
    name: "Nieve",
    species: "Gato",
    breed: "Persa Blanco",
    age: "8 meses",
    size: "Pequeño",
    sex: "Hembra",
    location: "Bogotá",
    description: "Nieve es una gatita dulce y juguetona. Su pelo sedoso requiere cepillado regular. Perfecta para hogares cariñosos.",
    temperament: ["Dulce", "Juguetona", "Tierna"],
    vaccinated: true,
    sterilized: false,
    images: [cat3],
    foundationId: "f1",
    status: "Adoptado",
    dewormed: true,
    active: true,
  },
];

export const adoptionRequests: AdoptionRequest[] = [
  {
    id: "r1",
    petId: "p3",
    adopterId: "u1",
    adopterName: "Carlos Rodríguez",
    status: "Evaluación",
    date: "2026-04-05",
    message: "Tengo experiencia con perros activos y un jardín amplio.",
    statusHistory: [
      { status: "Recibida", date: "2026-04-05T10:00:00" },
      { status: "Evaluación", date: "2026-04-06T14:30:00" },
    ],
    notes: [],
    pendingTasks: [],
    appointments: [],
    documents: [],
    verificationChecklist: { interview: false, visit: false, documents: false },
    contractAccepted: false,
  },
  {
    id: "r2",
    petId: "p1",
    adopterId: "u2",
    adopterName: "María García",
    status: "Recibida",
    date: "2026-04-08",
    message: "Siempre quise un Golden Retriever, tengo casa con patio.",
    statusHistory: [
      { status: "Recibida", date: "2026-04-08T09:15:00" },
    ],
    notes: [],
    pendingTasks: [],
    appointments: [],
    documents: [],
    verificationChecklist: { interview: false, visit: false, documents: false },
    contractAccepted: false,
  },
];
