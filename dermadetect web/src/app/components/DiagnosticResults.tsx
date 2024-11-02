import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Diagnostico {
  localizacion: string;
  observacion: string;
  fecha_diagnostico: string;
  probabilidades: {
    [key: string]: number;
  };
}

interface DiagnosticResultsProps {
  diagnostico: Diagnostico;
}

const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({ diagnostico }) => {
  // Función para encontrar la lesión con mayor probabilidad
  const getLesionWithHighestProbability = () => {
    if (!diagnostico?.probabilidades) return 'No disponible';
    const entries = Object.entries(diagnostico.probabilidades);
    const maxEntry = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max, entries[0]
    );
    return maxEntry[0];
  };

  if (!diagnostico) return null;

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800">
        <CardTitle className="text-white text-xl font-semibold">
          Resultados del Diagnóstico
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Información Principal - Grid de 2 columnas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm text-gray-500">Localización</Label>
            <p className="font-medium text-gray-900">{diagnostico.localizacion}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm text-gray-500">Tipo de Lesión</Label>
            <p className="font-medium text-gray-900 capitalize">
              {getLesionWithHighestProbability()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm text-gray-500">Fecha</Label>
            <p className="font-medium text-gray-900">
              {new Date(diagnostico.fecha_diagnostico).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm text-gray-500">Observación</Label>
            <p className="font-medium text-gray-900">{diagnostico.observacion}</p>
          </div>
        </div>

        {/* Probabilidades */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Probabilidades</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(diagnostico.probabilidades).map(([key, value]) => (
                <div 
                  key={key} 
                  className={`p-3 rounded-lg ${
                    key === getLesionWithHighestProbability()
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">{key}</span>
                    <span className={`font-semibold ${
                      key === getLesionWithHighestProbability()
                        ? 'text-blue-600'
                        : 'text-gray-900'
                    }`}>
                      {(value * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticResults;