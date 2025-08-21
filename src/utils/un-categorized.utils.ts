import { LongFormTableType } from "@/db/schemas/long-form"

export function isFullyFilled(row: LongFormTableType) {
  if (!row.isOfficeEmailVerified && !row.employmentProofDocument) return false;
  const verifiableItemsArray: Partial<keyof LongFormTableType>[] = [
    "name",
    "fatherName",
    "dob",
    "gender",
    "mobileNo",
    "isMobileOtpVerified",
    "personalEmail",
    "isPersonalEmailOtpVerified",
    "address1",
    "landmark",
    "pinCode",
    "area",
    "district",
    "state",
    "aadhaarNo",
    "panNo",
    "profilePicture",
    "aadhaarFront",
    "aadhaarBack",
    "panCard",
    "termsAccepted",
    "organizationName",
    "designation",
    "monthlyIncome",
    "workingYears",
    "salarySlips",
    "loanAmount",
    "loanPeriod",
    "bankAccountNo",
    "ifscCode",
    "bankName",
    "bankStatement",
    "preferredEmiDate"
  ]

  return verifiableItemsArray.every((item) => !!row[item])
}