import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBancoSchema, insertPracticaSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/recent-activity", isAuthenticated, async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/dashboard/recent-practices", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const practices = await storage.getRecentPractices(limit);
      res.json(practices);
    } catch (error) {
      console.error("Error fetching recent practices:", error);
      res.status(500).json({ message: "Failed to fetch recent practices" });
    }
  });

  app.get("/api/dashboard/top-banks", isAuthenticated, async (req, res) => {
    try {
      const banks = await storage.getTopBanks();
      res.json(banks);
    } catch (error) {
      console.error("Error fetching top banks:", error);
      res.status(500).json({ message: "Failed to fetch top banks" });
    }
  });

  // Banks routes
  app.get("/api/banks", isAuthenticated, async (req, res) => {
    try {
      const banks = await storage.getBanks();
      res.json(banks);
    } catch (error) {
      console.error("Error fetching banks:", error);
      res.status(500).json({ message: "Failed to fetch banks" });
    }
  });

  app.get("/api/banks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bank = await storage.getBankById(id);
      if (!bank) {
        return res.status(404).json({ message: "Bank not found" });
      }
      res.json(bank);
    } catch (error) {
      console.error("Error fetching bank:", error);
      res.status(500).json({ message: "Failed to fetch bank" });
    }
  });

  app.post("/api/banks", isAuthenticated, async (req, res) => {
    try {
      const bankData = insertBancoSchema.parse(req.body);
      const bank = await storage.createBank(bankData);
      res.status(201).json(bank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bank data", errors: error.errors });
      }
      console.error("Error creating bank:", error);
      res.status(500).json({ message: "Failed to create bank" });
    }
  });

  app.put("/api/banks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bankData = insertBancoSchema.partial().parse(req.body);
      const bank = await storage.updateBank(id, bankData);
      res.json(bank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bank data", errors: error.errors });
      }
      console.error("Error updating bank:", error);
      res.status(500).json({ message: "Failed to update bank" });
    }
  });

  app.delete("/api/banks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBank(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bank:", error);
      res.status(500).json({ message: "Failed to delete bank" });
    }
  });

  // Practices routes
  app.get("/api/practices", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const bancoId = req.query.bancoId ? parseInt(req.query.bancoId as string) : undefined;
      const pais = req.query.pais as string;
      const sector = req.query.sector as string;
      const estadoRevision = req.query.estadoRevision as string;
      const search = req.query.search as string;

      const result = await storage.getPractices({
        limit,
        offset,
        bancoId,
        pais,
        sector,
        estadoRevision,
        search,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching practices:", error);
      res.status(500).json({ message: "Failed to fetch practices" });
    }
  });

  app.get("/api/practices/search", isAuthenticated, async (req, res) => {
    try {
      const search = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const result = await storage.getPractices({ search, limit });
      res.json(result);
    } catch (error) {
      console.error("Error searching practices:", error);
      res.status(500).json({ message: "Failed to search practices" });
    }
  });

  app.get("/api/practices/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const practice = await storage.getPracticeById(id);
      if (!practice) {
        return res.status(404).json({ message: "Practice not found" });
      }
      res.json(practice);
    } catch (error) {
      console.error("Error fetching practice:", error);
      res.status(500).json({ message: "Failed to fetch practice" });
    }
  });

  app.post("/api/practices", isAuthenticated, async (req, res) => {
    try {
      const practiceData = insertPracticaSchema.parse(req.body);
      const practice = await storage.createPractice(practiceData);
      res.status(201).json(practice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid practice data", errors: error.errors });
      }
      console.error("Error creating practice:", error);
      res.status(500).json({ message: "Failed to create practice" });
    }
  });

  app.put("/api/practices/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const practiceData = insertPracticaSchema.partial().parse(req.body);
      const practice = await storage.updatePractice(id, practiceData);
      res.json(practice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid practice data", errors: error.errors });
      }
      console.error("Error updating practice:", error);
      res.status(500).json({ message: "Failed to update practice" });
    }
  });

  app.delete("/api/practices/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePractice(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting practice:", error);
      res.status(500).json({ message: "Failed to delete practice" });
    }
  });

  // Review routes
  app.get("/api/practices/review", isAuthenticated, async (req, res) => {
    try {
      const practices = await storage.getPracticesForReview();
      res.json(practices);
    } catch (error) {
      console.error("Error fetching practices for review:", error);
      res.status(500).json({ message: "Failed to fetch practices for review" });
    }
  });

  app.post("/api/practices/:id/approve", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const { comentarios } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const practice = await storage.approvePractice(id, userId, comentarios);
      res.json(practice);
    } catch (error) {
      console.error("Error approving practice:", error);
      res.status(500).json({ message: "Failed to approve practice" });
    }
  });

  app.post("/api/practices/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const { comentarios } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      if (!comentarios) {
        return res.status(400).json({ message: "Comments are required for rejection" });
      }
      
      const practice = await storage.rejectPractice(id, userId, comentarios);
      res.json(practice);
    } catch (error) {
      console.error("Error rejecting practice:", error);
      res.status(500).json({ message: "Failed to reject practice" });
    }
  });

  // Stats routes
  app.get("/api/stats/general", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching general stats:", error);
      res.status(500).json({ message: "Failed to fetch general stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
