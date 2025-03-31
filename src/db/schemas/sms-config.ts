import { pgTable } from "drizzle-orm/pg-core";


export const smsConfigTable = pgTable("sms_config", (t) => ({
    id: t.boolean().primaryKey().default(true),
    key: t.text().notNull(),
    route: t.text().notNull(),
    senderId: t.text().notNull(),
    sms: t.text().notNull(),
    templateId: t.text().notNull(),
    isActive: t.boolean().notNull().default(true),
}));