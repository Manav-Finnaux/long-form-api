import { pgTable } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";
import { applicationStatusEnum, maritalStatusEnum } from "./enums";


export const longFormTable = pgTable("long_form", (t) => ({

    //change id generation to uuid
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: t.text().notNull(),
    lastName: t.text(),
    dateOfBirth: t.date({ mode: "string" }).notNull(),
    gender: t.text().notNull(),
    phoneNumber: encryptedText().notNull(),
    email: t.text(),
    aadhar: encryptedText().notNull(),
    pan: encryptedText().notNull(),
    maritalStatus: maritalStatusEnum().notNull(),
    //relation
    relation: t.text().notNull(),
    relativeFirstName: t.text().notNull(),
    relativeLastName: t.text(),
    //address
    address: t.text().notNull(),
    pincode: t.text().notNull(),
    area: t.text().notNull(),
    block: t.text().notNull(),
    district: t.text().notNull(),
    state: t.text().notNull(),
    //loan details
    purposeOfLoan: t.text().notNull(),
    loanAmount: t.doublePrecision().notNull(),
    sourceOfIncome: t.text().notNull(),
    monthlyIncome: t.doublePrecision().notNull(),
    jobProfile: t.text().notNull(),
    status: applicationStatusEnum().notNull().default("PENDING"),
    //reason for update
    reason: t.text(),
    createdAt: t.timestamp({ mode: "string", withTimezone: true })
        .notNull()
        .defaultNow(),
    //utm fields
    utmMedium: t.text(),
    utmSource: t.text(),
    utmContent: t.text(),
    utmCampaign: t.text(),
    //employee details
    employeeId: t.text(),
    employeeName: t.text(),
    applicationNumber: t.text(),
    loanAccountNumber: t.text(),
}));