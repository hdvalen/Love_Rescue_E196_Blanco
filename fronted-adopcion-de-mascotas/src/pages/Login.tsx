import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { PawPrint, Mail, Lock, User, Eye, EyeOff, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import type { UserRole } from "@/data/mockData";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,24}$/;

export default function Login() {
  const { login, register, resendVerification, forgotPassword } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("adoptante");

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const [regEmailSent, setRegEmailSent] = useState("");
  const [verifyRequired, setVerifyRequired] = useState("");
  const [resending, setResending] = useState(false);
  

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error("Completa todos los campos"); return; }
    if (!validateEmail(loginEmail)) { toast.error("El formato del correo electrónico no es válido"); return; }
    const result = await login(loginEmail, loginPassword);
    if (result.emailNotVerified) {
      setVerifyRequired(loginEmail);
      return;
    }
    if (!result.ok) {
      toast.error("Las credenciales ingresadas son incorrectas");
      return;
    }
    toast.success("¡Bienvenido!");
    const from = (location.state as { from?: string })?.from;
    if (from) { navigate(from, { replace: true }); return; }
    const role = JSON.parse(atob(localStorage.getItem('token')!.split('.')[1])).id_rol;
    if (role === 1) navigate("/admin");
    else if (role === 2) navigate("/perfil-fundacion");
    else navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regLastName || !regEmail || !regPassword || !regConfirm) { toast.error("Completa todos los campos"); return; }
    if (!validateEmail(regEmail)) { toast.error("El formato del correo electrónico no es válido"); return; }
    if (!passwordRegex.test(regPassword)) {
      toast.error("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial");
      return;
    }
    if (regPassword !== regConfirm) { toast.error("Las contraseñas no coinciden"); return; }
    const fullName = regRole === "fundacion" ? regLastName : `${regName} ${regLastName}`;
    const result = await register(fullName, regEmail, regPassword, regRole);
    if (result.ok) {
      setRegEmailSent(regEmail);
      toast.success("Cuenta creada. Revisa tu correo para verificar tu email.");
    } else {
      toast.error(result.error || "Error al registrar");
    }
  };

  const handleResend = async () => {
    if (!regEmailSent) return;
    setResending(true);
    const ok = await resendVerification(regEmailSent);
    if (ok) toast.success("Correo de verificación reenviado");
    else toast.error("Error al reenviar el correo");
    setResending(false);
  };

  const handleForgotPassword = () => {
    navigate("/reset-password");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <PawPrint className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-heading text-3xl font-extrabold">AdoptaMe</h1>
          <p className="mt-1 text-muted-foreground">Plataforma de Adopción Responsable</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {verifyRequired ? (
            <div className="text-center py-6 space-y-4">
              <Mail className="mx-auto h-12 w-12 text-primary" />
              <h2 className="font-heading text-xl font-bold">Verifica tu correo</h2>
              <p className="text-sm text-muted-foreground">
                Debes verificar tu correo <strong>{verifyRequired}</strong> antes de iniciar sesión.
                Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
              </p>
              <Button variant="outline" onClick={async () => { setResending(true); const ok = await resendVerification(verifyRequired); if (ok) toast.success("Correo reenviado"); else toast.error("Error al reenviar"); setResending(false); }} disabled={resending} className="w-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                Reenviar correo
              </Button>
              <button
                type="button"
                onClick={() => setVerifyRequired("")}
                className="text-sm text-primary hover:underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : regEmailSent ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h2 className="font-heading text-xl font-bold">¡Cuenta creada!</h2>
              <p className="text-sm text-muted-foreground">
                Te hemos enviado un correo de verificación a <strong>{regEmailSent}</strong>.
                Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </p>
              <Button variant="outline" onClick={handleResend} disabled={resending} className="w-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                Reenviar correo
              </Button>
              <button
                type="button"
                onClick={() => setRegEmailSent("")}
                className="text-sm text-primary hover:underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="mt-4 space-y-4">
                  <div>
                    <Label>Correo electrónico</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" placeholder="tu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label>Contraseña</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type={showLoginPass ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="pl-9 pr-9" />
                      <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Iniciar Sesión</Button>
                  <button type="button" onClick={handleForgotPassword} className="w-full text-center text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="mt-4 space-y-4">
                  <div>
                    <Label>Tipo de cuenta</Label>
                    <Select value={regRole} onValueChange={(v: UserRole) => setRegRole(v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adoptante">🏠 Adoptante</SelectItem>
                        <SelectItem value="fundacion">🏥 Fundación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{regRole === "fundacion" ? "Nombre del representante" : "Nombre"}</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Tu nombre" value={regName} onChange={e => setRegName(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label>{regRole === "fundacion" ? "Nombre de la Fundación" : "Apellido"}</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder={regRole === "fundacion" ? "Nombre de la fundación" : "Tu apellido"} value={regLastName} onChange={e => setRegLastName(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label>Correo electrónico</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" placeholder="tu@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label>Contraseña</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type={showRegPass ? "text" : "password"} placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="pl-9 pr-9" />
                      <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">8-24 caracteres, una mayúscula, una minúscula y un carácter especial</p>
                  </div>
                  <div>
                    <Label>Confirmar contraseña</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type={showRegConfirm ? "text" : "password"} placeholder="••••••••" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} className="pl-9 pr-9" />
                      <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showRegConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Crear Cuenta</Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
