import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Particella {
  id: number;
  voz: string;
  nombreArchivo: string;
  obraId: number;
  instrumentoId: number;
  obra?: { titulo: string; compositor?: string };
  instrumento?: { nombre: string };
}

export default function GestionPartituras() {
  const navigate = useNavigate();
  
  // Estados para la lista y vistas
  const [partituras, setPartituras] = useState<Particella[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [particellaEditando, setParticellaEditando] = useState<Particella | null>(null);

  // Listas para los desplegables
  const [obras, setObras] = useState<any[]>([]);
  const [instrumentos, setInstrumentos] = useState<any[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    voz: '',
    obraId: '',
    instrumentoId: ''
  });
  const [archivo, setArchivo] = useState<File | null>(null);

  // Estado de carga y mensajes
  const [estado, setEstado] = useState<{ tipo: 'idle' | 'cargando' | 'exito' | 'error', mensaje: string }>({ tipo: 'idle', mensaje: '' });

  // 1. Cargar particellas y listas de los desplegables al iniciar
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    const token = localStorage.getItem('tokenBanda');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [resPart, resObras, resInst] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/particellas/todas`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/obras`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/instrumentos`, { headers })
      ]);

      if (resPart.ok) setPartituras(await resPart.json());
      if (resObras.ok) setObras(await resObras.json());
      if (resInst.ok) setInstrumentos(await resInst.json());
    } catch (error) {
      console.error("Error al cargar datos iniciales", error);
    }
  };

  // 2. Controladores de apertura de formularios
  const abrirFormularioCrear = () => {
    setParticellaEditando(null);
    setFormData({ voz: '', obraId: '', instrumentoId: '' });
    setArchivo(null);
    setEstado({ tipo: 'idle', mensaje: '' });
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (p: Particella) => {
    setParticellaEditando(p);
    setFormData({
      voz: p.voz || '',
      obraId: p.obraId ? p.obraId.toString() : '',
      instrumentoId: p.instrumentoId ? p.instrumentoId.toString() : ''
    });
    setArchivo(null);
    setEstado({ tipo: 'idle', mensaje: '' });
    setMostrarFormulario(true);
  };

  // 3. Guardar datos (POST para crear, PUT para actualizar con FormData)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.obraId || !formData.instrumentoId) {
      return setEstado({ tipo: 'error', mensaje: 'Faltan campos obligatorios (Obra o Instrumento)' });
    }
    if (!particellaEditando && !archivo) {
      return setEstado({ tipo: 'error', mensaje: 'Debes adjuntar un archivo PDF para la nueva particella' });
    }

    setEstado({ tipo: 'cargando', mensaje: particellaEditando ? 'Actualizando particella...' : 'Subiendo PDF al servidor...' });

    try {
      const token = localStorage.getItem('tokenBanda');
      const url = particellaEditando 
        ? `${import.meta.env.VITE_API_URL}/api/particellas/${particellaEditando.id}`
        : `${import.meta.env.VITE_API_URL}/api/particellas`;
      
      const method = particellaEditando ? 'PUT' : 'POST';

      const dataToSend = new FormData();
      if (archivo) dataToSend.append('pdf', archivo);
      dataToSend.append('voz', formData.voz);
      dataToSend.append('obraId', formData.obraId);
      dataToSend.append('instrumentoId', formData.instrumentoId);

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al procesar la solicitud');
      }

      setEstado({ tipo: 'exito', mensaje: particellaEditando ? '¡Partitura actualizada con éxito!' : '¡Partitura registrada con éxito!' });
      
      cargarDatosIniciales();
      setTimeout(() => {
        setMostrarFormulario(false);
      }, 1500);

    } catch (err: any) {
      setEstado({ tipo: 'error', mensaje: err.message });
    }
  };

  // 4. Eliminar particella (con borrado instantáneo optimista)
  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres borrar este archivo permanentemente?')) return;

    const listaAnterior = [...partituras];
    setPartituras(partituras.filter(p => p.id !== id));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/particellas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` }
      });

      if (!res.ok) throw new Error('Error al eliminar');
    } catch (error) {
      console.error(error);
      setPartituras(listaAnterior);
      alert('No se pudo eliminar la partitura del servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera Principal */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Gestión de Particellas</h2>
            <p className="text-slate-500 text-sm mt-1">Control de partituras individuales por instrumento y voz</p>
          </div>
          <button onClick={() => navigate('/admin')} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            ← Volver al Panel
          </button>
        </div>

        {mostrarFormulario ? (
          // ==========================================
          // VISTA: FORMULARIO (Crear / Editar Particella)
          // ==========================================
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {particellaEditando ? 'Editar Particella' : 'Subir Nueva Partitura'}
              </h3>
              <button onClick={() => setMostrarFormulario(false)} className="text-slate-400 hover:text-slate-600">
                ✕ Cancelar
              </button>
            </div>

            {estado.tipo !== 'idle' && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${estado.tipo === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : estado.tipo === 'exito' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                {estado.mensaje}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Obra Musical *</label>
                  <select
                    value={formData.obraId}
                    onChange={(e) => setFormData({ ...formData, obraId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    required
                  >
                    <option value="">Selecciona una obra...</option>
                    {obras.map(obra => (
                      <option key={obra.id} value={obra.id}>{obra.titulo} {obra.compositor ? `(${obra.compositor})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Instrumento *</label>
                  <select
                    value={formData.instrumentoId}
                    onChange={(e) => setFormData({ ...formData, instrumentoId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    required
                  >
                    <option value="">Selecciona un instrumento...</option>
                    {instrumentos.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Voz (Ej: 1º, Principal, Solista)</label>
                <input 
                  type="text" 
                  value={formData.voz} 
                  onChange={(e) => setFormData({ ...formData, voz: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" 
                  placeholder="Opcional o especificación de atril"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Archivo PDF {particellaEditando ? '(Opcional)' : '*'}</label>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)} 
                  className="w-full text-sm text-slate-500 
                             file:mr-4 file:py-2.5 file:px-4 
                             file:rounded-xl file:border-0 
                             file:text-sm file:font-medium 
                             file:bg-slate-100 file:text-slate-700 
                             hover:file:bg-slate-200 
                             transition-colors cursor-pointer border border-slate-200 rounded-xl p-1.5 bg-slate-50" 
                  {...(!particellaEditando ? { required: true } : {})}
                />
                {particellaEditando && (
                  <p className="text-xs text-slate-500 mt-2">
                    Si no seleccionas ningún archivo nuevo, se mantendrá la partitura actual.
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={estado.tipo === 'cargando'} 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm"
              >
                {estado.tipo === 'cargando' ? 'Guardando...' : (particellaEditando ? 'Guardar Cambios' : 'Subir Partitura')}
              </button>
            </form>
          </div>
        ) : (
          // ==========================================
          // VISTA: LISTA DE PARTICELLAS (Tabla)
          // ==========================================
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-800">Partituras Registradas ({partituras.length})</h3>
              <button 
                onClick={abrirFormularioCrear} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                + Subir Partitura
              </button>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-sm text-slate-500">
                    <th className="p-4 font-medium">Obra</th>
                    <th className="p-4 font-medium">Instrumento</th>
                    <th className="p-4 font-medium">Voz</th>
                    <th className="p-4 font-medium text-center">PDF</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partituras.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No hay partituras subidas en el sistema todavía.
                      </td>
                    </tr>
                  ) : (
                    partituras.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{p.obra?.titulo || 'Obra desconocida'}</td>
                        <td className="p-4 text-slate-600">{p.instrumento?.nombre || 'Instrumento genérico'}</td>
                        <td className="p-4">
                          {p.voz ? (
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                              {p.voz}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <a 
                            href={p.nombreArchivo} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-block px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg text-xs transition-colors"
                          >
                            Ver PDF
                          </a>
                        </td>
                        <td className="p-4 text-right space-x-3 text-sm">
                          <button 
                            onClick={() => abrirFormularioEditar(p)} 
                            className="text-amber-600 hover:text-amber-800 font-medium"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleEliminar(p.id)} 
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
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