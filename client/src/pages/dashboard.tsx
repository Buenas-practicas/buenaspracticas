import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  FileText,
  Clock,
  Users,
  Plus,
  BarChart3,
  FileDown,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentPractices, isLoading: practicesLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-practices"],
  });

  const { data: topBanks, isLoading: banksLoading } = useQuery({
    queryKey: ["/api/dashboard/top-banks"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-content">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Bancos</p>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-total-banks">
                  {(stats as any)?.totalBanks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-chart-2 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Prácticas Totales</p>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-total-practices">
                  {(stats as any)?.totalPractices || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-chart-4 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pendientes Revisión</p>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-pending-review">
                  {(stats as any)?.pendingReview || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-chart-5 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-semibold text-foreground" data-testid="stat-active-users">
                  {(stats as any)?.activeUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Prácticas por País</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-chart-1 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground">Gráfico de distribución por país</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : (recentActivity as any)?.length > 0 ? (
                (recentActivity as any[]).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.type === 'practice_added' && `Nueva práctica añadida: "${activity.title}"`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Fecha no disponible'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Practices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prácticas Recientes</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-practices">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {practicesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-32 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : (recentPractices as any)?.length > 0 ? (
                (recentPractices as any[]).map((practice: any) => (
                  <div key={practice.id} className="px-6 py-4 hover:bg-muted/50" data-testid={`practice-item-${practice.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {practice.titulo}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {practice.pais} • {practice.sector}
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge
                            variant={
                              practice.estadoRevision === "aprobada"
                                ? "default"
                                : practice.estadoRevision === "en_revision"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {practice.estadoRevision === "aprobada" && "Aprobada"}
                            {practice.estadoRevision === "en_revision" && "En Revisión"}
                            {practice.estadoRevision === "pendiente" && "Pendiente"}
                            {practice.estadoRevision === "rechazada" && "Rechazada"}
                          </Badge>
                          {practice.puntuacionRelevancia && (
                            <span className="text-xs text-muted-foreground">
                              {practice.puntuacionRelevancia}/10
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">No hay prácticas disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Banks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bancos Más Activos</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-banks">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {banksLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))
              ) : (topBanks as any)?.length > 0 ? (
                (topBanks as any[]).map((item: any, index: number) => (
                  <div key={item.banco.id} className="px-6 py-4 hover:bg-muted/50" data-testid={`bank-item-${item.banco.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-3 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {item.banco.nombre.substring(0, 3).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.banco.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.banco.tipoBanco} • {item.practiceCount} prácticas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min(100, (item.practiceCount / 300) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((item.practiceCount / 300) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">No hay bancos disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" data-testid="button-add-practice">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Añadir Práctica</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" data-testid="button-new-bank">
              <div className="w-12 h-12 bg-chart-2 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium">Nuevo Banco</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" data-testid="button-view-reports">
              <div className="w-12 h-12 bg-chart-4 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium">Ver Reportes</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" data-testid="button-export-data">
              <div className="w-12 h-12 bg-chart-5 rounded-lg flex items-center justify-center">
                <FileDown className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium">Exportar Datos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
