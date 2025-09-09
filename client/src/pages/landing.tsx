import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building2, FileText, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Sistema de Bancos de
            <span className="text-primary"> Buenas Prácticas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Gestiona y cataloga bancos de buenas prácticas de programas y políticas de desarrollo
            con herramientas administrativas avanzadas.
          </p>
          <Button
            size="lg"
            onClick={() => {
              window.location.href = "/api/login";
            }}
            data-testid="button-login"
          >
            Iniciar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-3">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualiza estadísticas y métricas generales del sistema.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-chart-2 rounded-lg flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Bancos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gestiona repositorios y bases de datos de prácticas.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-chart-4 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Prácticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Administra las buenas prácticas catalogadas en el sistema.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-chart-5 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Revisión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sistema de aprobación y validación de contenido.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            © 2024 Sistema de Bancos de Buenas Prácticas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
