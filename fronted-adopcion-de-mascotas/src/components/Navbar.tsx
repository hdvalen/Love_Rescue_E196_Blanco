import { useState } from "react";
import { getUploadUrl } from "@/api/uploads";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, PawPrint, LogOut, Menu, X, ChevronDown, Key, Settings, Plus, Shield, Bell } from "lucide-react";
import { useApp } from "@/context/AppContext";
import NotificacionesDropdown from "@/components/NotificacionesDropdown";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function UserAvatar({ user, className }: { user: { name: string; fotoUrl?: string; logoUrl?: string; role: string }; className?: string }) {
  const [imgError, setImgError] = useState(false);
  const raw = user.logoUrl || user.fotoUrl;
  const src = raw ? getUploadUrl(raw) : null;
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={user.name}
        className={`rounded-full object-cover border border-gray-200 ${className || 'w-9 h-9'}`}
        onError={() => setImgError(true)}
      />
    );
  }

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];
  const colorIdx = user.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`rounded-full flex items-center justify-center text-white text-xs font-semibold border border-gray-200 ${colors[colorIdx]} ${className || 'w-9 h-9'}`}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { currentUser, logout, changePassword } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const isActive = (path: string) => location.pathname === path;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,24}$/;

  const handleChangePassword = () => {
    if (!oldPass || !newPass || !confirmPass) { toast.error("Completa todos los campos"); return; }
    if (!passwordRegex.test(newPass)) { toast.error("La nueva contraseña debe tener 8-24 caracteres, una mayúscula, una minúscula y un carácter especial"); return; }
    if (newPass !== confirmPass) { toast.error("Las contraseñas no coinciden"); return; }
    const success = changePassword(oldPass, newPass);
    if (!success) { toast.error("La contraseña actual es incorrecta"); return; }
    toast.success("Contraseña actualizada exitosamente. Inicia sesión nuevamente.");
    setChangePassOpen(false);
    setOldPass(""); setNewPass(""); setConfirmPass("");
    logout();
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-7 w-7 text-primary" />
            <span className="font-heading text-xl font-bold text-foreground">AdoptaMe</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link to="/"><Button variant={isActive("/") ? "secondary" : "ghost"} size="sm">Explorar</Button></Link>
            {currentUser && (
              <Link to="/favoritos"><Button variant={isActive("/favoritos") ? "secondary" : "ghost"} size="sm"><Heart className="mr-1 h-4 w-4" /> Favoritos</Button></Link>
            )}
            {currentUser?.role === "fundacion" && (
              <>
                <Link to="/panel"><Button variant={isActive("/panel") ? "secondary" : "ghost"} size="sm">Panel</Button></Link>
                <Link to="/publicar-mascota"><Button variant={isActive("/publicar-mascota") ? "secondary" : "ghost"} size="sm"><Plus className="mr-1 h-4 w-4" /> Publicar</Button></Link>
              </>
            )}
            {currentUser?.role === "adoptante" && (
              <Link to="/mis-solicitudes"><Button variant={isActive("/mis-solicitudes") ? "secondary" : "ghost"} size="sm">Mis Solicitudes</Button></Link>
            )}
            {currentUser?.role === "admin" && (
              <Link to="/admin"><Button variant={isActive("/admin") ? "secondary" : "ghost"} size="sm"><Shield className="mr-1 h-4 w-4" /> Admin</Button></Link>
            )}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {currentUser && <NotificacionesDropdown />}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserAvatar user={currentUser} className="w-8 h-8" /> {currentUser.name} <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to="/perfil" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Mi Perfil</Link></DropdownMenuItem>
                  {currentUser.role === "fundacion" && (
                    <DropdownMenuItem asChild><Link to="/perfil-fundacion" className="flex items-center gap-2"><Shield className="h-4 w-4" /> Datos Fundación</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setChangePassOpen(true)} className="flex items-center gap-2"><Key className="h-4 w-4" /> Cambiar contraseña</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive"><LogOut className="h-4 w-4" /> Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login"><Button size="sm">Iniciar Sesión</Button></Link>
            )}
          </div>

          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="border-t bg-card p-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start">Explorar</Button></Link>
              {currentUser && (
                <>
                  <Link to="/favoritos" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start"><Heart className="mr-2 h-4 w-4" />Favoritos</Button></Link>
                  {currentUser.role === "fundacion" && (
                    <>
                      <Link to="/panel" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start">Panel de Fundación</Button></Link>
                      <Link to="/publicar-mascota" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start"><Plus className="mr-2 h-4 w-4" />Publicar Mascota</Button></Link>
                    </>
                  )}
                  {currentUser.role === "adoptante" && (
                    <Link to="/mis-solicitudes" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start">Mis Solicitudes</Button></Link>
                  )}
                  {currentUser.role === "admin" && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start"><Shield className="mr-2 h-4 w-4" />Admin</Button></Link>
                  )}
                  <Link to="/notificaciones" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start"><Bell className="mr-2 h-4 w-4" />Notificaciones</Button></Link>
                  <Link to="/perfil" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2"><UserAvatar user={currentUser} className="w-7 h-7 text-[10px]" />{currentUser.name}</Button></Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { setChangePassOpen(true); setMobileOpen(false); }}><Key className="mr-2 h-4 w-4" />Cambiar contraseña</Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { handleLogout(); setMobileOpen(false); }}><LogOut className="mr-2 h-4 w-4" />Cerrar Sesión</Button>
                </>
              )}
              {!currentUser && (
                <Link to="/login" onClick={() => setMobileOpen(false)}><Button className="w-full">Iniciar Sesión</Button></Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <Dialog open={changePassOpen} onOpenChange={setChangePassOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Cambiar contraseña</DialogTitle>
            <DialogDescription>Ingresa tu contraseña actual y la nueva.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Contraseña actual</Label><Input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Nueva contraseña</Label>
              <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">8-24 caracteres, una mayúscula, una minúscula y un carácter especial</p>
            </div>
            <div><Label>Confirmar nueva contraseña</Label><Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="mt-1" /></div>
            <Button onClick={handleChangePassword} className="w-full">Actualizar contraseña</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
