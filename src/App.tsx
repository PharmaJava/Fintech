import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Placeholder de la Fase 0 (esqueleto). El router, el layout navegable y la
 * pantalla de desbloqueo se montan en el bloque 8.2.
 */
function App() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Patrimonio</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Esqueleto de la Fase 0. Tu patrimonio, privado y en tu dispositivo.
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
