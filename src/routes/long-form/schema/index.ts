import { GENDER_VALUES } from "@/db/schemas/enums"
import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

export const step1Schema = yup.object({
    name: yup.string().required().trim(),
    fatherName: yup.string().required().trim(),
    dob: yup.string().datetime().required(),
    gender: yup.string().oneOf(GENDER_VALUES).required(),
    mobileNo: yup.string().required().matches(Regex.PHONE_NUMBER, "Invalid Phone Number"),
}).stripUnknown()
export type step1Type = yup.InferType<typeof step1Schema>

export const step2Schema = yup.object({
    personalEmail: yup.string().required().trim().email(),
    officeEmail: yup.string().trim().email(),
    officeEmailVerificationLinkSent: yup.boolean().required()
}).stripUnknown()
export type step2Type = yup.InferType<typeof step2Schema>

export const step3Schema = yup.object({
    address1: yup.string().required().trim(),
    address2: yup.string().trim(),
    landmark: yup.string().required().trim(),
    pinCode: yup.string().required().trim().length(6),
    area: yup.string().required().trim(),
    district: yup.string().required().trim(),
    state: yup.string().required().trim(),
}).stripUnknown()
export type step3Type = yup.InferType<typeof step3Schema>


export const step4Schema = yup.object({
    aadharNo: yup.string().required().trim().matches(Regex.AADHAAR, "Invalid Aadhar"),
    panNo: yup.string().required().trim().matches(Regex.PAN, "Invalid PAN"),
    profilePicture: yup.string().required().trim().url(),
    aadhaarFront: yup.string().required().trim().url(),
    aadhaarBack: yup.string().required().trim().url(),
    panCard: yup.string().required().trim().url(),
    termsAccepted: yup.boolean().required(),
}).stripUnknown()
export type step4Type = yup.InferType<typeof step4Schema>


export const step5Schema = yup.object({
    incomeType: yup.string().required().trim(),
    organizationName: yup.string().required().trim(),
    designation: yup.string().required().trim(),
    monthlyIncome: yup.number().required().min(0),
    workingYears: yup.number().min(0.5).required(),
    salarySlips: yup.array().of(yup.string()).length(3).required(),
}).stripUnknown()
export type step5Type = yup.InferType<typeof step5Schema>


export const step6Schema = yup.object({
    loanAmount: yup.number().required().min(0),
    loanPeriod: yup.number().required().min(6),
    bankAccountNumber: yup.number().required(),
    ifscCode: yup.string().required(),
    bankName: yup.string().required(),
    bankStatement: yup.string().required(),
}).stripUnknown()
export type step6Type = yup.InferType<typeof step6Schema>


export const step7Schema = yup.object({
    loanPurpose: yup.string()
}).stripUnknown()
export type step7Type = yup.InferType<typeof step7Schema>

export const verifyTokenSchema = yup.object({
    token: yup.string().required(),
})

export const getMobileOtpSchema = yup.object({
    mobileNo: yup.string().required().matches(Regex.PHONE_NUMBER, "Invalid Phone Number"),
})

export const getEmailOtpSchema = yup.object({
    personalEmail: yup.string().required().trim().email(),
})