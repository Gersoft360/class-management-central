
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, User, BookOpen, Users, Calendar, ClipboardList, BookmarkCheck, BarChart, LogOut } from 'lucide-react';

const AppSidebar = () => {
  const { currentUser, isAdmin, isTeacher, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const adminMenuItems = [
    { title: "Usuarios", icon: User, path: "/usuarios" },
    { title: "Cursos", icon: BookOpen, path: "/cursos" },
    { title: "Materias", icon: BookOpen, path: "/materias" },
    { title: "Estudiantes", icon: Users, path: "/estudiantes" },
    { title: "Asignaciones", icon: ClipboardList, path: "/asignaciones" },
    { title: "Reportes", icon: BarChart, path: "/reportes" }
  ];

  const teacherMenuItems = [
    { title: "Mis Cursos", icon: BookOpen, path: "/mis-cursos" },
    { title: "Registrar Asistencia", icon: Calendar, path: "/registrar-asistencia" },
    { title: "Registrar Notas", icon: BookmarkCheck, path: "/registrar-notas" },
    { title: "Reportes", icon: BarChart, path: "/reportes" }
  ];

  const menuItems = isAdmin() ? adminMenuItems : teacherMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 px-2">
          <BookOpen size={24} className="text-primary" />
          <span className="font-bold text-xl">Class Central</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {currentUser && (
          <SidebarGroup>
            <SidebarGroupLabel>
              Bienvenido, {currentUser.nombre}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="mb-4 p-2 text-sm bg-sidebar-accent rounded-md">
                Rol: {currentUser.rol === 'admin' ? 'Administrador' : 'Docente'}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild active={location.pathname.startsWith(item.path)}>
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={logout}
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
