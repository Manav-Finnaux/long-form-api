import { pgTable } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";


export const tokenTable = pgTable("token", (t) => ({
    id: t.uuid().primaryKey().$defaultFn(() => crypto.randomUUID()),
    target: encryptedText().notNull(),
    token: t.text().notNull(),
    tokenExpireAt: t.timestamp({ mode: "string", withTimezone: true }).notNull()
}));