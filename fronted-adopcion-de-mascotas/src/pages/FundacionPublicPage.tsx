import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, MapPin, Phone, Mail, Calendar, PawPrint, Building, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PetCard from "@/components/PetCard";
import { PetCardSkeleton } from "@/components/Skeletons";
import { getFundacionById, type FundacionBackend } from "@/api/fundaciones";
import { getMascotas, type MascotaBackend } from "@/api/mascotas";
import { getUploadUrl } from "@/api/uploads";
import type { Foundation } from "@/data/mockData";

function mapFundacionPublic(f: any): Foundation {
  return {
    id: String(f.id_fundacion),
    id_usuario: String(f.id_usuario),
    name: f.nombre_fundacion,
    email: f.email || '',
    phone: f.telefono || '',
    address: f.direccion || '',
    verified: f.estado_aprobacion === 'APROBADA',
    description: f.descripcion || '',
    nit: f.nit,
    socialMedia: f.redes_sociales || '',
    mission: f.mision || '',
    logoUrl: f.logo_url || '',
    city: f.ciudad || '',
    department: f.departamento || '',
    rejectionReason: f.motivo_rechazo || '',
    verificationStatus: f.estado_aprobacion === 'PENDIENTE' ? 'Pendiente' : f.estado_aprobacion === 'APROBADA' ? 'Aprobada' : 'Rechazada',
  };
}

function mapMascota(m: MascotaBackend): any {
  const fundacionCiudad = m.Fundacion?.ciudad || '';
  const fundacionDept = m.Fundacion?.departamento || '';
  return {
    id: String(m.id_mascota),
    name: m.nombre,
    species: (m.especie === 'Perro' ? 'Perro' : 'Gato') as 'Perro' | 'Gato',
    breed: m.raza || '',
    age: m.edad ? `${m.edad} años` : '',
    size: (m.tamano === 'PEQUENO' ? 'Pequeño' : m.tamano === 'MEDIANO' ? 'Mediano' : 'Grande') as any,
    sex: (m.sexo === 'MACHO' ? 'Macho' : 'Hembra') as any,
    location: m.ubicacion || fundacionCiudad || fundacionDept || '',
    department: m.Fundacion?.departamento || undefined,
    description: m.descripcion || '',
    temperament: m.Temperamentos ? m.Temperamentos.map((t: any) => t.nombre) : m.temperamento ? m.temperamento.split(',').map((t: string) => t.trim()) : [],
    vaccinated: m.vacunado || false,
    sterilized: m.esterilizado || false,
    dewormed: false,
    images: m.FotosMascota ? m.FotosMascota.map((d: any) => getUploadUrl(d.nombre_archivo)) : [],
    foundationId: String(m.id_fundacion),
    adoptionConditions: m.condiciones_adopcion || '',
    status: (m.estado_mascota === 'DISPONIBLE' ? 'Disponible' : m.estado_mascota === 'EN_PROCESO' ? 'En Proceso' : 'Adoptado') as any,
    active: m.estado === 1,
  } as any;
}

export default function FundacionPublicPage() {
  const { id } = useParams<{ id: string }>();
  const [fundacion, setFundacion] = useState<Foundation | null>(null);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getFundacionById(Number(id), true),
      getMascotas({ id_fundacion: id, estado_mascota: 'DISPONIBLE', limit: 50 })
    ]).then(([fundRes, mascRes]) => {
      if (fundRes.ok && fundRes.fundacion) {
        setFundacion(mapFundacionPublic(fundRes.fundacion));
      } else {
        setError('Fundación no encontrada');
      }
      if (mascRes.ok) {
        setMascotas(mascRes.mascotas.map(mapMascota));
      }
    }).catch(() => {
      setError('Error al cargar la fundación');
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <PetCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !fundacion) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Fundación no encontrada</h1>
        <p className="text-muted-foreground mb-6">{error || 'La fundación que buscas no existe o ha sido desactivada.'}</p>
        <Button asChild><Link to="/">Volver al inicio</Link></Button>
      </div>
    );
  }

  const logoUrl = fundacion.logoUrl ? getUploadUrl(fundacion.logoUrl) : null;
  const activeMascotas = mascotas.filter(p => p.active && p.status === 'Disponible');

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {logoUrl ? (
            <img src={logoUrl} alt={fundacion.name} className="h-24 w-24 rounded-2xl object-cover border shadow-sm" />
          ) : (
            <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building className="h-10 w-10 text-primary/60" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
              <h1 className="font-heading text-3xl font-bold">{fundacion.name}</h1>
              {fundacion.verified && (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-200">
                  <Shield className="mr-1 h-3 w-3" /> Verificada
                </Badge>
              )}
            </div>
            {fundacion.mission && (
              <p className="mt-3 text-muted-foreground italic border-l-2 border-primary/30 pl-4">{fundacion.mission}</p>
            )}
            {fundacion.description && (
              <p className="mt-2 text-sm text-muted-foreground">{fundacion.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground justify-center sm:justify-start">
              {fundacion.city && (
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {[fundacion.city, fundacion.department].filter(Boolean).join(", ")}</span>
              )}
              {fundacion.phone && (
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {fundacion.phone}</span>
              )}
              {fundacion.email && (
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {fundacion.email}</span>
              )}
              <span className="flex items-center gap-1.5">
                <PawPrint className="h-4 w-4" /> {activeMascotas.length} mascota(s) disponible(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mascotas */}
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-2xl font-bold mb-6">Mascotas en adopción</h2>
        {activeMascotas.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeMascotas.map(pet => <PetCard key={pet.id} pet={pet} />)}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed bg-muted/20">
            <PawPrint className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Esta fundación no tiene mascotas disponibles actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
