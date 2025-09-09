import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";
import { Search, UserPlus, Edit, Trash2, Users as UsersIcon } from "lucide-react";
import type { User } from "@shared/schema";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const { toast } = useToast();

  // For now, we'll show a placeholder since user management isn't fully implemented
  const users: User[] = [];
  const isLoading = false;
  const error = null;

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "destructive",
      revisor: "default",
      consultor: "secondary",
      readonly: "outline",
    };
    return colors[role as keyof typeof colors] || "default";
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrador",
      revisor: "Revisor",
      consultor: "Consultor",
      readonly: "Solo Lectura",
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.email) {
      return user.email;
    }
    return "Usuario Sin Nombre";
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
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
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
              <p className="text-lg font-medium text-foreground mb-2">Error al cargar usuarios</p>
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
    <div className="p-6 space-y-6" data-testid="users-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
        <Button data-testid="button-add-user">
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-users"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48" data-testid="select-role-filter">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los roles</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="revisor">Revisor</SelectItem>
            <SelectItem value="consultor">Consultor</SelectItem>
            <SelectItem value="readonly">Solo Lectura</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" data-testid="button-export-users">
          Exportar
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Gestión de usuarios no implementada
              </p>
              <p className="text-muted-foreground mb-4">
                Esta funcionalidad estará disponible en una próxima versión
              </p>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Los usuarios se gestionan actualmente a través del sistema de autenticación de Replit.
                  Las funciones de administración de usuarios se implementarán según los requisitos específicos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="hover-elevate" data-testid={`user-card-${user.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={getUserName(user)} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        {getUserName(user)}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant={getRoleColor(user.rol || "readonly") as any}>
                          {getRoleLabel(user.rol || "readonly")}
                        </Badge>
                        <Badge variant={user.estado === "activo" ? "default" : "secondary"}>
                          {user.estado || "activo"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-muted-foreground">
                      {user.ultimoAcceso ? `Último acceso: ${new Date(user.ultimoAcceso).toLocaleDateString()}` : "Nunca"}
                    </p>
                    <Button variant="ghost" size="sm" data-testid={`button-edit-user-${user.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-delete-user-${user.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
