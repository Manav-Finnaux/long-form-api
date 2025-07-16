import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { encryptedText } from "../custom-data-types";
import { genderEnum } from "./enums";

export const longFormTable = pgTable("longFormTable", (db) => ({
    id: db.uuid().primaryKey().$defaultFn(() => crypto.randomUUID()),

    // Step 1: Personal Info
    name: db.text(),
    fatherName: db.text(),
    dob: db.timestamp({ mode: "string", withTimezone: true }),
    gender: genderEnum(),
    mobileNo: encryptedText(),
    isMobileOtpVerified: db.boolean().default(false),
    personalEmail: encryptedText(),
    isPersonalEmailOtpVerified: db.boolean().default(false),

    // Step 2: Address Details
    address1: db.text(),
    address2: db.text(),
    landmark: db.text(),
    pinCode: db.text(),
    area: db.text(),
    district: db.text(),
    state: db.text(),

    // Step 3: Document Upload
    aadhaarNo: encryptedText(),
    panNo: encryptedText(),
    profilePicture: db.text(),
    aadhaarFront: db.text(),
    aadhaarBack: db.text(),
    panCard: db.text(),
    termsAccepted: db.boolean().default(false),

    // Step 4: Income Details
    incomeType: db.text(),
    organizationName: db.text(),
    designation: db.text(),
    monthlyIncome: db.doublePrecision(),
    workingYears: db.doublePrecision(),
    salarySlips: db.jsonb().$type<string[]>(),
    officeEmail: encryptedText(),
    isOfficeEmailVerified: db.boolean().default(false),
    employmentProofDocument: db.text(),

    // Step 5: Loan Details
    loanAmount: db.doublePrecision(),
    loanPeriod: db.integer(),
    bankAccountNo: db.text(), // because integer & bigint will ignore leading zeros
    ifscCode: db.text(),
    bankName: db.text(),
    bankStatement: db.text(),

    // Step 6: Final Submission
    loanPurpose: db.text(),

    // meta
    createdAt: db.timestamp({ mode: "string", withTimezone: true }).defaultNow(),
    updatedAt: db.timestamp({ mode: "string", withTimezone: true }).$onUpdateFn(() => sql`now()`)
}))
