import { useState, useEffect, useRef } from "react";
import { Shield, Edit, Save, X, Building, Phone, Globe, FileText, MapPin, Camera, CheckCircle, Clock, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { uploadLogoFundacion } from "@/api/fundaciones";
import { toast } from "sonner";
import { DEPARTAMENTOS } from "@/data/colombia";
import { getUploadUrl } from "@/api/uploads";

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function FoundationProfile() {
  const { currentUser, foundations, createFoundation, updateFoundation, refreshFoundations } = useApp();
  const foundation = foundations.find(f => f.id_usuario === currentUser?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", nit: "", address: "", phone: "", city: "", department: "", description: "", socialMedia: "", mission: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (foundation) {
      setForm({
        name: foundation.name,
        nit: foundation.nit || "",
        address: foundation.address || "",
        phone: foundation.phone || "",
        city: foundation.city || "",
        department: foundation.department || "",
        description: foundation.description || "",
        socialMedia: foundation.socialMedia || "",
        mission: foundation.mission || "",
      });
    }
  }, [foundation]);

  if (!currentUser || currentUser.role !== "fundacion") return null;

  const handleSave = async () => {
    if (foundation) {
      setSaving(true);
      try {
        await updateFoundation(foundation.id, {
          name: form.name,
          nit: form.nit,
          address: form.address,
          phone: form.phone,
          socialMedia: form.socialMedia,
          mission: form.mission,
          description: form.description,
          city: form.city,
          department: form.department,
        });
        toast.success("Datos actualizados");
        setEditing(false);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Error al actualizar";
        toast.error(msg);
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!form.name) { toast.error("El nombre es obligatorio"); return; }

    setSaving(true);
    try {
      await createFoundation({
        nombre_fundacion: form.name, nit: form.nit || undefined,
        telefono: form.phone || undefined, ciudad: form.city || undefined,
        direccion: form.address || undefined, descripcion: form.description || undefined,
        redes_sociales: form.socialMedia || undefined,
        mision: form.mission || undefined,
      });
      toast.success("¡Fundación creada!");
      setEditing(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al crear la fundación";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !foundation) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5 MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await uploadLogoFundacion(Number(foundation.id), fd);
      if (res.ok && res.fundacion?.logo_url) {
        setLocalLogoUrl(getUploadUrl(res.fundacion.logo_url));
        await refreshFoundations();
        toast.success("Logo subido correctamente");
      }
    } catch {
      toast.error("Error al subir el logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const cities = form.department ? DEPARTAMENTOS[form.department] || [] : [];

  const logoUrl = localLogoUrl || (foundation?.logoUrl ? getUploadUrl(foundation.logoUrl) : null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="text-center">
            {logoUrl ? (
              <img src={logoUrl} alt={foundation?.name} className="mx-auto h-24 w-24 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            )}
            <h1 className="mt-4 font-heading text-2xl font-bold">{foundation?.name || currentUser.name}</h1>
            {foundation ? (
              <div className="mt-2 flex items-center justify-center gap-2">
                {foundation.verified ? (
                  <Badge className="bg-info text-info-foreground"><CheckCircle className="mr-1 h-3 w-3" /> Verificada</Badge>
                ) : foundation.verificationStatus === "Rechazada" ? (
                  <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Rechazada</Badge>
                ) : (
                  <Badge className="bg-warning text-warning-foreground"><Clock className="mr-1 h-3 w-3" /> Pendiente de verificación</Badge>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Completa tu perfil de fundación</p>
            )}
          </div>

          {foundation?.rejectionReason && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-semibold mb-1">Motivo de rechazo:</p>
              <p>{foundation.rejectionReason}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold">
                {!foundation ? "Crear Fundación" : editing ? "Editar datos" : "Datos de la Fundación"}
              </h3>
              {foundation && !editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit className="mr-1 h-4 w-4" /> Editar
                </Button>
              )}
            </div>

            {!foundation || editing ? (
              <div className="space-y-4">
                {!foundation && (
                  <div><Label>Nombre de la fundación *</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre" className="mt-1" /></div>
                )}
                <div><Label>NIT</Label>
                  <Input value={form.nit} onChange={e => setForm(p => ({ ...p, nit: e.target.value }))} placeholder="900123456-7" className="mt-1" /></div>
                <div><Label>Departamento</Label>
                  <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v, city: "" }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar departamento" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(DEPARTAMENTOS).map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Ciudad</Label>
                  <Select value={form.city} onValueChange={v => setForm(p => ({ ...p, city: v }))} disabled={!form.department}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={form.department ? "Seleccionar ciudad" : "Primero elige departamento"} /></SelectTrigger>
                    <SelectContent>
                      {cities.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Dirección</Label>
                  <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Dirección" className="mt-1" /></div>
                <div><Label>Teléfono</Label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+573001234567" className="mt-1" /></div>
                <div><Label>Redes sociales</Label>
                  <Input value={form.socialMedia} onChange={e => setForm(p => ({ ...p, socialMedia: e.target.value }))} placeholder="@fundacion" className="mt-1" /></div>
                <div><Label>Descripción</Label>
                  <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe tu fundación..." className="mt-1" rows={3} /></div>
                <div><Label>Misión</Label>
                  <Textarea value={form.mission} onChange={e => setForm(p => ({ ...p, mission: e.target.value }))} placeholder="Misión..." className="mt-1" rows={3} /></div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando..." : <><Save className="mr-1 h-4 w-4" /> Guardar</>}
                  </Button>
                  {foundation && (
                    <Button variant="ghost" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {foundation.mission && (
                  <div className="rounded-md bg-muted p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Misión</p>
                    <p className="text-sm">{foundation.mission}</p>
                  </div>
                )}
                {[
                  { icon: FileText, label: "NIT", value: foundation.nit },
                  { icon: MapPin, label: "Ubicación", value: [foundation.city, foundation.department].filter(Boolean).join(", ") || foundation.address },
                  { icon: Building, label: "Dirección", value: foundation.address },
                  { icon: Phone, label: "Teléfono", value: foundation.phone },
                  { icon: Globe, label: "Redes sociales", value: foundation.socialMedia },
                ].filter(item => item.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-md bg-muted p-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}

                {/* Logo upload */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Logo de la fundación</Label>
                  </div>
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="h-20 w-20 object-cover rounded-lg border mb-2" />
                  )}
                  <div
                    className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <Camera className="mx-auto h-6 w-6 text-muted-foreground/50" />
                    <p className="mt-1 text-xs text-muted-foreground">{uploadingLogo ? "Subiendo..." : "Subir logo"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
