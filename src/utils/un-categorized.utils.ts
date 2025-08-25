import { LongFormTableType } from "@/db/schemas/long-form"
import { env } from "@/env";
import { default as Crypto } from 'crypto-js'


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

export function encryptToUrlSafe(id: string) {
  const encrypted = Crypto.AES.encrypt(id, env.CONTINUE_LOAN_APPLICATION_URL_KEY).toString()

  // Base64URL encode (replace +, /, remove =)
  return encrypted.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decryptFromUrlSafe(encryptedText: string) {
  // Convert back to normal Base64
  const base64 = encryptedText.replace(/-/g, "+").replace(/_/g, "/");

  const decrypted = Crypto.AES.decrypt(base64, env.CONTINUE_LOAN_APPLICATION_URL_KEY);
  return Crypto.enc.Utf8.stringify(decrypted);
} 