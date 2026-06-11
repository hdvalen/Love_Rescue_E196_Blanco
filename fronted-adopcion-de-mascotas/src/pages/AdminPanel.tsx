import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Clock, Building, AlertTriangle, PawPrint, Heart, ClipboardList, Download, Users } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getUploadUrl } from "@/api/uploads";
import { getReporteGeneral, downloadExcelReporte } from "@/api/reportes";
import type { ReporteGeneral } from "@/api/reportes";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_EVALUACION: "En Evaluación",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  EN_SEGUIMIENTO: "En Seguimiento",
  ADOPTADA: "Adoptada",
};

export default function AdminPanel() {
  const { foundations, verifyFoundation, refreshFoundations } = useApp();
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reporte, setReporte] = useState<ReporteGeneral | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { refreshFoundations(); }, [refreshFoundations]);

  useEffect(() => {
    getReporteGeneral().then(res => {
      if (res.ok) setReporte(res);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function getPorEstado(arr: { cantidad: number }[] | undefined, key: string, val: string): number {
    if (!arr) return 0;
    const found = arr.find((e: any) => e[key] === val);
    return parseInt(found?.cantidad || 0);
  }

  const mascotasDisponibles = getPorEstado(reporte?.mascotas.porEstado, 'estado_mascota', 'DISPONIBLE');
  const adopcionesCompletadas = getPorEstado(reporte?.solicitudes.porEstado, 'estado_solicitud', 'ADOPTADA');
  const solicitudesPendientes = getPorEstado(reporte?.solicitudes.porEstado, 'estado_solicitud', 'PENDIENTE')
    + getPorEstado(reporte?.solicitudes.porEstado, 'estado_solicitud', 'EN_EVALUACION');
  const fundacionesAprobadas = getPorEstado(reporte?.fundaciones.porEstado, 'estado_aprobacion', 'APROBADA');

  async function exportToExcel() {
    try {
      await downloadExcelReporte();
      toast.success('Reporte descargado');
    } catch {
      toast.error('Error al descargar el reporte');
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await verifyFoundation(id, true);
      toast.success("Fundación aprobada – se notificará por correo");
    } catch {
      toast.error("Error al aprobar");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) {
      toast.error("Debes escribir el motivo del rechazo");
      return;
    }
    try {
      await verifyFoundation(rejectModal.id, false, rejectReason.trim());
      toast.success("Fundación rechazada – se notificará por correo");
      setRejectModal(null);
      setRejectReason("");
    } catch {
      toast.error("Error al rechazar");
    }
  };

  const Card = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Panel de Administración
        </h1>
        {reporte && (
<Button variant="outline" size="sm" 
onClick={exportToExcel} className="rounded-xl">
            <Download className="mr-1.5 h-4 w-4" /> Exportar CSV
          </Button>
        )}
      </div>

      {/* Alertas operativas */}
      {reporte && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Fundaciones pendientes', value: reporte.fundaciones.total - fundacionesAprobadas, icon: Clock, color: 'bg-amber-500' },
            { label: 'Solicitudes activas', value: solicitudesPendientes, icon: ClipboardList, color: 'bg-blue-500' },
            { label: 'Mascotas disponibles', value: mascotasDisponibles, icon: PawPrint, color: 'bg-emerald-500' },
            { label: 'Adopciones del mes', value: adopcionesCompletadas, icon: Heart, color: 'bg-rose-500' },
          ].map(alert => (
            <div key={alert.label} className="rounded-xl border bg-card p-4 flex items-center gap-3 shadow-sm">
              <div className={'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ' + alert.color}>
                <alert.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold">{alert.value}</p>
                <p className="text-xs text-muted-foreground">{alert.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-sm animate-pulse">
              <div className="h-9 w-9 rounded-lg bg-muted mb-3" />
              <div className="h-6 w-16 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Fundaciones pendientes (bandeja de trabajo) */}
      {foundations.filter(f => f.verificationStatus === "Pendiente").length > 0 && (
        <div className="mb-6">
          <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Fundaciones pendientes ({foundations.filter(f => f.verificationStatus === "Pendiente").length})
          </h2>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="divide-y">
              {foundations.filter(f => f.verificationStatus === "Pendiente").map(f => {
                const logoUrl = f.logoUrl ? getUploadUrl(f.logoUrl) : null;
                const initials = f.name?.split(' ').map((s: string) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
                const isExpanded = expandedId === f.id;
                return (
                <div key={f.id}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : f.id)}>
                    {logoUrl ? (
                      <img src={logoUrl} alt={f.name} className="h-9 w-9 rounded-lg object-cover border shrink-0" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <span className="text-xs font-bold text-primary">{initials}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.email} · Registrada {f.createdAt ? new Date(f.createdAt).toLocaleDateString('es-CO') : '—'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <Button size="sm" onClick={() => handleApprove(f.id)} className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Aprobar
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRejectModal({ id: f.id, name: f.name })}>
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Rechazar
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t mx-4">
                      <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-4">
                        <div><span className="font-medium">NIT:</span> {f.nit || '—'}</div>
                        <div><span className="font-medium">Teléfono:</span> {f.phone || '—'}</div>
                        <div><span className="font-medium">Ciudad:</span> {f.city || '—'}</div>
                        <div><span className="font-medium">Departamento:</span> {f.department || '—'}</div>
                        <div className="col-span-2"><span className="font-medium">Dirección:</span> {f.address || '—'}</div>
                        {f.socialMedia && <div className="col-span-2"><span className="font-medium">Redes sociales:</span> {f.socialMedia}</div>}
                        {f.mission && <div className="col-span-2"><span className="font-medium">Misión:</span> <p className="text-xs mt-1 text-muted-foreground">{f.mission}</p></div>}
                        <div className="col-span-2"><span className="font-medium">Descripción:</span> <p className="text-xs mt-1 text-muted-foreground">{f.description || '—'}</p></div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Métricas resumidas */}
      {reporte && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card icon={ClipboardList} label="Solicitudes activas" value={solicitudesPendientes} sub="Pendientes + Evaluación" />
          <Card icon={Heart} label="Adopciones completadas" value={adopcionesCompletadas} />
          <Card icon={PawPrint} label="Mascotas disponibles" value={mascotasDisponibles} />
          <Card icon={Building} label="Fundaciones verificadas" value={fundacionesAprobadas} sub={`${reporte.fundaciones.total} registradas`} />
        </div>
      )}

      {/* Fundaciones verificadas (listado compacto) */}
      {foundations.filter(f => f.verificationStatus !== "Pendiente").length > 0 && (
        <div className="mb-6">
          <h2 className="font-heading text-lg font-semibold mb-3">Fundaciones verificadas ({foundations.filter(f => f.verificationStatus !== "Pendiente").length})</h2>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="divide-y">
              {foundations.filter(f => f.verificationStatus !== "Pendiente").map(f => {
                const logoUrl = f.logoUrl ? getUploadUrl(f.logoUrl) : null;
                const initials = f.name?.split(' ').map((s: string) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
                return (
                <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors text-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt={f.name} className="h-8 w-8 rounded-lg object-cover border shrink-0" />
                  ) : (
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                      f.verificationStatus === "Aprobada" ? "bg-emerald-100" : "bg-red-100"
                    )}>
                      <span className="text-xs font-bold">{initials}</span>
                    </div>
                  )}
                  <span className="font-medium flex-1 min-w-0 truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{f.email}</span>
                  <Badge className={
                    f.verificationStatus === "Aprobada" ? "bg-emerald-500/15 text-emerald-600 border-emerald-200" :
                    "bg-red-500/15 text-red-600 border-red-200"
                  } variant="outline">
                    {f.verificationStatus === "Aprobada" ? "Verificada" : "Rechazada"}
                  </Badge>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h3 className="font-heading text-lg font-bold mb-2">Rechazar fundación</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vas a rechazar a <strong>{rejectModal.name}</strong>. Escribe el motivo del rechazo:
            </p>
            <Label>Motivo de rechazo *</Label>
            <Textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ej: Documentación incompleta, falta NIT, etc."
              className="mt-1"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setRejectModal(null); setRejectReason(""); }}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
                <XCircle className="mr-1 h-4 w-4" /> Rechazar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
