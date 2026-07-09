import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CrearObra() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    compositor: '',
    arreglista: '',
    genero: '',
    ubicacionFisica: '',
    duracionEstimada: ''
  });
  const [estado, setEstado] = useState({ loading: false, error: '', exito: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado({ loading: true, error: '', exito: '' });

    try {
      // Recuperamos el token de donde lo tengas guardado (ajusta esto si usas un Contexto)
      const token = localStorage.getItem('tokenBanda'); 

      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/obras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          // Aseguramos que la duración se envíe como número si tu base de datos lo requiere
          duracionEstimada: formData.duracionEstimada ? parseInt(formData.duracionEstimada) : null
        })
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.error || 'Error al crear la obra');
      }

      setEstado({ loading: false, error: '', exito: '¡Obra registrada en el archivo con éxito!' });
      
      // Limpiamos el formulario para la siguiente obra
      setFormData({
        titulo: '', compositor: '', arreglista: '', genero: '', ubicacionFisica: '', duracionEstimada: ''
      });

    } catch (error: any) {
      setEstado({ loading: false, error: error.message, exito: '' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          
          {/* Cabecera con botón de volver perfectamente alineada */}
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Añadir Nueva Obra</h2>
              <p className="text-slate-500 text-sm">Registro de repertorio base</p>
            </div>
            <button 
              onClick={() => navigate('/admin')} 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              ← Volver a Gestión
            </button>
          </div>
          
          {estado.error && <div className="p-3 mb-4 text-red-700 bg-red-50 rounded-xl text-sm border border-red-100">{estado.error}</div>}
          {estado.exito && <div className="p-3 mb-4 text-green-700 bg-green-50 rounded-xl text-sm border border-green-100">{estado.exito}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
              <input 
                type="text" name="titulo" required
                value={formData.titulo} onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                placeholder="Ej: Amparito Roca"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compositor</label>
                <input 
                  type="text" name="compositor"
                  value={formData.compositor} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Arreglista</label>
                <input 
                  type="text" name="arreglista"
                  value={formData.arreglista} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Género</label>
                <input 
                  type="text" name="genero"
                  value={formData.genero} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                  placeholder="Ej: Pasodoble, Marcha Procesional..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duración (minutos)</label>
                <input 
                  type="number" name="duracionEstimada" min="0"
                  value={formData.duracionEstimada} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Física</label>
              <input 
                type="text" name="ubicacionFisica"
                value={formData.ubicacionFisica} onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                placeholder="Ej: Armario 2, Carpeta Azul"
              />
            </div>

            <button 
              type="submit" 
              disabled={estado.loading}
              className="w-full mt-6 bg-amber-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 shadow-sm transition-colors"
            >
              {estado.loading ? 'Guardando...' : 'Registrar Obra'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}