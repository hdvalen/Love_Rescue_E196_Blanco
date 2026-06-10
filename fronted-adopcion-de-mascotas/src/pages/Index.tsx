import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Heart, Shield, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import PetCard from "@/components/PetCard";
import PetFilters from "@/components/PetFilters";
import { PetCardSkeleton } from "@/components/Skeletons";
import PaginationControls from "@/components/PaginationControls";
import heroImg from "@/assets/hero-adoption.jpg";
import { getReportePublico } from "@/api/reportes";
import { getMascotas, getFotoMascotaUrl } from "@/api/mascotas";
import type { ReportePublico } from "@/api/reportes";
import type { Pet } from "@/data/mockData";

const PETS_PER_PAGE = 9;

const SIZE_MAP: Record<string, string> = { Pequeño: 'PEQUENO', Mediano: 'MEDIANO', Grande: 'GRANDE' };

export default function Index() {
  const [stats, setStats] = useState<ReportePublico | null>(null);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("all");
  const [size, setSize] = useState("all");
  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [vaccinated, setVaccinated] = useState(false);
  const [sterilized, setSterilized] = useState(false);
  const [kidFriendly, setKidFriendly] = useState(false);
  const [page, setPage] = useState(1);
  const [serverPets, setServerPets] = useState<Pet[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportePublico().then(res => {
      if (res.ok) setStats(res);
    }).catch(() => {});
  }, []);

  const fetchMascotas = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = { limit: 100 };
      if (search) filters.search = search;
      if (species !== "all") filters.especie = species;
      if (size !== "all") filters.tamano = SIZE_MAP[size] || size;
      if (location !== "all" && location) filters.ubicacion = location;
      const res = await getMascotas(filters);
      if (res.ok) {
        const mapped = res.mascotas.map(m => {
          const especie = m.especie === 'Perro' ? 'Perro' : 'Gato';
          const fundacionCiudad = m.Fundacion?.ciudad || '';
          const fundacionDept = m.Fundacion?.departamento || '';
          return {
            id: String(m.id_mascota),
            name: m.nombre,
            species: especie as Pet['species'],
            breed: m.raza || '',
            age: m.edad ? `${m.edad} años` : '',
            size: (m.tamano === 'PEQUENO' ? 'Pequeño' : m.tamano === 'MEDIANO' ? 'Mediano' : 'Grande') as Pet['size'],
            sex: (m.sexo === 'MACHO' ? 'Macho' : 'Hembra') as Pet['sex'],
            location: m.ubicacion || fundacionCiudad || fundacionDept || '',
            department: m.Fundacion?.departamento || undefined,
            description: m.descripcion || '',
            temperament: m.Temperamentos ? m.Temperamentos.map(t => t.nombre) : m.temperamento ? m.temperamento.split(',').map(t => t.trim()) : [],
            vaccinated: m.vacunado || false,
            sterilized: m.esterilizado || false,
            dewormed: false,
            images: m.FotosMascota ? m.FotosMascota.map(d => getFotoMascotaUrl(d.nombre_archivo)) : [],
            foundationId: String(m.id_fundacion),
            adoptionConditions: m.condiciones_adopcion || '',
            status: (m.estado_mascota === 'DISPONIBLE' ? 'Disponible' : m.estado_mascota === 'EN_PROCESO' ? 'En Proceso' : 'Adoptado') as Pet['status'],
            active: m.estado === 1,
          } as Pet;
        });
        setServerPets(mapped);
        setServerTotal(res.pagination?.total || mapped.length);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, species, size, location]);

  useEffect(() => {
    fetchMascotas();
  }, [fetchMascotas]);

  const filtered = useMemo(() => {
    return serverPets.filter(p => {
      if (department !== "all" && p.department !== department) return false;
      if (vaccinated && !p.vaccinated) return false;
      if (sterilized && !p.sterilized) return false;
      if (kidFriendly && !p.kidFriendly) return false;
      return true;
    });
  }, [serverPets, department, vaccinated, sterilized, kidFriendly]);

  const totalPages = Math.ceil(filtered.length / PETS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PETS_PER_PAGE, page * PETS_PER_PAGE);

  const clearFilters = () => {
    setSearch(""); setSpecies("all"); setSize("all"); setDepartment("all"); setLocation("all");
    setVaccinated(false); setSterilized(false); setKidFriendly(false); setPage(1);
  };

  const isLoading = loading;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Familia adoptando mascota" width={1280} height={720} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-xl">
            <h1 className="font-heading text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl">
              Encuentra a tu compañero ideal
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Conectamos adoptantes con fundaciones de confianza para darle un hogar amoroso a mascotas que lo necesitan.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#explorar">
                <Button size="lg" className="font-heading font-bold">
                  <PawPrint className="mr-2 h-5 w-5" /> Explorar Mascotas
                </Button>
              </a>
              <Link to="/login">
<Button
  size="lg"
  variant="outline"
  className="border-primary text-primary hover:bg-primary/10 font-heading font-bold"
>
  Registrarse
</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container mx-auto grid grid-cols-3 divide-x px-4 py-8">
          {[
            { icon: PawPrint, label: "Mascotas Disponibles", value: stats?.mascotas_disponibles ?? "..." },
            { icon: Heart, label: "Adopciones Exitosas", value: stats?.adopciones_exitosas ?? "..." },
            { icon: Shield, label: "Fundaciones Verificadas", value: stats?.fundaciones_verificadas ?? "..." },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4 text-center">
              <Icon className="h-6 w-6 text-primary" />
              <span className="font-heading text-2xl font-bold text-foreground">{value}</span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Explore */}
      <section id="explorar" className="container mx-auto px-4 py-12">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Mascotas en adopción</h2>
        <PetFilters
          search={search} onSearchChange={setSearch}
          species={species} onSpeciesChange={setSpecies}
          size={size} onSizeChange={setSize}
          department={department} onDepartmentChange={setDepartment}
          location={location} onLocationChange={setLocation}
          vaccinated={vaccinated} onVaccinatedChange={setVaccinated}
          sterilized={sterilized} onSterilizedChange={setSterilized}
          kidFriendly={kidFriendly} onKidFriendlyChange={setKidFriendly}
          resultCount={filtered.length}
          onClearFilters={clearFilters}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <PetCardSkeleton key={i} />)
          ) : paginated.length > 0 ? (
            paginated.map(pet => <PetCard key={pet.id} pet={pet} />)
          ) : null}
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="mt-12 text-center">
            <SearchX className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-heading text-lg text-muted-foreground">No se encontraron mascotas con esos filtros</p>
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="mt-8">
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </section>
    </div>
  );
}
