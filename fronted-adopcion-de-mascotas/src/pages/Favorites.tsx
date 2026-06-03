import { Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import PetCard from "@/components/PetCard";

export default function Favorites() {
  const { pets, favorites } = useApp();
  const favPets = pets.filter(p => favorites.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-destructive" /> Mis Favoritos
      </h1>
      {favPets.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-heading text-lg text-muted-foreground">Aún no tienes mascotas favoritas</p>
          <p className="text-sm text-muted-foreground">Explora y haz clic en el corazón para guardar</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favPets.map(pet => <PetCard key={pet.id} pet={pet} />)}
        </div>
      )}
    </div>
  );
}
