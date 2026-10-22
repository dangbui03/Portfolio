import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  segaId: text("sega_id").notNull().unique(),
  nickname: text("nickname").notNull(),
  rating: integer("rating").default(0),
  trophy: text("trophy"),
  plate: text("plate"),
  syncTime: integer("sync_time"), // timestamp
});

export const authTokens = sqliteTable("auth_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at").notNull(), // timestamp (Date.now() + 10 days)
});

export const scores = sqliteTable("scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  songTitle: text("song_title").notNull(),
  difficulty: text("difficulty").notNull(), // Basic, Advanced, Expert, Master, Re:Master
  level: text("level").notNull(), // e.g., "13", "14+"
  achievement: real("achievement").notNull(), // e.g., 100.85
  clearType: text("clear_type").default("CLEAR"), // FC, FCP, AP, APP, SYNC
  liked: integer("liked").default(0), // 0 = normal, 1 = liked
  playCount: integer("play_count").default(1),
});
export type User = typeof users.$inferSelect;
export type AuthToken = typeof authTokens.$inferSelect;
export type Score = typeof scores.$inferSelect;
