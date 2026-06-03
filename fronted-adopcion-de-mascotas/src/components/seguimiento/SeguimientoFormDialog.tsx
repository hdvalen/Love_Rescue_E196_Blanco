import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SeguimientoBackend } from "@/api/seguimientos";

interface SeguimientoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "complete";
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  seguimiento?: SeguimientoBackend | null;
  solicitudOptions?: { value: string; label: string }[];
  defaultSolicitudId?: string;
}

const TIPO_OPTIONS = [
  { value: "CONTACTO", label: "Contacto" },
  { value: "VISITA", label: "Visita" },
  { value: "LLAMADA", label: "Llamada" },
  { value: "CUESTIONARIO", label: "Cuestionario" },
];

const VISITA_OPTIONS = [
  { value: "VIRTUAL", label: "Virtual" },
  { value: "PRESENCIAL", label: "Presencial" },
];

export default function SeguimientoFormDialog({
  open, onOpenChange, mode, onSubmit, seguimiento, solicitudOptions, defaultSolicitudId,
}: SeguimientoFormDialogProps) {
  const [idSolicitud, setIdSolicitud] = useState("");
  const [tipo, setTipo] = useState("CONTACTO");
  const [tipoVisita, setTipoVisita] = useState("VIRTUAL");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [proximoContacto, setProximoContacto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (seguimiento) {
        setIdSolicitud(String(seguimiento.id_solicitud));
        setTipo(seguimiento.tipo);
        setTipoVisita(seguimiento.tipo_visita || "VIRTUAL");
        setDescripcion(seguimiento.descripcion);
        setFecha(seguimiento.fecha_seguimiento ? seguimiento.fecha_seguimiento.split("T")[0] : "");
        setProximoContacto(seguimiento.proximo_contacto ? seguimiento.proximo_contacto.split("T")[0] : "");
        setObservaciones(seguimiento.observaciones || "");
      } else if (defaultSolicitudId) {
        setIdSolicitud(defaultSolicitudId);
        setTipo("CONTACTO");
        setTipoVisita("VIRTUAL");
        setDescripcion("");
        setFecha(new Date().toISOString().split("T")[0]);
        setProximoContacto("");
        setObservaciones("");
      } else {
        setIdSolicitud(solicitudOptions?.[0]?.value || "");
        setTipo("CONTACTO");
        setTipoVisita("VIRTUAL");
        setDescripcion("");
        setFecha(new Date().toISOString().split("T")[0]);
        setProximoContacto("");
        setObservaciones("");
      }
    }
  }, [open, seguimiento, solicitudOptions, defaultSolicitudId]);

  const handleSubmit = async () => {
    if (mode === "complete") {
      if (!observaciones.trim()) return;
      setSubmitting(true);
      await onSubmit({ observaciones: observaciones.trim() });
      setSubmitting(false);
      return;
    }

    if (!descripcion.trim()) return;
    if (mode === "create" && !idSolicitud) return;

    setSubmitting(true);
    const payload: Record<string, unknown> = {
      tipo,
      descripcion: descripcion.trim(),
      fecha_seguimiento: fecha || undefined,
      proximo_contacto: proximoContacto || undefined,
    };
    if (tipo === "VISITA") payload.tipo_visita = tipoVisita;
    if (mode === "create") payload.id_solicitud = Number(idSolicitud);

    await onSubmit(payload);
    setSubmitting(false);
  };

  const title = mode === "create" ? "Nuevo Seguimiento"
    : mode === "edit" ? "Editar Seguimiento"
    : "Completar Seguimiento";

  const desc = mode === "complete"
    ? "Agrega observaciones finales para marcar este seguimiento como realizado."
    : "Registra una actividad de seguimiento post-adopción.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        {mode === "complete" ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Observaciones</Label>
              <Textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Describe el resultado del seguimiento..."
                className="mt-1 min-h-[120px] resize-none rounded-xl text-sm"
              />
            </div>
            <Button
              className="w-full rounded-xl h-11"
              disabled={!observaciones.trim() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Guardando..." : "Marcar como Realizado"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mode === "create" && !defaultSolicitudId && solicitudOptions && (
              <div>
                <Label className="text-xs text-muted-foreground">Solicitud</Label>
                <Select value={idSolicitud} onValueChange={setIdSolicitud}>
                  <SelectTrigger className="mt-1 h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {solicitudOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="mt-1 h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPO_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tipo === "VISITA" && (
                <div>
                  <Label className="text-xs text-muted-foreground">Modalidad de visita</Label>
                  <Select value={tipoVisita} onValueChange={setTipoVisita}>
                    <SelectTrigger className="mt-1 h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VISITA_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Descripción</Label>
              <Textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Describe la actividad de seguimiento..."
                className="mt-1 min-h-[100px] resize-none rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Fecha del seguimiento</Label>
                <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Próximo contacto</Label>
                <Input type="date" value={proximoContacto} onChange={e => setProximoContacto(e.target.value)} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
            </div>

            <Button className="w-full rounded-xl h-11" disabled={!descripcion.trim() || submitting} onClick={handleSubmit}>
              {submitting ? "Guardando..." : mode === "create" ? "Crear Seguimiento" : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
