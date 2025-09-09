import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddPracticeForm } from "@/components/forms/add-practice-form";
import { Plus, Search, FileText, ExternalLink, Calendar } from "lucide-react";
import type { BuenaPractica } from "@shared/schema";

export default function Practices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { data: practicesData, isLoading, error } = useQuery<{ practices: BuenaPractica[]; total: number }>({
    queryKey: ["/api/practices", {
      limit: pageSize,
      offset: currentPage * pageSize,
      search: searchQuery || undefined,
      sector: sectorFilter || undefined,
      estadoRevision: statusFilter || undefined,
    }],
  });

  const { data: banks } = useQuery({
    queryKey: ["/api/banks"],
  });

  const practices = practicesData?.practices || [];
  const total = practicesData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const getStatusColor = (status: string) => {
    const colors = {
      aprobada: "default",
      pendiente: "destructive",
      en_revision: "secondary",
      rechazada: "outline",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      aprobada: "Aprobada",
      pendiente: "Pendiente",
      en_revision: "En Revisión",
      rechazada: "Rechazada",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground mb-2">Error al cargar prácticas</p>
              <p className="text-muted-foreground">Ocurrió un error inesperado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="practices-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buenas Prácticas</h1>
          <p className="text-muted-foreground">
            Administra las buenas prácticas catalogadas en el sistema
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-practice">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Práctica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Práctica</DialogTitle>
            </DialogHeader>
            <AddPracticeForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prácticas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-practices"
          />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-48" data-testid="select-sector-filter">
            <SelectValue placeholder="Filtrar por sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los sectores</SelectItem>
            <SelectItem value="salud">Salud</SelectItem>
            <SelectItem value="educacion">Educación</SelectItem>
            <SelectItem value="tecnologia">Tecnología</SelectItem>
            <SelectItem value="finanzas">Finanzas</SelectItem>
            <SelectItem value="ambiente">Ambiente</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_revision">En Revisión</SelectItem>
            <SelectItem value="rechazada">Rechazada</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" data-testid="button-export-practices">
          Exportar
        </Button>
      </div>

      {/* Practices List */}
      <div className="space-y-4">
        {practices.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  {searchQuery || sectorFilter || statusFilter
                    ? "No se encontraron prácticas"
                    : "No hay prácticas registradas"}
                </p>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || sectorFilter || statusFilter
                    ? "Intenta con otros filtros de búsqueda"
                    : "Comienza agregando la primera práctica"}
                </p>
                {!searchQuery && !sectorFilter && !statusFilter && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-first-practice">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Primera Práctica
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          practices.map((practice) => (
            <Card key={practice.id} className="hover-elevate" data-testid={`practice-card-${practice.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{practice.titulo}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {practice.pais && (
                        <Badge variant="outline">{practice.pais}</Badge>
                      )}
                      {practice.sector && (
                        <Badge variant="secondary">{practice.sector}</Badge>
                      )}
                      <Badge variant={getStatusColor(practice.estadoRevision) as any}>
                        {getStatusLabel(practice.estadoRevision)}
                      </Badge>
                      {practice.puntuacionRelevancia && (
                        <Badge variant="outline">
                          {practice.puntuacionRelevancia}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {practice.urlOriginal && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        data-testid={`button-view-original-${practice.id}`}
                      >
                        <a href={practice.urlOriginal} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {practice.descripcionCorta && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {practice.descripcionCorta}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {practice.temaPrincipal && (
                    <div>
                      <p className="text-xs text-muted-foreground">Tema Principal</p>
                      <p className="font-medium">{practice.temaPrincipal}</p>
                    </div>
                  )}
                  {practice.fechaImplementacion && (
                    <div>
                      <p className="text-xs text-muted-foreground">Implementación</p>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <p className="font-medium">
                          {new Date(practice.fechaImplementacion).getFullYear()}
                        </p>
                      </div>
                    </div>
                  )}
                  {practice.replicabilidad && (
                    <div>
                      <p className="text-xs text-muted-foreground">Replicabilidad</p>
                      <Badge variant="outline" className="capitalize">
                        {practice.replicabilidad}
                      </Badge>
                    </div>
                  )}
                  {practice.sostenibilidad && (
                    <div>
                      <p className="text-xs text-muted-foreground">Sostenibilidad</p>
                      <Badge variant="outline" className="capitalize">
                        {practice.sostenibilidad}
                      </Badge>
                    </div>
                  )}
                </div>
                {practice.fechaRevision && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Revisado el {new Date(practice.fechaRevision).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            data-testid="button-prev-page"
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            data-testid="button-next-page"
          >
            Siguiente
          </Button>
        </div>
      )}

      {practices.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {practices.length} de {total} prácticas
          </p>
        </div>
      )}
    </div>
  );
}
