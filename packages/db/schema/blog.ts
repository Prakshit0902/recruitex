import { pgTable, serial, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user.js";

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    coverImage: varchar("cover_image", { length: 255 }),
    tags: varchar("tags", { length: 255 }).array(),
    sections: jsonb("sections").default("[]"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  }
);
