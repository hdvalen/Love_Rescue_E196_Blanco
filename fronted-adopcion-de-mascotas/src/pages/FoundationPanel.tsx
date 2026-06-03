import { useState, useCallback, useEffect } from "react";
import { ClipboardList, CheckCircle, XCircle, Clock, Eye, FileText, Calendar, MessageSquare, Upload, ChevronDown, ChevronUp, PawPrint, Edit, EyeOff, ExternalLink, User, FileCheck, Flag, CheckSquare, FileSignature, Home, ArrowRight, Info, Plus, Phone, Video, HelpCircle, Building2, RotateCw, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getMiFundacion } from "@/api/reportes";
import type { MiFundacion } from "@/api/reportes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { RequestStatus, NoteVisibility } from "@/data/mockData";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SeguimientoFormDialog } from "@/components/seguimiento";
import type { SeguimientoBackend } from "@/api/seguimientos";
import * as seguimientoApi from "@/api/seguimientos";
import { getUploadUrl } from "@/api/uploads";

const SOLICITUDES_PER_PAGE = 8;

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

const MAIN_STEPS = [
  { key: 'recibida', label: 'Recibida', icon: Home, desc: 'Revisar datos del adoptante' },
  { key: 'evaluacion', label: 'Evaluación', icon: ClipboardList, desc: 'Observaciones, tareas, cita y documentos' },
  { key: 'aprobacion', label: 'Aprobación', icon: Flag, desc: 'Checklist, contrato y finalizar' },
] as const;

function getMainStep(status: RequestStatus): number {
  if (status === 'Recibida') return 0;
  if (status === 'Evaluación') return 1;
  if (status === 'Aprobada' || status === 'En Seguimiento') return 2;
  return -1;
}

export default function FoundationPanel() {
  const { requests, pets, foundations, updateRequestStatus, addNote, addPendingTask, toggleTask, scheduleAppointment, reviewDocument, updateChecklist, finalizeAdoption, currentUser, updatePet } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState("dashboard");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectDoc, setRejectDoc] = useState<{ reqId: string; docId: string } | null>(null);
  const [rejectDocReason, setRejectDocReason] = useState("");
  const [finalizeDialogReq, setFinalizeDialogReq] = useState<string | null>(null);
  const [pendingSeguimientos, setPendingSeguimientos] = useState<SeguimientoBackend[]>([]);
  const [stepSeguimientos, setStepSeguimientos] = useState<Record<string, { pendientes: number; proximo: string | null }>>({});
  const [segCounts, setSegCounts] = useState<Record<string, number>>({});
  const [proximosSegs, setProximosSegs] = useState<SeguimientoBackend[]>([]);

  const [noteText, setNoteText] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<NoteVisibility>("Privada");
  const [taskText, setTaskText] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptStart, setApptStart] = useState("");
  const [apptEnd, setApptEnd] = useState("");

  const myFundacion = foundations.find(f => f.id_usuario === currentUser?.id);
  const myPets = pets.filter(p => p.foundationId === myFundacion?.id);

  const [approveDialogId, setApproveDialogId] = useState<string | null>(null);
  const [changePetStatus, setChangePetStatus] = useState(false);
  const [detalleSolicitanteId, setDetalleSolicitanteId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<MiFundacion | null>(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    getMiFundacion().then(res => {
      if (res.ok) setDashboard(res);
    }).catch(() => {}).finally(() => setDashLoading(false));
  }, []);
  const [solicitudPage, setSolicitudPage] = useState(1);

  const nextStatuses: Partial<Record<RequestStatus, RequestStatus[]>> = {
    Recibida: ["Evaluación"],
    Evaluación: ["Aprobada", "Rechazada"],
  };

  const totalSolicitudPages = Math.ceil(requests.length / SOLICITUDES_PER_PAGE);
  const paginatedRequests = requests.slice((solicitudPage - 1) * SOLICITUDES_PER_PAGE, solicitudPage * SOLICITUDES_PER_PAGE);

  const handleStatusChange = (requestId: string, status: RequestStatus) => {
    if (status === "Rechazada") { setRejectDialogId(requestId); return; }
    if (status === "Aprobada") { setApproveDialogId(requestId); return; }
    updateRequestStatus(requestId, status);
    toast.success(`Estado actualizado a "${status}"`);
  };

  const handleReject = () => {
    if (rejectDialogId) {
      updateRequestStatus(rejectDialogId, "Rechazada", rejectReason);
      toast.success("Solicitud rechazada");
      setRejectDialogId(null);
      setRejectReason("");
    }
  };

  const handleApprove = () => {
    if (approveDialogId) {
      updateRequestStatus(approveDialogId, "Aprobada", undefined, changePetStatus);
      toast.success(changePetStatus ? "Solicitud aprobada y mascota marcada como En Proceso" : "Solicitud aprobada");
      setApproveDialogId(null);
      setChangePetStatus(false);
    }
  };

  const handleAddNote = (requestId: string) => {
    if (!noteText.trim()) return;
    addNote(requestId, { text: noteText, visibility: noteVisibility, date: new Date().toISOString(), author: currentUser?.name || "" });
    setNoteText("");
    toast.success("Nota agregada");
  };

  const handleAddTask = (requestId: string) => {
    if (!taskText.trim()) return;
    addPendingTask(requestId, taskText);
    setTaskText("");
    toast.success("Tarea agregada");
  };

  const handleSchedule = (requestId: string) => {
    if (!apptDate || !apptStart || !apptEnd) { toast.error("Completa todos los campos de la cita"); return; }
    scheduleAppointment({ requestId, date: apptDate, startTime: apptStart, endTime: apptEnd, modality: "Presencial", status: "Pendiente", createdBy: currentUser?.id || "" });
    setApptDate(""); setApptStart(""); setApptEnd("");
    toast.success("Cita programada");
  };

  const handleFinalize = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const { interview, visit, documents } = req.verificationChecklist;
    const activeDocs = req.documents.filter(d => d.status !== 'Rechazado');
    const allDocsApproved = activeDocs.length > 0 && activeDocs.every(d => d.status === "Aprobado");
    if (!interview || !visit || !documents || !allDocsApproved || !req.contractAccepted) {
      toast.error("Debes completar toda la checklist, documentos y contrato antes de finalizar");
      return;
    }

    const res = await seguimientoApi.getSeguimientos({ id_solicitud: String(Number(requestId)) });
    const pendientes = res.ok ? (res.seguimientos || []).filter((s: SeguimientoBackend) => s.estado_seguimiento === 'PENDIENTE') : [];
    if (pendientes.length > 0) {
      setPendingSeguimientos(pendientes);
      setFinalizeDialogReq(requestId);
      return;
    }

    const ok = await finalizeAdoption(requestId);
    if (ok) {
      toast.success("¡Adopción finalizada exitosamente!");
    } else {
      toast.error("Error al finalizar la adopción");
    }
  };

  const handleToggleActive = (petId: string, currentActive: boolean) => {
    updatePet(petId, { active: !currentActive });
    toast.success(currentActive ? "Publicación desactivada" : "Publicación activada");
  };

  // Cargar próximos seguimientos para el dashboard
  useEffect(() => {
    if (tab !== "dashboard") return;
    seguimientoApi.getSeguimientos({}).then(res => {
      if (res.ok && res.seguimientos) {
        const pendientes = (res.seguimientos as SeguimientoBackend[])
          .filter(s => s.estado_seguimiento === 'PENDIENTE' && s.proximo_contacto)
          .sort((a, b) => new Date(a.proximo_contacto!).getTime() - new Date(b.proximo_contacto!).getTime())
          .slice(0, 10);
        setProximosSegs(pendientes);
      }
    }).catch(() => {});
  }, [tab]);

  // ── Seguimiento state ──
  const [seguimientos, setSeguimientos] = useState<SeguimientoBackend[]>([]);

  // Cargar seguimientos para la solicitud expandida (solo cuando se abre y no hay data previa)
  useEffect(() => {
    const req = requests.find(r => r.id === expandedId);
    if (!req || req.status !== 'En Seguimiento') return;
    // Solo cargar si no hay datos cacheados
    if (stepSeguimientos[req.id]) return;
    seguimientoApi.getSeguimientos({ id_solicitud: String(Number(req.id)) }).then(res => {
      if (res.ok && res.seguimientos) {
        const pendientes = res.seguimientos.filter((s: SeguimientoBackend) => s.estado_seguimiento === 'PENDIENTE').length;
        const prox = res.seguimientos.filter((s: SeguimientoBackend) => s.proximo_contacto)
          .sort((a: SeguimientoBackend, b: SeguimientoBackend) => new Date(a.proximo_contacto!).getTime() - new Date(b.proximo_contacto!).getTime())[0];
        const data = { pendientes, proximo: prox?.proximo_contacto || null };
        setStepSeguimientos(prev => ({ ...prev, [req.id]: data }));
        setSegCounts(prev => ({ ...prev, [req.id]: pendientes }));
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId, requests]);


  const [seguimientoFormOpen, setSeguimientoFormOpen] = useState(false);
  const [seguimientoFormMode, setSeguimientoFormMode] = useState<"create" | "edit" | "complete">("create");
  const [selectedSeguimiento, setSelectedSeguimiento] = useState<SeguimientoBackend | null>(null);
  const [seguimientoDefaultSolicitud, setSeguimientoDefaultSolicitud] = useState("");
  const [loadingSeg, setLoadingSeg] = useState(false);

  const loadSeguimientos = useCallback(async () => {
    try {
      setLoadingSeg(true);
      const res = await seguimientoApi.getSeguimientos();
      if (res.ok) setSeguimientos(res.seguimientos);
    } catch { /* ignore */ }
    setLoadingSeg(false);
  }, []);

  const myApprovedRequestIds = requests
    .filter(r => {
      const pet = pets.find(p => p.id === r.petId);
      return pet?.foundationId === myFundacion?.id;
    })
    .map(r => Number(r.id));

  const mySeguimientos = seguimientos.filter(s => myApprovedRequestIds.includes(s.id_solicitud));

  const handleCreateSeguimiento = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await seguimientoApi.createSeguimiento(data as Parameters<typeof seguimientoApi.createSeguimiento>[0]);
      if (res.ok) {
        setSeguimientos(prev => [...prev, res.seguimiento]);
        toast.success("Seguimiento creado exitosamente");
        setSeguimientoFormOpen(false);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al crear seguimiento");
    }
  }, []);

  const handleEditSeguimiento = useCallback(async (data: Record<string, unknown>) => {
    if (!selectedSeguimiento) return;
    try {
      const res = await seguimientoApi.updateSeguimiento(selectedSeguimiento.id_seguimiento, data as Parameters<typeof seguimientoApi.updateSeguimiento>[1]);
      if (res.ok) {
        setSeguimientos(prev => prev.map(s => s.id_seguimiento === res.seguimiento.id_seguimiento ? res.seguimiento : s));
        toast.success("Seguimiento actualizado");
        setSeguimientoFormOpen(false);
        setSelectedSeguimiento(null);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar seguimiento");
    }
  }, [selectedSeguimiento]);

  const handleCompleteSeguimiento = useCallback(async (data: Record<string, unknown>) => {
    if (!selectedSeguimiento) return;
    try {
      const res = await seguimientoApi.completeSeguimiento(
        selectedSeguimiento.id_seguimiento,
        data.observaciones as string | undefined
      );
      if (res.ok) {
        setSeguimientos(prev => prev.map(s => s.id_seguimiento === res.seguimiento.id_seguimiento ? res.seguimiento : s));
        toast.success("Seguimiento completado");
        setSeguimientoFormOpen(false);
        setSelectedSeguimiento(null);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al completar seguimiento");
    }
  }, [selectedSeguimiento]);

  const [cancelSeg, setCancelSeg] = useState<SeguimientoBackend | null>(null);
  const handleCancelSeguimiento = useCallback(async (seg: SeguimientoBackend) => {
    setCancelSeg(seg);
  }, []);

  const confirmCancelSeguimiento = useCallback(async () => {
    if (!cancelSeg) return;
    try {
      const res = await seguimientoApi.updateSeguimiento(cancelSeg.id_seguimiento, { estado_seguimiento: "CANCELADO" } as Parameters<typeof seguimientoApi.updateSeguimiento>[1]);
      if (res.ok) {
        setSeguimientos(prev => prev.map(s => s.id_seguimiento === res.seguimiento.id_seguimiento ? res.seguimiento : s));
        toast.success("Seguimiento cancelado");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al cancelar seguimiento");
    }
    setCancelSeg(null);
  }, [cancelSeg]);

  const openCreateForm = useCallback((solId?: string) => {
    setSelectedSeguimiento(null);
    setSeguimientoDefaultSolicitud(solId || "");
    setSeguimientoFormMode("create");
    setSeguimientoFormOpen(true);
  }, []);

  const openEditForm = useCallback((seg: SeguimientoBackend) => {
    setSelectedSeguimiento(seg);
    setSeguimientoFormMode("edit");
    setSeguimientoFormOpen(true);
  }, []);

  const openCompleteForm = useCallback((seg: SeguimientoBackend) => {
    setSelectedSeguimiento(seg);
    setSeguimientoFormMode("complete");
    setSeguimientoFormOpen(true);
  }, []);

  const solicitudOptions = requests
    .filter(r => {
      const pet = pets.find(p => p.id === r.petId);
      return pet?.foundationId === myFundacion?.id && ["Aprobada", "En Seguimiento"].includes(r.status);
    })
    .map(r => ({
      value: r.id,
      label: `#${r.id} — ${r.adopterName} (${pets.find(p => p.id === r.petId)?.name || 'Mascota'})`,
    }));

  // Iconos para tipo de seguimiento
  const TIPO_ICON: Record<string, typeof Phone> = {
    CONTACTO: MessageSquare,
    VISITA: Building2,
    LLAMADA: Phone,
    CUESTIONARIO: HelpCircle,
  };

  useEffect(() => {
    if (myFundacion) loadSeguimientos();
  }, [myFundacion, loadSeguimientos]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
        <ClipboardList className="h-6 w-6 text-primary" /> Panel de Fundación
      </h1>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); if (v === "seguimientos" && seguimientos.length === 0) loadSeguimientos(); }}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
          <TabsTrigger value="seguimientos">Seguimiento</TabsTrigger>
          <TabsTrigger value="publicaciones">Mis Publicaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {dashLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-5 shadow-sm animate-pulse">
                  <div className="h-12 w-12 rounded-lg bg-muted mb-3" />
                  <div className="h-6 w-16 bg-muted rounded mb-2" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : dashboard ? (
            <>
              {/* Metric cards clicables */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: PawPrint, label: 'Mascotas activas', value: dashboard.mascotas.disponibles, sub: `${dashboard.mascotas.total} totales`, tab: 'publicaciones' },
                  { icon: ClipboardList, label: 'Solicitudes pendientes', value: dashboard.solicitudes.pendientes + dashboard.solicitudes.enEvaluacion, sub: `${dashboard.solicitudes.adoptadas} completadas`, tab: 'solicitudes' },
                  { icon: Heart, label: 'Adopciones completadas', value: dashboard.solicitudes.adoptadas, tab: null },
                  { icon: Clock, label: 'En seguimiento', value: requests.filter(r => r.status === 'En Seguimiento').length, sub: `${proximosSegs.length} pendientes`, tab: 'solicitudes' },
                  { icon: Calendar, label: 'Citas próximas (7d)', value: dashboard.citasProximas.length, tab: null },
                  { icon: Eye, label: 'Notificaciones', value: dashboard.notificaciones.noLeidas, sub: `${dashboard.notificaciones.total} totales`, tab: null },
                ].map(({ icon: Icon, label, value, sub, tab: destTab }) => (
                  <div key={label}
                    onClick={() => { if (destTab) setTab(destTab); }}
                    className={cn(
                      "rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4 transition-all",
                      destTab ? "cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5" : ""
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                      destTab ? "bg-primary/10" : "bg-muted/50"
                    )}>
                      <Icon className={cn("h-6 w-6", destTab ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Row: Citas próximas + Próximos seguimientos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Citas próximas */}
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Próximas citas
                  </h3>
                  {dashboard.citasProximas.length > 0 ? (
                    <div className="space-y-2">
                      {dashboard.citasProximas.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                          <span className="truncate">{c.fecha} {c.hora_inicio?.slice(0,5)} - {c.adoptante} ({c.mascota})</span>
                          <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{c.estado}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs">No hay citas programadas</p>
                    </div>
                  )}
                </div>

                {/* Próximos seguimientos */}
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Próximos seguimientos
                  </h3>
                  {proximosSegs.length > 0 ? (
                    <div className="space-y-2">
                      {proximosSegs.slice(0, 5).map(s => {
                        const req = requests.find(r => Number(r.id) === s.id_solicitud);
                        const pet = req ? pets.find(p => p.id === req.petId) : null;
                        const label: Record<string, string> = { CONTACTO: 'Contacto', VISITA: 'Visita', LLAMADA: 'Llamada', CUESTIONARIO: 'Cuestionario' };
                        return (
                          <div key={s.id_seguimiento} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">{label[s.tipo] || s.tipo}</span>
                              <span className="truncate text-muted-foreground">{pet?.name || 'Mascota'} · {req?.adopterName || ''}</span>
                            </div>
                            <span className={cn("text-xs shrink-0 ml-2", s.proximo_contacto && new Date(s.proximo_contacto) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground")}>
                              {s.proximo_contacto ? new Date(s.proximo_contacto).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '—'}
                              {s.proximo_contacto && new Date(s.proximo_contacto) < new Date() && ' (atrasado)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs">Actualmente no tienes seguimientos pendientes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Distribución mascotas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-1">
                  <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <PawPrint className="h-4 w-4" /> Mascotas por estado
                  </h3>
                  {dashboard.mascotas.disponibles === 0 && dashboard.mascotas.enProceso === 0 && dashboard.mascotas.adoptadas === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <PawPrint className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs">¡Tu histórico de adopciones comenzará a aparecer aquí cuando completes tu primer proceso de adopción!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { label: 'Disponibles', count: dashboard.mascotas.disponibles, color: 'bg-emerald-500' },
                        { label: 'En Proceso', count: dashboard.mascotas.enProceso, color: 'bg-amber-500' },
                        { label: 'Adoptadas', count: dashboard.mascotas.adoptadas, color: 'bg-blue-500' },
                      ].map(s => (
                        <div key={s.label} className="flex items-center gap-3 text-sm">
                          <div className={'h-2.5 w-2.5 rounded-full shrink-0 ' + s.color} />
                          <span className="flex-1">{s.label}</span>
                          <Badge variant="secondary" className="font-mono">{s.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="publicaciones">
          {myPets.length === 0 ? (
            <div className="text-center py-16">
              <PawPrint className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 font-heading text-lg text-muted-foreground">No has publicado mascotas aún</p>
              <Link to="/publicar-mascota"><Button className="mt-4">Publicar Mascota</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myPets.map(pet => (
                <div key={pet.id} className="rounded-xl border bg-card shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <img src={pet.images[0]} alt={pet.name} className="h-16 w-16 rounded-lg object-cover ring-1 ring-border" />
                      <div>
                        <h3 className="font-heading font-bold">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">{pet.species} · {pet.breed} · {pet.age}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={
                            pet.status === "Disponible" ? "bg-success text-success-foreground" :
                            pet.status === "En Proceso" ? "bg-warning text-warning-foreground" :
                            "bg-muted text-muted-foreground"
                          }>{pet.status}</Badge>
                          {!pet.active && <Badge variant="outline" className="text-destructive border-destructive"><EyeOff className="mr-1 h-3 w-3" /> Desactivada</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Activa</Label>
                        <Switch checked={pet.active} onCheckedChange={() => handleToggleActive(pet.id, pet.active)} />
                      </div>
                      <Link to={`/editar-mascota/${pet.id}`}>
                        <Button variant="outline" size="sm"><Edit className="mr-1 h-4 w-4" /> Editar</Button>
                      </Link>
                    </div>
                  </div>
                  {pet.status !== "Disponible" && !pet.active && (
                    <div className={cn(
                      "mt-3 rounded-lg border p-3 text-sm flex items-center gap-2",
                      "bg-muted/50 border-dashed"
                    )}>
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Esta publicación está desactivada y no es visible para adoptantes.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="seguimientos">
          {loadingSeg ? (
            <div className="text-center py-16">
              <Clock className="mx-auto h-10 w-10 text-muted-foreground/50 animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Cargando seguimientos...</p>
            </div>
          ) : myFundacion && myApprovedRequestIds.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 font-heading text-lg text-muted-foreground">No hay solicitudes aprobadas para hacer seguimiento</p>
              <p className="text-sm text-muted-foreground mt-1">Las solicitudes aprobadas aparecerán aquí para registrar actividades post-adopción.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Create button */}
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">
                  Seguimientos ({mySeguimientos.length})
                </h2>
              </div>

              {mySeguimientos.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aún no hay seguimientos registrados</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Crea el primer seguimiento para dar inicio al monitoreo post-adopción.</p>
                  <Button onClick={openCreateForm} size="sm" className="mt-4 rounded-xl">
                    <Plus className="mr-1.5 h-4 w-4" /> Programar actividad
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const grupos = new Map<number, typeof mySeguimientos>();
                    mySeguimientos.forEach(seg => {
                      const g = grupos.get(seg.id_solicitud) || [];
                      g.push(seg);
                      grupos.set(seg.id_solicitud, g);
                    });
                    return Array.from(grupos.entries()).map(([solId, segs]) => {
                      const req = requests.find(r => Number(r.id) === solId);
                      const pet = req ? pets.find(p => p.id === req.petId) : null;
                      const pendientes = segs.filter(s => s.estado_seguimiento === 'PENDIENTE').length;
                      const realizados = segs.filter(s => s.estado_seguimiento === 'REALIZADO').length;
                      return (
                        <div key={solId} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                          <div className="p-4 bg-muted/30 border-b flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <PawPrint className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{pet?.name || 'Mascota'}</h3>
                                <p className="text-xs text-muted-foreground">{req?.adopterName || 'Adoptante'} · {pendientes} pendiente(s) · {realizados} realizado(s)</p>
                              </div>
                            </div>
                            <Button size="sm" className="h-7 text-xs rounded-lg" onClick={() => openCreateForm(String(solId))}>
                              <Plus className="mr-1 h-3 w-3" /> Programar actividad
                            </Button>
                          </div>
                          <div className="divide-y">
                            {segs.map(seg => {
                              const TipoIcon = TIPO_ICON[seg.tipo] || MessageSquare;
                              return (
                                <div key={seg.id_seguimiento} className={cn(
                                  "p-4 transition-all",
                                  seg.estado_seguimiento === "REALIZADO" && "bg-emerald-50/20",
                                  seg.estado_seguimiento === "CANCELADO" && "bg-red-50/20 opacity-70",
                                )}>
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                      <div className={cn(
                                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                        seg.estado_seguimiento === "REALIZADO" && "bg-emerald-100", seg.estado_seguimiento === "CANCELADO" && "bg-red-100", seg.estado_seguimiento === "PENDIENTE" && "bg-amber-100",
                                      )}>
                                        <TipoIcon className={cn("h-4 w-4", seg.estado_seguimiento === "REALIZADO" && "text-emerald-600", seg.estado_seguimiento === "CANCELADO" && "text-red-500", seg.estado_seguimiento === "PENDIENTE" && "text-amber-600")} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-medium text-sm">
                                            {seg.tipo === "CONTACTO" ? "Contacto" : seg.tipo === "VISITA" ? `Visita ${seg.tipo_visita === "VIRTUAL" ? "Virtual" : "Presencial"}` : seg.tipo === "LLAMADA" ? "Llamada" : seg.tipo === "CUESTIONARIO" ? "Cuestionario" : seg.tipo}
                                          </span>
                                          <Badge className={cn("text-[10px] h-5", seg.estado_seguimiento === "PENDIENTE" && "bg-amber-500/15 text-amber-600 border-amber-200", seg.estado_seguimiento === "REALIZADO" && "bg-emerald-500/15 text-emerald-600 border-emerald-200", seg.estado_seguimiento === "CANCELADO" && "bg-red-500/15 text-red-600 border-red-200")} variant="outline">
                                            <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1", seg.estado_seguimiento === "PENDIENTE" && "bg-amber-500", seg.estado_seguimiento === "REALIZADO" && "bg-emerald-500", seg.estado_seguimiento === "CANCELADO" && "bg-red-500")} />
                                            {seg.estado_seguimiento === "PENDIENTE" ? "Pendiente" : seg.estado_seguimiento === "REALIZADO" ? "Realizado" : "Cancelado"}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{seg.descripcion}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                                          <span>{seg.fecha_seguimiento ? new Date(seg.fecha_seguimiento).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"}</span>
                                          {seg.proximo_contacto && <><span className="text-muted-foreground/40">·</span><span>Próximo: {new Date(seg.proximo_contacto).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span></>}
                                        </div>
                                        {seg.observaciones && seg.estado_seguimiento === "REALIZADO" && (
                                          <div className="mt-2 rounded bg-emerald-50 border border-emerald-100 p-2 text-[11px] text-emerald-800"><span className="font-semibold">Observaciones:</span> {seg.observaciones}</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {seg.estado_seguimiento === "PENDIENTE" && (
                                        <>
                                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg" onClick={() => openEditForm(seg)}><Edit className="h-3.5 w-3.5" /></Button>
                                          <Button size="sm" className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openCompleteForm(seg)}><CheckCircle className="mr-1 h-3 w-3" /> Completar</Button>
                                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-red-500" onClick={() => handleCancelSeguimiento(seg)}><XCircle className="h-3.5 w-3.5" /></Button>
                                        </>
                                      )}
                                      {seg.estado_seguimiento !== "PENDIENTE" && (
                                        <Badge variant="outline" className={cn("text-[10px] h-5", seg.estado_seguimiento === "REALIZADO" && "bg-emerald-500/15 text-emerald-600 border-emerald-200", seg.estado_seguimiento === "CANCELADO" && "bg-red-500/15 text-red-600 border-red-200")}>
                                          {seg.estado_seguimiento === "REALIZADO" ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                                          {seg.estado_seguimiento === "REALIZADO" ? "Completado" : "Cancelado"}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="solicitudes">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 font-heading text-lg text-muted-foreground">No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedRequests.map(req => {
                const pet = pets.find(p => p.id === req.petId);
                const isExpanded = expandedId === req.id;
                const currentStep = getMainStep(req.status);
                const isRechazada = req.status === 'Rechazada';

                return (
                  <div key={req.id} className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
                    <div className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          {pet && (
                            <div className="h-14 w-14 rounded-xl overflow-hidden ring-1 ring-border shrink-0">
                              <img src={pet.images[0]} alt={pet.name} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-heading font-bold text-lg truncate">{req.adopterName}</h3>
                              <Badge className={cn("shrink-0",
                                req.status === 'Recibida' && "bg-blue-500/15 text-blue-600 border-blue-200 hover:bg-blue-500/20",
                                req.status === 'Evaluación' && "bg-amber-500/15 text-amber-600 border-amber-200 hover:bg-amber-500/20",
                                req.status === 'Aprobada' && "bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20",
                                req.status === 'En Seguimiento' && "bg-purple-500/15 text-purple-600 border-purple-200 hover:bg-purple-500/20",
                                req.status === 'Adoptada' && "bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20",
                                req.status === 'Rechazada' && "bg-red-500/15 text-red-600 border-red-200 hover:bg-red-500/20",
                              )} variant="outline">
                                <span className={cn(
                                  "inline-block w-1.5 h-1.5 rounded-full mr-1.5",
                                  req.status === 'Recibida' && "bg-blue-500",
                                  req.status === 'Evaluación' && "bg-amber-500",
                                  req.status === 'Aprobada' && "bg-emerald-500",
                                  req.status === 'En Seguimiento' && "bg-purple-500",
                                  req.status === 'Adoptada' && "bg-emerald-500",
                                  req.status === 'Rechazada' && "bg-red-500",
                                )} />
                                {req.status === 'Evaluación' ? 'En Evaluación' : req.status}
                              </Badge>
                              {req.status === 'En Seguimiento' && segCounts[req.id] !== undefined && (
                                <span className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                  segCounts[req.id] > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                )}>
                                  {segCounts[req.id] > 0 ? `🔔 ${segCounts[req.id]} pendiente(s)` : "✓ al día"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Solicita adoptar a <span className="font-medium text-foreground">{pet?.name || 'Mascota'}</span>
                              <span className="mx-1.5 text-muted-foreground/40">·</span>
                              {req.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!isRechazada && (
                            <Select value={req.status} onValueChange={(v: RequestStatus) => handleStatusChange(req.id, v)}>
                              <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value={req.status} disabled>Actual: {req.status}</SelectItem>
                                {(nextStatuses[req.status] || []).map(s => (
                                  <SelectItem key={s} value={s}>{s === "Evaluación" ? "En Evaluación" : s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setExpandedId(isExpanded ? null : req.id)} className="h-9 w-9">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      {req.message && (
                        <p className="mt-2.5 text-sm text-muted-foreground line-clamp-2 italic border-l-2 border-muted-foreground/20 pl-3">
                          "{req.message}"
                        </p>
                      )}
                      {isRechazada && req.rejectionReason && (
                        <p className="mt-2.5 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">Motivo: {req.rejectionReason}</p>
                      )}
                    </div>

                    {isExpanded && !isRechazada && (
                      <div className="border-t">
                        {/* Main 3-step stepper */}
                        <div className="px-5 pt-6 pb-2 bg-muted/20">
                          <div className="flex items-center max-w-3xl mx-auto">
                            {MAIN_STEPS.map((step, i) => {
                              const StepIcon = step.icon;
                              const isCompleted = i < currentStep;
                              const isCurrent = i === currentStep;
                              const isLast = i === MAIN_STEPS.length - 1;

                              return (
                                <div key={step.key} className="flex items-center flex-1">
                                  <div className="flex flex-col items-center">
                                    <div className={cn(
                                      "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold border-2 transition-all duration-300",
                                      isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                                      isCurrent && "border-primary text-primary bg-primary/10 shadow-sm shadow-primary/20",
                                      !isCompleted && !isCurrent && "border-muted-foreground/25 text-muted-foreground/50 bg-white"
                                    )}>
                                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-4 w-4" />}
                                    </div>
                                    <span className={cn(
                                      "text-xs font-semibold mt-1.5 transition-colors",
                                      isCompleted && "text-emerald-600",
                                      isCurrent && "text-primary",
                                      !isCompleted && !isCurrent && "text-muted-foreground/50"
                                    )}>{step.label}</span>
                                    <span className={cn(
                                      "text-[10px] mt-0.5 transition-colors",
                                      isCurrent ? "text-primary/60" : "text-muted-foreground/30"
                                    )}>{step.desc}</span>
                                  </div>
                                  {!isLast && (
                                    <div className={cn(
                                      "flex-1 h-0.5 mx-4 mb-6 rounded-full transition-colors duration-300",
                                      isCompleted ? "bg-emerald-400" : "bg-muted-foreground/15"
                                    )} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-5">
                          {/* ───── Recibida Step ───── */}
                          {currentStep === 0 && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                              {/* Left: Adopter info */}
                              <div className="xl:col-span-2 space-y-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-heading font-semibold">Información del solicitante</h3>
                                    <p className="text-xs text-muted-foreground">Revisa los datos del adoptante antes de iniciar la evaluación</p>
                                  </div>
                                  <Button variant="outline" size="sm" className="ml-auto h-8 text-xs" onClick={() => setDetalleSolicitanteId(req.id)}>
                                    Ver perfil completo
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  {[
                                    { label: 'Nombre completo', value: req.adopterName },
                                    { label: 'Email', value: req.adopterEmail || '—' },
                                    { label: 'Teléfono', value: req.adopterPhone || '—' },
                                    { label: 'Tipo de vivienda', value: req.adopterHousingType ? req.adopterHousingType.charAt(0).toUpperCase() + req.adopterHousingType.slice(1) : '—' },
                                  ].map(({ label, value }) => (
                                    <div key={label} className="rounded-xl bg-muted/40 border border-border/50 p-4">
                                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                                      <p className="text-sm font-semibold mt-1">{value}</p>
                                    </div>
                                  ))}
                                </div>

                                <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
                                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Motivo de la solicitud</p>
                                  <p className="text-sm leading-relaxed">"{req.message}"</p>
                                </div>
                              </div>

                              {/* Right: Sidebar */}
                              <div className="space-y-4">
                                <div className="rounded-xl border bg-card p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acción rápida</h4>
                                  <Button onClick={() => handleStatusChange(req.id, 'Evaluación')} className="w-full h-10 rounded-xl" size="default">
                                    <Eye className="mr-2 h-4 w-4" /> Iniciar Evaluación
                                  </Button>
                                </div>

                                <div className="rounded-xl border bg-muted/30 p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Solicitud</h4>
                                  <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">ID</span>
                                      <span className="font-mono text-xs">#{req.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Recibida</span>
                                      <span className="font-medium text-xs">{req.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Mascota</span>
                                      <span className="font-medium text-xs">{pet?.name || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ───── Evaluación Step ───── */}
                          {currentStep === 1 && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                              {/* Left: Tabs */}
                              <div className="xl:col-span-2">
                                <Tabs defaultValue="observaciones" className="w-full">
                                  <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
                                    {[
                                      { key: 'observaciones', label: 'Observaciones', icon: MessageSquare },
                                      { key: 'tareas', label: 'Tareas', icon: CheckSquare },
                                      { key: 'cita', label: 'Cita', icon: Calendar },
                                      { key: 'documentos', label: 'Documentos', icon: FileText },
                                    ].map(({ key, label, icon: TabIcon }) => (
                                      <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 py-2.5 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white rounded-lg">
                                        <TabIcon className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">{label}</span>
                                      </TabsTrigger>
                                    ))}
                                  </TabsList>

                                  <TabsContent value="observaciones" className="mt-5 space-y-4">
                                    <div className="flex gap-3">
                                      <div className="flex-1">
                                        <Textarea
                                          value={noteText}
                                          onChange={e => setNoteText(e.target.value)}
                                          placeholder="Agregar observación..."
                                          className="min-h-[100px] resize-none rounded-xl text-sm"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1.5">
                                        <Select value={noteVisibility} onValueChange={(v: NoteVisibility) => setNoteVisibility(v)}>
                                          <SelectTrigger className="w-28 h-9 text-xs"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Privada">
                                              <span className="flex items-center gap-1.5"><EyeOff className="h-3 w-3" /> Privada</span>
                                            </SelectItem>
                                            <SelectItem value="Compartida">
                                              <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" /> Compartida</span>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button size="sm" onClick={() => handleAddNote(req.id)} className="h-9">
                                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Agregar
                                        </Button>
                                      </div>
                                    </div>

                                    {req.notes.length > 0 ? (
                                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                        {req.notes.map(n => (
                                          <div key={n.id} className={cn(
                                            "rounded-xl border p-4 text-sm transition-all",
                                            n.visibility === 'Privada'
                                              ? 'bg-amber-50/50 border-amber-200/50'
                                              : 'bg-blue-50/50 border-blue-200/50'
                                          )}>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white border text-[10px] font-bold text-muted-foreground">
                                                {n.author.charAt(0).toUpperCase()}
                                              </span>
                                              <span className="font-semibold text-foreground/70">{n.author}</span>
                                              <span className="text-muted-foreground/40">·</span>
                                              <span>{new Date(n.date).toLocaleString('es-CO')}</span>
                                              <Badge variant="outline" className={cn(
                                                "ml-auto text-[10px] h-5 px-2",
                                                n.visibility === 'Privada'
                                                  ? 'border-amber-300 text-amber-700 bg-amber-100/50'
                                                  : 'border-blue-300 text-blue-700 bg-blue-100/50'
                                              )}>
                                                {n.visibility === 'Privada' ? <EyeOff className="h-2.5 w-2.5 mr-1" /> : <Eye className="h-2.5 w-2.5 mr-1" />}
                                                {n.visibility}
                                              </Badge>
                                            </div>
                                            <p className="text-sm leading-relaxed">{n.text}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                                        <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">No hay observaciones aún</p>
                                        <p className="text-xs text-muted-foreground/50 mt-1">Las notas privadas solo las verás tú; las compartidas las verá el adoptante.</p>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent value="tareas" className="mt-5 space-y-4">
                                    <div className="flex gap-2">
                                      <Input
                                        value={taskText}
                                        onChange={e => setTaskText(e.target.value)}
                                        placeholder="Nueva tarea para el adoptante..."
                                        className="flex-1 rounded-xl text-sm"
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddTask(req.id); }}
                                      />
                                      <Button size="sm" onClick={() => handleAddTask(req.id)} className="h-9 px-4 shrink-0 rounded-xl">
                                        Agregar
                                      </Button>
                                    </div>

                                    {req.pendingTasks.length > 0 ? (
                                      <div className="rounded-xl border divide-y">
                                        {req.pendingTasks.map(t => (
                                          <div key={t.id} className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors">
                                            <Checkbox
                                              checked={t.completed}
                                              onCheckedChange={() => toggleTask(req.id, t.id)}
                                              className={cn(t.completed && "text-emerald-500 border-emerald-400")}
                                            />
                                            <span className={cn(
                                              "text-sm flex-1",
                                              t.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'
                                            )}>{t.text}</span>
                                            {t.completed && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                                        <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">No hay tareas asignadas</p>
                                        <p className="text-xs text-muted-foreground/50 mt-1">Asigna tareas que el adoptante debe completar durante la evaluación.</p>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent value="cita" className="mt-5 space-y-4">
                                    <div className="rounded-xl border bg-card p-5">
                                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Programar nueva cita
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <div className="sm:col-span-2">
                                          <Label className="text-xs text-muted-foreground">Fecha</Label>
                                          <Input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="mt-1 h-10 text-sm rounded-xl" />
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Hora inicio</Label>
                                          <Input type="time" value={apptStart} onChange={e => setApptStart(e.target.value)} className="mt-1 h-10 text-sm rounded-xl" />
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Hora fin</Label>
                                          <Input type="time" value={apptEnd} onChange={e => setApptEnd(e.target.value)} className="mt-1 h-10 text-sm rounded-xl" />
                                        </div>
                                      </div>
                                      <Button size="sm" variant="outline" className="mt-4 rounded-xl" onClick={() => handleSchedule(req.id)}>
                                        <Calendar className="mr-1.5 h-3.5 w-3.5" /> Programar
                                      </Button>
                                    </div>

                                    {req.appointments.length > 0 ? (
                                      <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                          Citas agendadas ({req.appointments.length})
                                        </h4>
                                        {req.appointments.map(a => (
                                          <div key={a.id} className="flex items-center gap-3 rounded-xl border p-3.5 text-sm">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                              <Calendar className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm">{a.date}</p>
                                              <p className="text-xs text-muted-foreground">{a.startTime} - {a.endTime} · {a.modality}</p>
                                            </div>
                                          <div className="flex flex-col items-end gap-1 shrink-0">
                                            <Badge className={cn(
                                              "text-[10px] h-5",
                                              a.status === 'Aceptada' && 'bg-emerald-500/15 text-emerald-600 border-emerald-200',
                                              a.status === 'Rechazada' && 'bg-red-500/15 text-red-600 border-red-200',
                                              a.status === 'Pendiente' && 'bg-amber-500/15 text-amber-600 border-amber-200',
                                            )} variant="outline">
                                              <span className={cn(
                                                "inline-block w-1.5 h-1.5 rounded-full mr-1",
                                                a.status === 'Aceptada' && "bg-emerald-500",
                                                a.status === 'Rechazada' && "bg-red-500",
                                                a.status === 'Pendiente' && "bg-amber-500",
                                              )} />
                                              {a.status}
                                            </Badge>
                                            {a.status === 'Rechazada' && a.rejectionReason && (
                                              <p className="text-[11px] text-red-500 leading-tight text-right max-w-[200px]">
                                                Motivo: {a.rejectionReason}
                                              </p>
                                            )}
                                          </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                                        <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">No hay citas programadas</p>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent value="documentos" className="mt-5 space-y-4">
                                    {req.documents.length > 0 ? (
                                      <div className="space-y-3">
                                        {req.documents.map(doc => (
                                          <div key={doc.id} className="flex items-center justify-between rounded-xl border p-4 transition-all hover:border-muted-foreground/20">
                                            <div className="flex items-center gap-4 min-w-0">
                                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                              </div>
                                              <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                                {doc.fileName && (
                                                  <a
                                                    href={getUploadUrl(doc.fileName)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                                                  >
                                                    <ExternalLink className="h-3 w-3" /> Ver archivo
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0">
                                                {doc.status === 'Rechazado' && doc.rejectionComment && (
                                                  <p className="text-[10px] text-red-500 mr-2 max-w-[200px] truncate" title={doc.rejectionComment}>Motivo: {doc.rejectionComment}</p>
                                                )}
                                                <Badge className={cn(
                                                "text-[10px] h-5",
                                                doc.status === 'Aprobado' && 'bg-emerald-500/15 text-emerald-600 border-emerald-200',
                                                doc.status === 'Rechazado' && 'bg-red-500/15 text-red-600 border-red-200',
                                                doc.status === 'Pendiente' && 'bg-amber-500/15 text-amber-600 border-amber-200',
                                              )} variant="outline">
                                                <span className={cn(
                                                  "inline-block w-1.5 h-1.5 rounded-full mr-1",
                                                  doc.status === 'Aprobado' && "bg-emerald-500",
                                                  doc.status === 'Rechazado' && "bg-red-500",
                                                  doc.status === 'Pendiente' && "bg-amber-500",
                                                )} />
                                                {doc.status}
                                              </Badge>
                                              {doc.status === 'Pendiente' && (
                                                <>
                                                  <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg" onClick={() => reviewDocument(req.id, doc.id, true)}>
                                                    <CheckCircle className="mr-1 h-3 w-3" /> Aprobar
                                                  </Button>
                                                  <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg" onClick={() => { setRejectDoc({ reqId: req.id, docId: doc.id }); setRejectDocReason(''); }}>
                                                    <XCircle className="mr-1 h-3 w-3" /> Rechazar
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                                        <Upload className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">El adoptante aún no ha subido documentos</p>
                                        <p className="text-xs text-muted-foreground/50 mt-1">Los documentos aparecerán aquí una vez que el adoptante los cargue.</p>
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </div>

                              {/* Right: Sidebar */}
                              <div className="space-y-4">
                                {/* Status card */}
                                <div className="rounded-xl border bg-card p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estado del proceso</h4>
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                                      <Clock className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">En Evaluación</p>
                                      <p className="text-xs text-muted-foreground">Paso 2 de 3</p>
                                    </div>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5">
                                    <div className="bg-amber-500 h-1.5 rounded-full w-[50%]" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">Completa observaciones, tareas, cita y documentos para avanzar.</p>
                                </div>

                                {/* Adopter quick info */}
                                <div className="rounded-xl border bg-card p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Solicitante</h4>
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold truncate">{req.adopterName}</p>
                                      <p className="text-xs text-muted-foreground truncate">{req.adopterEmail || 'Sin email'}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDetalleSolicitanteId(req.id)} title="Ver perfil completo">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="mt-3 space-y-1.5 text-xs border-t pt-3">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Teléfono</span>
                                      <span className="font-medium">{req.adopterPhone || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Vivienda</span>
                                      <span className="font-medium capitalize">{req.adopterHousingType || '—'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Quick stats */}
                                <div className="rounded-xl border bg-card p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumen</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                                      <p className="text-lg font-bold">{req.notes.length}</p>
                                      <p className="text-[10px] text-muted-foreground">Notas</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                                      <p className="text-lg font-bold">{req.pendingTasks.filter(t => !t.completed).length}</p>
                                      <p className="text-[10px] text-muted-foreground">Pendientes</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                                      <p className="text-lg font-bold">{req.appointments.length}</p>
                                      <p className="text-[10px] text-muted-foreground">Citas</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                                      <p className="text-lg font-bold">{req.documents.filter(d => d.status === 'Aprobado').length}/{req.documents.length}</p>
                                      <p className="text-[10px] text-muted-foreground">Docs aprob.</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Approve / Reject actions */}
                                <div className="rounded-xl border bg-card p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acciones</h4>
                                  <div className="space-y-2">
                                    <Button
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                                      onClick={() => setApproveDialogId(req.id)}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" /> Aprobar solicitud
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl"
                                      onClick={() => setRejectDialogId(req.id)}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" /> Rechazar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ───── Aprobación Step ───── */}
                          {currentStep === 2 && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                              {/* Left: Checklist, contract, documents */}
                              <div className="xl:col-span-2 space-y-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Flag className="h-5 w-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-heading font-semibold">Aprobación y finalización</h3>
                                    <p className="text-xs text-muted-foreground">Completa los pasos finales para concretar la adopción</p>
                                  </div>
                                </div>

                                <div className="rounded-xl border bg-card p-5">
                                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 text-primary" />
                                    Checklist de verificación
                                  </h4>
                                  <div className="space-y-3">
                                    {[
                                      { key: 'interview' as const, label: 'Entrevista realizada', desc: 'Conversación con el adoptante completada' },
                                      { key: 'visit' as const, label: 'Visita al hogar completada', desc: 'Verificación del entorno del adoptante' },
                                      { key: 'documents' as const, label: 'Documentos verificados', desc: 'Todos los documentos han sido revisados' },
                                    ].map(({ key, label, desc }) => (
                                      <div key={key} className="flex items-center gap-3 rounded-lg border p-3.5 transition-all hover:border-muted-foreground/30">
                                        <Checkbox
                                          checked={req.verificationChecklist[key]}
                                          onCheckedChange={(v) => updateChecklist(req.id, key, v === true)}
                                          className={cn(req.verificationChecklist[key] && "text-emerald-500 border-emerald-400")}
                                        />
                                        <div className="flex-1">
                                          <span className={cn(
                                            "text-sm font-medium",
                                            req.verificationChecklist[key] && "text-emerald-700"
                                          )}>{label}</span>
                                          <p className="text-xs text-muted-foreground">{desc}</p>
                                        </div>
                                        {req.verificationChecklist[key] && (
                                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className={cn(
                                  "rounded-xl border p-5 transition-all",
                                  req.contractAccepted
                                    ? 'bg-emerald-50/50 border-emerald-200'
                                    : 'bg-card'
                                )}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center",
                                        req.contractAccepted ? 'bg-emerald-100' : 'bg-muted'
                                      )}>
                                        <FileSignature className={cn(
                                          "h-5 w-5",
                                          req.contractAccepted ? 'text-emerald-600' : 'text-muted-foreground'
                                        )} />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold">Contrato de adopción</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {req.contractAccepted
                                            ? `Firmado el ${new Date(req.contractAcceptedDate!).toLocaleString('es-CO')}`
                                            : 'Pendiente de firma por el adoptante'}
                                        </p>
                                      </div>
                                    </div>
                                    {req.contractAccepted
                                      ? <CheckCircle className="h-6 w-6 text-emerald-500" />
                                      : <Clock className="h-6 w-6 text-amber-500" />
                                    }
                                  </div>
                                </div>

                                {req.documents.length > 0 && (
                                  <div className="rounded-xl border p-5">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-primary" />
                                      Documentos
                                    </h4>
                                    <div className="space-y-2">
                                      {req.documents.map(doc => (
                                        <div key={doc.id} className="py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm min-w-0">
                                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                              <span className="truncate">{doc.name}</span>
                                            </div>
                                            <Badge className={cn(
                                              "text-[10px] h-5",
                                              doc.status === 'Aprobado' && 'bg-emerald-500/15 text-emerald-600 border-emerald-200',
                                              doc.status === 'Rechazado' && 'bg-red-500/15 text-red-600 border-red-200',
                                              doc.status === 'Pendiente' && 'bg-amber-500/15 text-amber-600 border-amber-200',
                                            )} variant="outline">
                                              <span className={cn(
                                                "inline-block w-1.5 h-1.5 rounded-full mr-1",
                                                doc.status === 'Aprobado' && "bg-emerald-500",
                                                doc.status === 'Rechazado' && "bg-red-500",
                                                doc.status === 'Pendiente' && "bg-amber-500",
                                              )} />
                                              {doc.status}
                                            </Badge>
                                          </div>
                                          {doc.status === 'Rechazado' && doc.rejectionComment && (
                                            <p className="text-[10px] text-red-500 mt-1 ml-6">{doc.rejectionComment}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right: Summary sidebar */}
                              <div className="space-y-4">
                                <div className="rounded-xl border bg-card p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estado</h4>
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                                      <Flag className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">Aprobada</p>
                                      <p className="text-xs text-muted-foreground">Paso 3 de 3</p>
                                    </div>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5">
                                    <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
                                  </div>
                                </div>

                                <div className="rounded-xl border bg-card p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Checklist</h4>
                                  <div className="space-y-2">
                                    {[
                                      { label: 'Entrevista', done: req.verificationChecklist.interview },
                                      { label: 'Visita hogar', done: req.verificationChecklist.visit },
                                      { label: 'Documentos', done: req.verificationChecklist.documents },
                                      { label: 'Contrato', done: req.contractAccepted },
                                      { label: 'Docs aprobados', done: req.documents.length > 0 && req.documents.every(d => d.status === 'Aprobado') },
                                    ].map(({ label, done }) => (
                                      <div key={label} className="flex items-center gap-2 text-xs">
                                        {done
                                          ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                          : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                                        }
                                        <span className={done ? 'text-emerald-700 font-medium' : 'text-muted-foreground'}>{label}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {pet?.status !== 'Adoptado' ? (
                                  <>
                                    {req.status === 'En Seguimiento' && (
                                      <div className="rounded-xl bg-purple-50/50 border border-purple-200 p-4 space-y-3">
                                        {/* Step indicator */}
                                        <div className="flex items-center gap-1 text-xs">
                                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                            <CheckCircle className="h-3.5 w-3.5" /> Contrato firmado
                                          </span>
                                          <span className="text-muted-foreground/40 mx-1">→</span>
                                          <span className="flex items-center gap-1 text-purple-700 font-medium">
                                            <ClipboardList className="h-3.5 w-3.5" /> Seguimiento activo
                                          </span>
                                          <span className="text-muted-foreground/40 mx-1">→</span>
                                          <span className="flex items-center gap-1 text-muted-foreground/60">
                                            <Flag className="h-3.5 w-3.5" /> Adopción finalizada
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-purple-800">
                                          <ClipboardList className="h-4 w-4 shrink-0" />
                                          <span className="font-semibold text-sm">Acompañamiento post-adopción activo</span>
                                        </div>
                                        <p className="text-xs text-purple-700/80 leading-relaxed">
                                          El contrato ha sido firmado y la mascota fue entregada. Ahora inicia el período de seguimiento post-adopción.
                                          Complete las actividades de seguimiento programadas y registre nuevas actividades según sea necesario antes de cerrar definitivamente el caso.
                                        </p>
                                        {(() => {
                                          const info = stepSeguimientos[req.id];
                                          if (!info) return <p className="text-xs text-purple-500/60">Cargando actividades...</p>;
                                          return (
                                            <div className="flex items-center gap-4 text-xs text-purple-700">
                                              <span className="flex items-center gap-1">
                                                <span className={cn("inline-block w-2 h-2 rounded-full", info.pendientes > 0 ? "bg-amber-500" : "bg-emerald-500")} />
                                                {info.pendientes} pendiente(s)
                                              </span>
                                              {info.proximo && (
                                                <span>📅 Próximo: {new Date(info.proximo).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                                              )}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    )}
                                    <Button
                                      className={cn(
                                        "w-full text-white h-12 text-base rounded-xl shadow-sm",
                                        req.status === 'En Seguimiento' && stepSeguimientos[req.id]?.pendientes
                                          ? "bg-amber-600 hover:bg-amber-700"
                                          : "bg-emerald-600 hover:bg-emerald-700"
                                      )}
                                      onClick={() => handleFinalize(req.id)}
                                      disabled={!req.verificationChecklist.interview || !req.verificationChecklist.visit || !req.verificationChecklist.documents || !req.contractAccepted || req.documents.filter(d => d.status !== 'Rechazado').some(d => d.status !== 'Aprobado')}
                                    >
                                      <Flag className="mr-2 h-5 w-5" /> Finalizar Adopción
                                    </Button>
                                    {req.status === 'En Seguimiento' && stepSeguimientos[req.id]?.pendientes > 0 && (
                                      <p className="text-xs text-amber-600 text-center font-medium">
                                        ⚠️ Hay {stepSeguimientos[req.id].pendientes} actividad(es) pendiente(s). Revísalas en la pestaña Seguimiento.
                                      </p>
                                    )}
                                    {(!req.verificationChecklist.interview || !req.verificationChecklist.visit || !req.verificationChecklist.documents || !req.contractAccepted || req.documents.filter(d => d.status !== 'Rechazado').some(d => d.status !== 'Aprobado')) && !(req.status === 'En Seguimiento') && (
                                      <p className="text-xs text-muted-foreground text-center">
                                        <ArrowRight className="h-3 w-3 inline mr-1" />
                                        Completa la checklist, firma el contrato y aprueba todos los documentos para finalizar
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-4 text-center">
                                    <CheckCircle className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
                                    <p className="text-sm font-semibold text-emerald-700">Adopción finalizada</p>
                                    <p className="text-xs text-emerald-600/70">Esta mascota ya fue adoptada</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Seguimiento Form Dialog */}
      <SeguimientoFormDialog
        open={seguimientoFormOpen}
        onOpenChange={(v) => { setSeguimientoFormOpen(v); if (!v) setSelectedSeguimiento(null); }}
        mode={seguimientoFormMode}
        onSubmit={seguimientoFormMode === "create" ? handleCreateSeguimiento
          : seguimientoFormMode === "edit" ? handleEditSeguimiento
          : handleCompleteSeguimiento}
        seguimiento={selectedSeguimiento}
        solicitudOptions={solicitudOptions}
        defaultSolicitudId={seguimientoDefaultSolicitud}
      />

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialogId} onOpenChange={() => setRejectDialogId(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Rechazar Solicitud
            </DialogTitle>
            <DialogDescription>
              Puedes indicar el motivo del rechazo (opcional). El adoptante recibirá una notificación.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Ej: El perfil del adoptante no es compatible con las necesidades de la mascota" rows={3} className="rounded-xl text-sm" />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setRejectDialogId(null)} className="rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} className="rounded-xl">Confirmar Rechazo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Finalize with pending seguimientos dialog */}
      <Dialog open={!!finalizeDialogReq} onOpenChange={() => setFinalizeDialogReq(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Finalizar Adopción
            </DialogTitle>
            <DialogDescription>
              Hay {pendingSeguimientos.length} actividades de seguimiento pendientes. ¿Qué deseas hacer?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {pendingSeguimientos.map(s => {
              const label: Record<string, string> = { CONTACTO: 'Contacto', VISITA: 'Visita', LLAMADA: 'Llamada', CUESTIONARIO: 'Cuestionario' };
              return (
                <div key={s.id_seguimiento} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30 border border-border/50">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="font-medium">{label[s.tipo] || s.tipo}</span>
                  {s.proximo_contacto && (
                    <span className="text-xs text-muted-foreground">— {new Date(s.proximo_contacto).toLocaleDateString('es-CO')}</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">Se cancelarán con la observación "Cancelado automáticamente al finalizar la adopción" y quedarán registradas. Esta acción no se puede deshacer.</p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setFinalizeDialogReq(null)} className="rounded-xl">Volver</Button>
            <Button variant="default" onClick={async () => {
              if (!finalizeDialogReq) return;
              const hoy = new Date().toLocaleDateString('es-CO');
              for (const s of pendingSeguimientos) {
                await seguimientoApi.updateSeguimiento(s.id_seguimiento, {
                  estado_seguimiento: 'CANCELADO',
                  observaciones: `Cancelado automáticamente al finalizar la adopción (${hoy})`
                } as any);
              }
              const ok = await finalizeAdoption(finalizeDialogReq);
              setFinalizeDialogReq(null);
              if (ok) toast.success("¡Adopción finalizada exitosamente!");
              else toast.error("Error al finalizar la adopción");
            }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
              <Flag className="mr-2 h-4 w-4" /> Finalizar de todas formas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel seguimiento confirmation dialog */}
      <Dialog open={!!cancelSeg} onOpenChange={() => setCancelSeg(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Cancelar actividad de seguimiento
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La actividad quedará registrada como cancelada.
            </DialogDescription>
          </DialogHeader>
          {cancelSeg && (
            <div className="text-sm space-y-2">
              <p><span className="font-medium">Tipo:</span> {cancelSeg.tipo === "CONTACTO" ? "Contacto" : cancelSeg.tipo === "VISITA" ? "Visita" : cancelSeg.tipo === "LLAMADA" ? "Llamada" : "Cuestionario"}</p>
              {cancelSeg.descripcion && <p><span className="font-medium">Descripción:</span> {cancelSeg.descripcion}</p>}
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setCancelSeg(null)} className="rounded-xl">Volver</Button>
            <Button variant="destructive" onClick={confirmCancelSeguimiento} className="rounded-xl">Cancelar actividad</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Reject Dialog */}
      <Dialog open={!!rejectDoc} onOpenChange={() => setRejectDoc(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Rechazar Documento
            </DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo del documento. El adoptante podrá ver este comentario y subir un nuevo documento corregido.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={rejectDocReason} onChange={e => setRejectDocReason(e.target.value)} placeholder="Ej: El documento no es legible, la foto no muestra claramente el espacio..." rows={3} className="rounded-xl text-sm" />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setRejectDoc(null)} className="rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={() => {
              if (rejectDoc) {
                reviewDocument(rejectDoc.reqId, rejectDoc.docId, false, rejectDocReason || 'Documento rechazado');
                setRejectDoc(null);
                toast.success('Documento rechazado');
              }
            }} className="rounded-xl">Confirmar Rechazo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={!!approveDialogId} onOpenChange={() => setApproveDialogId(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Aprobar Solicitud
            </DialogTitle>
            <DialogDescription>
              Confirma la aprobación de la solicitud de adopción.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">¿Deseas cambiar automáticamente el estado de la mascota a <strong>"En Proceso"</strong> para informar a otros adoptantes que ya no está disponible?</p>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
              <Checkbox id="changePetStatus" checked={changePetStatus} onCheckedChange={(v) => setChangePetStatus(v === true)} />
              <label htmlFor="changePetStatus" className="text-sm font-medium cursor-pointer">Marcar mascota como "En Proceso"</label>
            </div>
            <p className="text-xs text-muted-foreground">Si no marcas esta opción, la mascota seguirá apareciendo como "Disponible" en el listado público.</p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => { setApproveDialogId(null); setChangePetStatus(false); }} className="rounded-xl">Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={handleApprove}>Confirmar Aprobación</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adopter Detail Dialog */}
      <Dialog open={!!detalleSolicitanteId} onOpenChange={() => setDetalleSolicitanteId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
          {(() => {
            const req = requests.find(r => r.id === detalleSolicitanteId);
            if (!req) return null;
            const fotoUrl = req.adopterFotoUrl ? getUploadUrl(req.adopterFotoUrl) : null;
            const D = req.datosAdoptante;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading">Datos del Solicitante</DialogTitle>
                  <DialogDescription>Información del posible adoptante para la solicitud #{req.id}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-xl border bg-muted/30 p-5">
                    <div className="flex items-center gap-4 mb-3">
                      {fotoUrl ? (
                        <img src={fotoUrl} alt={req.adopterName} className="h-16 w-16 rounded-full object-cover ring-2 ring-border" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-7 w-7 text-primary/60" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-heading font-bold text-lg">{req.adopterName}</h3>
                        <p className="text-xs text-muted-foreground">Solicitud #{req.id} · {req.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-5">
                    <h4 className="font-heading font-semibold mb-3 text-sm">Información personal</h4>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Email:</span>
                        <span className="font-medium">{req.adopterEmail || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Teléfono:</span>
                        <span className="font-medium">{req.adopterPhone || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-5">
                    <h4 className="font-heading font-semibold mb-3 text-sm">Información del hogar</h4>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-36">Tipo de vivienda:</span>
                        <span className="font-medium">{req.adopterHousingType || D?.tipoVivienda || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-36">Patio/Jardín:</span>
                        <span className="font-medium">
                          {req.adopterHasPatio !== undefined ? (req.adopterHasPatio ? 'Sí' : 'No') :
                           D?.tienePatio === "Si" ? "Sí" : D?.tienePatio === "No" ? "No" : D?.tienePatio === "Balcon" ? "Solo balcón" : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-36">Horas solo:</span>
                        <span className="font-medium">{req.adopterHoursAlone || D?.horasSolo || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-36">Experiencia:</span>
                        <span className="font-medium capitalize">{req.adopterExperience || D?.experiencia || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-36">Núcleo familiar:</span>
                        <span className="font-medium">{req.adopterFamilyComposition || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-36">Otros animales:</span>
                        <span className="font-medium">
                          {D?.otrosAnimales === "No" ? "No" :
                           D?.otrosAnimales === "SiPerro" ? "Sí, perro(s)" :
                           D?.otrosAnimales === "SiGato" ? "Sí, gato(s)" :
                           D?.otrosAnimales === "SiAmbos" ? "Sí, ambos" :
                           D?.otrosAnimales === "SiOtros" ? "Sí, otros" : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-36">Niños en casa:</span>
                        <span className="font-medium">
                          {D?.ninos === "No" ? "No" :
                           D?.ninos === "SiMenores" ? "Sí, menores de 6 años" :
                           D?.ninos === "SiMayores" ? "Sí, mayores de 6 años" : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-5">
                    <h4 className="font-heading font-semibold mb-2 text-sm">Motivo de la solicitud</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{req.message}"</p>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
