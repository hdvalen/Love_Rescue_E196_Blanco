import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Syringe, Scissors, PawPrint, CheckCircle, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { getMascotaById, getFotoMascotaUrl } from "@/api/mascotas";
import AdoptionModal from "@/components/AdoptionModal";
import { DetailSkeleton } from "@/components/Skeletons";
import { getUploadUrl } from "@/api/uploads";

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

const statusStyles: Record<string, string> = {
  Disponible: "bg-success text-success-foreground",
  "En Proceso": "bg-warning text-warning-foreground",
  Adoptado: "bg-muted text-muted-foreground",
};

export default function PetDetail() {
  const { id } = useParams();
  const { pets, favorites, toggleFavorite, currentUser, foundations, requests, loading } = useApp();
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const contextPet = pets.find(p => p.id === id);
  const pet = contextPet ? { ...contextPet, images: localImages.length > 0 ? localImages : contextPet.images } : undefined;

  const hasActiveRequest = currentUser && pet
    ? requests.some(r => r.petId === pet.id && r.adopterId === currentUser.id && r.status !== 'Rechazada')
    : false;

  useEffect(() => {
    if (id) {
      getMascotaById(Number(id)).then(res => {
        if (res.ok && res.mascota.FotosMascota && res.mascota.FotosMascota.length > 0) {
          setLocalImages(res.mascota.FotosMascota.map(d => getFotoMascotaUrl(d.nombre_archivo)));
        }
      }).catch(() => {});
    }
  }, [id]);

  if (!pet) {
    if (loading) {
      return <DetailSkeleton />;
    }
    return (
      <div className="container mx-auto flex flex-col items-center py-20">
        <PawPrint className="h-16 w-16 text-muted-foreground/50" />
        <p className="mt-4 font-heading text-xl text-muted-foreground">Mascota no encontrada</p>
        <Link to="/"><Button className="mt-4" variant="outline">Volver al inicio</Button></Link>
      </div>
    );
  }

  const foundation = foundations.find(f => f.id === pet.foundationId);
  const myFundacion = foundations.find(f => f.id_usuario === currentUser?.id);
  const foundationLogoUrl = foundation?.logoUrl ? getUploadUrl(foundation.logoUrl) : null;
  const isFav = favorites.includes(pet.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg bg-muted aspect-square max-w-[600px]">
            <img
              src={pet.images[imgIndex] || pet.images[0]}
              alt={pet.name}
              className="h-full w-full object-cover rounded-lg"
            />
            {pet.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImgIndex(i => (i - 1 + pet.images.length) % pet.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIndex(i => (i + 1) % pet.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {pet.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {pet.images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIndex(i)}
                  className={`shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    i === imgIndex ? "border-primary ring-1 ring-primary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-heading text-3xl font-extrabold">{pet.name}</h1>
                <p className="text-lg text-muted-foreground">{pet.breed}</p>
              </div>
              <Badge className={statusStyles[pet.status]}>{pet.status}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {pet.location}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Edad", value: pet.age },
              { label: "Tamaño", value: pet.size },
              { label: "Especie", value: pet.species },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-secondary p-3 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-heading font-bold text-secondary-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-heading font-bold mb-2">Sobre {pet.name}</h3>
            <p className="text-muted-foreground leading-relaxed">{pet.description}</p>
          </div>

          <div>
            <h3 className="font-heading font-bold mb-2">Temperamento</h3>
            <div className="flex flex-wrap gap-2">
              {pet.temperament.map(t => (
                <span key={t} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">{t}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-bold mb-2">Salud</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Syringe className={`h-5 w-5 ${pet.vaccinated ? "text-success" : "text-muted-foreground"}`} />
                <span className="text-sm">{pet.vaccinated ? "Vacunado" : "Sin vacunar"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors className={`h-5 w-5 ${pet.sterilized ? "text-success" : "text-muted-foreground"}`} />
                <span className="text-sm">{pet.sterilized ? "Esterilizado" : "Sin esterilizar"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Syringe className={`h-5 w-5 ${pet.dewormed ? "text-success" : "text-muted-foreground"}`} />
                <span className="text-sm">{pet.dewormed ? "Desparasitado" : "Sin desparasitar"}</span>
              </div>
            </div>
          </div>

          {foundation && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {foundationLogoUrl ? (
                  <img src={foundationLogoUrl} alt={foundation.name} className="h-12 w-12 rounded-full object-cover border" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-6 w-6 text-primary/60" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Fundación</p>
                  <p className="font-heading font-bold">{foundation.name}</p>
                  {foundation.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-info font-medium">
                      <CheckCircle className="h-3 w-3" /> Verificada
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {pet.status === "Disponible" && currentUser?.role === "adoptante" && !hasActiveRequest && (
              <Button className="flex-1" size="lg" onClick={() => setModalOpen(true)}>
                <PawPrint className="mr-2 h-5 w-5" /> Solicitar Adopción
              </Button>
            )}
            {pet.status === "Disponible" && currentUser?.role === "adoptante" && hasActiveRequest && (
              <div className="flex-1 rounded-lg border border-info/30 bg-info/5 p-3 text-center">
                <p className="font-medium text-info text-sm">Ya has aplicado a la adopción de {pet.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Puedes ver el avance en Mis Trámites</p>
              </div>
            )}
            {currentUser?.role === "fundacion" && pet.foundationId === myFundacion?.id && (
              <Link to={`/editar-mascota/${pet.id}`} className="flex-1">
                <Button className="w-full" size="lg" variant="outline">
                  Editar Publicación
                </Button>
              </Link>
            )}
            {currentUser && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => toggleFavorite(pet.id)}
                className={isFav ? "text-destructive border-destructive" : ""}
              >
                <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
              </Button>
            )}
            {!currentUser && (
              <Link to="/login" className="flex-1">
                <Button className="w-full" size="lg">Inicia sesión para adoptar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {pet.status === "Disponible" && currentUser?.role === "adoptante" && (
        <AdoptionModal pet={pet} open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </div>
  );
}
