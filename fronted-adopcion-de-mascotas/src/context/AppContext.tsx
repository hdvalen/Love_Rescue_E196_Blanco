import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Pet, AdoptionRequest, User, UserRole, Foundation, EvaluationNote, PendingTask, Appointment, UploadedDocument, PendingActivity, RequestStatus, AppointmentStatus, NoteVisibility, AdoptionStatus } from "@/data/mockData";
import * as api from "@/api";
import { clearToken } from "@/api/client";
import type { MascotaBackend } from "@/api/mascotas";
import type { FundacionBackend } from "@/api/fundaciones";
import type { SolicitudBackend } from "@/api/solicitudes";
import type { NotificacionBackend } from "@/api/notificaciones";

const ROLE_MAP: Record<number, UserRole> = { 1: 'admin', 2: 'fundacion', 3: 'adoptante' };
const ROLE_TO_ID: Record<UserRole, number> = { admin: 1, fundacion: 2, adoptante: 3 };

function mapMascota(m: MascotaBackend): Pet {
  const especie = m.especie === 'Perro' ? 'Perro' : 'Gato';
  const fundacionCiudad = m.Fundacion?.ciudad || '';
  const fundacionDept = m.Fundacion?.departamento || '';
  const location = m.ubicacion || fundacionCiudad || fundacionDept || '';
  return {
    id: String(m.id_mascota),
    name: m.nombre,
    species: especie as Pet['species'],
    breed: m.raza || '',
    age: m.edad ? `${m.edad} años` : '',
    size: (m.tamano === 'PEQUENO' ? 'Pequeño' : m.tamano === 'MEDIANO' ? 'Mediano' : 'Grande') as Pet['size'],
    sex: (m.sexo === 'MACHO' ? 'Macho' : 'Hembra') as Pet['sex'],
    location,
    department: m.Fundacion?.departamento || undefined,
    description: m.descripcion || '',
    temperament: m.Temperamentos ? m.Temperamentos.map(t => t.nombre) : m.temperamento ? m.temperamento.split(',').map(t => t.trim()) : [],
    temperament_ids: m.Temperamentos ? m.Temperamentos.map(t => t.id_temperamento) : undefined,
    vaccinated: m.vacunado || false,
    sterilized: m.esterilizado || false,
    dewormed: false,
    images: m.FotosMascota ? m.FotosMascota.map(d => api.getFotoMascotaUrl(d.nombre_archivo)) : [],
    foundationId: String(m.id_fundacion),
    adoptionConditions: m.condiciones_adopcion || '',
    status: (m.estado_mascota === 'DISPONIBLE' ? 'Disponible' : m.estado_mascota === 'EN_PROCESO' ? 'En Proceso' : 'Adoptado') as Pet['status'],
    active: m.estado === 1,
  };
}

function mapFundacion(f: FundacionBackend): Foundation {
  return {
    id: String(f.id_fundacion),
    id_usuario: String(f.id_usuario),
    name: f.nombre_fundacion,
    email: f.email || '',
    phone: f.telefono || '',
    address: f.direccion || '',
    verified: f.estado_aprobacion === 'APROBADA',
    description: f.descripcion || '',
    nit: f.nit,
    socialMedia: f.redes_sociales || '',
    mission: f.mision || '',
    logoUrl: f.logo_url || '',
    city: f.ciudad || '',
    department: f.departamento || '',
    rejectionReason: f.motivo_rechazo || '',
    verificationStatus: f.estado_aprobacion === 'PENDIENTE' ? 'Pendiente' : f.estado_aprobacion === 'APROBADA' ? 'Aprobada' : 'Rechazada',
  };
}

function mapStatusToFrontend(backendStatus: string): RequestStatus {
  switch (backendStatus) {
    case 'PENDIENTE': return 'Recibida';
    case 'EN_EVALUACION': return 'Evaluación';
    case 'APROBADA': return 'Aprobada';
    case 'RECHAZADA': return 'Rechazada';
    case 'EN_SEGUIMIENTO': return 'En Seguimiento';
    case 'ADOPTADA': return 'Adoptada';
    case 'CANCELADA': return 'Rechazada';
    default: return 'Recibida';
  }
}

function mapSolicitud(s: SolicitudBackend): AdoptionRequest {
  return {
    id: String(s.id_solicitud),
    petId: String(s.id_mascota),
    adopterId: String(s.id_usuario),
    adopterName: s.User?.nombre || '',
    adopterEmail: s.User?.email || undefined,
    adopterPhone: s.User?.telefono || undefined,
    adopterFotoUrl: s.User?.foto_url || undefined,
    adopterHousingType: s.User?.PerfilAdoptante?.housing_type || undefined,
    adopterHasPatio: s.User?.PerfilAdoptante?.has_patio ?? undefined,
    adopterHoursAlone: s.User?.PerfilAdoptante?.hours_alone || undefined,
    adopterExperience: s.User?.PerfilAdoptante?.experience || undefined,
    adopterFamilyComposition: s.User?.PerfilAdoptante?.family_composition || undefined,
    status: mapStatusToFrontend(s.estado_solicitud),
    date: s.fecha_solicitud ? s.fecha_solicitud.split('T')[0] : '',
    message: s.motivo,
    rejectionReason: ['RECHAZADA', 'CANCELADA'].includes(s.estado_solicitud) ? s.respuesta || undefined : undefined,
    statusHistory: [{ status: mapStatusToFrontend(s.estado_solicitud), date: s.fecha_solicitud }],
    datosAdoptante: s.datos_adoptante
      ? (typeof s.datos_adoptante === 'string' ? JSON.parse(s.datos_adoptante) : s.datos_adoptante)
      : undefined,
    notes: [],
    pendingTasks: [],
    appointments: [],
    documents: [],
    verificationChecklist: { interview: false, visit: false, documents: false },
    contractAccepted: false,
  };
}

interface AppState {
  currentUser: User | null;
  pets: Pet[];
  foundations: Foundation[];
  favorites: string[];
  requests: AdoptionRequest[];
  activities: PendingActivity[];
  notificaciones: NotificacionBackend[];
  loading: boolean;
  unreadCount: number;
  loadNotificaciones: () => Promise<void>;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; emailVerified?: boolean; emailNotVerified?: boolean }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ ok: boolean; email?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ ok: boolean; message: string }>;
  resendVerification: (email: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ ok: boolean; message: string }>;
  toggleFavorite: (petId: string) => void;
  submitRequest: (petId: string, message: string, datosAdoptante?: Record<string, string>) => Promise<{ ok: boolean; error?: string }>;
  updateRequestStatus: (requestId: string, status: RequestStatus, reason?: string, cambiarEstadoMascota?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  createFoundation: (data: { nombre_fundacion: string; nit?: string; telefono?: string; ciudad?: string; direccion?: string; descripcion?: string }) => Promise<void>;
  updateFoundation: (foundationId: string, updates: Partial<Foundation>) => void;
  verifyFoundation: (foundationId: string, approved: boolean, motivoRechazo?: string) => Promise<void>;
  addPet: (pet: Omit<Pet, "id">) => Promise<Pet>;
  refreshPets: () => Promise<void>;
  refreshFoundations: () => Promise<void>;
  updatePet: (petId: string, updates: Partial<Pet>) => Promise<void>;
  addNote: (requestId: string, note: Omit<EvaluationNote, "id">) => void;
  addPendingTask: (requestId: string, task: string) => void;
  toggleTask: (requestId: string, taskId: string) => void;
  scheduleAppointment: (appointment: Omit<Appointment, "id">) => void;
  respondAppointment: (appointmentId: string, requestId: string, accepted: boolean, motivo?: string) => void;
  uploadDocument: (requestId: string, files: File[], tipo: string, nombre: string) => void;
  reviewDocument: (requestId: string, docId: string, approved: boolean, comment?: string) => void;
  updateChecklist: (requestId: string, field: "interview" | "visit" | "documents", value: boolean) => void;
  acceptContract: (requestId: string) => void;
  finalizeAdoption: (requestId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [activities, setActivities] = useState<PendingActivity[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionBackend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotificaciones = useCallback(async () => {
    try {
      const res = await api.getNotificaciones();
      if (res.ok) setNotificaciones(res.notificaciones);
    } catch (e) { console.error('[loadNotificaciones]', e); }
  }, []);

  const marcarLeidaCb = useCallback(async (id: number) => {
    try {
      const res = await api.marcarLeida(id);
      if (res.ok) {
        setNotificaciones(prev => prev.map(n =>
          n.id_notificacion === id ? { ...n, leido: true, fecha_leido: new Date().toISOString() } : n
        ));
      }
    } catch (e) { console.error('[marcarLeida]', e); }
  }, []);

  const marcarTodasLeidasCb = useCallback(async () => {
    try {
      const res = await api.marcarTodasLeidas();
      if (res.ok) {
        setNotificaciones(prev => prev.map(n => n.leido ? n : { ...n, leido: true, fecha_leido: new Date().toISOString() }));
      }
    } catch (e) { console.error('[marcarTodasLeidas]', e); }
  }, []);

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getPerfil().then(res => {
        if (res.ok) {
          const p = res.user.PerfilAdoptante || {};
          setCurrentUser({
            id: String(res.user.id_usuario),
            name: res.user.nombre,
            email: res.user.email,
            role: ROLE_MAP[res.user.id_rol] || 'adoptante',
            fotoUrl: res.user.foto_url || undefined,
            logoUrl: res.user.Fundacion?.logo_url || undefined,
            phone: res.user.telefono || undefined,
            emailVerifiedAt: res.user.email_verified_at || undefined,
            housingType: p.housing_type || undefined,
            hasPatio: p.has_patio ?? undefined,
            hoursAlone: p.hours_alone || undefined,
            experience: p.experience || undefined,
            familyComposition: p.family_composition || undefined,
          });
          loadFavoritos();
          loadNotificaciones();
        }
      }).catch((e) => { console.error('[getPerfil]', e); });
    }
  }, []);

  useEffect(() => {
    api.getMascotas({ limit: 100 }).then(res => {
      if (res.ok) setPets(res.mascotas.map(mapMascota));
    }).catch((e) => { console.error('[getMascotas]', e); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getFundaciones().then(res => {
      if (res.ok) setFoundations(res.fundaciones.map(mapFundacion));
    }).catch((e) => { console.error('[getFundaciones]', e); });
  }, []);

  useEffect(() => {
    api.getFundaciones().then(res => {
      if (res.ok) setFoundations(res.fundaciones.map(mapFundacion));
    }).catch((e) => { console.error('[getFundaciones duplicado]', e); });
  }, []);

  useEffect(() => {
    if (currentUser) {
      api.getSolicitudes({ limit: 100 }).then(res => {
        if (res.ok) {
          const mapped = res.solicitudes.map(mapSolicitud);
          setRequests(mapped);
          mapped.forEach(r => loadDetalle(r.id));
        }
      }).catch((e) => { console.error('[getSolicitudes]', e); });
    }
  }, [currentUser]);

  const loadDetalle = useCallback(async (requestId: string) => {
    try {
      const res = await api.getSolicitudDetalle(Number(requestId));
      if (!res.ok) return;
      setRequests(prev => prev.map(r => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          notes: res.notas.map(n => ({
            id: String(n.id_nota), text: n.texto,
            visibility: (n.visibilidad === 'COMPARTIDA' ? 'Compartida' : 'Privada') as NoteVisibility,
            date: n.fecha, author: n.autor,
          })),
          pendingTasks: res.tareas.filter(t => t.estado === 1).map(t => ({
            id: String(t.id_tarea), text: t.texto, completed: t.completada === 1,
          })),
          appointments: res.citas.filter(c => c.estado_registro === 1).map(c => ({
            id: String(c.id_cita), requestId, date: c.fecha,
            startTime: c.hora_inicio, endTime: c.hora_fin,
            modality: 'Presencial' as const,
            status: (c.estado === 'ACEPTADA' ? 'Aceptada' : c.estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente') as AppointmentStatus,
            createdBy: String(c.creado_por),
            rejectionReason: c.motivo_rechazo || undefined,
          })),
          documents: res.documentos.filter(d => d.estado === 1).map(d => ({
            id: String(d.id_doc), name: d.nombre, type: d.tipo as UploadedDocument['type'],
            fileName: d.nombre_archivo || '', fileSize: d.tamano || 0,
            status: (d.estado_revision === 'APROBADO' ? 'Aprobado' : d.estado_revision === 'RECHAZADO' ? 'Rechazado' : 'Pendiente') as UploadedDocument['status'],
            rejectionComment: d.comentario_rechazo || undefined, uploadDate: d.fecha_subida,
          })),
          verificationChecklist: {
            interview: res.evaluacion?.entrevista === 1,
            visit: res.evaluacion?.visita === 1,
            documents: res.evaluacion?.documentos_verificados === 1,
          },
          contractAccepted: res.evaluacion?.contrato_aceptado === 1,
          contractAcceptedDate: res.evaluacion?.contrato_fecha || undefined,
          contractAcceptedIP: res.evaluacion?.contrato_ip || undefined,
        };
      }));
    } catch (e) { console.error('[loadDetalle]', e); }
  }, []);

  const loadFavoritos = useCallback(async () => {
    try {
      const res = await api.getFavoritos();
      if (res.ok) setFavorites(res.favoritos.map(f => String(f.id_mascota)));
    } catch (e) { console.error('[loadFavoritos]', e); setFavorites([]); }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      const role = ROLE_MAP[res.user.id_rol] || 'adoptante';
      const p = res.user.PerfilAdoptante || {};
      setCurrentUser({
        id: String(res.user.id_usuario),
        name: res.user.nombre,
        email: res.user.email,
        role,
        fotoUrl: res.user.foto_url || undefined,
        logoUrl: res.user.Fundacion?.logo_url || undefined,
        phone: res.user.telefono || undefined,
        emailVerifiedAt: res.user.email_verified_at || undefined,
        housingType: p.housing_type || undefined,
        hasPatio: p.has_patio ?? undefined,
        hoursAlone: p.hours_alone || undefined,
        experience: p.experience || undefined,
        familyComposition: p.family_composition || undefined,
      });
      loadFavoritos();
      loadNotificaciones();
      return { ok: true, emailVerified: !!res.user.email_verified_at };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      return { ok: false, emailNotVerified: msg === 'EMAIL_NOT_VERIFIED' };
    }
  }, [loadFavoritos, loadNotificaciones]);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    const id_rol = ROLE_TO_ID[role];
    try {
      await api.register(name, email, password, id_rol);
      return { ok: true, email };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : 'Error al registrar' };
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const res = await api.verifyEmail(token);
      return { ok: res.ok, message: res.message };
    } catch (e: unknown) {
      return { ok: false, message: e instanceof Error ? e.message : 'Error al verificar' };
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      const res = await api.resendVerification(email);
      return res.ok;
    } catch (e) { console.error('[resendVerification]', e); return false; }
  }, []);

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem('refresh_token');
      if (rt) await api.logoutApi(rt);
    } catch (e) { console.error('[logout]', e); }
    clearToken();
    setCurrentUser(null);
    setFavorites([]);
  }, []);

  const changePassword = useCallback(async (oldPass: string, newPass: string) => {
    if (!currentUser) return false;
    try {
      const res = await api.changePassword(Number(currentUser.id), oldPass, newPass);
      return res.ok;
    } catch (e) { console.error('[changePassword]', e); return false; }
  }, [currentUser]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await api.forgotPassword(email);
      return { ok: res.ok, message: res.message };
    } catch (e: unknown) {
      return { ok: false, message: e instanceof Error ? e.message : 'Error al enviar' };
    }
  }, []);

  const toggleFavorite = useCallback(async (petId: string) => {
    try {
      const res = await api.toggleFavorito(Number(petId));
      if (res.ok) {
        setFavorites(prev => res.favorito
          ? [...prev, petId]
          : prev.filter(id => id !== petId)
        );
      }
    } catch (e) { console.error('[toggleFavorite]', e); }
  }, []);

  const submitRequest = useCallback(async (petId: string, message: string, datosAdoptante?: Record<string, string>): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await api.createSolicitud(Number(petId), message, datosAdoptante);
      if (res.ok) {
        setRequests(prev => [...prev, mapSolicitud(res.solicitud)]);
        return { ok: true };
      }
      return { ok: false, error: res.message || 'Error al enviar solicitud' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al enviar solicitud';
      return { ok: false, error: msg };
    }
  }, []);

  const updateRequestStatus = useCallback(async (requestId: string, status: RequestStatus, reason?: string, cambiarEstadoMascota?: boolean) => {
    try {
      const id = Number(requestId);
      let res;
      if (status === 'Evaluación') {
        res = await api.ponerEnEvaluacion(id);
      } else if (status === 'Aprobada') {
        res = await api.aprobarSolicitud(id, reason, cambiarEstadoMascota);
      } else if (status === 'Rechazada') {
        res = await api.rechazarSolicitud(id, reason);
      }
      if (res?.ok) {
        setRequests(prev => prev.map(r => r.id === requestId ? {
          ...r,
          status,
          rejectionReason: status === 'Rechazada' ? reason : r.rejectionReason,
        } : r));
        loadDetalle(requestId);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar solicitud';
      console.error(msg);
    }
  }, [loadDetalle]);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const userPayload: Record<string, unknown> = {};
      if (updates.name) userPayload.nombre = updates.name;
      if (updates.phone !== undefined) userPayload.telefono = updates.phone;
      if (Object.keys(userPayload).length > 0) {
        await api.updateUsuario(Number(currentUser.id), userPayload);
      }
      const perfilPayload: Record<string, unknown> = {};
      if (updates.housingType !== undefined) perfilPayload.housing_type = updates.housingType;
      if (updates.hasPatio !== undefined) perfilPayload.has_patio = updates.hasPatio;
      if (updates.hoursAlone !== undefined) perfilPayload.hours_alone = updates.hoursAlone;
      if (updates.experience !== undefined) perfilPayload.experience = updates.experience;
      if (updates.familyComposition !== undefined) perfilPayload.family_composition = updates.familyComposition;
      if (Object.keys(perfilPayload).length > 0) {
        await api.updatePerfilAdoptante(perfilPayload);
      }
      setCurrentUser(prev => prev ? { ...prev, ...updates } : prev);
      return true;
    } catch (e) { console.error('[updateProfile]', e); return false; }
  }, [currentUser]);

  const createFoundation = useCallback(async (data: { nombre_fundacion: string; nit?: string; telefono?: string; ciudad?: string; direccion?: string; descripcion?: string; redes_sociales?: string; mision?: string }) => {
    const res = await api.createFundacion(data);
    if (!res.ok) throw new Error(res.message || 'Error al crear la fundación');
    setFoundations(prev => [...prev, mapFundacion(res.fundacion)]);
    const fundaciones = await api.getFundaciones();
    if (fundaciones.ok) setFoundations(fundaciones.fundaciones.map(mapFundacion));
  }, []);

  const updateFoundation = useCallback(async (foundationId: string, updates: Partial<Foundation>) => {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.nombre_fundacion = updates.name;
    if (updates.nit !== undefined) payload.nit = updates.nit;
    if (updates.address !== undefined) payload.direccion = updates.address;
    if (updates.phone !== undefined) payload.telefono = updates.phone;
    if (updates.socialMedia !== undefined) payload.redes_sociales = updates.socialMedia;
    if (updates.mission !== undefined) payload.mision = updates.mission;
    if (updates.description !== undefined) payload.descripcion = updates.description;
    if (updates.city !== undefined) payload.ciudad = updates.city;
    if (updates.department !== undefined) payload.departamento = updates.department;
    try {
      const res = await api.updateFundacion(Number(foundationId), payload);
      if (res.ok) {
        setFoundations(prev => prev.map(f => f.id === foundationId ? mapFundacion(res.fundacion) : f));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar';
      throw new Error(msg);
    }
  }, []);

  const verifyFoundation = useCallback(async (foundationId: string, approved: boolean, motivoRechazo?: string) => {
    try {
      const res = await api.aprobarFundacion(Number(foundationId), motivoRechazo);
      if (res.ok) {
        setFoundations(prev => prev.map(f =>
          f.id === foundationId ? mapFundacion(res.fundacion) : f
        ));
      }
    } catch (e) { console.error('[verifyFoundation]', e); }
  }, []);

  const addPet = useCallback(async (pet: Omit<Pet, 'id'>): Promise<Pet> => {
    const payload: Record<string, unknown> = {
      nombre: pet.name,
      especie: pet.species,
      raza: pet.breed,
      edad: parseInt(pet.age) || 0,
      tamano: pet.size === 'Pequeño' ? 'PEQUENO' : pet.size === 'Mediano' ? 'MEDIANO' : 'GRANDE',
      sexo: pet.sex === 'Macho' ? 'MACHO' : 'HEMBRA',
      descripcion: pet.description,
      ubicacion: pet.location,
      vacunado: pet.vaccinated,
      esterilizado: pet.sterilized,
      temperamento_ids: pet.temperament_ids,
      condiciones_adopcion: pet.adoptionConditions || '',
    };
    const res = await api.createMascota(payload);
    if (!res.ok) throw new Error(res.message || 'Error al publicar la mascota');
    const newPet = mapMascota(res.mascota);
    setPets(prev => [...prev, newPet]);
    return newPet;
  }, []);

  const updatePet = useCallback(async (petId: string, updates: Partial<Pet>) => {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.nombre = updates.name;
      if (updates.species !== undefined) payload.especie = updates.species;
      if (updates.breed !== undefined) payload.raza = updates.breed;
      if (updates.age !== undefined) payload.edad = parseInt(updates.age) || 0;
      if (updates.size !== undefined) payload.tamano = updates.size === 'Pequeño' ? 'PEQUENO' : updates.size === 'Mediano' ? 'MEDIANO' : 'GRANDE';
      if (updates.sex !== undefined) payload.sexo = updates.sex === 'Macho' ? 'MACHO' : 'HEMBRA';
      if (updates.description !== undefined) payload.descripcion = updates.description;
      if (updates.location !== undefined) payload.ubicacion = updates.location;
      if (updates.vaccinated !== undefined) payload.vacunado = updates.vaccinated;
      if (updates.sterilized !== undefined) payload.esterilizado = updates.sterilized;
      if (updates.temperament_ids !== undefined) payload.temperamento_ids = updates.temperament_ids;
      if (updates.adoptionConditions !== undefined) payload.condiciones_adopcion = updates.adoptionConditions;
      if (updates.status !== undefined) {
        payload.estado_mascota = updates.status === 'Disponible' ? 'DISPONIBLE' : updates.status === 'En Proceso' ? 'EN_PROCESO' : 'ADOPTADO';
      }
      await api.updateMascota(Number(petId), payload);
      setPets(prev => prev.map(p => p.id === petId ? { ...p, ...updates } : p));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar mascota';
      console.error(msg);
    }
  }, []);

  const refreshPets = useCallback(async () => {
    try {
      const res = await api.getMascotas({ limit: 100 });
      if (res.ok) setPets(res.mascotas.map(mapMascota));
    } catch (e) { console.error(e) }
  }, []);

  const refreshFoundations = useCallback(async () => {
    try {
      const res = await api.getFundaciones();
      if (res.ok) setFoundations(res.fundaciones.map(mapFundacion));
    } catch (e) { console.error(e) }
  }, []);

  const addNote = useCallback(async (requestId: string, note: Omit<EvaluationNote, 'id'>) => {
    try {
      const res = await api.addNotaSolicitud(Number(requestId), {
        texto: note.text,
        visibilidad: note.visibility === 'Compartida' ? 'COMPARTIDA' : 'PRIVADA',
        autor: note.author,
      });
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            notes: [...r.notes, {
              id: String(res.nota.id_nota),
              text: res.nota.texto,
              visibility: (res.nota.visibilidad === 'COMPARTIDA' ? 'Compartida' : 'Privada') as NoteVisibility,
              date: res.nota.fecha,
              author: res.nota.autor,
            }],
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const addPendingTask = useCallback(async (requestId: string, text: string) => {
    try {
      const res = await api.addTareaSolicitud(Number(requestId), text);
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            pendingTasks: [...r.pendingTasks, { id: String(res.tarea.id_tarea), text: res.tarea.texto, completed: false }],
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const toggleTask = useCallback(async (requestId: string, taskId: string) => {
    try {
      const res = await api.toggleTareaSolicitud(Number(requestId), Number(taskId));
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            pendingTasks: r.pendingTasks.map(t => t.id === taskId ? { ...t, completed: res.tarea.completada === 1 } : t),
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const scheduleAppointment = useCallback(async (appt: Omit<Appointment, 'id'>) => {
    try {
      const res = await api.scheduleCitaSolicitud(Number(appt.requestId), {
        fecha: appt.date,
        hora_inicio: appt.startTime,
        hora_fin: appt.endTime,
        modalidad: appt.modality,
      });
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === appt.requestId ? {
            ...r,
            appointments: [...r.appointments, {
              id: String(res.cita.id_cita), requestId: appt.requestId,
              date: res.cita.fecha, startTime: res.cita.hora_inicio, endTime: res.cita.hora_fin,
              modality: appt.modality, status: 'Pendiente' as AppointmentStatus,
              createdBy: String(res.cita.creado_por),
            }],
          } : r
        ));
        setActivities(prev => [...prev, {
          id: `act_${Date.now()}`,
          type: 'appointment',
          title: 'Cita programada',
          description: `Cita ${appt.modality} el ${appt.date} de ${appt.startTime} a ${appt.endTime}`,
          date: appt.date,
          relatedRequestId: appt.requestId,
          userId: appt.createdBy,
        }]);
      }
    } catch (e) { console.error(e) }
  }, []);

  const respondAppointment = useCallback(async (appointmentId: string, requestId: string, accepted: boolean, motivo?: string) => {
    try {
      const estado = accepted ? 'ACEPTADA' : 'RECHAZADA';
      const res = await api.responderCitaSolicitud(Number(requestId), Number(appointmentId), estado, motivo);
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            appointments: r.appointments.map(a => a.id === appointmentId ? {
              ...a, status: accepted ? 'Aceptada' as const : 'Rechazada' as const,
              rejectionReason: accepted ? undefined : (motivo || a.rejectionReason),
            } : a),
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const uploadDocument = useCallback(async (requestId: string, files: File[], tipo: string, nombre: string) => {
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('documentos', f));
      formData.append('tipo', tipo);
      formData.append('nombre', nombre);
      const res = await api.addDocumentoSolicitud(Number(requestId), formData);
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            documents: [...r.documents, ...res.documentos.map(d => ({
              id: String(d.id_doc), name: d.nombre, type: d.tipo as UploadedDocument['type'],
              fileName: d.nombre_archivo || '', fileSize: d.tamano || 0,
              status: (d.estado_revision === 'APROBADO' ? 'Aprobado' : d.estado_revision === 'RECHAZADO' ? 'Rechazado' : 'Pendiente') as UploadedDocument['status'],
              rejectionComment: d.comentario_rechazo || undefined, uploadDate: d.fecha_subida,
            }))],
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const reviewDocument = useCallback(async (requestId: string, docId: string, approved: boolean, comment?: string) => {
    try {
      const estado = approved ? 'APROBADO' : 'RECHAZADO';
      const res = await api.revisarDocumentoSolicitud(Number(requestId), Number(docId), estado, comment);
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            documents: r.documents.map(d => d.id === docId ? {
              ...d, status: (approved ? 'Aprobado' : 'Rechazado') as UploadedDocument['status'],
              rejectionComment: approved ? undefined : (comment || d.rejectionComment),
            } : d),
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const updateChecklist = useCallback(async (requestId: string, field: "interview" | "visit" | "documents", value: boolean) => {
    try {
      const data: any = {};
      if (field === 'interview') data.entrevista = value;
      if (field === 'visit') data.visita = value;
      if (field === 'documents') data.documentos_verificados = value;
      const res = await api.updateChecklistSolicitud(Number(requestId), data);
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            verificationChecklist: { ...r.verificationChecklist, [field]: value },
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const acceptContract = useCallback(async (requestId: string) => {
    try {
      const res = await api.acceptContractSolicitud(Number(requestId));
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            contractAccepted: true,
            contractAcceptedDate: res.evaluacion.contrato_fecha || undefined,
            contractAcceptedIP: res.evaluacion.contrato_ip || undefined,
          } : r
        ));
      }
    } catch (e) { console.error(e) }
  }, []);

  const finalizeAdoption = useCallback(async (requestId: string) => {
    try {
      const res = await api.finalizarSolicitud(Number(requestId));
      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === requestId ? {
            ...r,
            status: 'Adoptada' as RequestStatus,
          } : r
        ));
        if (res.mascota) {
          setPets(prev => prev.map(p =>
            p.id === String(res.mascota.id_mascota) ? { ...p, status: 'Adoptado' as AdoptionStatus } : p
          ));
        }
        return true;
      }
      console.error('[finalizeAdoption] API returned error');
      return false;
    } catch (error) {
      console.error('[finalizeAdoption]', error);
      return false;
    }
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, pets, foundations, favorites, requests, activities,
      notificaciones, loading, unreadCount, loadNotificaciones,
      marcarLeida: marcarLeidaCb, marcarTodasLeidas: marcarTodasLeidasCb,
      login, register, verifyEmail, resendVerification, logout, changePassword, forgotPassword,
      toggleFavorite, submitRequest, updateRequestStatus, updateProfile,
      createFoundation, updateFoundation, verifyFoundation, addPet, updatePet, refreshPets, refreshFoundations,
      addNote, addPendingTask, toggleTask, scheduleAppointment, respondAppointment,
      uploadDocument, reviewDocument, updateChecklist, acceptContract, finalizeAdoption,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
