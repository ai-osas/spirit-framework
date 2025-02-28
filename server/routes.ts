import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/journal/entries", async (req, res) => {
    const entries = await storage.getEntries();
    res.json(entries);
  });

  app.get("/api/journal/entries/:id", async (req, res) => {
    const entry = await storage.getEntry(req.params.id);
    if (!entry) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(entry);
  });

  app.post("/api/journal/entries", async (req, res) => {
    const result = insertJournalEntrySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }
    const entry = await storage.createEntry(result.data);
    res.json(entry);
  });

  app.patch("/api/journal/entries/:id", async (req, res) => {
    const result = insertJournalEntrySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }
    try {
      const entry = await storage.updateEntry(req.params.id, result.data);
      res.json(entry);
    } catch (error) {
      res.status(404).json({ message: "Entry not found" });
    }
  });

  app.delete("/api/journal/entries/:id", async (req, res) => {
    try {
      await storage.deleteEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Entry not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
