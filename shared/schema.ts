import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  }>>(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries)
  .omit({ id: true, created_at: true })
  .extend({
    media: z.array(z.object({
      id: z.string(),
      file_type: z.enum(['image', 'audio']),
      file_url: z.string()
    })).optional()
  });

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
