import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  FileText,
  CheckCircle,
  Users,
  Code,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Bancos de Prácticas",
    url: "/banks",
    icon: Building2,
  },
  {
    title: "Buenas Prácticas",
    url: "/practices",
    icon: FileText,
  },
  {
    title: "Revisión",
    url: "/review",
    icon: CheckCircle,
    badge: 12,
  },
  {
    title: "Usuarios",
    url: "/users",
    icon: Users,
  },
  {
    title: "API",
    url: "/api-docs",
    icon: Code,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "Usuario";
  };

  const getUserRole = (user: any) => {
    const roleMap = {
      admin: "Administrador",
      revisor: "Revisor",
      consultor: "Consultor",
      readonly: "Solo Lectura",
    };
    return roleMap[user?.rol as keyof typeof roleMap] || "Usuario";
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader>
        <div className="px-4 py-2">
          <h1 className="text-xl font-bold text-foreground">Buenas Prácticas</h1>
        </div>
        
        {user && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.profileImageUrl || undefined} alt={getUserName(user)} />
                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {getUserName(user)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getUserRole(user)}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              window.location.href = "/api/logout";
            }}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
