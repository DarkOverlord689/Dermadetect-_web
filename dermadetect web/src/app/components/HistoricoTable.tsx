import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Patient {
  fecha_registro: string;
  nombre: string;
  numero_identificacion: string;
  edad: number;
  sexo: string;
}

interface Diagnosis {
  localizacion: string;
  tipo_cancer: string;
  observacion: string;
}

interface Image {
  ruta_imagen: string;
}

interface Prediction {
  paciente: Patient;
  diagnostico: Diagnosis;
  imagen: Image;
  probabilities: Record<string, number>;
  predicted_class: string;
}

const HistoricoTable = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  console.log(baseUrl); 
  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch(`${baseUrl}/get_predictions`);
      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }
      const data = await response.json();
      console.log(data); // Verifica la estructura de los datos
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDownloadPDF = async (patientId: string) => {
    try {
      const response = await fetch(`${baseUrl}/pdfs/${patientId}`);
      if (!response.ok) {
        throw new Error('Error al descargar el PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar el PDF');
    }
  };

  const filteredPredictions = searchQuery
  ? predictions.filter(prediction => {
      const numeroIdentificacion = prediction.paciente.numero_identificacion;
      return (String(numeroIdentificacion) || '').toLowerCase().includes(searchQuery.toLowerCase());
    })
  : predictions;



  

  if (isLoading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histórico de Predicciones</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por identificación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Identificación</th>
                <th className="p-2 text-left">Edad</th>
                <th className="p-2 text-left">Sexo</th>
                <th className="p-2 text-left">Localización</th>
                <th className="p-2 text-left">Tipo de Cáncer</th>
                <th className="p-2 text-left">Imagen</th>
                <th className="p-2 text-left">Probabilidades</th>
                <th className="p-2 text-left">Clase Predicha</th>
                <th className="p-2 text-left">Observaciones</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.map((prediction, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2">{prediction.paciente.fecha_registro}</td>
                  <td className="p-2">{prediction.paciente.nombre}</td>
                  <td className="p-2">{prediction.paciente.numero_identificacion}</td>
                  <td className="p-2">{prediction.paciente.edad}</td>
                  <td className="p-2">{prediction.paciente.sexo}</td>
                  <td className="p-2">{prediction.diagnostico.localizacion}</td>
                  <td className="p-2">{prediction.diagnostico.tipo_cancer}</td>
                  <td className="p-2">{prediction.imagen?.ruta_imagen || 'No disponible'}</td>
                  <td className="p-2">{JSON.stringify(prediction.probabilities)}</td>
                  <td className="p-2">{prediction.predicted_class}</td>
                  <td className="p-2">{prediction.diagnostico.observacion}</td>
                  <td className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(prediction.paciente.numero_identificacion)}
                    >
                      Descargar PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricoTable;