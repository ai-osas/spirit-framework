import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { mediaSchema } from "../client/src/types/journal";

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  wallet_address: text("wallet_address").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  media: json("media").$type<Array<{
    id: string;
    file_type: 'image' | 'audio';
    file_url: string;
  }> | null>(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries)
  .omit({ id: true, created_at: true })
  .extend({
    media: z.array(mediaSchema).nullable()
  });

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;