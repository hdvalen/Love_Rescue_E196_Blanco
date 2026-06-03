import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { UserRole } from "@/data/mockData";

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { currentUser, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
