import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  date,
  decimal,
  jsonb,
  pgEnum,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const tipoBancoEnum = pgEnum("tipo_banco", [
  "gubernamental",
  "internacional", 
  "ong",
  "academico",
  "privado",
]);

export const estadoEnum = pgEnum("estado", ["activo", "inactivo", "en_revision"]);

export const replicabilidadEnum = pgEnum("replicabilidad", ["alta", "media", "baja"]);

export const escalabilidadEnum = pgEnum("escalabilidad", ["alta", "media", "baja"]);

export const sostenibilidadEnum = pgEnum("sostenibilidad", ["alta", "media", "baja"]);

export const seguimientoEstadoEnum = pgEnum("seguimiento_estado", [
  "completado",
  "en_curso", 
  "suspendido",
  "sin_seguimiento",
]);

export const estadoRevisionEnum = pgEnum("estado_revision", [
  "pendiente",
  "aprobada",
  "rechazada",
  "en_revision",
]);

export const rolEnum = pgEnum("rol", ["admin", "revisor", "consultor", "readonly"]);

export const scrapingEstadoEnum = pgEnum("scraping_estado", [
  "exitoso",
  "parcial", 
  "fallido",
]);

// User storage table for Replit Auth
export const usuarios = pgTable("usuarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username", { length: 100 }),
  rol: rolEnum("rol").default("readonly"),
  permisos: jsonb("permisos"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
  ultimoAcceso: timestamp("ultimo_acceso"),
  estado: estadoEnum("estado").default("activo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bancos de Prácticas table
export const bancosPracticas = pgTable("bancos_practicas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  urlPrincipal: varchar("url_principal", { length: 500 }),
  paisOrigen: varchar("pais_origen", { length: 100 }),
  institucionResponsable: varchar("institucion_responsable", { length: 255 }),
  tipoBanco: tipoBancoEnum("tipo_banco").notNull(),
  idiomasDisponibles: jsonb("idiomas_disponibles"),
  fechaCreacion: date("fecha_creacion"),
  ultimaActualizacion: timestamp("ultima_actualizacion").defaultNow(),
  estado: estadoEnum("estado").default("activo"),
  metadatos: jsonb("metadatos"),
});

// Buenas Prácticas table  
export const buenasPracticas = pgTable("buenas_practicas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bancoId: integer("banco_id").references(() => bancosPracticas.id).notNull(),
  titulo: varchar("titulo", { length: 500 }).notNull(),
  descripcionCorta: text("descripcion_corta"),
  descripcionDetallada: text("descripcion_detallada"),
  pais: varchar("pais", { length: 100 }),
  region: varchar("region", { length: 100 }),
  temaPrincipal: varchar("tema_principal", { length: 200 }),
  temasSecundarios: jsonb("temas_secundarios"),
  sector: varchar("sector", { length: 100 }),
  subsector: varchar("subsector", { length: 100 }),
  actoresInvolucrados: jsonb("actores_involucrados"),
  poblacionObjetivo: varchar("poblacion_objetivo", { length: 500 }),
  fechaImplementacion: date("fecha_implementacion"),
  duracionImplementacion: varchar("duracion_implementacion", { length: 100 }),
  presupuestoEstimado: decimal("presupuesto_estimado"),
  moneda: varchar("moneda", { length: 10 }),
  resultadosObtenidos: text("resultados_obtenidos"),
  indicadoresExito: jsonb("indicadores_exito"),
  leccionesAprendidas: text("lecciones_aprendidas"),
  replicabilidad: replicabilidadEnum("replicabilidad"),
  escalabilidad: escalabilidadEnum("escalabilidad"),
  sostenibilidad: sostenibilidadEnum("sostenibilidad"),
  urlOriginal: varchar("url_original", { length: 1000 }),
  screenshotPath: varchar("screenshot_path", { length: 500 }),
  documentosAdjuntos: jsonb("documentos_adjuntos"),
  contactoInformacion: jsonb("contacto_informacion"),
  seguimientoEstado: seguimientoEstadoEnum("seguimiento_estado"),
  fechaSeguimiento: date("fecha_seguimiento"),
  notasSeguimiento: text("notas_seguimiento"),
  fechaScraping: timestamp("fecha_scraping"),
  estadoRevision: estadoRevisionEnum("estado_revision").default("pendiente"),
  revisorId: varchar("revisor_id").references(() => usuarios.id),
  fechaRevision: timestamp("fecha_revision"),
  comentariosRevision: text("comentarios_revision"),
  tags: jsonb("tags"),
  puntuacionRelevancia: decimal("puntuacion_relevancia"),
  metadatos: jsonb("metadatos"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

// Scraping Logs table
export const scrapingLogs = pgTable("scraping_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bancoId: integer("banco_id").references(() => bancosPracticas.id).notNull(),
  fechaScraping: timestamp("fecha_scraping").defaultNow(),
  practicasEncontradas: integer("practicas_encontradas"),
  practicasNuevas: integer("practicas_nuevas"),
  erroresEncontrados: jsonb("errores_encontrados"),
  tiempoEjecucion: integer("tiempo_ejecucion"),
  estado: scrapingEstadoEnum("estado").notNull(),
});

// Relations
export const bancosPracticasRelations = relations(bancosPracticas, ({ many }) => ({
  practicas: many(buenasPracticas),
  scrapingLogs: many(scrapingLogs),
}));

export const buenasPracticasRelations = relations(buenasPracticas, ({ one }) => ({
  banco: one(bancosPracticas, {
    fields: [buenasPracticas.bancoId],
    references: [bancosPracticas.id],
  }),
  revisor: one(usuarios, {
    fields: [buenasPracticas.revisorId],
    references: [usuarios.id],
  }),
}));

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  practicasRevisadas: many(buenasPracticas),
}));

export const scrapingLogsRelations = relations(scrapingLogs, ({ one }) => ({
  banco: one(bancosPracticas, {
    fields: [scrapingLogs.bancoId],
    references: [bancosPracticas.id],
  }),
}));

// Insert schemas
export const insertBancoSchema = createInsertSchema(bancosPracticas).omit({
  id: true,
  ultimaActualizacion: true,
});

export const insertPracticaSchema = createInsertSchema(buenasPracticas).omit({
  id: true,
  fechaCreacion: true,
  fechaScraping: true,
});

export const insertUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  fechaCreacion: true,
  ultimoAcceso: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof usuarios.$inferInsert;
export type User = typeof usuarios.$inferSelect;
export type BancoPractica = typeof bancosPracticas.$inferSelect;
export type InsertBanco = z.infer<typeof insertBancoSchema>;
export type BuenaPractica = typeof buenasPracticas.$inferSelect;
export type InsertPractica = z.infer<typeof insertPracticaSchema>;
export type ScrapingLog = typeof scrapingLogs.$inferSelect;
