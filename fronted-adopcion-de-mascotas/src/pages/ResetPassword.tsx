import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, PawPrint, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, resetPassword } from "@/api/auth";
import { toast } from "sonner";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,24}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { toast.error("Correo electrónico inválido"); return; }
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.ok) {
        setSent(true);
        toast.success("Si el correo existe, recibirás un enlace para restablecer tu contraseña");
      } else {
        toast.error(res.message || "Error al enviar");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error("Token no proporcionado"); return; }
    if (!passwordRegex.test(newPassword)) {
      toast.error("La contraseña debe tener 8-24 caracteres, una mayúscula, una minúscula y un carácter especial");
      return;
    }
    if (newPassword !== confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword);
      if (res.ok) {
        setResetDone(true);
        toast.success("Contraseña actualizada correctamente");
      } else {
        toast.error(res.message || "Error al restablecer");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  if (resetDone) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-4">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="font-heading text-2xl font-bold">Contraseña actualizada</h1>
          <p className="text-muted-foreground">Tu contraseña ha sido cambiada exitosamente.</p>
          <Link to="/login">
            <Button className="w-full">Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Lock className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 font-heading text-3xl font-extrabold">Nueva Contraseña</h1>
            <p className="mt-1 text-muted-foreground">Crea una contraseña segura para tu cuenta</p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label>Nueva contraseña</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pl-9 pr-9" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">8-24 caracteres, una mayúscula, una minúscula y un carácter especial</p>
              </div>
              <div>
                <Label>Confirmar contraseña</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-9 pr-9" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <PawPrint className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-heading text-3xl font-extrabold">Recuperar Contraseña</h1>
          <p className="mt-1 text-muted-foreground">Ingresa tu correo y te enviaremos un enlace</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4 py-6">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h2 className="font-heading text-xl font-bold">Correo enviado</h2>
              <p className="text-sm text-muted-foreground">
                Revisa tu bandeja de entrada en <strong>{email}</strong> para el enlace de restablecimiento.
              </p>
              <Button variant="outline" onClick={() => setSent(false)} className="w-full">
                Enviar a otro correo
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <Label>Correo electrónico</Label>
                <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
