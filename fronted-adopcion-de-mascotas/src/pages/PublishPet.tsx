import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, X, ShieldAlert, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApp } from "@/context/AppContext";
import { getFundaciones } from "@/api/fundaciones";
import { uploadFotosMascota, getTemperamentos } from "@/api/mascotas";
import { toast } from "sonner";
import type { Species, Size, Sex } from "@/data/mockData";

export default function PublishPet() {
  const { addPet, currentUser, refreshPets } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", species: "" as Species, breed: "", age: "", size: "" as Size, sex: "" as Sex,
    location: "", description: "",
    vaccinated: false, sterilized: false, dewormed: false, adoptionConditions: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [fundacionId, setFundacionId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [allTemperamentos, setAllTemperamentos] = useState<{ id_temperamento: number; nombre: string }[]>([]);
  const [selectedTemperamentoIds, setSelectedTemperamentoIds] = useState<number[]>([]);

  const toggleTemperamento = useCallback((id: number) => {
    setSelectedTemperamentoIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  useEffect(() => {
    async function checkVerification() {
      try {
        const res = await getFundaciones();
        if (res.ok) {
          const myFundacion = res.fundaciones.find(
            f => String(f.id_usuario) === currentUser?.id
          );
          if (myFundacion) {
            setVerificationStatus(myFundacion.estado_aprobacion);
            setFundacionId(String(myFundacion.id_fundacion));
          }
        }
      } catch {
        // ignore
      } finally {
        setChecking(false);
      }
    }
    if (currentUser?.role === "fundacion") {
      checkVerification();
    }
    getTemperamentos().then(res => {
      if (res.ok) setAllTemperamentos(res.temperamentos);
    }).catch(() => {});
  }, [currentUser]);

  if (!currentUser || currentUser.role !== "fundacion") return null;

  const isVerified = verificationStatus === "APROBADA";

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(f => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} no es una imagen`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} supera los 5 MB`);
        return false;
      }
      return true;
    });

    const totalAfter = selectedFiles.length + validFiles.length;
    if (totalAfter > 5) {
      toast.error(`Máximo 5 imágenes permitidas`);
      const slotsLeft = 5 - selectedFiles.length;
      if (slotsLeft <= 0) return;
      validFiles.splice(slotsLeft);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    addFiles(files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    addFiles(files);
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.species || !form.breed || !form.age || !form.size || !form.sex || !form.location) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    if (previews.length === 0) {
      toast.error("Debes subir al menos 1 foto de la mascota");
      return;
    }

    setSubmitting(true);

    try {
      const images = previews;

      const temperament = allTemperamentos
        .filter(t => selectedTemperamentoIds.includes(t.id_temperamento))
        .map(t => t.nombre);

      const newPet = await addPet({
        ...form,
        temperament,
        temperament_ids: selectedTemperamentoIds,
        images,
        foundationId: currentUser.id,
        status: "Disponible",
        dewormed: form.dewormed,
        active: true,
      });

      let uploadedCount = 0;
      const fd = new FormData();
      for (const file of selectedFiles) {
        fd.append('fotos', file);
      }
      try {
        const res = await uploadFotosMascota(Number(newPet.id), fd);
        if (res.ok) uploadedCount = res.fotos.length;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(`Error al subir imágenes: ${msg}`);
      }

      if (uploadedCount > 0) {
        await refreshPets();
        toast.success("¡Mascota publicada con éxito! Ya es visible para los adoptantes");
      } else {
        toast.warning("Mascota guardada pero no se pudieron subir las imágenes");
      }
      navigate(`/mascota/${newPet.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al publicar la mascota";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  if (!checking && !isVerified) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-lg">
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-heading text-lg">Fundación no verificada</AlertTitle>
            <AlertDescription className="mt-2">
              {verificationStatus === "PENDIENTE" ? (
                <p>
                  Tu fundación está pendiente de verificación por parte del administrador.
                  Una vez sea aprobada podrás publicar mascotas. Este proceso puede tomar
                  algunos días hábiles.
                </p>
              ) : verificationStatus === "RECHAZADA" ? (
                <p>
                  Tu fundación ha sido rechazada. Por favor contacta al administrador
                  para más información sobre los requisitos de verificación.
                </p>
              ) : (
                <p>
                  No se encontró información de tu fundación. Asegúrate de haber
                  completado el registro de tu fundación primero.
                </p>
              )}
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          {isVerified && (
            <div className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 px-3 py-1 rounded-full">
              <ShieldCheck className="h-4 w-4" />
              Verificada
            </div>
          )}
        </div>

        <h1 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" /> Publicar Mascota
        </h1>

        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Nombre *</Label><Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Nombre de la mascota" className="mt-1" /></div>
            <div><Label>Especie *</Label>
              <Select value={form.species} onValueChange={v => update("species", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent><SelectItem value="Perro">Perro</SelectItem><SelectItem value="Gato">Gato</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Raza *</Label><Input value={form.breed} onChange={e => update("breed", e.target.value)} placeholder="Raza" className="mt-1" /></div>
            <div><Label>Edad *</Label><Input value={form.age} onChange={e => update("age", e.target.value)} placeholder="Ej: 2 años" className="mt-1" /></div>
            <div><Label>Tamaño *</Label>
              <Select value={form.size} onValueChange={v => update("size", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent><SelectItem value="Pequeño">Pequeño</SelectItem><SelectItem value="Mediano">Mediano</SelectItem><SelectItem value="Grande">Grande</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Sexo *</Label>
              <Select value={form.sex} onValueChange={v => update("sex", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent><SelectItem value="Macho">Macho</SelectItem><SelectItem value="Hembra">Hembra</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Ubicación *</Label><Input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Ciudad" className="mt-1" /></div>
          </div>

          <div><Label>Descripción</Label><Textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe la personalidad, historia..." className="mt-1" rows={4} /></div>
          <div>
            <Label>Temperamento</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {allTemperamentos.map(t => (
                <button
                  key={t.id_temperamento}
                  type="button"
                  onClick={() => toggleTemperamento(t.id_temperamento)}
                  className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                    selectedTemperamentoIds.includes(t.id_temperamento)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-muted-foreground/30 hover:border-primary/50'
                  }`}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex items-center gap-2"><Switch checked={form.vaccinated} onCheckedChange={v => update("vaccinated", v)} /><Label>Vacunado</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.sterilized} onCheckedChange={v => update("sterilized", v)} /><Label>Esterilizado</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.dewormed} onCheckedChange={v => update("dewormed", v)} /><Label>Desparasitado</Label></div>
          </div>

          <div><Label>Condiciones de adopción</Label><Textarea value={form.adoptionConditions} onChange={e => update("adoptionConditions", e.target.value)} placeholder="Requisitos especiales..." className="mt-1" rows={2} /></div>

          <div>
            <Label>Fotos de la mascota *</Label>
            <div
              className={`mt-1 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Arrastra las fotos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">Mínimo 1, máximo 5 imágenes</p>
            </div>
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={`Foto ${i + 1}`} className="h-20 w-20 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Publicando..." : "Publicar Mascota"}
          </Button>
        </form>
      </div>
    </div>
  );
}
