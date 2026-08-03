import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [instrumentos, setInstrumentos] = useState<any[]>([]);
  
  // Estado para el menú móvil
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estado para controlar si estamos editando un usuario
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const cargarDatos = async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` };
    try {
      const [resUsu, resInst] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/instrumentos`, { headers })
      ]);
      if (resUsu.ok && resInst.ok) {
        setUsuarios(await resUsu.json());
        setInstrumentos(await resInst.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const eliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${nombre} de la banda permanentemente?`)) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` }
      });
      if (res.ok) cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const iniciarEdicion = (usuario: any) => {
    setEditandoId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      username: usuario.username,
      rol: usuario.rol,
      instrumentoId: usuario.instrumentoId || '',
      voz: usuario.voz || 'Única'
    });
  };

  const guardarEdicion = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setEditandoId(null);
        cargarDatos();
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
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Directorio de Músicos</h1>
              <p className="text-slate-500 text-sm">Gestión de usuarios y accesos</p>
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

          {/* Contenedor de Botones */}
          <div className={`${menuAbierto ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:flex-wrap gap-3 mt-6 md:mt-6`}>
            <button 
              onClick={() => navigate('/admin/registrar')} 
              className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl shadow-sm hover:bg-emerald-700 transition-colors text-center"
            >
              + Nuevo Miembro
            </button>
            <button 
              onClick={() => navigate('/admin')} 
              className="w-full md:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-center"
            >
              Volver a Partituras
            </button>
          </div>
        </div>

        {/* --- TABLA RESPONSIVE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase">
                  <th className="p-4 font-semibold">Músico</th>
                  <th className="p-4 font-semibold">Nombre de Usuario</th>
                  <th className="p-4 font-semibold">Rol</th>
                  <th className="p-4 font-semibold">Instrumento & Voz</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    
                    {editandoId === u.id ? (
                      /* MODO EDICIÓN */
                      <>
                        <td className="p-4">
                          <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="block w-full border rounded p-1 mb-1" placeholder="Nombre" />
                          <input type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="block w-full border rounded p-1" placeholder="Apellido" />
                        </td>
                        <td className="p-4">
                          <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="block w-full border rounded p-1 mb-1" placeholder="Nomrbe de Usuario" />
                        </td>
                        <td className="p-4">
                          <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="w-full border rounded p-1">
                            <option value="MUSICO">MUSICO</option>
                            <option value="PROFESOR">PROFESOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select value={formData.instrumentoId} onChange={e => setFormData({...formData, instrumentoId: e.target.value})} className="block w-full border rounded p-1 mb-1">
                            <option value="">Ningún instrumento...</option>
                            {instrumentos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                          </select>
                          
                          {formData.instrumentoId && (
                            <select value={formData.voz} onChange={e => setFormData({...formData, voz: e.target.value})} className="block w-full border rounded p-1">
                              <option value="Principal">Principal</option>
                              <option value="1º">1º</option>
                              <option value="2º">2º</option>
                              <option value="3º">3º</option>
                              <option value="Única">Única</option>
                            </select>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => guardarEdicion(u.id)} className="px-3 py-1 bg-green-500 text-white rounded mr-2">Guardar</button>
                          <button onClick={() => setEditandoId(null)} className="px-3 py-1 bg-gray-300 text-slate-700 rounded">Cancelar</button>
                        </td>
                      </>
                    ) : (
                      /* MODO LECTURA */
                      <>
                        <td className="p-4 font-medium text-slate-800">{u.nombre} {u.apellido}</td>
                        <td className="p-4 text-slate-600 text-sm">{u.username}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.rol === 'PROFESOR' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.instrumento ? (
                            <div className="flex flex-col">
                              <span className="text-slate-800">{u.instrumento.nombre}</span>
                              <span className="text-slate-400 text-xs">{u.voz}</span>
                            </div>
                          ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => iniciarEdicion(u)} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm transition-colors">
                            Editar
                          </button>
                          <button onClick={() => eliminar(u.id, u.nombre)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm transition-colors">
                            Eliminar
                          </button>
                        </td>
                      </>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}