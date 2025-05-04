
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      toast({
        title: '¡Bienvenido!',
        description: `Has iniciado sesión como ${user.nombre}`,
      });
      
      navigate('/dashboard');
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/login');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
    });
  };

  const checkUserRole = (allowedRoles) => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.rol);
  };

  const isAdmin = () => checkUserRole(['admin']);
  const isTeacher = () => checkUserRole(['docente']);

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isTeacher,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
