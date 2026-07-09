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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Cabecera con botón de volver */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <button onClick={() => navigate('/admin')} className="text-sm text-slate-500 hover:text-slate-800">
            ← Volver a Gestión
          </button>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Añadir Nueva Obra al Archivo</h2>
      
      {estado.error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{estado.error}</div>}
      {estado.exito && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{estado.exito}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input 
            type="text" name="titulo" required
            value={formData.titulo} onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
            placeholder="Ej: Amparito Roca"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Compositor</label>
            <input 
              type="text" name="compositor"
              value={formData.compositor} onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Arreglista</label>
            <input 
              type="text" name="arreglista"
              value={formData.arreglista} onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Género</label>
            <input 
              type="text" name="genero"
              value={formData.genero} onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="Ej: Pasodoble, Marcha Mora..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duración (minutos)</label>
            <input 
              type="number" name="duracionEstimada" min="0"
              value={formData.duracionEstimada} onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ubicación Física</label>
          <input 
            type="text" name="ubicacionFisica"
            value={formData.ubicacionFisica} onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
            placeholder="Ej: Armario 2, Carpeta Roja"
          />
        </div>

        <button 
          type="submit" 
          disabled={estado.loading}
          className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {estado.loading ? 'Guardando...' : 'Registrar Obra'}
        </button>
      </form>
    </div>
  );
}