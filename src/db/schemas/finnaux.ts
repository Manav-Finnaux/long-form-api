import { pgTable } from "drizzle-orm/pg-core";
import { longFormTable } from "./long-form";
import { applicationStatusEnum } from "./enums";
import { sql } from "drizzle-orm";

export const finnauxData = pgTable("finnaux", (db) => ({
  id: db.uuid().references(() => longFormTable.id).unique(),
  status: applicationStatusEnum().$default(() => "PENDING"),
  applicationNumber: db.text(),
  loanAccountNumber: db.text(),
  reason: db.text(),
  employeeName: db.text(),
  createdAt: db.timestamp({ mode: "string", withTimezone: true }).defaultNow(),
  updatedAt: db.timestamp({ mode: "string", withTimezone: true }).$onUpdateFn(() => sql`now()`)
}))

/**
 * status
 * application num
 * loan acc no
 * reason
 * emp name
*/