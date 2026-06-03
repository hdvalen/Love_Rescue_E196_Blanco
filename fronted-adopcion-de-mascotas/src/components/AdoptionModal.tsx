import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/context/AppContext";
import type { Pet } from "@/data/mockData";
import { toast } from "sonner";
import { updatePerfilAdoptante } from "@/api/perfil_adoptante";

interface Props {
  pet: Pet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdoptionModal({ pet, open, onOpenChange }: Props) {
  const { submitRequest, currentUser, updateProfile } = useApp();
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileComplete = !!(currentUser?.housingType && currentUser?.hoursAlone && currentUser?.experience);

  const [horasSolo, setHorasSolo] = useState(currentUser?.hoursAlone || "");
  const [tipoVivienda, setTipoVivienda] = useState(currentUser?.housingType || "");
  const [tienePatio, setTienePatio] = useState(
    currentUser?.hasPatio === true ? "Si" : currentUser?.hasPatio === false ? "No" : ""
  );
  const [otrosAnimales, setOtrosAnimales] = useState("");
  const [ninos, setNinos] = useState("");
  const [experiencia, setExperiencia] = useState(currentUser?.experience || "");

  useEffect(() => {
    if (open && currentUser) {
      setHorasSolo(currentUser.hoursAlone || "");
      setTipoVivienda(currentUser.housingType || "");
      setTienePatio(
        currentUser.hasPatio === true ? "Si" : currentUser.hasPatio === false ? "No" : ""
      );
      setExperiencia(currentUser.experience || "");
      setOtrosAnimales("");
      setNinos("");
    }
  }, [open, currentUser]);

  const resetForm = () => {
    setMessage("");
    setAccepted(false);
    setOtrosAnimales("");
    setNinos("");
  };

  const handleSubmit = async () => {
    if (!message.trim() || message.trim().length < 70) {
      toast.error("El mensaje debe tener al menos 70 caracteres");
      return;
    }
    if (!accepted) {
      toast.error("Debes aceptar el compromiso de adopción");
      return;
    }
    if (!profileComplete && (!horasSolo || !tipoVivienda || !tienePatio || !otrosAnimales || !ninos || !experiencia)) {
      toast.error("Completa todos los campos sobre tu hogar");
      return;
    }
    setLoading(true);
    const datosAdoptante = { horasSolo, tipoVivienda, tienePatio, otrosAnimales, ninos, experiencia };
    const result = await submitRequest(pet.id, message, datosAdoptante);
    if (result.ok) {
      if (!profileComplete && horasSolo && tipoVivienda && experiencia) {
        try {
          await updatePerfilAdoptante({
            hours_alone: horasSolo,
            housing_type: tipoVivienda,
            has_patio: tienePatio === "Si",
            experience: experiencia,
          });
          if (currentUser) {
            updateProfile({
              hoursAlone: horasSolo,
              housingType: tipoVivienda,
              hasPatio: tienePatio === "Si",
              experience: experiencia,
            });
          }
        } catch { /* ignore */ }
      }
      toast.success("Tu solicitud ha sido enviada a la fundación. Puedes ver el avance en la sección 'Mis Trámites'.");
      onOpenChange(false);
      resetForm();
    } else {
      toast.error(result.error || "Error al enviar la solicitud");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Solicitar adopción de {pet.name}</DialogTitle>
          <DialogDescription>Cuéntanos sobre ti y tu hogar para que la fundación evalúe tu solicitud.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {currentUser && (
            <div className="rounded-lg bg-secondary/50 p-3 text-sm">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>
          )}

          {!profileComplete && (
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="font-heading font-semibold text-sm">Información del hogar</h4>

            <div className="space-y-1">
              <Label>¿Cuántas horas al día estará solo el animal?</Label>
              <Select value={horasSolo} onValueChange={setHorasSolo}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-4">1-4 horas</SelectItem>
                  <SelectItem value="4-8">4-8 horas</SelectItem>
                  <SelectItem value="8-12">8-12 horas</SelectItem>
                  <SelectItem value="12+">Más de 12 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Tipo de vivienda</Label>
              <Select value={tipoVivienda} onValueChange={setTipoVivienda}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Apartamento">Apartamento</SelectItem>
                  <SelectItem value="Finca">Finca / Casa con terreno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>¿Tiene patio, balcón o jardín?</Label>
              <Select value={tienePatio} onValueChange={setTienePatio}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Sí</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Balcon">Solo balcón</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>¿Tienes otros animales en casa?</Label>
              <Select value={otrosAnimales} onValueChange={setOtrosAnimales}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="SiPerro">Sí, perro(s)</SelectItem>
                  <SelectItem value="SiGato">Sí, gato(s)</SelectItem>
                  <SelectItem value="SiAmbos">Sí, ambos</SelectItem>
                  <SelectItem value="SiOtros">Sí, otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>¿Hay niños en casa?</Label>
              <Select value={ninos} onValueChange={setNinos}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="SiMenores">Sí, menores de 6 años</SelectItem>
                  <SelectItem value="SiMayores">Sí, mayores de 6 años</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Experiencia previa con mascotas</Label>
              <Select value={experiencia} onValueChange={setExperiencia}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ninguna">Ninguna</SelectItem>
                  <SelectItem value="Poca">Poca (he cuidado alguna vez)</SelectItem>
                  <SelectItem value="Media">Media (he tenido antes)</SelectItem>
                  <SelectItem value="Mucha">Mucha (he tenido y cuidado por años)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          )}

          <div>
            <Textarea
              placeholder="Cuéntanos por qué quieres adoptar a esta mascota y cualquier otra información relevante... (mínimo 70 caracteres)"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
            />
            <p className={`text-xs mt-1 ${message.length >= 70 ? "text-success" : "text-muted-foreground"}`}>{message.length}/70 caracteres mínimo</p>
          </div>

          <div className="rounded-lg border bg-secondary/50 p-4">
            <h4 className="font-heading font-semibold mb-2">Compromiso de Adopción Responsable</h4>
            <ul className="text-sm text-muted-foreground space-y-1 mb-3">
              <li>• Proporcionar alimentación, agua y refugio adecuados</li>
              <li>• Brindar atención veterinaria regular</li>
              <li>• No abandonar ni maltratar al animal</li>
              <li>• Permitir visitas de seguimiento de la fundación</li>
            </ul>
            <div className="flex items-center gap-2">
              <Checkbox id="accept" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
              <label htmlFor="accept" className="text-sm font-medium cursor-pointer">
                Acepto el compromiso de adopción responsable
              </label>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
