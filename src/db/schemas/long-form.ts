import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";
import { applicationStatusEnum, maritalStatusEnum } from "./enums";


export const longFormTable = pgTable("long_form", (t) => ({

    //change id generation to uuid
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: t.text().notNull(),
    lastName: t.text(),
    dob: t.timestamp({ mode: "string", withTimezone: true }).notNull(),
    gender: t.text().notNull(),
    mobileNo: encryptedText().notNull(),
    email: t.text(),
    aadharNo: encryptedText().notNull(),
    panNo: encryptedText().notNull(),

    //marital status
    mStatus: maritalStatusEnum().notNull(),
    //relation
    relation: t.text().notNull(),
    relativeFirstName: t.text().notNull(),
    relativeLastName: t.text(),
    //address
    address: t.text().notNull(),
    pinCode: t.text().notNull(),
    area: t.text().notNull(),
    city: t.text().notNull(),
    district: t.text().notNull(),
    state: t.text().notNull(),
    //loan details
    purposeOfLoan: t.text().notNull(),
    loanRequired: t.doublePrecision().notNull(),
    sourceOfIncome: t.text().notNull(),
    monthlyIncome: t.doublePrecision().notNull(),
    jobProfile: t.text().notNull(),
    status: applicationStatusEnum().notNull().default("PENDING"),
    //reason for update
    reason: t.text(),

    createdAt: t.timestamp({ mode: "string", withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: t.timestamp({ mode: "string", withTimezone: true }).$onUpdateFn(() => sql`now()`),
    //utm fields
    utmMedium: t.text(),
    utmSource: t.text(),
    utmContent: t.text(),
    utmCampaign: t.text(),
    //employee details
    employeeId: t.text(),
    employeeName: t.text(),
    applicationNo: t.text(),
    loanNo: t.text(),

}));