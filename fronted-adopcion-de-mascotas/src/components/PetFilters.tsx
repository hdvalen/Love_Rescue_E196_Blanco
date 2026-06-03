import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEPARTAMENTOS } from "@/data/colombia";

interface FiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  species: string;
  onSpeciesChange: (v: string) => void;
  size: string;
  onSizeChange: (v: string) => void;
  department: string;
  onDepartmentChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  vaccinated: boolean;
  onVaccinatedChange: (v: boolean) => void;
  sterilized: boolean;
  onSterilizedChange: (v: boolean) => void;
  kidFriendly: boolean;
  onKidFriendlyChange: (v: boolean) => void;
  resultCount: number;
  onClearFilters: () => void;
}

export default function PetFilters({
  search, onSearchChange, species, onSpeciesChange, size, onSizeChange,
  department, onDepartmentChange, location, onLocationChange,
  vaccinated, onVaccinatedChange, sterilized, onSterilizedChange, kidFriendly, onKidFriendlyChange,
  resultCount, onClearFilters,
}: FiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const cities = department !== "all" ? DEPARTAMENTOS[department] || [] : [];

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold">Filtros</h2>
          <span className="text-sm text-muted-foreground">({resultCount} resultados)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClearFilters}><RotateCcw className="mr-1 h-4 w-4" /> Limpiar</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            Avanzados {showAdvanced ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre..." value={search} onChange={e => onSearchChange(e.target.value)} className="pl-9" />
        </div>
        <Select value={species} onValueChange={onSpeciesChange}>
          <SelectTrigger><SelectValue placeholder="Especie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Perro">Perro</SelectItem>
            <SelectItem value="Gato">Gato</SelectItem>
          </SelectContent>
        </Select>
        <Select value={size} onValueChange={onSizeChange}>
          <SelectTrigger><SelectValue placeholder="Tamaño" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Pequeño">Pequeño</SelectItem>
            <SelectItem value="Mediano">Mediano</SelectItem>
            <SelectItem value="Grande">Grande</SelectItem>
          </SelectContent>
        </Select>
        <Select value={department} onValueChange={v => { onDepartmentChange(v); onLocationChange("all"); }}>
          <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.keys(DEPARTAMENTOS).map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {department !== "all" && (
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger><SelectValue placeholder="Ciudad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {cities.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {showAdvanced && (
        <div className="mt-4 flex flex-wrap gap-6 pt-3 border-t">
          <div className="flex items-center gap-2"><Switch checked={vaccinated} onCheckedChange={onVaccinatedChange} /><Label className="text-sm">Vacunado</Label></div>
          <div className="flex items-center gap-2"><Switch checked={sterilized} onCheckedChange={onSterilizedChange} /><Label className="text-sm">Esterilizado</Label></div>
          <div className="flex items-center gap-2"><Switch checked={kidFriendly} onCheckedChange={onKidFriendlyChange} /><Label className="text-sm">Apto para niños</Label></div>
        </div>
      )}
    </div>
  );
}