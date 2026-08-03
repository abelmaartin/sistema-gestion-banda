import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPartituras() {
  const navigate = useNavigate();
  // Cambiamos el estado para almacenar obras en lugar de particellas
  const [obras, setObras] = useState<any[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cargarObras = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/obras`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` }
    });
    if (res.ok) setObras(await res.json());
  };

  useEffect(() => {
    cargarObras();
  }, []);

  const eliminarObra = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres borrar esta obra permanentemente?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/obras/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` }
      });

      if (res.ok) {
        cargarObras();
      } else {
        alert('Error al eliminar la obra');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* --- CABECERA RESPONSIVE --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Gestor General de Archivos</h1>
              <p className="text-slate-500 text-sm">Panel de Administración</p>
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
            
            <button 
              onClick={() => navigate('/admin/registrar')} 
              className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl shadow-sm hover:bg-emerald-700 transition-colors text-center"
            >
              Registrar Miembro
            </button>

            <button 
              onClick={() => navigate('/admin/usuarios')} 
              className="w-full md:w-auto px-5 py-2.5 bg-sky-600 text-white font-medium rounded-xl shadow-sm hover:bg-sky-700 transition-colors text-center"
            >
              Gestionar Usuarios
            </button>

            <button 
              onClick={() => navigate('/admin/crear-obra')} 
              className="w-full md:w-auto px-5 py-2.5 bg-amber-500 text-white font-medium rounded-xl shadow-sm hover:bg-amber-600 transition-colors text-center"
            > 
              Gestionar Obras
            </button>

            <button 
              onClick={() => navigate('/subir')} 
              className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 transition-colors text-center"
            >
              Subir Nueva Partitura
            </button>

            <button 
              onClick={() => navigate('/panel')} 
              className="w-full md:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-center"
            >
              Ver mi panel personal
            </button>
          </div>
        </div>

        {/* --- TABLA RESPONSIVE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase">
                  <th className="p-4 font-semibold">Obra</th>
                  <th className="p-4 font-semibold hidden sm:table-cell">Compositor</th>
                  <th className="p-4 font-semibold text-center">Guión (PDF)</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {obras.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No hay obras en el archivo.
                    </td>
                  </tr>
                ) : (
                  obras.map((obra) => (
                    <tr key={obra.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">{obra.titulo}</td>
                      <td className="p-4 text-slate-600 hidden sm:table-cell">{obra.compositor || '-'}</td>
                      <td className="p-4 text-center">
                        {obra.guionUrl ? (
                          <a 
                            href={obra.guionUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-block px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg text-sm transition-colors"
                          >
                            Ver PDF
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm italic">Sin guión</span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        {/* El botón editar lleva al gestor completo de obras */}
                        <button 
                          onClick={() => navigate('/admin/crear-obra')}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarObra(obra.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}