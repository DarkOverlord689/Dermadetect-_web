import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const ResultadosGallery = () => {
  const [imagenes, setImagenes] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchImagenes = async () => {
      try {
        const response = await axios.get(`${baseUrl}/imagenes/`);
        const descripcionResponse = await axios.get(`${baseUrl}/descripcion/`);
        const imagenesConDetalles = response.data.imagenes.map((nombre) => ({
          id: nombre,
          titulo: nombre.split('.')[0], // Usar el nombre de la imagen como título (puedes modificarlo)
          descripcion: "Descripción de " + nombre, // Agregar una descripción (ajusta según tus necesidades)
          url: `${baseUrl}/imagenes/${nombre}`, // Construir la URL para la imagen
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
                  className="w-full h-48 object-cover"
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
    </div>
  );
};

export default ResultadosGallery;
