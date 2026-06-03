import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PawPrint, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/AppContext";
import { uploadFotosMascota, deleteFotoMascota, getMascotaById, getFotoMascotaUrl, getTemperamentos } from "@/api/mascotas";
import { toast } from "sonner";
import type { Species, Size, Sex, AdoptionStatus } from "@/data/mockData";

export default function EditPet() {
  const { id } = useParams();
  const { pets, foundations, updatePet, currentUser, refreshPets } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pet = pets.find(p => p.id === id);
  const myFundacion = foundations.find(f => f.id_usuario === currentUser?.id);

  const [form, setForm] = useState({
    name: "", species: "" as Species, breed: "", age: "", size: "" as Size, sex: "" as Sex,
    location: "", description: "",
    vaccinated: false, sterilized: false, dewormed: false, adoptionConditions: "", status: "" as AdoptionStatus,
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fotos, setFotos] = useState<{ id_foto: number; nombre_archivo: string }[]>([]);
  const [allTemperamentos, setAllTemperamentos] = useState<{ id_temperamento: number; nombre: string }[]>([]);
  const [selectedTemperamentoIds, setSelectedTemperamentoIds] = useState<number[]>([]);

  const toggleTemperamento = useCallback((id: number) => {
    setSelectedTemperamentoIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name, species: pet.species, breed: pet.breed, age: pet.age,
        size: pet.size, sex: pet.sex, location: pet.location, description: pet.description,
        vaccinated: pet.vaccinated,
        sterilized: pet.sterilized, dewormed: pet.dewormed, adoptionConditions: pet.adoptionConditions || "",
        status: pet.status,
      });
      getMascotaById(Number(pet.id)).then(res => {
        if (res.ok) {
          if (res.mascota.FotosMascota) setFotos(res.mascota.FotosMascota);
          if (res.mascota.Temperamentos) {
            setSelectedTemperamentoIds(res.mascota.Temperamentos.map(t => t.id_temperamento));
          }
        }
      }).catch(() => {});
    }
  }, [pet]);

  useEffect(() => {
    getTemperamentos().then(res => {
      if (res.ok) setAllTemperamentos(res.temperamentos);
    }).catch(() => {});
  }, []);

  if (!pet || !currentUser || currentUser.role !== "fundacion") return null;

  const handleDeleteImage = async (foto: { id_foto: number }) => {
    try {
      await deleteFotoMascota(foto.id_foto);
      setFotos(prev => prev.filter(d => d.id_foto !== foto.id_foto));
      await refreshPets();
      toast.success("Imagen eliminada");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar imagen';
      toast.error(msg);
    }
  };

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
    const totalAfter = fotos.length + newFiles.length + validFiles.length;
    if (totalAfter > 5) {
      toast.error("Máximo 5 imágenes por mascota");
      const slotsLeft = 5 - fotos.length - newFiles.length;
      if (slotsLeft <= 0) return;
      validFiles.splice(slotsLeft);
    }
    setNewFiles(prev => [...prev, ...validFiles]);
    setNewPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePet(pet.id, {
      ...form,
      temperament_ids: selectedTemperamentoIds,
    });

    if (newFiles.length > 0) {
      const fd = new FormData();
      for (const file of newFiles) {
        fd.append('fotos', file);
      }
      try {
        await uploadFotosMascota(Number(pet.id), fd);
        await refreshPets();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(`Error al subir imágenes: ${msg}`);
      }
    }

    toast.success("Mascota actualizada exitosamente");
    navigate(`/mascota/${pet.id}`);
  };

  const update = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) addFiles(files);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" /> Editar Mascota — {pet.name}
        </h1>

        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Nombre</Label><Input value={form.name} onChange={e => update("name", e.target.value)} className="mt-1" /></div>
            <div><Label>Especie</Label>
              <Select value={form.species} onValueChange={v => update("species", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Perro">Perro</SelectItem><SelectItem value="Gato">Gato</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Raza</Label><Input value={form.breed} onChange={e => update("breed", e.target.value)} className="mt-1" /></div>
            <div><Label>Edad</Label><Input value={form.age} onChange={e => update("age", e.target.value)} className="mt-1" /></div>
            <div><Label>Tamaño</Label>
              <Select value={form.size} onValueChange={v => update("size", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Pequeño">Pequeño</SelectItem><SelectItem value="Mediano">Mediano</SelectItem><SelectItem value="Grande">Grande</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Sexo</Label>
              <Select value={form.sex} onValueChange={v => update("sex", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Macho">Macho</SelectItem><SelectItem value="Hembra">Hembra</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Ubicación</Label><Input value={form.location} onChange={e => update("location", e.target.value)} className="mt-1" /></div>
            <div><Label>Estado</Label>
              <Select value={form.status} onValueChange={v => update("status", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Disponible">Disponible</SelectItem><SelectItem value="En Proceso">En Proceso</SelectItem><SelectItem value="Adoptado">Adoptado</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Descripción</Label><Textarea value={form.description} onChange={e => update("description", e.target.value)} className="mt-1" rows={4} /></div>
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
          <div><Label>Condiciones de adopción</Label><Textarea value={form.adoptionConditions} onChange={e => update("adoptionConditions", e.target.value)} className="mt-1" rows={2} /></div>

          <div>
            <Label>Fotos actuales ({fotos.length})</Label>
            <p className="text-xs text-muted-foreground mb-2">Haz clic en la X para eliminar una imagen</p>
            {fotos.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {fotos.map(foto => (
                  <div key={foto.id_foto} className="relative group">
                    <img src={getFotoMascotaUrl(foto.nombre_archivo)} alt="" className="h-16 w-16 object-cover rounded-lg border" />
                    <button type="button" onClick={() => handleDeleteImage(foto)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Agregar nuevas fotos</Label>
            <div
              className={`mt-1 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => {
                const files = Array.from(e.target.files || []);
                if (files.length) addFiles(files);
                e.target.value = "";
              }} />
              <Upload className="mx-auto h-6 w-6 text-muted-foreground/50" />
              <p className="mt-1 text-sm text-muted-foreground">Arrastra o haz clic para agregar fotos</p>
              <p className="text-xs text-muted-foreground">Máximo 5 imágenes en total</p>
            </div>
            {newPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="h-16 w-16 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeNewImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Guardar Cambios</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
