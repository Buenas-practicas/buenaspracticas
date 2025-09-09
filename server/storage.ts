import {
  usuarios,
  bancosPracticas,
  buenasPracticas,
  scrapingLogs,
  type User,
  type UpsertUser,
  type BancoPractica,
  type InsertBanco,
  type BuenaPractica,
  type InsertPractica,
  type ScrapingLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Banks operations
  getBanks(): Promise<BancoPractica[]>;
  getBankById(id: number): Promise<BancoPractica | undefined>;
  createBank(bank: InsertBanco): Promise<BancoPractica>;
  updateBank(id: number, bank: Partial<InsertBanco>): Promise<BancoPractica>;
  deleteBank(id: number): Promise<void>;
  
  // Practices operations
  getPractices(params?: {
    limit?: number;
    offset?: number;
    bancoId?: number;
    pais?: string;
    sector?: string;
    estadoRevision?: string;
    search?: string;
  }): Promise<{ practices: BuenaPractica[]; total: number }>;
  getPracticeById(id: number): Promise<BuenaPractica | undefined>;
  createPractice(practice: InsertPractica): Promise<BuenaPractica>;
  updatePractice(id: number, practice: Partial<InsertPractica>): Promise<BuenaPractica>;
  deletePractice(id: number): Promise<void>;
  getPracticesForReview(): Promise<BuenaPractica[]>;
  approvePractice(id: number, revisorId: string, comentarios?: string): Promise<BuenaPractica>;
  rejectPractice(id: number, revisorId: string, comentarios: string): Promise<BuenaPractica>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalBanks: number;
    totalPractices: number;
    pendingReview: number;
    activeUsers: number;
  }>;
  
  getRecentActivity(): Promise<any[]>;
  getRecentPractices(limit?: number): Promise<BuenaPractica[]>;
  getTopBanks(): Promise<Array<{ banco: BancoPractica; practiceCount: number }>>;
  
  // Scraping logs
  createScrapingLog(log: Omit<ScrapingLog, 'id'>): Promise<ScrapingLog>;
  getScrapingLogs(bancoId?: number): Promise<ScrapingLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(usuarios).where(eq(usuarios.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(usuarios)
      .values(userData)
      .onConflictDoUpdate({
        target: usuarios.id,
        set: {
          ...userData,
          updatedAt: new Date(),
          ultimoAcceso: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Banks operations
  async getBanks(): Promise<BancoPractica[]> {
    return await db.select().from(bancosPracticas).orderBy(desc(bancosPracticas.fechaCreacion));
  }

  async getBankById(id: number): Promise<BancoPractica | undefined> {
    const [bank] = await db.select().from(bancosPracticas).where(eq(bancosPracticas.id, id));
    return bank;
  }

  async createBank(bank: InsertBanco): Promise<BancoPractica> {
    const [newBank] = await db.insert(bancosPracticas).values([bank]).returning();
    return newBank;
  }

  async updateBank(id: number, bank: Partial<InsertBanco>): Promise<BancoPractica> {
    const [updatedBank] = await db
      .update(bancosPracticas)
      .set({ ...bank, ultimaActualizacion: new Date() })
      .where(eq(bancosPracticas.id, id))
      .returning();
    return updatedBank;
  }

  async deleteBank(id: number): Promise<void> {
    await db.delete(bancosPracticas).where(eq(bancosPracticas.id, id));
  }

  // Practices operations
  async getPractices(params: {
    limit?: number;
    offset?: number;
    bancoId?: number;
    pais?: string;
    sector?: string;
    estadoRevision?: string;
    search?: string;
  } = {}): Promise<{ practices: BuenaPractica[]; total: number }> {
    const { limit = 50, offset = 0, bancoId, pais, sector, estadoRevision, search } = params;

    let query = db.select().from(buenasPracticas);
    let countQuery = db.select({ count: count() }).from(buenasPracticas);

    const conditions = [];

    if (bancoId) {
      conditions.push(eq(buenasPracticas.bancoId, bancoId));
    }
    if (pais) {
      conditions.push(eq(buenasPracticas.pais, pais));
    }
    if (sector) {
      conditions.push(eq(buenasPracticas.sector, sector));
    }
    if (estadoRevision) {
      conditions.push(eq(buenasPracticas.estadoRevision, estadoRevision as any));
    }
    if (search) {
      conditions.push(ilike(buenasPracticas.titulo, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    const [practices, totalResult] = await Promise.all([
      query.orderBy(desc(buenasPracticas.fechaCreacion)).limit(limit).offset(offset),
      countQuery,
    ]);

    return {
      practices,
      total: totalResult[0]?.count || 0,
    };
  }

  async getPracticeById(id: number): Promise<BuenaPractica | undefined> {
    const [practice] = await db.select().from(buenasPracticas).where(eq(buenasPracticas.id, id));
    return practice;
  }

  async createPractice(practice: InsertPractica): Promise<BuenaPractica> {
    const [newPractice] = await db.insert(buenasPracticas).values([practice]).returning();
    return newPractice;
  }

  async updatePractice(id: number, practice: Partial<InsertPractica>): Promise<BuenaPractica> {
    const [updatedPractice] = await db
      .update(buenasPracticas)
      .set(practice)
      .where(eq(buenasPracticas.id, id))
      .returning();
    return updatedPractice;
  }

  async deletePractice(id: number): Promise<void> {
    await db.delete(buenasPracticas).where(eq(buenasPracticas.id, id));
  }

  async getPracticesForReview(): Promise<BuenaPractica[]> {
    return await db
      .select()
      .from(buenasPracticas)
      .where(eq(buenasPracticas.estadoRevision, "pendiente"))
      .orderBy(desc(buenasPracticas.fechaCreacion));
  }

  async approvePractice(id: number, revisorId: string, comentarios?: string): Promise<BuenaPractica> {
    const [practice] = await db
      .update(buenasPracticas)
      .set({
        estadoRevision: "aprobada",
        revisorId,
        fechaRevision: new Date(),
        comentariosRevision: comentarios,
      })
      .where(eq(buenasPracticas.id, id))
      .returning();
    return practice;
  }

  async rejectPractice(id: number, revisorId: string, comentarios: string): Promise<BuenaPractica> {
    const [practice] = await db
      .update(buenasPracticas)
      .set({
        estadoRevision: "rechazada",
        revisorId,
        fechaRevision: new Date(),
        comentariosRevision: comentarios,
      })
      .where(eq(buenasPracticas.id, id))
      .returning();
    return practice;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalBanks: number;
    totalPractices: number;
    pendingReview: number;
    activeUsers: number;
  }> {
    const [banksCount] = await db.select({ count: count() }).from(bancosPracticas);
    const [practicesCount] = await db.select({ count: count() }).from(buenasPracticas);
    const [pendingCount] = await db
      .select({ count: count() })
      .from(buenasPracticas)
      .where(eq(buenasPracticas.estadoRevision, "pendiente"));
    const [usersCount] = await db
      .select({ count: count() })
      .from(usuarios)
      .where(eq(usuarios.estado, "activo"));

    return {
      totalBanks: banksCount?.count || 0,
      totalPractices: practicesCount?.count || 0,
      pendingReview: pendingCount?.count || 0,
      activeUsers: usersCount?.count || 0,
    };
  }

  async getRecentActivity(): Promise<any[]> {
    // Return recent activities from various tables
    const recentPractices = await db
      .select({
        type: sql<string>`'practice_added'`,
        title: buenasPracticas.titulo,
        timestamp: buenasPracticas.fechaCreacion,
      })
      .from(buenasPracticas)
      .orderBy(desc(buenasPracticas.fechaCreacion))
      .limit(10);

    return recentPractices;
  }

  async getRecentPractices(limit = 5): Promise<BuenaPractica[]> {
    return await db
      .select()
      .from(buenasPracticas)
      .orderBy(desc(buenasPracticas.fechaCreacion))
      .limit(limit);
  }

  async getTopBanks(): Promise<Array<{ banco: BancoPractica; practiceCount: number }>> {
    const result = await db
      .select({
        banco: bancosPracticas,
        practiceCount: count(buenasPracticas.id),
      })
      .from(bancosPracticas)
      .leftJoin(buenasPracticas, eq(bancosPracticas.id, buenasPracticas.bancoId))
      .groupBy(bancosPracticas.id)
      .orderBy(desc(count(buenasPracticas.id)))
      .limit(5);

    return result.map(r => ({
      banco: r.banco,
      practiceCount: r.practiceCount || 0,
    }));
  }

  // Scraping logs
  async createScrapingLog(log: Omit<ScrapingLog, 'id'>): Promise<ScrapingLog> {
    const [newLog] = await db.insert(scrapingLogs).values(log).returning();
    return newLog;
  }

  async getScrapingLogs(bancoId?: number): Promise<ScrapingLog[]> {
    let query = db.select().from(scrapingLogs);
    
    if (bancoId) {
      query = query.where(eq(scrapingLogs.bancoId, bancoId));
    }

    return await query.orderBy(desc(scrapingLogs.fechaScraping));
  }
}

export const storage = new DatabaseStorage();
