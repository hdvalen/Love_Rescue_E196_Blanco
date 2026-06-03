import { useState, useRef, useEffect } from "react";
import { FileText, Clock, Eye, CheckCircle, XCircle, Upload, Calendar, ScrollText, ExternalLink, MessageSquare, ClipboardList, User, Building2, CheckSquare, Home, ArrowRight, MapPin, ChevronRight, AlertTriangle, Flag, Phone, Video, HelpCircle, Send, Ban } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { RequestStatus } from "@/data/mockData";
import { cn } from "@/lib/utils";
import type { SeguimientoBackend } from "@/api/seguimientos";
import * as seguimientoApi from "@/api/seguimientos";
import { cancelarSolicitud, getHistorial } from "@/api/solicitudes";
import type { HistorialEntry } from "@/api/solicitudes";
import { getUploadUrl } from "@/api/uploads";

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

const ADOPTER_STEPS = [
  { key: 'enviada', label: 'Enviada', icon: FileText, desc: 'Solicitud recibida' },
  { key: 'evaluacion', label: 'Evaluación', icon: Eye, desc: 'Documentos, citas y tareas' },
  { key: 'contrato', label: 'Contrato', icon: ScrollText, desc: 'Firma del contrato' },
  { key: 'seguimiento', label: 'Seguimiento', icon: ClipboardList, desc: 'Acompañamiento post-adopción' },
  { key: 'adoptada', label: 'Adoptada', icon: CheckCircle, desc: 'Adopción finalizada' },
] as const;

function getAdopterStepIdx(status: RequestStatus): number {
  if (status === 'Recibida') return 0;
  if (status === 'Evaluación') return 1;
  if (status === 'Aprobada') return 2;
  if (status === 'En Seguimiento') return 3;
  if (status === 'Adoptada') return 4;
  return -1;
}

export default function MyRequests() {
  const { requests, pets, currentUser, foundations, uploadDocument, acceptContract, respondAppointment } = useApp();
  const myRequests = requests.filter(r => r.adopterId === currentUser?.id);
  const [contractOpen, setContractOpen] = useState<string | null>(null);
  const [acceptedClauses, setAcceptedClauses] = useState<boolean[]>([false, false, false, false]);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUpload, setPendingUpload] = useState<{ requestId: string; type: string; label: string; multiple: boolean } | null>(null);
  const [rejectingAppointment, setRejectingAppointment] = useState<{ requestId: string; appointmentId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [seguimientosMap, setSeguimientosMap] = useState<Record<string, SeguimientoBackend[]>>({});
  const [segModalReq, setSegModalReq] = useState<string | null>(null);
  const [historialMap, setHistorialMap] = useState<Record<string, HistorialEntry[]>>({});
  const [historialLoading, setHistorialLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    myRequests.forEach(req => {
      if (["Aprobada", "En Seguimiento", "Adoptada"].includes(req.status) && !seguimientosMap[req.id]) {
        seguimientoApi.getSeguimientos({ id_solicitud: String(Number(req.id)) }).then(res => {
          if (res.ok) setSeguimientosMap(prev => ({ ...prev, [req.id]: res.seguimientos }));
        }).catch((e) => { console.error('[getSeguimientos]', e); });
      }
    });
  }, [myRequests, seguimientosMap]);

  useEffect(() => {
    myRequests.forEach(req => {
      if (!historialMap[req.id] && !historialLoading[req.id]) {
        setHistorialLoading(prev => ({ ...prev, [req.id]: true }));
        getHistorial(Number(req.id)).then(res => {
          if (res.ok) setHistorialMap(prev => ({ ...prev, [req.id]: res.historial }));
        }).catch(() => {}).finally(() => {
          setHistorialLoading(prev => ({ ...prev, [req.id]: false }));
        });
      }
    });
  }, [myRequests]);

  const SEG_TIPO_LABEL: Record<string, string> = {
    CONTACTO: "Contacto",
    VISITA: "Visita",
    LLAMADA: "Llamada",
    CUESTIONARIO: "Cuestionario",
  };

  const SEG_ESTADO_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    PENDIENTE: { label: "Pendiente", color: "bg-amber-500/15 text-amber-600 border-amber-200", dot: "bg-amber-500" },
    REALIZADO: { label: "Realizado", color: "bg-emerald-500/15 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
    CANCELADO: { label: "Cancelado", color: "bg-red-500/15 text-red-600 border-red-200", dot: "bg-red-500" },
  };

  const handleUploadClick = (requestId: string, type: string, label: string, multiple: boolean) => {
    setPendingUpload({ requestId, type, label, multiple });
    if (fileInputRef.current) {
      fileInputRef.current.multiple = multiple;
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !pendingUpload) return;

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" supera los 5MB`);
        e.target.value = '';
        return;
      }
    }

    const key = `${pendingUpload.requestId}_${pendingUpload.type}`;
    setUploading(key);
    try {
      uploadDocument(pendingUpload.requestId, Array.from(files), pendingUpload.type, pendingUpload.label);
      toast.success(`${pendingUpload.label} subido exitosamente`);
    } catch {
      toast.error('Error al subir los archivos');
    }
    setUploading(null);
    setPendingUpload(null);
    e.target.value = '';
  };

  const clauses = [
    "Me comprometo a no abandonar ni maltratar al animal bajo ninguna circunstancia.",
    "Acepto la esterilización obligatoria si aplica y los cuidados veterinarios preventivos.",
    "Permito visitas de seguimiento por parte de la fundación.",
    "He leído y acepto todos los términos del Contrato de Adopción Responsable.",
  ];

  const handleAcceptContract = async (requestId: string) => {
    if (!acceptedClauses.every(Boolean)) { toast.error("Debes aceptar todas las cláusulas"); return; }
    await acceptContract(requestId);
    toast.success("Contrato firmado correctamente. Puedes descargar el PDF.");
    setContractOpen(null);
    setAcceptedClauses([false, false, false, false]);
    setReloadKey(k => k + 1);
  };

  const handleCancelRequest = async () => {
    if (!cancelModal) return;
    try {
      const res = await cancelarSolicitud(Number(cancelModal), cancelMotivo || undefined);
      if (res.ok) {
        toast.success("Solicitud cancelada correctamente");
        setCancelModal(null);
        setCancelMotivo('');
      }
    } catch {
      toast.error("Error al cancelar la solicitud");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" /> Mis Solicitudes
      </h1>

      {myRequests.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-heading text-lg text-muted-foreground">No has enviado solicitudes aún</p>
          <Link to="/" className="mt-2 text-sm text-primary hover:underline">Explorar mascotas</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myRequests.map(req => {
            const pet = pets.find(p => p.id === req.petId);
            const foundation = pet ? foundations.find(f => f.id === pet.foundationId) : null;
            const stepIdx = getAdopterStepIdx(req.status);
            const isRechazada = req.status === 'Rechazada';
            const nextAppointment = req.appointments[0];

            return (
              <div key={req.id} className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 min-w-0">
                      {pet && (
                        <Link to={`/mascota/${pet.id}`}>
                          <div className="h-14 w-14 rounded-xl overflow-hidden ring-1 ring-border shrink-0">
                            <img src={pet.images[0]} alt={pet.name} className="h-full w-full object-cover" />
                          </div>
                        </Link>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-lg truncate">{pet?.name || 'Mascota'}</h3>
                        <p className="text-xs text-muted-foreground">{pet?.breed} · Enviada el {req.date}</p>
                      </div>
                    </div>
                    {(req.status === 'En Seguimiento' || req.status === 'Adoptada') ? (
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge className={cn("text-[10px] h-5",
                          req.status === 'En Seguimiento' && "bg-purple-500/15 text-purple-600 border-purple-200",
                          req.status === 'Adoptada' && "bg-emerald-500/15 text-emerald-600 border-emerald-200",
                        )} variant="outline">
                          <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1",
                            req.status === 'En Seguimiento' && "bg-purple-500",
                            req.status === 'Adoptada' && "bg-emerald-500",
                          )} />
                          {req.status === 'En Seguimiento' ? 'En seguimiento' : 'Adopción finalizada'}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs shrink-0 rounded-lg" onClick={() => setSegModalReq(req.id)}>
                          <ClipboardList className="mr-1 h-3 w-3" /> Ver seguimiento
                        </Button>
                      </div>
                    ) : req.status === 'Aprobada' ? (
                      <Badge className={cn("shrink-0 text-[10px] h-5",
                        "bg-emerald-500/15 text-emerald-600 border-emerald-200",
                      )} variant="outline">
                        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 bg-emerald-500" />
                        Aprobada
                      </Badge>
                    ) : (
                      <>
                        {(req.status === 'Recibida' || req.status === 'Evaluación') && (
                          <>
                            <Badge className={cn("shrink-0 text-[10px] h-5",
                              req.status === 'Recibida' && "bg-blue-500/15 text-blue-600 border-blue-200",
                              req.status === 'Evaluación' && "bg-amber-500/15 text-amber-600 border-amber-200",
                            )} variant="outline">
                              <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1",
                                req.status === 'Recibida' && "bg-blue-500",
                                req.status === 'Evaluación' && "bg-amber-500",
                              )} />
                              {req.status === 'Evaluación' ? 'En evaluación' : req.status}
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0" onClick={() => setCancelModal(req.id)}>
                              <Ban className="mr-1 h-3 w-3" /> Cancelar
                            </Button>
                          </>
                        )}
                        {req.status === 'Rechazada' && (
                          <Badge className="shrink-0 text-[10px] h-5 bg-red-500/15 text-red-600 border-red-200" variant="outline">
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 bg-red-500" />
                            Rechazada
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  {/* Stepper */}
                  {!isRechazada && stepIdx >= 0 && (
                    <div className="pt-2 pb-4">
                      <div className="flex items-center max-w-xl mx-auto">
                        {ADOPTER_STEPS.map((step, i) => {
                          const StepIcon = step.icon;
                          const isCompleted = i < stepIdx;
                          const isCurrent = i === stepIdx;
                          const isLast = i === ADOPTER_STEPS.length - 1;
                          return (
                            <div key={step.key} className="flex items-center flex-1">
                              <div className="flex flex-col items-center">
                                <div className={cn(
                                  "flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border-2 transition-all duration-300",
                                  isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                                  isCurrent && "border-primary text-primary bg-primary/10 shadow-sm shadow-primary/20",
                                  !isCompleted && !isCurrent && "border-muted-foreground/25 text-muted-foreground/50 bg-white"
                                )}>
                                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                                </div>
                                <span className={cn(
                                  "text-[11px] font-semibold mt-1.5 transition-colors",
                                  isCompleted && "text-emerald-600",
                                  isCurrent && "text-primary",
                                  !isCompleted && !isCurrent && "text-muted-foreground/50"
                                )}>{step.label}</span>
                                <span className={cn(
                                  "text-[9px] mt-0.5 transition-colors",
                                  isCurrent ? "text-primary/60" : "text-muted-foreground/30"
                                )}>{step.desc}</span>
                              </div>
                              {!isLast && (
                                <div className={cn(
                                  "flex-1 h-0.5 mx-3 mb-7 rounded-full transition-colors duration-300",
                                  i < stepIdx ? "bg-emerald-400" : "bg-muted-foreground/15"
                                )} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isRechazada && req.rejectionReason && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Motivo de rechazo:</span> {req.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>

                {/* ───── 2-Column Content ───── */}
                {isRechazada ? (
                  <div className="px-5 pb-5">
                    <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                      <XCircle className="mx-auto h-10 w-10 text-destructive/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Esta solicitud fue rechazada</p>
                    </div>
                  </div>
                ) : stepIdx === 0 ? (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2">
                        <div className="rounded-xl bg-blue-50/50 border border-blue-200/50 p-8 text-center">
                          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <Clock className="h-8 w-8 text-blue-500" />
                          </div>
                          <h4 className="font-heading font-semibold text-lg mb-2">Solicitud enviada</h4>
                          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                            Tu solicitud ha sido recibida por la fundación. Ellos la revisarán y te notificarán cuando pase a la etapa de evaluación.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {foundation && (
                          <div className="rounded-xl border bg-card p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fundación</h4>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{foundation.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{foundation.email}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="rounded-xl border bg-card p-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Solicitud</h4>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ID</span>
                              <span className="font-mono text-xs">#{req.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Enviada</span>
                              <span className="font-medium text-xs">{req.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Estado</span>
                              <Badge className="text-[10px] h-5 bg-blue-500/15 text-blue-600 border-blue-200" variant="outline">Recibida</Badge>
                          </div>
                        </div>

                        {historialMap[req.id] && historialMap[req.id].length > 0 && (
                          <div className="rounded-xl border bg-card p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Historial de cambios</h4>
                            <div className="space-y-3">
                              {historialMap[req.id].map((h, i) => {
                                const isLast = i === historialMap[req.id].length - 1;
                                const stateColors: Record<string, string> = {
                                  PENDIENTE: 'bg-blue-500', EN_EVALUACION: 'bg-amber-500',
                                  APROBADA: 'bg-emerald-500', RECHAZADA: 'bg-red-500',
                                  EN_SEGUIMIENTO: 'bg-purple-500', ADOPTADA: 'bg-emerald-600',
                                  CANCELADA: 'bg-gray-500', CONTRATO_FIRMADO: 'bg-indigo-500'
                                };
                                const stateLabels: Record<string, string> = {
                                  PENDIENTE: 'Creada', EN_EVALUACION: 'En evaluación', APROBADA: 'Aprobada',
                                  RECHAZADA: 'Rechazada', EN_SEGUIMIENTO: 'En seguimiento',
                                  ADOPTADA: 'Adoptada', CANCELADA: 'Cancelada',
                                  CONTRATO_FIRMADO: 'Contrato firmado'
                                };
                                return (
                                  <div key={h.id_historial} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className={'h-3 w-3 rounded-full shrink-0 mt-1 ' + (stateColors[h.estado_nuevo] || 'bg-muted-foreground')} />
                                      {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
                                    </div>
                                    <div className="pb-3 flex-1 min-w-0">
                                      <p className="text-sm font-medium">{stateLabels[h.estado_nuevo] || h.estado_nuevo}</p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {new Date(h.fecha).toLocaleString('es-CO')}
                                        {h.Responsable?.nombre ? ` por ${h.Responsable.nombre}` : ''}
                                      </p>
                                      {h.motivo && (
                                        <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic">{h.motivo}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {historialLoading[req.id] && (
                          <div className="rounded-xl border bg-card p-4 animate-pulse">
                            <div className="h-3 w-24 bg-muted rounded mb-4" />
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex gap-3 mb-3">
                                <div className="h-3 w-3 rounded-full bg-muted mt-1" />
                                <div className="flex-1 space-y-1.5">
                                  <div className="h-3 w-20 bg-muted rounded" />
                                  <div className="h-2 w-32 bg-muted rounded" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                ) : stepIdx === 1 ? (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* Left column: main content */}
                      <div className="xl:col-span-2 space-y-5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={handleFileSelected}
                        />

                        {/* ── Tabs: Documentos | Observaciones | Tareas | Citas ── */}
                        <Tabs defaultValue="documentos" className="w-full">
                          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
                            <TabsTrigger value="documentos" className="flex items-center gap-1.5 py-2.5 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white rounded-lg">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Documentos</span>
                            </TabsTrigger>
                            <TabsTrigger value="observaciones" className="flex items-center gap-1.5 py-2.5 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white rounded-lg">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Observaciones</span>
                            </TabsTrigger>
                            <TabsTrigger value="tareas" className="flex items-center gap-1.5 py-2.5 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white rounded-lg">
                              <ClipboardList className="h-3.5 w-3.5" />
                              <span>Tareas</span>
                            </TabsTrigger>
                            <TabsTrigger value="citas" className="flex items-center gap-1.5 py-2.5 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white rounded-lg">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Citas</span>
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="documentos" className="mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { type: "cedula", label: "Documento de Identidad", icon: FileText, desc: "Cédula de ciudadanía o documento oficial" },
                                { type: "recibo", label: "Recibo de Servicios", icon: FileText, desc: "Recibo de agua, luz o teléfono reciente" },
                                { type: "foto_hogar", label: "Fotos del Hogar", icon: Home, desc: "Fotos del espacio donde vivirá la mascota" },
                              ].map(({ type, label, icon: DocIcon, desc }) => {
                                const existingDocs = req.documents.filter(d => d.type === type);
                                const hasRealFiles = existingDocs.some(d => d.fileName);
                                const allApproved = existingDocs.length > 0 && existingDocs.every(d => d.status === 'Aprobado');
                                const anyRejected = existingDocs.some(d => d.status === 'Rechazado');
                                const isMultiple = type === 'foto_hogar';
                                const isUploading = uploading === `${req.id}_${type}`;
                                return (
                                  <div key={type} className={cn(
                                    "rounded-xl border transition-all p-4",
                                    allApproved && "bg-emerald-50/50 border-emerald-200",
                                    anyRejected && "bg-red-50/50 border-red-200",
                                    !hasRealFiles && "bg-card hover:border-muted-foreground/30"
                                  )}>
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center",
                                        allApproved && "bg-emerald-100",
                                        anyRejected && "bg-red-100",
                                        !hasRealFiles && "bg-muted"
                                      )}>
                                        <DocIcon className={cn(
                                          "h-5 w-5",
                                          allApproved && "text-emerald-600",
                                          anyRejected && "text-red-500",
                                          !hasRealFiles && "text-muted-foreground"
                                        )} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold truncate">{label}</p>
                                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                                      </div>
                                      {hasRealFiles && (
                                        <Badge className={cn(
                                          "text-[10px] h-5 shrink-0",
                                          allApproved && "bg-emerald-500/15 text-emerald-600 border-emerald-200",
                                          anyRejected && "bg-red-500/15 text-red-600 border-red-200",
                                          !allApproved && !anyRejected && "bg-amber-500/15 text-amber-600 border-amber-200",
                                        )} variant="outline">
                                          <span className={cn(
                                            "inline-block w-1.5 h-1.5 rounded-full mr-1",
                                            allApproved && "bg-emerald-500",
                                            anyRejected && "bg-red-500",
                                            !allApproved && !anyRejected && "bg-amber-500",
                                          )} />
                                          {allApproved ? 'Aprobado' : anyRejected ? 'Rechazado' : 'Pendiente'}
                                        </Badge>
                                      )}
                                    </div>

                                    {hasRealFiles && (
                                      <div className="space-y-1.5 mb-3">
                                        {existingDocs.map(d => (
                                          <div key={d.id} className="flex items-center justify-between text-xs bg-white rounded-lg border p-2">
                                            <div className="min-w-0 flex-1">
                                              {d.fileName ? (
                                                <a href={getUploadUrl(d.fileName)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 truncate">
                                                  <ExternalLink className="h-3 w-3 shrink-0" /> {d.name}
                                                </a>
                                              ) : (
                                                <span className="italic text-muted-foreground">Sin archivo</span>
                                              )}
                  {d.rejectionComment && d.status === 'Rechazado' && (
                    <p className="text-red-500 text-[10px] mt-0.5">{d.rejectionComment}</p>
                  )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {!allApproved && (
                                      <Button
                                        size="sm"
                                        variant={hasRealFiles ? "outline" : "default"}
                                        className={cn("w-full h-8 text-xs rounded-lg", hasRealFiles && "border-dashed")}
                                        onClick={() => handleUploadClick(req.id, type, label, isMultiple)}
                                        disabled={isUploading}
                                      >
                                        {isUploading ? (
                                          <>Subiendo...</>
                                        ) : hasRealFiles ? (
                                          anyRejected ? 'Reintentar' : 'Agregar más'
                                        ) : (
                                          <><Upload className="mr-1.5 h-3 w-3" /> Subir archivo</>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </TabsContent>

                          <TabsContent value="observaciones" className="mt-4">
                            {req.notes.some(n => n.visibility === 'Compartida') ? (
                              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {req.notes.filter(n => n.visibility === 'Compartida').map(n => (
                                  <div key={n.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                        F
                                      </div>
                                      <div className="w-px flex-1 bg-border mt-2" />
                                    </div>
                                    <div className="flex-1 pb-3">
                                      <div className="rounded-xl border bg-card p-3.5">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                                          <span className="font-semibold text-foreground/70">{n.author}</span>
                                          <span className="text-muted-foreground/40">·</span>
                                          <span>{new Date(n.date).toLocaleString('es-CO')}</span>
                                        </div>
                                        <p className="text-sm leading-relaxed">{n.text}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No hay observaciones aún</p>
                                <p className="text-xs text-muted-foreground/50 mt-1">La fundación compartirá observaciones aquí durante la evaluación.</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="tareas" className="mt-4">
                            {req.pendingTasks.length > 0 ? (
                              <div className="rounded-xl border divide-y">
                                {req.pendingTasks.map(t => (
                                  <div key={t.id} className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors">
                                    <Checkbox checked={t.completed} disabled className={cn(t.completed && "text-emerald-500 border-emerald-400")} />
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
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="citas" className="mt-4">
                            {req.appointments.length > 0 ? (
                              <div className="space-y-2">
                                {req.appointments.map(a => (
                                  <div key={a.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-muted-foreground/30">
                                    <div className={cn(
                                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                      a.status === 'Aceptada' && "bg-emerald-100",
                                      a.status === 'Rechazada' && "bg-red-100",
                                      a.status === 'Pendiente' && "bg-amber-100"
                                    )}>
                                      <Calendar className={cn(
                                        "h-6 w-6",
                                        a.status === 'Aceptada' && "text-emerald-600",
                                        a.status === 'Rechazada' && "text-red-500",
                                        a.status === 'Pendiente' && "text-amber-600"
                                      )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold">{a.date}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {a.startTime} - {a.endTime}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="outline" className="text-[10px] h-5">
                                          <MapPin className="h-2.5 w-2.5 mr-1" />
                                          {a.modality}
                                        </Badge>
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
                                      </div>
                                    </div>
                                    {a.status === 'Pendiente' && rejectingAppointment?.appointmentId === a.id ? (
                                      <div className="flex flex-col gap-2 shrink-0 max-w-[240px]">
                                        <Textarea
                                          placeholder="¿Por qué rechazas esta cita?"
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                          className="h-20 text-xs resize-none"
                                        />
                                        <div className="flex gap-1.5 justify-end">
                                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setRejectingAppointment(null); setRejectReason(''); }}>
                                            Cancelar
                                          </Button>
                                          <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => { respondAppointment(a.id, req.id, false, rejectReason); setRejectingAppointment(null); setRejectReason(''); }}>
                                            <Send className="mr-1 h-3 w-3" /> Rechazar
                                          </Button>
                                        </div>
                                      </div>
                                    ) : a.status === 'Pendiente' ? (
                                      <div className="flex gap-1.5 shrink-0">
                                        <Button size="sm" className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => respondAppointment(a.id, req.id, true)}>
                                          <CheckCircle className="mr-1 h-3 w-3" /> Aceptar
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setRejectingAppointment({ requestId: req.id, appointmentId: a.id }); setRejectReason(''); }}>
                                          <XCircle className="mr-1 h-3 w-3" /> Rechazar
                                        </Button>
                                      </div>
                                    ) : a.status === 'Rechazada' && a.rejectionReason ? (
                                      <div className="max-w-[200px] shrink-0">
                                        <p className="text-[11px] text-red-500 leading-tight">
                                          <span className="font-medium">Motivo:</span> {a.rejectionReason}
                                        </p>
                                      </div>
                                    ) : null}
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
                        </Tabs>
                      </div>

                      {/* Right column: sidebar */}
                      <div className="space-y-4">
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
                        </div>

                        {foundation && (
                          <div className="rounded-xl border bg-card p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fundación</h4>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{foundation.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{foundation.email}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {nextAppointment && (
                          <div className="rounded-xl border bg-card p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próxima cita</h4>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold">{nextAppointment.date}</p>
                                <p className="text-xs text-muted-foreground">{nextAppointment.startTime} - {nextAppointment.endTime}</p>
                              </div>
                              <Badge className={cn(
                                "text-[10px] h-5 shrink-0",
                                nextAppointment.status === 'Aceptada' && 'bg-emerald-500/15 text-emerald-600 border-emerald-200',
                                nextAppointment.status === 'Rechazada' && 'bg-red-500/15 text-red-600 border-red-200',
                                nextAppointment.status === 'Pendiente' && 'bg-amber-500/15 text-amber-600 border-amber-200',
                              )} variant="outline">
                                {nextAppointment.status}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="rounded-xl border bg-card p-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Progreso</h4>
                          <div className="space-y-2">
                            {[
                              { label: 'Documentos', done: req.documents.length > 0 && req.documents.every(d => d.status === 'Aprobado'), count: `${req.documents.filter(d => d.status === 'Aprobado').length}/${req.documents.length}` },
                              { label: 'Observaciones', done: req.notes.some(n => n.visibility === 'Compartida') },
                              { label: 'Tareas', done: req.pendingTasks.length > 0 && req.pendingTasks.every(t => t.completed), count: `${req.pendingTasks.filter(t => t.completed).length}/${req.pendingTasks.length}` },
                              { label: 'Citas', done: req.appointments.some(a => a.status === 'Aceptada'), count: `${req.appointments.filter(a => a.status === 'Aceptada').length}/${req.appointments.length}` },
                            ].map(({ label, done, count }) => (
                              <div key={label} className="flex items-center gap-2 text-xs">
                                {done
                                  ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                                }
                                <span className={done ? 'text-emerald-700 font-medium' : 'text-muted-foreground'}>{label}</span>
                                {count !== undefined && <span className="text-muted-foreground/60 ml-auto">{count}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : stepIdx === 2 ? (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 space-y-5">
                        {req.contractAccepted ? (
                          <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-8 text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                              <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h4 className="font-heading font-semibold text-lg text-emerald-700 mb-1">Contrato firmado</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Firmado el {new Date(req.contractAcceptedDate!).toLocaleString('es-CO')}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => {
                                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                                const token = localStorage.getItem('token');
                                window.open(`${baseUrl}/solicitudes/${req.id}/contrato/descargar?token=${encodeURIComponent(token || '')}`, '_blank');
                              }}
                            >
                              <FileText className="mr-1.5 h-4 w-4" /> Descargar contrato PDF
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-8 text-center">
                              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                                <ScrollText className="h-8 w-8 text-primary" />
                              </div>
                              <h4 className="font-heading font-semibold text-lg mb-2">¡Solicitud aprobada!</h4>
                              <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
                                La fundación ha aprobado tu solicitud. El último paso es firmar el contrato de adopción responsable.
                              </p>
                              <Button size="lg" onClick={() => setContractOpen(req.id)} className="rounded-xl h-12 px-8 text-base">
                                <ScrollText className="mr-2 h-5 w-5" /> Firmar Contrato de Adopción
                              </Button>
                            </div>

                            <div className="rounded-xl border p-5">
                              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-primary" />
                                Estado de tu proceso
                              </h4>
                              <div className="space-y-3">
                                {[
                                  { done: req.documents.some(d => d.status === 'Aprobado'), label: 'Documentos aprobados', desc: 'Todos los documentos han sido verificados' },
                                  { done: true, label: 'Solicitud aprobada por la fundación', desc: 'La fundación ha dado su visto bueno' },
                                  { done: false, label: 'Firma del contrato', desc: 'Pendiente — debes firmar digitalmente' },
                                ].map((item, i) => (
                                  <div key={i} className={cn(
                                    "flex items-center gap-3 rounded-lg border p-3.5 transition-all",
                                    item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-card'
                                  )}>
                                    {item.done
                                      ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                                      : <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                                    }
                                    <div className="flex-1">
                                      <span className={cn(
                                        "text-sm font-medium",
                                        item.done ? 'text-emerald-700' : 'text-foreground'
                                      )}>{item.label}</span>
                                      <p className="text-xs text-muted-foreground">{item.done ? 'Completado' : item.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* ── Seguimiento timeline ── */}
                        {seguimientosMap[req.id] && seguimientosMap[req.id].length > 0 && (
                          <div className="rounded-xl border bg-card p-5">
                            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-primary" />
                              Plan de Seguimiento Post-Adopción
                            </h4>
                            <p className="text-xs text-muted-foreground mb-4">La fundación realizará los siguientes controles para verificar el bienestar de la mascota:</p>
                            <div className="relative ml-2">
                              {seguimientosMap[req.id].map((seg, idx) => {
                                const ec = SEG_ESTADO_CONFIG[seg.estado_seguimiento] || SEG_ESTADO_CONFIG.PENDIENTE;
                                const Icon = seg.tipo === 'VISITA' ? '🏠' : seg.tipo === 'LLAMADA' ? '📞' : seg.tipo === 'CUESTIONARIO' ? '📋' : '📝';
                                return (
                                  <div key={seg.id_seguimiento} className="relative pb-5 pl-8">
                                    {idx < seguimientosMap[req.id].length - 1 && (
                                      <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-border" />
                                    )}
                                    <div className={cn("absolute left-0 top-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs",
                                      seg.estado_seguimiento === 'REALIZADO' ? 'bg-emerald-100 border-emerald-400' :
                                      seg.estado_seguimiento === 'CANCELADO' ? 'bg-red-100 border-red-400' :
                                      'bg-amber-100 border-amber-400'
                                    )}>
                                      {seg.estado_seguimiento === 'REALIZADO' ? '✓' : seg.estado_seguimiento === 'CANCELADO' ? '✗' : '○'}
                                    </div>
                                    <div className="rounded-lg border p-3 text-sm">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                          <span className="text-base">{Icon}</span>
                                          <span className="font-medium">{SEG_TIPO_LABEL[seg.tipo] || seg.tipo}</span>
                                          {seg.tipo === "VISITA" && seg.tipo_visita && (
                                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                              {seg.tipo_visita === "VIRTUAL" ? "Virtual" : "Presencial"}
                                            </span>
                                          )}
                                        </div>
                                        <Badge className={cn("text-[10px] h-5", ec.color)} variant="outline">
                                          <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1", ec.dot)} />
                                          {ec.label}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">{seg.descripcion}</p>
                                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                                        <span>📅 {seg.fecha_seguimiento ? new Date(seg.fecha_seguimiento).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                                        {seg.proximo_contacto && (
                                          <>
                                            <span className="text-muted-foreground/30">|</span>
                                            <span className="text-amber-600 font-medium">🔔 Próximo: {new Date(seg.proximo_contacto).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estado</h4>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <Flag className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{req.contractAccepted ? 'Completada' : 'Aprobada'}</p>
                              <p className="text-xs text-muted-foreground">Paso 3 de 3</p>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
                          </div>
                        </div>

                        {foundation && (
                          <div className="rounded-xl border bg-card p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fundación</h4>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{foundation.name}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="rounded-xl border bg-card p-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumen final</h4>
                          <div className="space-y-2">
                            {[
                              { label: 'Documentos', done: req.documents.length > 0 && req.documents.every(d => d.status === 'Aprobado') },
                              { label: 'Aprobación fundación', done: true },
                              { label: 'Contrato', done: req.contractAccepted },
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
                      </div>
                    </div>
                  </div>
                ) : stepIdx === 3 ? (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 space-y-5">
                        <div className="rounded-xl bg-purple-50/50 border border-purple-200 p-6 text-center">
                          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
                            <ClipboardList className="h-8 w-8 text-purple-600" />
                          </div>
                          <h4 className="font-heading font-semibold text-lg text-purple-700 mb-1">En seguimiento</h4>
                          <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-3 leading-relaxed">
                            La fundación está realizando actividades de seguimiento para verificar el bienestar de la mascota.
                            Recibirás notificaciones cuando se programen visitas o llamadas.
                          </p>
                          <Button size="sm" variant="outline" className="mt-4 rounded-xl" onClick={() => setSegModalReq(req.id)}>
                            <ClipboardList className="mr-1.5 h-4 w-4" /> Ver seguimiento
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estado</h4>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-sm font-medium">En seguimiento</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">La fundación realizará actividades de acompañamiento durante los próximos meses.</p>
                        </div>
                        {req.contractAccepted && (
                          <Button size="sm" variant="outline" className="w-full rounded-xl" onClick={() => {
                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                            const token = localStorage.getItem('token');
                            window.open(`${baseUrl}/solicitudes/${req.id}/contrato/descargar?token=${encodeURIComponent(token || '')}`, '_blank');
                          }}>
                            <FileText className="mr-1.5 h-4 w-4" /> Descargar contrato PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : stepIdx === 4 ? (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2 space-y-5">
                        <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-8 text-center">
                          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                          </div>
                          <h4 className="font-heading font-semibold text-lg text-emerald-700 mb-1">Adopción finalizada</h4>
                          <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-3 leading-relaxed">
                            La adopción ha sido finalizada exitosamente. Gracias por adoptar responsablemente.
                            La fundación realizó todas las actividades de seguimiento necesarias para verificar el bienestar de la mascota.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estado</h4>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-sm font-medium">Adopción finalizada</span>
                          </div>
                        </div>
                        {req.contractAccepted && (
                          <Button size="sm" variant="outline" className="w-full rounded-xl" onClick={() => {
                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                            const token = localStorage.getItem('token');
                            window.open(`${baseUrl}/solicitudes/${req.id}/contrato/descargar?token=${encodeURIComponent(token || '')}`, '_blank');
                          }}>
                            <FileText className="mr-1.5 h-4 w-4" /> Descargar contrato PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Contract Dialog */}
      <Dialog open={!!contractOpen} onOpenChange={() => setContractOpen(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Contrato de Adopción Responsable</DialogTitle>
            <DialogDescription>Lee y acepta cada cláusula para firmar digitalmente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-muted p-4 text-sm space-y-3">
              <p className="font-semibold">CONTRATO DE ADOPCIÓN RESPONSABLE</p>
              <p>Por medio del presente documento, el adoptante se compromete a:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>No abandonar ni maltratar al animal adoptado bajo ninguna circunstancia.</li>
                <li>Cumplir con la esterilización obligatoria del animal si este no ha sido esterilizado, en un plazo máximo de 3 meses posteriores a la adopción.</li>
                <li>Proporcionar cuidados veterinarios preventivos incluyendo vacunación anual, desparasitación y atención médica oportuna.</li>
                <li>Permitir visitas de seguimiento por parte de la fundación durante los primeros 6 meses posteriores a la adopción.</li>
              </ol>
              <p>El incumplimiento de cualquiera de estas cláusulas podrá resultar en la devolución del animal a la fundación.</p>
            </div>

            {clauses.map((clause, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={acceptedClauses[i]}
                  onCheckedChange={(v) => {
                    const updated = [...acceptedClauses];
                    updated[i] = v === true;
                    setAcceptedClauses(updated);
                  }}
                  className="mt-0.5"
                />
                <label className="text-sm cursor-pointer leading-relaxed">{clause}</label>
              </div>
            ))}

            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              Al firmar, se registrará tu dirección IP, fecha y hora como constancia legal. Se generará un PDF del contrato que será enviado a ambas partes.
            </p>

            <Button
              className="w-full h-11 rounded-xl text-base"
              disabled={!acceptedClauses.every(Boolean)}
              onClick={() => contractOpen && handleAcceptContract(contractOpen)}
            >
              <ScrollText className="mr-2 h-5 w-5" /> Firmar Digitalmente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seguimiento modal */}
      <Dialog open={!!segModalReq} onOpenChange={(open) => { if (!open) setSegModalReq(null); }}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Seguimiento Post-Adopción
            </DialogTitle>
            <DialogDescription>
              Actividades de acompañamiento registradas por la fundación.
            </DialogDescription>
          </DialogHeader>
          {segModalReq && seguimientosMap[segModalReq] && seguimientosMap[segModalReq].length > 0 ? (
            <div className="relative ml-2 max-h-80 overflow-y-auto pr-2">
              {[...seguimientosMap[segModalReq]]
                .sort((a, b) => new Date(a.fecha_seguimiento).getTime() - new Date(b.fecha_seguimiento).getTime())
                .map((seg, idx, arr) => {
                const ec = SEG_ESTADO_CONFIG[seg.estado_seguimiento] || SEG_ESTADO_CONFIG.PENDIENTE;
                const Icon = seg.tipo === 'VISITA' ? '🏠' : seg.tipo === 'LLAMADA' ? '📞' : seg.tipo === 'CUESTIONARIO' ? '📋' : '📝';
                return (
                  <div key={seg.id_seguimiento} className="relative pb-5 pl-8">
                    {idx < arr.length - 1 && (
                      <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className={cn("absolute left-0 top-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs",
                      seg.estado_seguimiento === 'REALIZADO' ? 'bg-emerald-100 border-emerald-400' :
                      seg.estado_seguimiento === 'CANCELADO' ? 'bg-red-100 border-red-400' :
                      'bg-amber-100 border-amber-400'
                    )}>
                      {seg.estado_seguimiento === 'REALIZADO' ? '✓' : seg.estado_seguimiento === 'CANCELADO' ? '✗' : '◷'}
                    </div>
                    <div className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{Icon}</span>
                          <span className="font-medium">{SEG_TIPO_LABEL[seg.tipo] || seg.tipo}</span>
                          {seg.tipo === "VISITA" && seg.tipo_visita && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {seg.tipo_visita === "VIRTUAL" ? "Virtual" : "Presencial"}
                            </span>
                          )}
                        </div>
                        <Badge className={cn("text-[10px] h-5", ec.color)} variant="outline">
                          <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1", ec.dot)} />
                          {ec.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        {seg.estado_seguimiento === 'PENDIENTE' && seg.proximo_contacto ? (
                          <span className="text-amber-600 font-medium flex items-center gap-1">🔔 Próximo: {new Date(seg.proximo_contacto).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                        ) : (
                          <span>📅 {seg.fecha_seguimiento ? new Date(seg.fecha_seguimiento).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm">No hay actividades de seguimiento registradas</p>
              <p className="text-xs mt-1">La fundación aún no ha registrado actividades para este caso.</p>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setSegModalReq(null)} className="rounded-xl">Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel modal */}
      <Dialog open={!!cancelModal} onOpenChange={(open) => { if (!open) { setCancelModal(null); setCancelMotivo(''); } }}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Cancelar solicitud</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo (opcional)</Label>
              <Textarea
                value={cancelMotivo}
                onChange={e => setCancelMotivo(e.target.value)}
                placeholder="Ej: Encontré otra mascota, cambié de opinión, etc."
                className="mt-1 h-20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setCancelModal(null); setCancelMotivo(''); }}>
                Volver
              </Button>
              <Button variant="destructive" onClick={handleCancelRequest}>
                <Ban className="mr-1.5 h-4 w-4" /> Confirmar Cancelación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
