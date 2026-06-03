import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";

export default function NotificacionesDropdown() {
  const { notificaciones, unreadCount, marcarLeida, marcarTodasLeidas } = useApp();
  const recent = notificaciones.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={marcarTodasLeidas}>
              <CheckCheck className="mr-1 h-3 w-3" /> Marcar todas leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recent.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No tienes notificaciones
          </div>
        ) : (
          recent.map((n) => (
            <DropdownMenuItem
              key={n.id_notificacion}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 ${!n.leido ? "bg-muted/50 font-medium" : ""}`}
              onClick={() => marcarLeida(n.id_notificacion)}
            >
              <span className="text-sm">{n.titulo}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{n.mensaje}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                {new Date(n.fecha_creacion).toLocaleDateString("es-ES", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notificaciones" className="justify-center text-center text-sm font-medium">
            Ver todas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
