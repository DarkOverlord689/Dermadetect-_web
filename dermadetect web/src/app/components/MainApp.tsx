import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AnalisisForm from './AnalisisForm'; 
import ResultadosGallery from './ResultadosGallery'; 
import HistoricoTable from './HistoricoTable'; // Importa el nuevo componente

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('historico');

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="analisis">Análisis</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="historico">
          <Card>
            <CardContent className="p-4">
              <HistoricoTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analisis">
          <Card>
            <CardContent className="p-4">
              <AnalisisForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultados">
          <Card>
            <CardContent className="p-4">
              <ResultadosGallery />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MainApp;
