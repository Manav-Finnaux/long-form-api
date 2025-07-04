import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";
import { genderEnum } from "./enums";

export const longFormTable = pgTable("longFormTable", (db) => ({
    id: db.uuid().primaryKey().$defaultFn(() => crypto.randomUUID()),

    // Step 1: Personal Info
    name: db.text().notNull(),
    fatherName: db.text().notNull(),
    dob: db.timestamp({ mode: "string", withTimezone: true }).notNull(),
    gender: genderEnum().notNull(),
    mobileNo: encryptedText().notNull(),

    // Step 2: Email Verification
    personalEmail: db.text().notNull(),
    officeEmail: db.text(),

    // Step 3: Address Details
    address1: db.text().notNull(),
    address2: db.text(),
    landmark: db.text().notNull(),
    pinCode: db.text().notNull(),
    area: db.text().notNull(),
    district: db.text().notNull(),
    state: db.text().notNull(),

    // Step 4: Document Upload
    aadhaarNo: encryptedText().notNull(),
    panNo: encryptedText().notNull(),
    profilePicture: db.text().notNull(),
    aadhaarFront: db.text().notNull(),
    aadhaarBack: db.text().notNull(),
    panCard: db.text().notNull(),
    termsAccepted: db.boolean().default(false),

    // Step 5: Income Details
    incomeType: db.text().notNull(),
    organizationName: db.text().notNull(),
    designation: db.text().notNull(),
    monthlyIncome: db.doublePrecision().notNull(),
    workingYears: db.doublePrecision().notNull(),
    salarySlips: db.jsonb().$type<string[]>().notNull(),

    // Step 6: Loan Details
    loanAmount: db.doublePrecision().notNull(),
    loanPeriod: db.integer().notNull(),
    bankAccountNo: db.integer().notNull(),
    ifscCode: db.text().notNull(),
    bankName: db.text().notNull(),
    bankStatement: db.text().notNull(),

    // Step 7: Final Submission
    loanPurpose: db.text(),

    // meta
    createdAt: db.timestamp({ mode: "string", withTimezone: true }).defaultNow().notNull(),
    updatedAt: db.timestamp({ mode: "string", withTimezone: true }).$onUpdateFn(() => sql`now()`)
}))
