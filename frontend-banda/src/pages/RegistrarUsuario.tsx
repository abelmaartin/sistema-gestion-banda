import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistrarUsuario() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('MUSICO');
  const [instrumentoId, setInstrumentoId] = useState('');
  
  const [instrumentos, setInstrumentos] = useState<any[]>([]);
  const [estado, setEstado] = useState<{ tipo: 'idle' | 'cargando' | 'exito' | 'error', mensaje: string }>({ tipo: 'idle', mensaje: '' });
  const [voz, setVoz] = useState('1º');

  // Cargamos los instrumentos para el select
  useEffect(() => {
    const cargarInstrumentos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/instrumentos`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` }
        });
        if (res.ok) setInstrumentos(await res.json());
      } catch (error) {
        console.error(error);
      }
    };
    cargarInstrumentos();
  }, []);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado({ tipo: 'cargando', mensaje: 'Registrando usuario en el sistema...' });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}`
        },
        body: JSON.stringify({
          nombre,
          apellido,
          username,
          password,
          rol,
          instrumentoId: instrumentoId || null, 
          voz: instrumentoId ? voz : null
        })
      });

      const datos = await res.json();

      if (!res.ok) throw new Error(datos.error || 'Error al registrar');

      setEstado({ tipo: 'exito', mensaje: `¡${nombre} ha sido registrado correctamente!` });
      
      // Limpiar formulario
      setNombre(''); setApellido(''); setUsername(''); setPassword(''); setRol('MUSICO'); setInstrumentoId('');
      setTimeout(() => navigate('/admin'), 2000);

    } catch (err: any) {
      setEstado({ tipo: 'error', mensaje: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Registrar Miembro</h2>
            <p className="text-slate-500 mt-1">Crea una nueva cuenta de acceso</p>
          </div>
          <button onClick={() => navigate('/admin')} className="text-sm text-slate-500 hover:text-slate-800">
            ← Volver a Gestión
          </button>
        </div>

        {estado.tipo !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${estado.tipo === 'error' ? 'bg-red-50 text-red-600' : estado.tipo === 'exito' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            {estado.mensaje}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Apellidos</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Correo Electrónico</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña Temporal</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mínimo 6 caracteres" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rol del Usuario</label>
              <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="MUSICO">Músico de la Banda</option>
                <option value="PROFESOR">Profesor / Director</option>
                <option value="ADMIN">Administrador General</option>
              </select>
            </div>

            {/* Los campos de instrumento y voz ahora siempre están visibles para todos los roles */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Instrumento (Opcional para Admin/Profesor)</label>
              <select value={instrumentoId} onChange={(e) => setInstrumentoId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Ninguno / No aplica...</option>
                {instrumentos.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mostramos la voz solo si han seleccionado un instrumento previamente */}
          {instrumentoId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Voz / Papel asignado</label>
              <select value={voz} onChange={(e) => setVoz(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Principal">Principal</option>
                <option value="1º">1º</option>
                <option value="2º">2º</option>
                <option value="3º">3º</option>
                <option value="Única">Única</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={estado.tipo === 'cargando'} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm">
            Dar de Alta en la Plataforma
          </button>
        </form>
      </div>
    </div>
  );
}