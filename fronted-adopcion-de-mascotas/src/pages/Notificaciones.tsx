import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import type { NotificacionBackend } from "@/api/notificaciones";
import PaginationControls from "@/components/PaginationControls";

const NOTIFS_PER_PAGE = 10;

export default function Notificaciones() {
  const { notificaciones, marcarLeida, marcarTodasLeidas, loadNotificaciones } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"todas" | "no_leidas" | "leidas">("todas");
  const [page, setPage] = useState(1);

  const handleMarcarLeida = useCallback(async (n: NotificacionBackend) => {
    if (!n.leido) {
      await marcarLeida(n.id_notificacion);
    }
    if (n.accion_url) {
      navigate(n.accion_url);
    } else if (n.id_solicitud) {
      navigate(`/mis-solicitudes?destacada=${n.id_solicitud}`);
    }
  }, [marcarLeida, navigate]);

  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  const filtered = notificaciones.filter((n) => {
    if (filter === "no_leidas") return !n.leido;
    if (filter === "leidas") return n.leido;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / NOTIFS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * NOTIFS_PER_PAGE, page * NOTIFS_PER_PAGE);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-heading text-2xl font-bold">Notificaciones</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            {(["todas", "no_leidas", "leidas"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none px-3 text-xs"
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f === "todas" ? "Todas" : f === "no_leidas" ? "No leídas" : "Leídas"}
              </Button>
            ))}
          </div>
          {notificaciones.some((n) => !n.leido) && (
            <Button variant="outline" size="sm" onClick={marcarTodasLeidas}>
              <CheckCheck className="mr-1 h-4 w-4" /> Marcar todas leídas
            </Button>
          )}
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No hay notificaciones</p>
          <p className="text-sm">
            {filter === "todas"
              ? "Aún no tienes ninguna notificación"
              : filter === "no_leidas"
                ? "No tienes notificaciones sin leer"
                : "No tienes notificaciones leídas"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((n) => (
              <button
                key={n.id_notificacion}
                onClick={() => handleMarcarLeida(n)}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${
                  !n.leido ? "border-l-4 border-l-primary bg-muted/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!n.leido && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <span className={`text-sm ${!n.leido ? "font-semibold" : ""}`}>{n.titulo}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.mensaje}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.fecha_creacion).toLocaleDateString("es-ES", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.leido && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        marcarLeida(n.id_notificacion);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6">
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
