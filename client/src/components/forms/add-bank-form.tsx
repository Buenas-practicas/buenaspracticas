import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255, "Máximo 255 caracteres"),
  descripcion: z.string().optional(),
  urlPrincipal: z.string().url("URL inválida").optional().or(z.literal("")),
  paisOrigen: z.string().max(100, "Máximo 100 caracteres").optional(),
  institucionResponsable: z.string().max(255, "Máximo 255 caracteres").optional(),
  tipoBanco: z.enum(["gubernamental", "internacional", "ong", "academico", "privado"], {
    required_error: "Selecciona un tipo de banco",
  }),
  idiomasDisponibles: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddBankFormProps {
  onSuccess?: () => void;
}

export function AddBankForm({ onSuccess }: AddBankFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      urlPrincipal: "",
      paisOrigen: "",
      institucionResponsable: "",
      idiomasDisponibles: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formattedData = {
        ...data,
        urlPrincipal: data.urlPrincipal || null,
        paisOrigen: data.paisOrigen || null,
        institucionResponsable: data.institucionResponsable || null,
        descripcion: data.descripcion || null,
        idiomasDisponibles: data.idiomasDisponibles 
          ? data.idiomasDisponibles.split(",").map(lang => lang.trim()) 
          : null,
      };
      
      const response = await apiRequest("POST", "/api/banks", formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/top-banks"] });
      toast({
        title: "Éxito",
        description: "Banco creado correctamente",
      });
      form.reset();
      onSuccess?.();
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
        description: "No se pudo crear el banco. Verifica los datos e intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-add-bank">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Banco *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Banco Interamericano de Desarrollo"
                    data-testid="input-bank-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoBanco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Banco *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-bank-type">
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gubernamental">Gubernamental</SelectItem>
                    <SelectItem value="internacional">Internacional</SelectItem>
                    <SelectItem value="ong">ONG</SelectItem>
                    <SelectItem value="academico">Académico</SelectItem>
                    <SelectItem value="privado">Privado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paisOrigen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País de Origen</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Chile, Colombia, Regional"
                    data-testid="input-bank-country"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urlPrincipal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Principal</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://ejemplo.org"
                    data-testid="input-bank-url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="institucionResponsable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institución Responsable</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: Ministerio de Desarrollo Social"
                  data-testid="input-bank-institution"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe el propósito y alcance del banco de prácticas..."
                  rows={4}
                  data-testid="textarea-bank-description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idiomasDisponibles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idiomas Disponibles</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: español, inglés, portugués (separados por comas)"
                  data-testid="input-bank-languages"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-6">
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => {
              form.reset();
              onSuccess?.();
            }}
            data-testid="button-cancel-bank"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            data-testid="button-submit-bank"
          >
            {createMutation.isPending ? "Guardando..." : "Guardar Banco"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
