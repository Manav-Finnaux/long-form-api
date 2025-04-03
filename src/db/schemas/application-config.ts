import { pgTable } from "drizzle-orm/pg-core";


export const applicationConfigsTable = pgTable("application_configs", (t) => ({
    id: t.boolean().primaryKey().notNull().default(true),
    applicationRejectedDays: t.integer().notNull().default(60),
    allowApplicationCreationOnCompleted: t.boolean().notNull().default(false),
}));