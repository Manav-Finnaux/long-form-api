import { sql } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";

export const locationTable = pgTable(
  "location",
  (t) => ({
    //change id generation to uuid
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    pincode: t.text().notNull(),
    name: t.text().notNull(),
    block: t.text(),
    state: t.text(),
    district: t.text(),
    tehsil: t.text(),
    isActive: t.boolean().notNull().default(true),
    createdAt: t
      .timestamp({ mode: "string", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: t
      .timestamp({ mode: "string", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (t) => [index("location_pincode_index").on(t.pincode)]
);
