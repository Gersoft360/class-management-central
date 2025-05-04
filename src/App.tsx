
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import RecordAttendancePage from "./pages/RecordAttendancePage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={<ProtectedRoute element={<Layout />} />}
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Admin routes */}
              <Route 
                path="usuarios" 
                element={<ProtectedRoute element={<UsersPage />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="cursos" 
                element={<ProtectedRoute element={<div>Cursos Page</div>} allowedRoles={['admin']} />} 
              />
              <Route 
                path="materias" 
                element={<ProtectedRoute element={<div>Materias Page</div>} allowedRoles={['admin']} />} 
              />
              <Route 
                path="estudiantes" 
                element={<ProtectedRoute element={<div>Estudiantes Page</div>} allowedRoles={['admin']} />} 
              />
              <Route 
                path="asignaciones" 
                element={<ProtectedRoute element={<div>Asignaciones Page</div>} allowedRoles={['admin']} />} 
              />
              
              {/* Teacher routes */}
              <Route 
                path="mis-cursos" 
                element={<ProtectedRoute element={<div>Mis Cursos Page</div>} allowedRoles={['docente']} />} 
              />
              <Route 
                path="registrar-asistencia" 
                element={<ProtectedRoute element={<RecordAttendancePage />} allowedRoles={['docente']} />} 
              />
              <Route 
                path="registrar-notas" 
                element={<ProtectedRoute element={<div>Registrar Notas Page</div>} allowedRoles={['docente']} />} 
              />
              
              {/* Routes for both roles */}
              <Route 
                path="reportes" 
                element={<ProtectedRoute element={<ReportsPage />} allowedRoles={['admin', 'docente']} />} 
              />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
