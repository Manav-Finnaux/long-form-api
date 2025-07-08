import { pgTable } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";


export const tokenTable = pgTable("token", (t) => ({
    target: encryptedText().primaryKey().notNull(),
    token: t.text().notNull(),
    tokenExpireAt: t.timestamp({ mode: "string", withTimezone: true }).notNull()
}));