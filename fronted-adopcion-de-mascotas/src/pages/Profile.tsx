import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Home, Briefcase, Clock, Users, TreePine, Edit, Save, X, Camera } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getUploadUrl } from "@/api/uploads";
import { uploadFotoUsuario } from "@/api/usuarios";

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function Profile() {
  const { currentUser, updateProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [localFotoUrl, setLocalFotoUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    housingType: "",
    hasPatio: false,
    hoursAlone: "",
    experience: "",
    familyComposition: "",
  });

  useEffect(() => {
    if (currentUser) {
      setForm({
        phone: currentUser.phone || "",
        housingType: currentUser.housingType || "",
        hasPatio: currentUser.hasPatio || false,
        hoursAlone: currentUser.hoursAlone || "",
        experience: currentUser.experience || "",
        familyComposition: currentUser.familyComposition || "",
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSave = async () => {
    const result = await updateProfile(form);
    if (result !== false) {
      setEditing(false);
      toast.success("Perfil actualizado exitosamente");
    } else {
      toast.error("Error al guardar el perfil");
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imágenes"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no debe superar los 5 MB"); return; }
    setUploadingFoto(true);
    try {
      const fd = new FormData();
      fd.append("foto", file);
      const res = await uploadFotoUsuario(fd);
      if (res.ok && res.user?.foto_url) {
        setLocalFotoUrl(getUploadUrl(res.user.foto_url));
        await updateProfile({ fotoUrl: res.user.foto_url });
        toast.success("Foto subida correctamente");
      }
    } catch {
      toast.error("Error al subir la foto");
    } finally {
      setUploadingFoto(false);
    }
  };

  const fotoUrl = localFotoUrl || (currentUser.fotoUrl ? getUploadUrl(currentUser.fotoUrl) : null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="text-center">
            {fotoUrl ? (
              <img src={fotoUrl} alt={currentUser.name} className="mx-auto h-24 w-24 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
            )}
            <h1 className="mt-4 font-heading text-2xl font-bold">{currentUser.name}</h1>
            <Badge className="mt-2 bg-secondary text-secondary-foreground">
              {currentUser.role === "adoptante" ? "Adoptante" : currentUser.role === "fundacion" ? "Fundación" : "Admin"}
            </Badge>

            <div className="mt-3">
              <div
                className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3 w-3" />
                {uploadingFoto ? "Subiendo..." : "Cambiar foto"}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-md bg-muted p-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{currentUser.email}</p>
            </div>
          </div>

          {currentUser.phone && (
            <div className="mt-2 flex items-center gap-3 rounded-md bg-muted p-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Celular</p>
                <p className="text-sm font-medium">{currentUser.phone}</p>
              </div>
            </div>
          )}

          {currentUser.role === "adoptante" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold">Información del hogar</h3>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="mr-1 h-4 w-4" /> Editar</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}><Save className="mr-1 h-4 w-4" /> Guardar</Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Celular</Label>
                    <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Ej: 3001234567" className="mt-1" />
                  </div>
                  <div>
                    <Label>Tipo de vivienda</Label>
                    <Select value={form.housingType} onValueChange={v => setForm(p => ({ ...p, housingType: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa con patio">Casa con patio</SelectItem>
                        <SelectItem value="Finca">Finca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>¿Posee patio?</Label>
                    <Switch checked={form.hasPatio} onCheckedChange={v => setForm(p => ({ ...p, hasPatio: v }))} />
                  </div>
                  <div>
                    <Label>Horas que la mascota estará sola</Label>
                    <Input value={form.hoursAlone} onChange={e => setForm(p => ({ ...p, hoursAlone: e.target.value }))} placeholder="Ej: 4 horas" className="mt-1" />
                  </div>
                  <div>
                    <Label>Experiencia previa con mascotas</Label>
                    <Textarea value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="Describe tu experiencia..." className="mt-1" rows={3} />
                  </div>
                  <div>
                    <Label>Composición del núcleo familiar</Label>
                    <Input value={form.familyComposition} onChange={e => setForm(p => ({ ...p, familyComposition: e.target.value }))} placeholder="Ej: 2 adultos, 1 niño" className="mt-1" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentUser.phone && (
                    <div className="flex items-center gap-3 rounded-md bg-muted p-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Celular</p>
                        <p className="text-sm font-medium">{currentUser.phone}</p>
                      </div>
                    </div>
                  )}
                  {[
                    { icon: Home, label: "Tipo de vivienda", value: currentUser.housingType },
                    { icon: TreePine, label: "Patio", value: currentUser.hasPatio ? "Sí" : "No" },
                    { icon: Clock, label: "Horas sola la mascota", value: currentUser.hoursAlone },
                    { icon: Briefcase, label: "Experiencia", value: currentUser.experience },
                    { icon: Users, label: "Núcleo familiar", value: currentUser.familyComposition },
                  ].map(({ icon: Icon, label, value }) => value && (
                    <div key={label} className="flex items-center gap-3 rounded-md bg-muted p-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                  {!currentUser.housingType && !currentUser.experience && (
                    <p className="text-sm text-muted-foreground text-center py-4">Haz clic en "Editar" para completar tu perfil</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
