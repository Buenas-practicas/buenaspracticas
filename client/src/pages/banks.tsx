import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddBankForm } from "@/components/forms/add-bank-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Search, Building2, Edit, Trash2, Globe } from "lucide-react";
import type { BancoPractica } from "@shared/schema";

export default function Banks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: banks, isLoading, error } = useQuery<BancoPractica[]>({
    queryKey: ["/api/banks"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/banks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      toast({
        title: "Éxito",
        description: "Banco eliminado correctamente",
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
        description: "No se pudo eliminar el banco",
        variant: "destructive",
      });
    },
  });

  const filteredBanks = banks?.filter(bank =>
    bank.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.institucionResponsable?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.paisOrigen?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTipoBancoLabel = (tipo: string) => {
    const labels = {
      gubernamental: "Gubernamental",
      internacional: "Internacional",
      ong: "ONG",
      academico: "Académico",
      privado: "Privado",
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoBancoVariant = (tipo: string) => {
    const variants = {
      gubernamental: "default",
      internacional: "secondary",
      ong: "outline",
      academico: "destructive",
      privado: "default",
    };
    return variants[tipo as keyof typeof variants] || "default";
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
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
              <p className="text-lg font-medium text-foreground mb-2">Error al cargar bancos</p>
              <p className="text-muted-foreground">
                {isUnauthorizedError(error) ? "No tienes permisos para ver esta información" : "Ocurrió un error inesperado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="banks-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bancos de Prácticas</h1>
          <p className="text-muted-foreground">
            Gestiona los repositorios y bases de datos de buenas prácticas
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-bank">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Banco
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Banco</DialogTitle>
            </DialogHeader>
            <AddBankForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar bancos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-banks"
          />
        </div>
        <Button variant="outline" size="sm" data-testid="button-export-banks">
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanks?.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    {searchQuery ? "No se encontraron bancos" : "No hay bancos registrados"}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Intenta con otros términos de búsqueda"
                      : "Comienza agregando el primer banco de prácticas"}
                  </p>
                  {!searchQuery && (
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-first-bank">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primer Banco
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredBanks?.map((bank) => (
            <Card key={bank.id} className="hover-elevate" data-testid={`bank-card-${bank.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{bank.nombre}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getTipoBancoVariant(bank.tipoBanco) as any}>
                        {getTipoBancoLabel(bank.tipoBanco)}
                      </Badge>
                      {bank.paisOrigen && (
                        <Badge variant="outline">
                          {bank.paisOrigen}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" data-testid={`button-edit-bank-${bank.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(bank.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-bank-${bank.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bank.descripcion && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {bank.descripcion}
                  </p>
                )}
                {bank.institucionResponsable && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">Institución Responsable</p>
                    <p className="text-sm font-medium">{bank.institucionResponsable}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  {bank.urlPrincipal ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      asChild
                      data-testid={`button-visit-bank-${bank.id}`}
                    >
                      <a href={bank.urlPrincipal} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-1" />
                        Visitar
                      </a>
                    </Button>
                  ) : (
                    <div />
                  )}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <Badge variant={bank.estado === "activo" ? "default" : "secondary"}>
                      {bank.estado}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredBanks && filteredBanks.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredBanks.length} de {banks?.length || 0} bancos
          </p>
        </div>
      )}
    </div>
  );
}
