import { InferSelectModel } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const smsConfig = pgTable("smsConfig", (db) => ({
  id: db.uuid().primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: db.text(),
  route: db.text(),
  senderId: db.text(),
  template: db.text(),
  templateId: db.text(),
}))

export type smsConfigTableType = InferSelectModel<typeof smsConfig>