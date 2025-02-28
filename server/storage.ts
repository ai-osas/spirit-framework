import { type JournalEntry, type InsertJournalEntry } from "@shared/schema";

export interface IStorage {
  getEntries(): Promise<JournalEntry[]>;
  getEntry(id: string): Promise<JournalEntry | undefined>;
  createEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateEntry(id: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  deleteEntry(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private entries: Map<string, JournalEntry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async getEntries(): Promise<JournalEntry[]> {
    return Array.from(this.entries.values());
  }

  async getEntry(id: string): Promise<JournalEntry | undefined> {
    return this.entries.get(id);
  }

  async createEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const newEntry: JournalEntry = {
      ...entry,
      id,
      created_at: new Date(),
    };
    this.entries.set(id.toString(), newEntry);
    return newEntry;
  }

  async updateEntry(id: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    const existingEntry = await this.getEntry(id);
    if (!existingEntry) {
      throw new Error("Entry not found");
    }
    const updatedEntry: JournalEntry = {
      ...entry,
      id: existingEntry.id,
      created_at: existingEntry.created_at,
    };
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteEntry(id: string): Promise<void> {
    this.entries.delete(id);
  }
}

export const storage = new MemStorage();
