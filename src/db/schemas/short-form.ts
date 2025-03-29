import { sql } from "drizzle-orm";
import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";
import { enquiryStatusEnum } from "./enums";


export const shortFormTable = pgTable("short_form", (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar({ length: 255 }).notNull(),
    phoneNumber: encryptedText().notNull(),
    email: t.text(),
    city: t.varchar({ length: 255 }).notNull(),
    loanAmount: t.numeric(),
    otp: varchar({ length: 255 }),
    isOtpVerified: boolean().notNull().default(false),
    otpExpireAt: t.timestamp({ mode: "string", withTimezone: true }),
    hasRequestedCallback: t.boolean().notNull().default(false),
    wantWhatsappUpdates: t.boolean().notNull().default(false),


    utmMedium: t.text(),
    utmSource: t.text(),
    utmContent: t.text(),
    utmCampaign: t.text(),
    isActive: t.boolean().notNull().default(true),
    status: enquiryStatusEnum().notNull().default("PENDING"),
    createdAt: t.timestamp({ mode: "string", withTimezone: true })
        .notNull()
        .defaultNow(),
    employeeName: t.text(),
    remarks: t.text(),
    updatedAt: t.timestamp({ mode: "string", withTimezone: true }).$onUpdateFn(() => sql`now()`),
}));