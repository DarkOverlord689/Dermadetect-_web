import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const ResultadosGallery = () => {
  const [imagenes, setImagenes] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [imagenZoom, setImagenZoom] = useState(null); // Para la imagen en zoom
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchImagenes = async () => {
      try {
        const response = await axios.get(`${baseUrl}/imagenes/`);
        const descripcionResponse = await axios.get(`${baseUrl}/descripcion/`);
        const imagenesConDetalles = response.data.imagenes.map((nombre) => ({
          id: nombre,
          titulo: nombre.split('.')[0],
          descripcion: "Descripción de " + nombre,
          url: `${baseUrl}/imagenes/${nombre}`,
        }));
        setImagenes(imagenesConDetalles);
        setDescripcion(descripcionResponse.data.descripcion);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchImagenes();
  }, []);

  if (cargando) {
    return <div>Cargando imágenes...</div>;
  }

  if (error) {
    return <div>Error al cargar imágenes: {error}</div>;
  }

  // Función para abrir el zoom
  const handleImageClick = (url) => {
    setImagenZoom(url);
  };

  // Función para cerrar el zoom
  const closeZoom = () => {
    setImagenZoom(null);
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Análisis Dermatoscópico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            {descripcion}
          </p>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imagenes.map((imagen) => (
            <Card key={imagen.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={imagen.url}
                  alt={imagen.titulo}
                  className="w-full h-64 object-cover cursor-pointer"
                  onClick={() => handleImageClick(imagen.url)} // Habilitar zoom al hacer clic
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{imagen.titulo}</h3>
                  <p className="text-sm text-gray-600">{imagen.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Modal para el zoom */}
      {imagenZoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <img
              src={imagenZoom}
              alt="Zoomed"
              className="max-w-full max-h-full"
              onClick={closeZoom} // Cerrar zoom al hacer clic
            />
            <button
              className="absolute top-2 right-2 text-white"
              onClick={closeZoom}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultadosGallery;
