import React, { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DiagnosticResults from './DiagnosticResults'; // Ajusta la ruta según tu estructura de carpetas


interface Diagnostico {
  localizacion: string;
  observacion: string;
  fecha_diagnostico: string;
  probabilidades: {
    [key: string]: number;
  };
}



const AnalisisForm = () => {
  const [image, setImage] = useState(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [preview, setPreview] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [adjustments, setAdjustments] = useState({
    zoom: 100,
    brightness: 100,
    contrast: 100
  });
  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    age: '',
    sex: '',
    localization: '',
    observacion: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
 
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setPreview(reader.result);
        applyImageAdjustments(reader.result, adjustments);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyImageAdjustments = (imgSrc, adjustments) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const scale = adjustments.zoom / 100;
      ctx.scale(scale, scale);
      ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%)`;
      ctx.drawImage(img, 0, 0);
    };

    img.src = imgSrc;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // Validar campos del formulario
        const missingFields = Object.entries(formData)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (!image) missingFields.push('image');

        if (missingFields.length > 0) {
            setErrorMessage(`Faltan campos por llenar: ${missingFields.join(', ')}`);
            return;
        }
        
        setErrorMessage('');
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
            throw new Error('La URL de la API no está configurada');
        }

        // Crear FormData con validación de datos
        const formDataToSend = new FormData();
        formDataToSend.append('file', image);
        formDataToSend.append('age', Number(formData.age) || 0);
        formDataToSend.append('sex', formData.sex || '');
        formDataToSend.append('localization', formData.localization || '');
        formDataToSend.append('name', formData.name || '');
        formDataToSend.append('identification', formData.identification || '');
        formDataToSend.append('observacion', formData.observacion || '');

        const predictUrl = `${baseUrl}/predict`;

        let response = await fetch(predictUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formDataToSend
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const predictResult = await response.json();

        // Verificar que tenemos la información necesaria
        const storageInfo = predictResult.storage_info || {};
        const imagenRuta = predictResult.imagen.ruta_imagen; // Ruta de la imagen de la respuesta

        if (!imagenRuta) {
            console.error('Falta la ruta de la imagen en la respuesta:', predictResult);
            throw new Error('No se recibió la ruta de la imagen del servidor');
        }

        const pdfPayload = {
            result: {
                paciente: predictResult.paciente,
                diagnostico: predictResult.diagnostico,
                imagen: {
                    ...predictResult.imagen,
                    ruta_imagen: imagenRuta // Usar la ruta de la imagen
                },
                predicted_class: predictResult.predicted_class,
                probabilities: predictResult.probabilities
            },
            patient_dir: storageInfo.patient_dir || '',
            diagnosis_date: storageInfo.diagnosis_date || '',
            original_image_path: imagenRuta // Pasar la ruta de la imagen
        };

        let pdfResponse = await fetch(`${baseUrl}/generate-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/pdf'
            },
            body: JSON.stringify(pdfPayload)
        });

        if (!pdfResponse.ok) {
            const errorText = await pdfResponse.text();
            throw new Error(`Error ${pdfResponse.status}: ${errorText}`);
        }

        const pdfBlob = await pdfResponse.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Reporte_Diagnostico_${formData.identification}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);

        setSuccessMessage('Reporte PDF generado y descargado exitosamente.');
        
    } catch (error) {
        console.error('Error completo:', error);
        setErrorMessage(error.message || 'Error desconocido en la aplicación');
    }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name' && !/^[a-zA-Z\s]*$/.test(value)) return; // Solo letras y espacios
    if (name === 'identification' && (!/^\d+$/.test(value) || value.length > 8)) return; // Solo números, máximo 8 dígitos
    if (name === 'age' && (!/^\d*$/.test(value) || value < 0 || value > 99)) return; // Solo números, entre 0-99

    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagen Dermatoscópica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="image-upload">Seleccionar imagen</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
              />
            </div>

            <div className="relative min-h-[300px] bg-gray-50 rounded-lg overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
              {!preview && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No se ha seleccionado ninguna imagen
                </div>
              )}
            </div>

            {/* Ajustes de imagen */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Zoom</Label>
                <Slider
                  value={[adjustments.zoom]}
                  min={50}
                  max={200}
                  step={1}
                  className="w-full"
                  onValueChange={([value]) => {
                    setAdjustments({ ...adjustments, zoom: value });
                    if (preview) applyImageAdjustments(preview, { ...adjustments, zoom: value });
                  }}
                />
                <div className="text-sm text-gray-500 text-right">{adjustments.zoom}%</div>
              </div>

              <div className="space-y-4">
                <Label>Brillo</Label>
                <Slider
                  value={[adjustments.brightness]}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                  onValueChange={([value]) => {
                    setAdjustments({ ...adjustments, brightness: value });
                    if (preview) applyImageAdjustments(preview, { ...adjustments, brightness: value });
                  }}
                />
                <div className="text-sm text-gray-500 text-right">{adjustments.brightness}%</div>
              </div>

              <div className="space-y-4">
                <Label>Contraste</Label>
                <Slider
                  value={[adjustments.contrast]}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                  onValueChange={([value]) => {
                    setAdjustments({ ...adjustments, contrast: value });
                    if (preview) applyImageAdjustments(preview, { ...adjustments, contrast: value });
                  }}
                />
                <div className="text-sm text-gray-500 text-right">{adjustments.contrast}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="name">Nombre del Paciente</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                />

                <Label htmlFor="identification">DNI</Label>
                <Input
                  id="identification"
                  name="identification"
                  placeholder="DNI"
                  value={formData.identification}
                  onChange={handleInputChange}
                />

                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Edad"
                  value={formData.age}
                  onChange={handleInputChange}
                />

                <Label htmlFor="sex">Sexo</Label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>

                <Label htmlFor="localization">Ubicación de la Lesión</Label>
                <select
                  id="localization"
                  name="localization"
                  value={formData.localization}
                  onChange={(e) => setFormData({ ...formData, localization: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Miembro inferior">Miembro inferior</option>
                  <option value="Cabeza/cuello">Cabeza/cuello</option>
                  <option value="Tórax anterior">Tórax anterior</option>
                  <option value="Miembro superior">Miembro superior</option>
                  <option value="Espalda">Espalda</option>
                  <option value="Palmas/plantas">Palmas/plantas</option>
                  <option value="Lateral torso">Lateral torso</option>
                  <option value="Oral/genital">Oral/genital</option>
                </select>

                <Label htmlFor="observacion">Observaciones</Label>
                <Textarea
                  id="observacion"
                  name="observacion"
                  placeholder="Observaciones"
                  value={formData.observacion}
                  onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Enviar Análisis
              </Button>

              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {successMessage && <p className="text-green-500">{successMessage}</p>}
            </form>
          </CardContent>
        </Card>

        {diagnostico && <DiagnosticResults diagnostico={diagnostico} />}
      </div>
    </div>
  );
};

export default AnalisisForm;
