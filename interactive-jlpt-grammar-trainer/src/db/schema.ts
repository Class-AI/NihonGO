import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// One row per learner + item. itemId examples: "g:n4-01" (grammar), "u:1" (unit review), "v:yama" (vocab)
export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),
    userKey: text("user_key").notNull(),
    itemId: text("item_id").notNull(),
    learned: boolean("learned").notNull().default(false),
    quizScore: integer("quiz_score"),
    speakingScore: integer("speaking_score"),
    completed: boolean("completed").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("progress_user_item_idx").on(t.userKey, t.itemId)],
);

export type ProgressRow = typeof progress.$inferSelect;
