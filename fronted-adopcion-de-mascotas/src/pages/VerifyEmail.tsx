import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useApp();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No se encontró el token de verificación.");
      return;
    }
    verifyEmail(token).then(res => {
      if (res.ok) {
        setStatus("success");
        setMessage(res.message);
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    });
  }, [token, verifyEmail]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <h1 className="mt-4 font-heading text-xl font-bold">Verificando correo...</h1>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h1 className="mt-4 font-heading text-xl font-bold">¡Correo verificado!</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <Link to="/login">
                <Button className="mt-6 w-full">Iniciar sesión</Button>
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h1 className="mt-4 font-heading text-xl font-bold">Error de verificación</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <Link to="/login">
                <Button className="mt-6 w-full" variant="outline">Volver al inicio</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
