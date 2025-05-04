
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, BookmarkCheck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, value, icon, description, linkTo }) => {
  const Icon = icon;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link to={linkTo}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        </CardContent>
      </Link>
    </Card>
  );
};

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    subjects: 0,
    assignments: 0,
  });

  useEffect(() => {
    // In a real app, you would fetch these stats from your API
    // This is just mock data for the example
    const mockStats = {
      courses: isAdmin() ? 12 : 4,
      students: isAdmin() ? 320 : 120,
      subjects: isAdmin() ? 24 : 5,
      assignments: isAdmin() ? 48 : 5,
    };
    setStats(mockStats);
  }, [isAdmin]);

  const adminCards = [
    {
      title: 'Cursos',
      value: stats.courses,
      icon: BookOpen,
      description: 'Total de cursos registrados',
      linkTo: '/cursos',
    },
    {
      title: 'Estudiantes',
      value: stats.students,
      icon: Users,
      description: 'Total de estudiantes registrados',
      linkTo: '/estudiantes',
    },
    {
      title: 'Materias',
      value: stats.subjects,
      icon: BookmarkCheck,
      description: 'Total de materias registradas',
      linkTo: '/materias',
    },
    {
      title: 'Asignaciones',
      value: stats.assignments,
      icon: Calendar,
      description: 'Total de asignaciones creadas',
      linkTo: '/asignaciones',
    },
  ];

  const teacherCards = [
    {
      title: 'Mis Cursos',
      value: stats.courses,
      icon: BookOpen,
      description: 'Cursos asignados',
      linkTo: '/mis-cursos',
    },
    {
      title: 'Mis Estudiantes',
      value: stats.students,
      icon: Users,
      description: 'Estudiantes en tus cursos',
      linkTo: '/mis-cursos',
    },
    {
      title: 'Asistencias Pendientes',
      value: '3',
      icon: Calendar,
      description: 'Registros pendientes esta semana',
      linkTo: '/registrar-asistencia',
    },
    {
      title: 'Notas Pendientes',
      value: '2',
      icon: BookmarkCheck,
      description: 'Registros pendientes este mes',
      linkTo: '/registrar-notas',
    },
  ];

  const cards = isAdmin() ? adminCards : teacherCards;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {currentUser?.nombre}. {isAdmin() ? 'Administre el sistema desde aquí.' : 'Gestione sus cursos desde aquí.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
            linkTo={card.linkTo}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isAdmin() ? (
              <>
                <Link to="/usuarios/nuevo" className="block p-2 hover:bg-secondary rounded-md">
                  + Nuevo Usuario
                </Link>
                <Link to="/estudiantes/nuevo" className="block p-2 hover:bg-secondary rounded-md">
                  + Nuevo Estudiante
                </Link>
                <Link to="/reportes" className="block p-2 hover:bg-secondary rounded-md">
                  Generar Reportes
                </Link>
              </>
            ) : (
              <>
                <Link to="/registrar-asistencia" className="block p-2 hover:bg-secondary rounded-md">
                  + Registrar Asistencia
                </Link>
                <Link to="/registrar-notas" className="block p-2 hover:bg-secondary rounded-md">
                  + Registrar Notas
                </Link>
                <Link to="/reportes" className="block p-2 hover:bg-secondary rounded-md">
                  Generar Reportes
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas actualizaciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Hoy, 10:24 AM</span>
                <span>Se registraron asistencias en 1° A</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Hoy, 09:15 AM</span>
                <span>Se agregaron calificaciones para Matemáticas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-muted-foreground">Ayer, 14:30 PM</span>
                <span>Se creó el nuevo curso 3° B</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
