import { Heart, MapPin, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { Pet } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  Disponible: "bg-success text-success-foreground",
  "En Proceso": "bg-warning text-warning-foreground",
  Adoptado: "bg-muted text-muted-foreground",
};

export default function PetCard({ pet }: { pet: Pet }) {
  const { favorites, toggleFavorite, currentUser, foundations } = useApp();
  const foundation = foundations.find(f => f.id === pet.foundationId);
  const isFav = favorites.includes(pet.id);

  return (
    <div className="group animate-fade-in overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/mascota/${pet.id}`}>
          <img
            src={pet.images[0]}
            alt={pet.name}
            loading="lazy"
            width={640}
            height={640}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <Badge className={`absolute left-3 top-3 ${statusStyles[pet.status]}`}>
          {pet.status}
        </Badge>
        {currentUser && (
          <button
            onClick={() => toggleFavorite(pet.id)}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card ${isFav ? "text-destructive" : "text-muted-foreground"}`}
          >
            <Heart className={`h-5 w-5 ${isFav ? "fill-current animate-heart-beat" : ""}`} />
          </button>
        )}
      </div>
      <Link to={`/mascota/${pet.id}`} className="block p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">{pet.name}</h3>
            <p className="text-sm text-muted-foreground">{pet.breed} · {pet.age}</p>
          </div>
          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {pet.size}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {pet.location}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {foundation && (
            <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5">
              {foundation.verified && <CheckCircle className="h-3 w-3 text-info" />}
              <span className="text-xs text-muted-foreground">{foundation.name}</span>
            </div>
          )}
          {pet.temperament.slice(0, 2).map(t => (
            <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {t}
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
}
