import { pgTable, text, serial, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { mediaSchema } from "../client/src/types/journal";

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  wallet_address: text("wallet_address").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  reward_status: text("reward_status").notNull().default('pending'), // 'pending', 'approved', 'denied'
  reward_amount: text("reward_amount"), // Stored as string to handle BigInt
  distributed_at: timestamp("distributed_at"),
  media: json("media").$type<Array<{
    id: string;
    file_type: 'image' | 'audio';
    file_url: string;
  }> | null>(),
  is_shared: boolean("is_shared").default(false).notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries)
  .omit({ id: true, created_at: true, reward_status: true, reward_amount: true, distributed_at: true })
  .extend({
    media: z.array(mediaSchema).nullable(),
    is_shared: z.boolean().default(false).optional()
  });

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;