import { GENDER_VALUES } from "@/db/schemas/enums"
import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

export const step1Schema = yup.object({
  name: yup.string().required().trim(),
  fatherName: yup.string().required().trim(),
  dob: yup.string().datetime().required(),
  gender: yup.string().oneOf(GENDER_VALUES).required(),
  // mobileNo: yup.string().matches(Regex.PHONE_NUMBER, "Invalid Phone Number"),
  // personalEmail: yup.string().trim().email(),
}).stripUnknown()
export type step1Type = yup.InferType<typeof step1Schema>

export const step2Schema = yup.object({
  address1: yup.string().required().trim(),
  address2: yup.string().trim(),
  landmark: yup.string().required().trim(),
  pinCode: yup.string().required().trim().length(6),
  area: yup.string().required().trim(),
  district: yup.string().required().trim(),
  state: yup.string().required().trim(),
}).stripUnknown()
export type step2Type = yup.InferType<typeof step2Schema>


export const step3Schema = yup.object({
  aadhaarNo: yup.string().required().trim().matches(Regex.AADHAAR, "Invalid Aadhar"),
  panNo: yup.string().required().trim().matches(Regex.PAN, "Invalid PAN"),
  profilePicture: yup.mixed(),
  aadhaarFront: yup.mixed(),
  aadhaarBack: yup.mixed(),
  panCard: yup.mixed(),
  termsAccepted: yup.boolean().required(),
})
// .stripUnknown()
export type step3Type = yup.InferType<typeof step3Schema>

export const step4Schema = yup.object({
  incomeType: yup.string().required().trim(),
  organizationName: yup.string().required().trim(),
  designation: yup.string().required().trim(),
  monthlyIncome: yup.number().required().min(0),
  workingYears: yup.number().min(0.5).required(),
  // this can be improved
  salarySlips: yup
    .array()
    .min(1)
    .max(3)
    .required(),
  // employmentProofDocument: yup.mixed()
}).stripUnknown()
export type step4Type = yup.InferType<typeof step4Schema>

export const employmentProofSchema = yup.object({
  employmentProofDocument: yup.mixed()
}).stripUnknown()
export type employmentProofType = yup.InferType<typeof employmentProofSchema>


export const step5Schema = yup.object({
  loanAmount: yup.number().required().min(0),
  loanPeriod: yup.number().required().min(1).max(6),
  bankAccountNo: yup.string().required(),
  ifscCode: yup.string().required(),
  bankName: yup.string().required(),
  bankStatement: yup
    .array()
    .of(yup.string())
    .length(2)
    .required()
}).stripUnknown()
export type step5Type = yup.InferType<typeof step5Schema>


export const step6Schema = yup.object({
  loanPurpose: yup.string()
}).stripUnknown()
export type step6Type = yup.InferType<typeof step6Schema>

export const verifyTokenSchema = yup.object({
  otp: yup.string().required(),
  isPersonal: yup.boolean().required()
})

export const getMobileOtpSchema = yup.object({
  mobileNo: yup.string().required().matches(Regex.PHONE_NUMBER, "Invalid Phone Number"),
})

export const getEmailOtpSchema = yup.object({
  email: yup.string().required().trim().email(),
  isPersonal: yup.boolean().required(),
})

export const createCookieSchema = yup.object({
  mobileNo: yup.string().matches(Regex.PHONE_NUMBER, "Invalid Phone Number").required(),
})
export type createCookieType = yup.InferType<typeof createCookieSchema>