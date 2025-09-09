import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CheckCircle, XCircle, Eye, Calendar, ExternalLink } from "lucide-react";
import type { BuenaPractica } from "@shared/schema";

export default function Review() {
  const [selectedPractice, setSelectedPractice] = useState<BuenaPractica | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const { toast } = useToast();

  const { data: practicesForReview, isLoading, error } = useQuery<BuenaPractica[]>({
    queryKey: ["/api/practices/review"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, comentarios }: { id: number; comentarios?: string }) => {
      await apiRequest("POST", `/api/practices/${id}/approve`, { comentarios });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practices/review"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setSelectedPractice(null);
      setReviewComments("");
      toast({
        title: "Éxito",
        description: "Práctica aprobada correctamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Tu sesión ha expirado. Redirigiendo...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo aprobar la práctica",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, comentarios }: { id: number; comentarios: string }) => {
      await apiRequest("POST", `/api/practices/${id}/reject`, { comentarios });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practices/review"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setSelectedPractice(null);
      setReviewComments("");
      toast({
        title: "Práctica rechazada",
        description: "La práctica ha sido rechazada con comentarios",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Tu sesión ha expirado. Redirigiendo...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo rechazar la práctica",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (practice: BuenaPractica) => {
    approveMutation.mutate({ id: practice.id, comentarios: reviewComments || undefined });
  };

  const handleReject = (practice: BuenaPractica) => {
    if (!reviewComments.trim()) {
      toast({
        title: "Comentarios requeridos",
        description: "Debes proporcionar comentarios para rechazar una práctica",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ id: practice.id, comentarios: reviewComments });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
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
              <p className="text-muted-foreground">
                {isUnauthorizedError(error) ? "No tienes permisos para revisar prácticas" : "Ocurrió un error inesperado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="review-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revisión de Prácticas</h1>
          <p className="text-muted-foreground">
            Revisa y aprueba las prácticas pendientes de validación
          </p>
        </div>
        {practicesForReview && practicesForReview.length > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {practicesForReview.length} pendientes
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {!practicesForReview || practicesForReview.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  No hay prácticas pendientes de revisión
                </p>
                <p className="text-muted-foreground">
                  Todas las prácticas han sido procesadas
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          practicesForReview.map((practice) => (
            <Card key={practice.id} className="hover-elevate" data-testid={`review-practice-${practice.id}`}>
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
                      <Badge variant="destructive">Pendiente</Badge>
                      {practice.fechaCreacion && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          Agregado {new Date(practice.fechaCreacion).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPractice(practice)}
                          data-testid={`button-view-practice-${practice.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{practice.titulo}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {practice.pais && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">País</p>
                                <p className="text-sm">{practice.pais}</p>
                              </div>
                            )}
                            {practice.sector && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Sector</p>
                                <p className="text-sm">{practice.sector}</p>
                              </div>
                            )}
                            {practice.temaPrincipal && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Tema Principal</p>
                                <p className="text-sm">{practice.temaPrincipal}</p>
                              </div>
                            )}
                            {practice.fechaImplementacion && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha Implementación</p>
                                <p className="text-sm">{new Date(practice.fechaImplementacion).toLocaleDateString()}</p>
                              </div>
                            )}
                            {practice.replicabilidad && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Replicabilidad</p>
                                <Badge variant="outline" className="capitalize">{practice.replicabilidad}</Badge>
                              </div>
                            )}
                            {practice.sostenibilidad && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Sostenibilidad</p>
                                <Badge variant="outline" className="capitalize">{practice.sostenibilidad}</Badge>
                              </div>
                            )}
                          </div>

                          {practice.descripcionCorta && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Descripción Corta</p>
                              <p className="text-sm">{practice.descripcionCorta}</p>
                            </div>
                          )}

                          {practice.descripcionDetallada && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Descripción Detallada</p>
                              <p className="text-sm whitespace-pre-line">{practice.descripcionDetallada}</p>
                            </div>
                          )}

                          {practice.resultadosObtenidos && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Resultados Obtenidos</p>
                              <p className="text-sm">{practice.resultadosObtenidos}</p>
                            </div>
                          )}

                          {practice.leccionesAprendidas && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Lecciones Aprendidas</p>
                              <p className="text-sm">{practice.leccionesAprendidas}</p>
                            </div>
                          )}

                          {practice.urlOriginal && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">URL Original</p>
                              <a
                                href={practice.urlOriginal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {practice.urlOriginal}
                              </a>
                            </div>
                          )}

                          <div className="border-t pt-4">
                            <p className="text-sm font-medium text-muted-foreground mb-3">Comentarios de Revisión</p>
                            <Textarea
                              placeholder="Añade comentarios sobre esta práctica..."
                              value={reviewComments}
                              onChange={(e) => setReviewComments(e.target.value)}
                              className="mb-4"
                              rows={4}
                              data-testid="textarea-review-comments"
                            />
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(practice)}
                                disabled={rejectMutation.isPending}
                                data-testid={`button-reject-practice-${practice.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rechazar
                              </Button>
                              <Button
                                onClick={() => handleApprove(practice)}
                                disabled={approveMutation.isPending}
                                data-testid={`button-approve-practice-${practice.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprobar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {practice.descripcionCorta && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {practice.descripcionCorta}
                  </p>
                )}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedPractice(practice);
                      // For quick reject, could open a simple dialog
                    }}
                    disabled={rejectMutation.isPending}
                    data-testid={`button-quick-reject-${practice.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(practice)}
                    disabled={approveMutation.isPending}
                    data-testid={`button-quick-approve-${practice.id}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
