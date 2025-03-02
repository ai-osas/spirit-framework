import { pgTable, text, serial, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { mediaSchema } from "../client/src/types/journal";
import { relations } from "drizzle-orm";

// Define mood type
const moodSchema = z.object({
  emotion: z.enum(['happy', 'sad', 'excited', 'anxious', 'neutral', 'focused', 'frustrated']),
  intensity: z.number().min(1).max(5),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  timestamp: z.string()
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  wallet_address: text("wallet_address").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  reward_status: text("reward_status").notNull().default('pending'),
  reward_amount: text("reward_amount"),
  distributed_at: timestamp("distributed_at"),
  media: json("media").$type<Array<{
    id: string;
    file_type: 'image' | 'audio';
    file_url: string;
  }> | null>(),
  is_shared: boolean("is_shared").default(false).notNull(),
  mood: json("mood").$type<z.infer<typeof moodSchema> | null>(),
});

export const journalCollections = pgTable("journal_collections", {
  entry_id: serial("entry_id").references(() => journalEntries.id),
  collector_wallet_address: text("collector_wallet_address").notNull(),
  collected_at: timestamp("collected_at").defaultNow().notNull(),
});

// Relations remain unchanged
export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  collections: many(journalCollections),
}));

export const journalCollectionsRelations = relations(journalCollections, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [journalCollections.entry_id],
    references: [journalEntries.id],
  }),
}));

export const insertJournalEntrySchema = createInsertSchema(journalEntries)
  .omit({ id: true, created_at: true, reward_status: true, reward_amount: true, distributed_at: true })
  .extend({
    media: z.array(mediaSchema).nullable(),
    is_shared: z.boolean().default(false).optional(),
    mood: moodSchema.nullable().optional()
  });

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type JournalCollection = typeof journalCollections.$inferSelect;
export type Mood = z.infer<typeof moodSchema>;

// Export mood schema for frontend validation
export { moodSchema };