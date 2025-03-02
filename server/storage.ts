import { type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { type JournalEntry as JournalEntryType, type InsertJournalEntry as InsertJournalEntryType, journalEntries } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

export interface IStorage {
  getEntries(wallet_address: string): Promise<JournalEntry[]>;
  getEntry(id: string): Promise<JournalEntry | undefined>;
  createEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateEntry(id: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  deleteEntry(id: string): Promise<void>;
  getPendingEntries(): Promise<JournalEntry[]>;
  updateEntryStatus(id: string, status: 'approved' | 'denied', rewardAmount?: string): Promise<void>;
  updateEntryReward(id: string, rewardAmount: string): Promise<void>;
  updateEntrySharing(id: string, isShared: boolean): Promise<JournalEntryType>;
}

export class PostgresStorage implements IStorage {
  async getEntries(wallet_address: string): Promise<JournalEntry[]> {
    // Return user's own entries and entries shared by others
    return db.select()
      .from(journalEntries)
      .where(
        or(
          eq(journalEntries.wallet_address, wallet_address),
          eq(journalEntries.is_shared, true)
        )
      )
      .orderBy(journalEntries.created_at, "desc");
  }

  async getEntry(id: string): Promise<JournalEntry | undefined> {
    const results = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, parseInt(id)));
    return results[0];
  }

  async createEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db
      .insert(journalEntries)
      .values({
        ...entry,
        created_at: new Date(),
        reward_status: 'pending',
        reward_amount: null,
        distributed_at: null
      })
      .returning();
    return newEntry;
  }

  async updateEntry(id: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set(entry)
      .where(eq(journalEntries.id, parseInt(id)))
      .returning();

    if (!updatedEntry) {
      throw new Error("Entry not found");
    }
    return updatedEntry;
  }

  async deleteEntry(id: string): Promise<void> {
    await db
      .delete(journalEntries)
      .where(eq(journalEntries.id, Number(id)));
  }

  async getPendingEntries(): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.reward_status, 'pending'));
  }

  async updateEntryStatus(id: string, status: 'approved' | 'denied', rewardAmount?: string): Promise<void> {
    await db
      .update(journalEntries)
      .set({
        reward_status: status,
        reward_amount: status === 'approved' ? rewardAmount || null : null,
        distributed_at: status === 'approved' ? new Date() : null
      })
      .where(eq(journalEntries.id, parseInt(id)));
  }

  async updateEntryReward(id: string, rewardAmount: string): Promise<void> {
    await db
      .update(journalEntries)
      .set({ reward_amount: rewardAmount })
      .where(eq(journalEntries.id, parseInt(id)));
  }

  async updateEntrySharing(id: string, isShared: boolean): Promise<JournalEntryType> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ is_shared: isShared })
      .where(eq(journalEntries.id, Number(id)))
      .returning();

    if (!updatedEntry) {
      throw new Error("Entry not found");
    }
    return updatedEntry;
  }
}

export const storage = new PostgresStorage();