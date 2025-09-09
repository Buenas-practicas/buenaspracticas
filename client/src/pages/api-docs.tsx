import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/banks",
    description: "Listar todos los bancos de prácticas",
    auth: true,
    parameters: [],
    response: "Array de objetos BancoPractica",
  },
  {
    method: "GET",
    path: "/api/banks/{id}",
    description: "Obtener un banco específico por ID",
    auth: true,
    parameters: [{ name: "id", type: "number", description: "ID del banco" }],
    response: "Objeto BancoPractica",
  },
  {
    method: "POST",
    path: "/api/banks",
    description: "Crear un nuevo banco de prácticas",
    auth: true,
    parameters: [],
    body: "InsertBanco object",
    response: "Objeto BancoPractica creado",
  },
  {
    method: "GET",
    path: "/api/practices",
    description: "Listar prácticas con filtros opcionales",
    auth: true,
    parameters: [
      { name: "limit", type: "number", description: "Número máximo de resultados (default: 50)" },
      { name: "offset", type: "number", description: "Número de resultados a saltar (default: 0)" },
      { name: "bancoId", type: "number", description: "Filtrar por banco específico" },
      { name: "pais", type: "string", description: "Filtrar por país" },
      { name: "sector", type: "string", description: "Filtrar por sector" },
      { name: "search", type: "string", description: "Búsqueda por texto en título" },
    ],
    response: "{ practices: BuenaPractica[], total: number }",
  },
  {
    method: "POST",
    path: "/api/practices",
    description: "Crear una nueva práctica",
    auth: true,
    parameters: [],
    body: "InsertPractica object",
    response: "Objeto BuenaPractica creado",
  },
  {
    method: "GET",
    path: "/api/practices/search",
    description: "Búsqueda avanzada de prácticas",
    auth: true,
    parameters: [
      { name: "q", type: "string", description: "Término de búsqueda" },
      { name: "limit", type: "number", description: "Número máximo de resultados" },
    ],
    response: "{ practices: BuenaPractica[], total: number }",
  },
  {
    method: "GET",
    path: "/api/dashboard/stats",
    description: "Obtener estadísticas generales del dashboard",
    auth: true,
    parameters: [],
    response: "{ totalBanks: number, totalPractices: number, pendingReview: number, activeUsers: number }",
  },
];

const codeExamples = {
  javascript: `// Obtener lista de prácticas
fetch('/api/practices?limit=10&sector=salud', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Prácticas:', data.practices);
  console.log('Total:', data.total);
});

// Crear nueva práctica
const nuevaPractica = {
  bancoId: 1,
  titulo: "Programa de Telemedicina Rural",
  descripcionCorta: "Sistema de consultas médicas remotas",
  pais: "Chile",
  sector: "Salud",
  temaPrincipal: "Telemedicina"
};

fetch('/api/practices', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(nuevaPractica)
})
.then(response => response.json())
.then(data => console.log('Práctica creada:', data));`,

  python: `import requests

# Configuración base
base_url = "https://your-domain.com"
session = requests.Session()

# Obtener lista de prácticas
response = session.get(f"{base_url}/api/practices", params={
    "limit": 10,
    "sector": "salud"
})
data = response.json()
print(f"Prácticas encontradas: {len(data['practices'])}")

# Crear nueva práctica
nueva_practica = {
    "bancoId": 1,
    "titulo": "Programa de Telemedicina Rural",
    "descripcionCorta": "Sistema de consultas médicas remotas",
    "pais": "Chile",
    "sector": "Salud",
    "temaPrincipal": "Telemedicina"
}

response = session.post(f"{base_url}/api/practices", json=nueva_practica)
if response.status_code == 201:
    print("Práctica creada exitosamente")
else:
    print(f"Error: {response.status_code}")`,

  curl: `# Obtener lista de prácticas
curl -X GET "https://your-domain.com/api/practices?limit=10&sector=salud" \\
  -H "Content-Type: application/json" \\
  --cookie-jar cookies.txt \\
  --cookie cookies.txt

# Crear nueva práctica
curl -X POST "https://your-domain.com/api/practices" \\
  -H "Content-Type: application/json" \\
  --cookie cookies.txt \\
  -d '{
    "bancoId": 1,
    "titulo": "Programa de Telemedicina Rural",
    "descripcionCorta": "Sistema de consultas médicas remotas",
    "pais": "Chile",
    "sector": "Salud",
    "temaPrincipal": "Telemedicina"
  }'`
};

export default function ApiDocs() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof codeExamples>("javascript");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Código copiado al portapapeles",
    });
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "default",
      POST: "secondary",
      PUT: "outline",
      DELETE: "destructive",
    };
    return colors[method as keyof typeof colors] || "default";
  };

  return (
    <div className="p-6 space-y-6" data-testid="api-docs-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentación de la API</h1>
          <p className="text-muted-foreground">
            Referencia completa de endpoints y ejemplos de uso
          </p>
        </div>
        <Button variant="outline" asChild data-testid="button-external-docs">
          <a href="#" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Docs Externas
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Overview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Base URL</p>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  https://your-domain.com
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Autenticación</p>
                <p className="text-sm">Session-based (cookies)</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Formato</p>
                <p className="text-sm">JSON</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Endpoints</p>
                <p className="text-sm">{apiEndpoints.length} disponibles</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Códigos de Estado</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>200</span>
                    <span className="text-muted-foreground">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>201</span>
                    <span className="text-muted-foreground">Creado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>400</span>
                    <span className="text-muted-foreground">Bad Request</span>
                  </div>
                  <div className="flex justify-between">
                    <span>401</span>
                    <span className="text-muted-foreground">No Autorizado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>404</span>
                    <span className="text-muted-foreground">No Encontrado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>500</span>
                    <span className="text-muted-foreground">Error Servidor</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints and Examples */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="endpoints" className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="endpoints" className="flex-1">Endpoints</TabsTrigger>
              <TabsTrigger value="examples" className="flex-1">Ejemplos de Código</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index} data-testid={`endpoint-card-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getMethodColor(endpoint.method) as any}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      {endpoint.auth && (
                        <Badge variant="outline">Auth Required</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Parámetros:</p>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center space-x-2 text-sm">
                              <code className="bg-muted px-1 rounded text-xs">{param.name}</code>
                              <Badge variant="outline" className="text-xs">{param.type}</Badge>
                              <span className="text-muted-foreground">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.body && (
                      <div>
                        <p className="text-sm font-medium mb-2">Body:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded block">{endpoint.body}</code>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Respuesta:</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded block">{endpoint.response}</code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="flex space-x-2 mb-4">
                {Object.keys(codeExamples).map((lang) => (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang as keyof typeof codeExamples)}
                    data-testid={`button-lang-${lang}`}
                  >
                    {lang === "javascript" ? "JavaScript" : lang === "python" ? "Python" : "cURL"}
                  </Button>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ejemplo - {selectedLanguage.toUpperCase()}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeExamples[selectedLanguage])}
                      data-testid="button-copy-code"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeExamples[selectedLanguage]}</code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Respuesta de Ejemplo</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`{
  "practices": [
    {
      "id": 1,
      "titulo": "Programa de Digitalización Rural",
      "pais": "Chile",
      "sector": "Tecnología",
      "temaPrincipal": "Inclusión Digital",
      "estadoRevision": "aprobada",
      "puntuacionRelevancia": 8.5,
      "fechaCreacion": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 156
}`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
