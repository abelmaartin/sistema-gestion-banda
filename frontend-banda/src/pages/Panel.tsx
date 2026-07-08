import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Definimos la forma de los datos que nos enviará Prisma
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

  // 2. useEffect se ejecuta automáticamente al cargar el componente
  useEffect(() => {
    const cargarPartituras = async () => {
      try {
        // Rescatamos el pase VIP
        const token = localStorage.getItem('tokenBanda');
        
        // Llamamos a nuestra API
        const respuesta = await fetch('http://localhost:3000/api/particellas/mis-partituras', {
          headers: {
            'Authorization': `Bearer ${token}` // ¡Aquí está la magia de la seguridad!
          }
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.error || 'Error al cargar las partituras');
        }

        // Guardamos los datos en el estado
        setPartituras(datos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarPartituras();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('tokenBanda');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mi Archivo Musical</h1>
            <p className="text-slate-500 text-sm">Banda de Guía de Isora</p>
          </div>
          
          <div className="flex gap-3">
            {/* Leemos el rol del localStorage. Si es ADMIN o PROFESOR, mostramos el botón directo */}
            {(localStorage.getItem('rolBanda') === 'ADMIN' || localStorage.getItem('rolBanda') === 'PROFESOR') && (
              <button 
                onClick={() => navigate('/admin')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                ⚙️ Administración
              </button>
            )}

            <button 
              onClick={() => navigate('/perfil')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors border border-slate-200"
            >
              👤 Mi Perfil
            </button>

            <button 
              onClick={cerrarSesion}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors border border-red-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Zona de contenido dinámico */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Estados de Carga y Error */}
          {cargando && (
            <div className="p-12 text-center text-slate-400 font-medium animate-pulse">
              Cargando repertorio...
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Tabla de Partituras (Solo se muestra si hay datos y no está cargando) */}
          {!cargando && !error && partituras.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium">
              Aún no tienes partituras asignadas a tu instrumento.
            </div>
          )}

          {!cargando && !error && partituras.length > 0 && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Obra</th>
                  <th className="p-4 font-semibold">Compositor</th>
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
                    <td className="p-4 text-slate-600">
                      {particella.obra.compositor}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100">
                        {particella.voz}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* El enlace apunta a la ruta estática que expusimos en Express */}
                      <a 
                        href={`http://localhost:3000/descargar-partitura/${particella.nombreArchivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                      >
                        Descargar PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
        </div>
      </div>
    </div>
  );
}