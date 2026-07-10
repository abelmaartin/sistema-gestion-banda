import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al iniciar sesión');
      }

      // Guardamos el token Y el rol del usuario
      localStorage.setItem('tokenBanda', datos.token);
      localStorage.setItem('rolBanda', datos.usuario.rol);
      
      // Redirección inteligente
      if (datos.usuario.rol === 'ADMIN' || datos.usuario.rol === 'PROFESOR') {
        navigate('/admin');
      } else {
        navigate('/panel');
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal con imagen de fondo y efecto de oscurecimiento
    <div className="min-h-screen flex items-center justify-center relative bg-[url('/fondo-login.jpg')] bg-cover bg-center">
      
      {/* Capa negra semitransparente para que el texto resalte */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>

      {/* Tarjeta Glassmorphism */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl">
        
        {/* Cabecera */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center"> 
            <img 
              src="/logo.png" 
              alt="Logo Agrupación Musical Isorana" 
              className="h-8 w-8 object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide mb-1">Archivo Musical</h1>
          <p className="text-blue-200 font-medium tracking-wider text-sm uppercase">Agrupación Musical Isorana</p>
        </div>

        {/* Mensaje de error animado */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}