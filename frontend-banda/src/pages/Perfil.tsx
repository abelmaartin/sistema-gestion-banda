import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Perfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<any>(null);
  
  // Estado para el cambio de contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [estado, setEstado] = useState<{ tipo: 'idle' | 'cargando' | 'exito' | 'error', mensaje: string }>({ tipo: 'idle', mensaje: '' });

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/usuarios/mi-perfil', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` }
        });
        if (res.ok) setPerfil(await res.json());
      } catch (error) {
        console.error(error);
      }
    };
    cargarPerfil();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPassword !== confirmarPassword) {
      return setEstado({ tipo: 'error', mensaje: 'Las contraseñas nuevas no coinciden.' });
    }
    if (nuevaPassword.length < 6) {
      return setEstado({ tipo: 'error', mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    setEstado({ tipo: 'cargando', mensaje: 'Actualizando...' });

    try {
      const res = await fetch('http://localhost:3000/api/usuarios/mi-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` 
        },
        body: JSON.stringify({ passwordActual, nuevaPassword })
      });

      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || 'Error al cambiar contraseña');

      setEstado({ tipo: 'exito', mensaje: datos.mensaje });
      setPasswordActual(''); setNuevaPassword(''); setConfirmarPassword('');
    } catch (err: any) {
      setEstado({ tipo: 'error', mensaje: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
            <p className="text-slate-500 text-sm">Ajustes de cuenta</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200">
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tarjeta de Datos Personales (Solo lectura) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Datos Personales</h2>
            {perfil ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Nombre completo</p>
                  <p className="font-medium text-slate-800">{perfil.nombre} {perfil.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Correo electrónico</p>
                  <p className="font-medium text-slate-800">{perfil.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Rol en el sistema</p>
                  <p className="font-medium text-slate-800">{perfil.rol}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Instrumento y Voz</p>
                  <p className="font-medium text-slate-800">
                    {perfil.instrumento ? `${perfil.instrumento.nombre} (${perfil.voz})` : 'Ninguno asignado'}
                  </p>
                </div>
                <div className="pt-4 text-xs text-slate-400">
                  * Si necesitas modificar estos datos o cambias de instrumento, contacta con la administración de la banda.
                </div>
              </div>
            ) : (
              <p className="text-slate-400 animate-pulse">Cargando datos...</p>
            )}
          </div>

          {/* Formulario de Cambio de Contraseña */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Seguridad</h2>
            
            {estado.tipo !== 'idle' && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${estado.tipo === 'error' ? 'bg-red-50 text-red-600' : estado.tipo === 'exito' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {estado.mensaje}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña actual</label>
                <input type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contraseña</label>
                <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nueva contraseña</label>
                <input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              
              <button type="submit" disabled={estado.tipo === 'cargando'} className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">
                Actualizar Contraseña
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}