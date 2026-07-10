import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubirPartitura() {
  const navigate = useNavigate();
  const [voz, setVoz] = useState('');
  const [obraId, setObraId] = useState('');
  const [instrumentoId, setInstrumentoId] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  
  const [obras, setObras] = useState<any[]>([]);
  const [instrumentos, setInstrumentos] = useState<any[]>([]);
  const [estado, setEstado] = useState<{ tipo: 'idle' | 'cargando' | 'exito' | 'error', mensaje: string }>({ tipo: 'idle', mensaje: '' });

  // Cargar datos para los desplegables al montar el componente
  useEffect(() => {
    const cargarListas = async () => {
      const token = localStorage.getItem('tokenBanda');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const [resObras, resInst] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/obras`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/instrumentos`, { headers })
        ]);

        if (resObras.ok && resInst.ok) {
          setObras(await resObras.json());
          setInstrumentos(await resInst.json());
        }
      } catch (error) {
        console.error("Error cargando desplegables", error);
      }
    };
    cargarListas();
  }, []);

  const handleSubir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo || !obraId || !instrumentoId) return setEstado({ tipo: 'error', mensaje: 'Faltan campos obligatorios' });

    setEstado({ tipo: 'cargando', mensaje: 'Subiendo PDF al servidor...' });

    try {
      const formData = new FormData();
      formData.append('pdf', archivo);
      formData.append('voz', voz);
      formData.append('obraId', obraId);
      formData.append('instrumentoId', instrumentoId);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/particellas`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenBanda')}` },
        body: formData
      });

      if (!res.ok) throw new Error('Error al subir el archivo');

      setEstado({ tipo: 'exito', mensaje: '¡Partitura registrada con éxito!' });
      setVoz(''); setObraId(''); setInstrumentoId(''); setArchivo(null);
    } catch (err: any) {
      setEstado({ tipo: 'error', mensaje: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Subir Nueva Partitura</h2>
          <button onClick={() => navigate('/admin')} className="text-sm text-slate-500 hover:text-slate-800">
            ← Volver a Gestión
          </button>
        </div>

        {estado.tipo !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${estado.tipo === 'error' ? 'bg-red-50 text-red-600' : estado.tipo === 'exito' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            {estado.mensaje}
          </div>
        )}

        <form onSubmit={handleSubir} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Obra Musical</label>
              <select
                value={obraId}
                onChange={(e) => setObraId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Selecciona una obra...</option>
                {obras.map(obra => (
                  <option key={obra.id} value={obra.id}>{obra.titulo} ({obra.compositor})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Instrumento</label>
              <select
                value={instrumentoId}
                onChange={(e) => setInstrumentoId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Voz (Ej: 1º, Principal)</label>
            <input type="text" value={voz} onChange={(e) => setVoz(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Archivo PDF</label>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)} 
              className="w-full text-sm text-slate-500 
                         file:mr-4 file:py-2 file:px-4 
                         file:rounded-xl file:border-0 
                         file:text-sm file:font-medium 
                         file:bg-slate-100 file:text-slate-700 
                         hover:file:bg-slate-200 
                         transition-colors cursor-pointer" 
              required 
            />
          </div>

          <button type="submit" disabled={estado.tipo === 'cargando'} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">
            Subir Partitura
          </button>
        </form>
      </div>
    </div>
  );
}