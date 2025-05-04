
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-4 text-center">
        <div className="rounded-full bg-amber-100 p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={36} className="text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/dashboard">Ir al Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
