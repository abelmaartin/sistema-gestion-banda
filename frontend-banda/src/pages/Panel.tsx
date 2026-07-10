import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Particella {
  id: number;
  voz: string;
  nombreArchivo: string;
  obra: {
    titulo: string;
    compositor: string;
  };
}

export default function Panel() {
  const navigate = useNavigate();
  const [partituras, setPartituras] = useState<Particella[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para guardar el texto del buscador
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  // Estado para el menú hamburguesa en móvil
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    // Usamos un temporizador (debounce) para no saturar el servidor al teclear rápido
    const temporizador = setTimeout(async () => {
      try {
        const token = localStorage.getItem('tokenBanda');
        
        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/particellas/mis-partituras?q=${terminoBusqueda}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.error || 'Error al cargar las partituras');
        }

        setPartituras(datos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }, 300);

    return () => clearTimeout(temporizador);
    
  }, [terminoBusqueda]);

  const cerrarSesion = () => {
    localStorage.removeItem('tokenBanda');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* --- CABECERA RESPONSIVE --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Mi Archivo</h1>
              <p className="text-slate-500 text-sm">Agrupación Musical Isorana</p>
            </div>
            
            {/* Botón Hamburguesa visible solo en móvil (< md) */}
            <button 
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {menuAbierto ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Contenedor de Botones (Oculto en móvil por defecto, visible en desktop) */}
          <div className={`${menuAbierto ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:flex-wrap gap-3 mt-6 md:mt-6`}>
            {(localStorage.getItem('rolBanda') === 'ADMIN' || localStorage.getItem('rolBanda') === 'PROFESOR') && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm text-center"
              >
                ⚙️ Administración
              </button>
            )}

            <button 
              onClick={() => navigate('/perfil')}
              className="w-full md:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-center"
            >
              👤 Mi Perfil
            </button>

            <button 
              onClick={cerrarSesion}
              className="w-full md:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors text-center"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Barra de búsqueda visual */}
        <div className="mb-6 relative">
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por título de obra..."
            className="w-full px-5 py-4 pl-12 text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
          />
          <svg className="absolute left-4 top-4 h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Zona de contenido dinámico */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          {cargando && (
            <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
              Buscando repertorio...
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {!cargando && !error && partituras.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-medium">
              {terminoBusqueda 
                ? 'No se encontraron partituras con ese nombre para tu instrumento.' 
                : 'Aún no tienes partituras asignadas a tu instrumento.'}
            </div>
          )}

          {!cargando && !error && partituras.length > 0 && (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Obra</th>
                    <th className="p-4 font-semibold hidden md:table-cell">Compositor</th>
                    <th className="p-4 font-semibold text-center">Voz</th>
                    <th className="p-4 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partituras.map((particella) => (
                    <tr key={particella.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">
                        {particella.obra.titulo}
                      </td>
                      <td className="p-4 text-slate-600 hidden md:table-cell">
                        {particella.obra.compositor}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium border border-indigo-100">
                          {particella.voz}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <a 
                          href={particella.nombreArchivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
                        >
                          Ver PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}