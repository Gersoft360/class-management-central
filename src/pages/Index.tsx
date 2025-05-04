
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if logged in, otherwise to login
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full">
            <BookOpen size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Sistema de Gestión Escolar</h1>
          <div className="flex items-center mt-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Redireccionando...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
