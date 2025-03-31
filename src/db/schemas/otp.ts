import { pgTable, varchar } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";


export const otpTable = pgTable("otp", (t) => ({
    target: encryptedText().primaryKey().notNull(),
    otp: varchar({ length: 255 }).notNull(),
    otpExpireAt: t.timestamp({ mode: "string", withTimezone: true }).notNull(),
}));