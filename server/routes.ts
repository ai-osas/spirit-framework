import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/journal/entries", async (req, res) => {
    const wallet_address = req.query.wallet_address as string;
    
    if (!wallet_address) {
      return res.status(400).json({ message: "Wallet address is required" });
    }
    
    const entries = await storage.getEntries(wallet_address);
    res.json(entries);
  });

  app.get("/api/journal/entries/pending", async (req, res) => {
    try {
      const pendingEntries = await storage.getPendingEntries();
      res.json(pendingEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending entries" });
    }
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

  app.patch("/api/journal/entries/:id/reward", async (req, res) => {
    try {
      await storage.updateEntryReward(req.params.id, req.body.reward_amount);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update reward amount" });
    }
  });

  app.post("/api/journal/entries/:id/status", async (req, res) => {
    const { status, rewardAmount } = req.body;
    if (!['approved', 'denied'].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    try {
      await storage.updateEntryStatus(req.params.id, status, rewardAmount);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update entry status" });
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

  app.patch("/api/journal/entries/:id/share", async (req, res) => {
    const { shared } = req.body;
    
    if (typeof shared !== 'boolean') {
      return res.status(400).json({ message: "Shared status must be a boolean" });
    }
    
    try {
      const entry = await storage.updateEntrySharing(req.params.id, shared);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sharing status" });
    }
  });

  // Update pattern sharing endpoint
  app.post("/api/journal/patterns/:id/share", async (req, res) => {
    const { isShared } = req.body;

    if (typeof isShared !== 'boolean') {
      return res.status(400).json({ message: "isShared must be a boolean" });
    }

    try {
      const updatedEntry = await storage.updateEntrySharing(req.params.id, isShared);
      res.json(updatedEntry);
    } catch (error) {
      console.error('Error updating sharing status:', error);
      res.status(500).json({ message: "Failed to update sharing status" });
    }
  });

  // Add new routes for collection management
  app.post("/api/journal/entries/:id/collect", async (req, res) => {
    const entryId = parseInt(req.params.id);
    const collectorWalletAddress = req.query.wallet_address as string;

    if (!collectorWalletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    try {
      await storage.addToPrivateCollection(entryId, collectorWalletAddress);
      res.json({ success: true });
    } catch (error) {
      console.error('Error adding to private collection:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to add to private collection" 
      });
    }
  });

  app.delete("/api/journal/entries/:id/collect", async (req, res) => {
    const entryId = parseInt(req.params.id);
    const collectorWalletAddress = req.query.wallet_address as string;

    if (!collectorWalletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    try {
      await storage.removeFromPrivateCollection(entryId, collectorWalletAddress);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing from private collection:', error);
      res.status(500).json({ message: "Failed to remove from private collection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}