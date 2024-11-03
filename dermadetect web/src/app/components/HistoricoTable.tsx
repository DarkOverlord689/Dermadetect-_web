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

interface PDFFile {
  patient_id: string;
  filename: string;
  timestamp: string;
  path: string;
}

const HistoricoTable = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    Promise.all([
      fetchPredictions(),
      
    ]);
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch(`${baseUrl}/get_predictions`);
      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }
      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };



  const handleDownloadPDF = async (patientId: string) => {
    setIsLoading(true);
    setError(null);
    console.log('Patient ID a buscar:', patientId);

    try {
        // Obtener la lista de PDFs
        const response = await fetch(`${baseUrl}/pdfs`);
        if (!response.ok) {
            throw new Error('Error al cargar la lista de PDFs');
        }
        const pdfFiles: PDFFile[] = await response.json();
        console.log('Datos recibidos de la API:', pdfFiles);

        const patientPDFs = pdfFiles.filter(pdf => {
          if (!pdf) {
              console.log('Elemento indefinido encontrado');
              return false;
          }
          const patientIdString = String(patientId).trim();
          const pdfPatientIdString = String(pdf.patient_id).trim();
          const isMatch = pdfPatientIdString === patientIdString;
          console.log(`Comparando patientId: "${patientIdString}" con pdf.patient_id: "${pdfPatientIdString}", Coincide: ${isMatch}`);
          return isMatch;
      });
      
      
      console.log('PDFs filtrados:', patientPDFs);
      

        if (patientPDFs.length === 0) {
            throw new Error('No hay PDFs disponibles para este paciente');
        }

        // Seleccionar el PDF más reciente
        const mostRecentPDF = patientPDFs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

        // Descargar el PDF
        const pdfResponse = await fetch(`${baseUrl}/pdfs/${mostRecentPDF.patient_id}/${mostRecentPDF.timestamp}/${mostRecentPDF.filename}`);
        if (!pdfResponse.ok) {
            throw new Error('Error al descargar el PDF');
        }

        // Descargar y abrir el PDF
        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mostRecentPDF.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al descargar el PDF');
    } finally {
        setIsLoading(false);
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
              {filteredPredictions.map((prediction, index) => {
                const patientPDFs = pdfFiles.filter(
                  pdf => pdf.patient_id === prediction.paciente.numero_identificacion
                );
                return (
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
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricoTable;
