import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { BancoPractica } from "@shared/schema";

const formSchema = z.object({
  bancoId: z.number({
    required_error: "Selecciona un banco",
  }),
  titulo: z.string().min(1, "El título es requerido").max(500, "Máximo 500 caracteres"),
  descripcionCorta: z.string().optional(),
  descripcionDetallada: z.string().optional(),
  pais: z.string().max(100, "Máximo 100 caracteres").optional(),
  region: z.string().max(100, "Máximo 100 caracteres").optional(),
  temaPrincipal: z.string().max(200, "Máximo 200 caracteres").optional(),
  sector: z.string().max(100, "Máximo 100 caracteres").optional(),
  subsector: z.string().max(100, "Máximo 100 caracteres").optional(),
  poblacionObjetivo: z.string().max(500, "Máximo 500 caracteres").optional(),
  fechaImplementacion: z.date().optional(),
  duracionImplementacion: z.string().max(100, "Máximo 100 caracteres").optional(),
  presupuestoEstimado: z.number().optional(),
  moneda: z.string().max(10, "Máximo 10 caracteres").optional(),
  resultadosObtenidos: z.string().optional(),
  leccionesAprendidas: z.string().optional(),
  replicabilidad: z.enum(["alta", "media", "baja"]).optional(),
  escalabilidad: z.enum(["alta", "media", "baja"]).optional(),
  sostenibilidad: z.enum(["alta", "media", "baja"]).optional(),
  urlOriginal: z.string().url("URL inválida").optional().or(z.literal("")),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddPracticeFormProps {
  onSuccess?: () => void;
}

export function AddPracticeForm({ onSuccess }: AddPracticeFormProps) {
  const { toast } = useToast();

  const { data: banks = [] } = useQuery<BancoPractica[]>({
    queryKey: ["/api/banks"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descripcionCorta: "",
      descripcionDetallada: "",
      pais: "",
      region: "",
      temaPrincipal: "",
      sector: "",
      subsector: "",
      poblacionObjetivo: "",
      duracionImplementacion: "",
      moneda: "USD",
      resultadosObtenidos: "",
      leccionesAprendidas: "",
      urlOriginal: "",
      tags: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formattedData = {
        ...data,
        pais: data.pais || null,
        region: data.region || null,
        temaPrincipal: data.temaPrincipal || null,
        sector: data.sector || null,
        subsector: data.subsector || null,
        poblacionObjetivo: data.poblacionObjetivo || null,
        descripcionCorta: data.descripcionCorta || null,
        descripcionDetallada: data.descripcionDetallada || null,
        fechaImplementacion: data.fechaImplementacion || null,
        duracionImplementacion: data.duracionImplementacion || null,
        presupuestoEstimado: data.presupuestoEstimado || null,
        moneda: data.moneda || null,
        resultadosObtenidos: data.resultadosObtenidos || null,
        leccionesAprendidas: data.leccionesAprendidas || null,
        urlOriginal: data.urlOriginal || null,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : null,
      };
      
      const response = await apiRequest("POST", "/api/practices", formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-practices"] });
      toast({
        title: "Éxito",
        description: "Práctica creada correctamente",
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
        description: "No se pudo crear la práctica. Verifica los datos e intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-add-practice">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Título de la Práctica *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Programa de Digitalización Rural"
                    data-testid="input-practice-title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bancoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banco *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger data-testid="select-practice-bank">
                      <SelectValue placeholder="Seleccionar banco..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id.toString()}>
                        {bank.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Chile"
                    data-testid="input-practice-country"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-practice-sector">
                      <SelectValue placeholder="Seleccionar sector..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="salud">Salud</SelectItem>
                    <SelectItem value="educacion">Educación</SelectItem>
                    <SelectItem value="tecnologia">Tecnología</SelectItem>
                    <SelectItem value="finanzas">Finanzas</SelectItem>
                    <SelectItem value="ambiente">Ambiente</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="infraestructura">Infraestructura</SelectItem>
                    <SelectItem value="agricultura">Agricultura</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temaPrincipal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema Principal</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Inclusión Digital"
                    data-testid="input-practice-topic"
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
          name="descripcionCorta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Corta</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Resumen breve de la práctica..."
                  rows={3}
                  data-testid="textarea-practice-short-description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcionDetallada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Detallada</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción completa de la práctica, incluyendo objetivos, metodología y alcance..."
                  rows={6}
                  data-testid="textarea-practice-detailed-description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="fechaImplementacion"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Implementación</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        data-testid="button-implementation-date"
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="presupuestoEstimado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presupuesto Estimado</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="1000000"
                    data-testid="input-practice-budget"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="moneda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-practice-currency">
                      <SelectValue placeholder="Seleccionar moneda..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CLP">CLP</SelectItem>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="replicabilidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replicabilidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-practice-replicability">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="escalabilidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escalabilidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-practice-scalability">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sostenibilidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sostenibilidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-practice-sustainability">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="resultadosObtenidos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resultados Obtenidos</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe los principales resultados e impactos de la práctica..."
                  rows={4}
                  data-testid="textarea-practice-results"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leccionesAprendidas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lecciones Aprendidas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="¿Qué se aprendió durante la implementación? ¿Qué se haría diferente?"
                  rows={4}
                  data-testid="textarea-practice-lessons"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="urlOriginal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Original</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://ejemplo.org/practica"
                    data-testid="input-practice-url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="innovación, digital, rural (separados por comas)"
                    data-testid="input-practice-tags"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => {
              form.reset();
              onSuccess?.();
            }}
            data-testid="button-cancel-practice"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            data-testid="button-submit-practice"
          >
            {createMutation.isPending ? "Guardando..." : "Guardar Práctica"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
