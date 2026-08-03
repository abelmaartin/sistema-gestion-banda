import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Definimos la estructura de la Obra para TypeScript
interface Obra {
  id: number;
  titulo: string;
  compositor: string;
  arreglista: string;
  genero: string;
  ubicacionFisica: string;
  duracionEstimada: number | string;
  guionUrl?: string | null;
}

export default function GestionObras() {
  const navigate = useNavigate();
  
  // Estados para la lista de obras y la vista actual
  const [obras, setObras] = useState<Obra[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [obraEditando, setObraEditando] = useState<Obra | null>(null);
  
  // Estado del formulario de texto
  const [formData, setFormData] = useState({
    titulo: '', compositor: '', arreglista: '', genero: '', ubicacionFisica: '', duracionEstimada: ''
  });
  
  // Estado exclusivo para el archivo PDF
  const [archivoGuion, setArchivoGuion] = useState<File | null>(null);
  
  // Estado de mensajes y carga
  const [estado, setEstado] = useState({ loading: false, error: '', exito: '' });

  // 1. Cargar las obras al montar el componente
  useEffect(() => {
    cargarObras();
  }, []);

  const cargarObras = async () => {
    try {
      const token = localStorage.getItem('tokenBanda');
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/obras`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (respuesta.ok) {
        const data = await respuesta.json();
        setObras(data);
      }
    } catch (error) {
      console.error("Error al cargar obras:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Preparar el formulario para crear o editar
  const abrirFormularioCrear = () => {
    setObraEditando(null);
    setFormData({ titulo: '', compositor: '', arreglista: '', genero: '', ubicacionFisica: '', duracionEstimada: '' });
    setArchivoGuion(null); // Limpiamos el archivo
    setEstado({ loading: false, error: '', exito: '' });
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (obra: Obra) => {
    setObraEditando(obra);
    setFormData({
      titulo: obra.titulo || '',
      compositor: obra.compositor || '',
      arreglista: obra.arreglista || '',
      genero: obra.genero || '',
      ubicacionFisica: obra.ubicacionFisica || '',
      duracionEstimada: obra.duracionEstimada ? obra.duracionEstimada.toString() : ''
    });
    setArchivoGuion(null); // Limpiamos por si había seleccionado uno antes
    setEstado({ loading: false, error: '', exito: '' });
    setMostrarFormulario(true);
  };

  // 3. Enviar los datos (POST para crear, PUT para actualizar usando FormData)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado({ loading: true, error: '', exito: '' });

    try {
      const token = localStorage.getItem('tokenBanda'); 
      const url = obraEditando 
        ? `${import.meta.env.VITE_API_URL}/api/obras/${obraEditando.id}`
        : `${import.meta.env.VITE_API_URL}/api/obras`;
      
      const method = obraEditando ? 'PUT' : 'POST';

      // Creamos el FormData para poder enviar archivos y texto a la vez
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('compositor', formData.compositor);
      formDataToSend.append('arreglista', formData.arreglista);
      formDataToSend.append('genero', formData.genero);
      formDataToSend.append('ubicacionFisica', formData.ubicacionFisica);
      
      if (formData.duracionEstimada) {
        formDataToSend.append('duracionEstimada', formData.duracionEstimada.toString());
      }
      
      // Si el usuario ha seleccionado un archivo, lo adjuntamos con la clave 'guionPdf'
      if (archivoGuion) {
        formDataToSend.append('guionPdf', archivoGuion);
      }

      const respuesta = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // IMPORTANTE: Quitamos el 'Content-Type': 'application/json'
        },
        body: formDataToSend
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.error || 'Error al guardar la obra');
      }

      setEstado({ loading: false, error: '', exito: obraEditando ? 'Obra actualizada.' : 'Obra registrada.' });
      setArchivoGuion(null);
      
      // Recargar la lista y volver a la vista principal tras un segundito
      cargarObras();
      setTimeout(() => setMostrarFormulario(false), 1500);

    } catch (error: any) {
      setEstado({ loading: false, error: error.message, exito: '' });
    }
  };

  // 4. Eliminar una obra (con Actualización Optimista)
  const handleEliminar = async (id: number, titulo: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la obra "${titulo}"?`)) return;

    // 1. Guardamos una copia de seguridad del estado actual
    const obrasAnteriores = [...obras];
    
    // 2. ¡BORRADO INSTANTÁNEO EN PANTALLA! 
    setObras(obras.filter(obra => obra.id !== id));

    try {
      const token = localStorage.getItem('tokenBanda');
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/obras/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 3. Si el servidor dice que hubo un error
      if (!respuesta.ok) {
        throw new Error("El servidor rechazó el borrado");
      }
      
    } catch (error) {
      console.error("Error al eliminar:", error);
      // 4. Si algo falla (red, backend, etc.), restauramos la copia de seguridad
      setObras(obrasAnteriores);
      alert("No se pudo eliminar la obra. Es posible que tenga archivos asociados o haya un error de conexión.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera Principal */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Archivo Musical</h2>
            <p className="text-slate-500 text-sm mt-1">Gestión del repertorio de la banda</p>
          </div>
          <button onClick={() => navigate('/admin')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            ← Volver al Panel
          </button>
        </div>

        {mostrarFormulario ? (
          // ==============================
          // VISTA: FORMULARIO (Crear/Editar)
          // ==============================
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {obraEditando ? 'Editar Obra' : 'Añadir Nueva Obra'}
              </h3>
              <button onClick={() => setMostrarFormulario(false)} className="text-slate-400 hover:text-slate-600">
                ✕ Cancelar
              </button>
            </div>

            {estado.error && <div className="p-3 mb-4 text-red-700 bg-red-50 rounded-xl text-sm border border-red-100">{estado.error}</div>}
            {estado.exito && <div className="p-3 mb-4 text-green-700 bg-green-50 rounded-xl text-sm border border-green-100">{estado.exito}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                <input type="text" name="titulo" required value={formData.titulo} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                  placeholder="Ej: Amparito Roca" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Compositor</label>
                  <input type="text" name="compositor" value={formData.compositor} onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arreglista</label>
                  <input type="text" name="arreglista" value={formData.arreglista} onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Género</label>
                  <input type="text" name="genero" value={formData.genero} onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                    placeholder="Ej: Pasodoble..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duración (minutos)</label>
                  <input 
                    type="number" 
                    name="duracionEstimada" 
                    min="0"
                    step="0.1"
                    value={formData.duracionEstimada} 
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Física</label>
                <input type="text" name="ubicacionFisica" value={formData.ubicacionFisica} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                  placeholder="Ej: Archivo A - Caja 1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Guión del Director (PDF)</label>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setArchivoGuion(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                {obraEditando && obraEditando.guionUrl && !archivoGuion && (
                  <p className="text-xs text-slate-500 mt-2">
                    Ya hay un guión subido. Selecciona un archivo nuevo solo si quieres reemplazarlo.
                  </p>
                )}
              </div>

              <button type="submit" disabled={estado.loading}
                className="w-full mt-6 bg-amber-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors">
                {estado.loading ? 'Guardando...' : (obraEditando ? 'Guardar Cambios' : 'Registrar Obra')}
              </button>
            </form>
          </div>
        ) : (
          // ==============================
          // VISTA: LISTA DE OBRAS (Tabla)
          // ==============================
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-800">Inventario ({obras.length})</h3>
              <button onClick={abrirFormularioCrear} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm">
                + Nueva Obra
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-sm text-slate-500">
                    <th className="p-4 font-medium">Título</th>
                    <th className="p-4 font-medium hidden md:table-cell">Compositor</th>
                    <th className="p-4 font-medium hidden sm:table-cell">Ubicación</th>
                    <th className="p-4 font-medium text-center">Guión</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {obras.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No hay obras registradas en el archivo todavía.
                      </td>
                    </tr>
                  ) : (
                    obras.map((obra) => (
                      <tr key={obra.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{obra.titulo}</td>
                        <td className="p-4 text-slate-600 hidden md:table-cell">{obra.compositor || '-'}</td>
                        <td className="p-4 text-slate-600 hidden sm:table-cell">
                          {obra.ubicacionFisica ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {obra.ubicacionFisica}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {obra.guionUrl ? (
                            <a href={obra.guionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline">
                              Ver PDF
                            </a>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-3 text-sm">
                          <button onClick={() => abrirFormularioEditar(obra)} className="text-amber-600 hover:text-amber-800 font-medium">
                            Editar
                          </button>
                          <button onClick={() => handleEliminar(obra.id, obra.titulo)} className="text-red-500 hover:text-red-700 font-medium">
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}