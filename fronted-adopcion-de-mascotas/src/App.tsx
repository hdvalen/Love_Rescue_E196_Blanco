import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import PetDetail from "./pages/PetDetail";
import Login from "./pages/Login";
import Favorites from "./pages/Favorites";
import FoundationPanel from "./pages/FoundationPanel";
import MyRequests from "./pages/MyRequests";
import Notificaciones from "./pages/Notificaciones";
import Profile from "./pages/Profile";
import FoundationProfile from "./pages/FoundationProfile";
import FundacionPublicPage from "./pages/FundacionPublicPage";
import AdminPanel from "./pages/AdminPanel";
import PublishPet from "./pages/PublishPet";
import EditPet from "./pages/EditPet";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <Navbar />
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mascota/:id" element={<PetDetail />} />
            <Route path="/fundacion/:id" element={<FundacionPublicPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/panel" element={<ProtectedRoute roles={['fundacion', 'admin']}><FoundationPanel /></ProtectedRoute>} />
            <Route path="/mis-solicitudes" element={<ProtectedRoute roles={['adoptante']}><MyRequests /></ProtectedRoute>} />
            <Route path="/notificaciones" element={<ProtectedRoute><Notificaciones /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/perfil-fundacion" element={<ProtectedRoute roles={['fundacion']}><FoundationProfile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
            <Route path="/publicar-mascota" element={<ProtectedRoute roles={['fundacion']}><PublishPet /></ProtectedRoute>} />
            <Route path="/editar-mascota/:id" element={<ProtectedRoute roles={['fundacion']}><EditPet /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
