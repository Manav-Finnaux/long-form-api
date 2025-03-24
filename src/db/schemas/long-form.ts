import { pgTable } from "drizzle-orm/pg-core";
import { applicationStatusEnum, maritalStatusEnum } from "./enums";


export const longFormTable = pgTable("long_form", (t) => ({

    //change id generation to uuid
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),

    firstName: t.text().notNull(),
    lastName: t.text(),
    dateOfBirth: t.date().notNull(),
    gender: t.text().notNull(),

    phoneNumber: t.varchar({ length: 10 }).notNull(),
    email: t.text(),

    aadhar: t.text().notNull(),
    pan: t.text().notNull(),
    maritalStatus: maritalStatusEnum().notNull(),

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


    purposeOfLoan: t.text().notNull(),
    loanAmount: t.numeric().notNull(),
    sourceOfIncome: t.text().notNull(),
    monthlyIncome: t.numeric().notNull(),
    jobProfile: t.text().notNull(),




    status: applicationStatusEnum().notNull().default("PENDING"),


    createdAt: t.timestamp({ mode: "date", withTimezone: true })
        .notNull()
        .defaultNow(),



    //utm fields
    utmMedium: t.text(),
    utmSource: t.text(),
    utmContent: t.text(),
    utmCampaign: t.text(),
}));