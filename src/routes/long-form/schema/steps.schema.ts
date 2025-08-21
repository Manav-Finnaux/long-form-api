import { GENDER_VALUES } from "@/db/schemas/enums"
import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

// personal details - excluding ph no and personal email
export const step1Schema = yup.object({
  name: yup.string().required().trim(),
  fatherName: yup.string().required().trim(),
  dob: yup.string().datetime().required(),
  gender: yup.string().oneOf(GENDER_VALUES).required(),
}).stripUnknown()
export type step1Type = yup.InferType<typeof step1Schema>

// income details part 1
export const step2Schema = yup.object({
  incomeType: yup.string().required().trim(),
  designation: yup.string().required().trim(),
  monthlyIncome: yup.number().required().min(0),
  workingYears: yup.number().min(0.5).required()
}).stripUnknown()
export type step2Type = yup.InferType<typeof step2Schema>

// loan and bank details
export const step3Schema = yup.object({
  loanAmount: yup.number().required().min(0),
  loanPeriod: yup.number().required().min(1).max(6),
  loanPurpose: yup.string().required(),
  preferredEmiDate: yup.number().oneOf([5, 10, 15, 20, 25]).required(),
  bankAccountNo: yup.string().required(),
  ifscCode: yup.string().required(),
  bankName: yup.string().required(),
})
  .stripUnknown()
export type step3Type = yup.InferType<typeof step3Schema>

// address
export const step4Schema = yup.object({
  address1: yup.string().required().trim(),
  address2: yup.string().trim(),
  landmark: yup.string().required().trim(),
  pinCode: yup.string().required().trim().length(6),
  area: yup.string().required().trim(),
  district: yup.string().required().trim(),
  state: yup.string().required().trim(),
}).stripUnknown()
export type step4Type = yup.InferType<typeof step4Schema>

// documents - excluding file uploads
export const step5Schema = yup.object({
  aadhaarNo: yup.string().required().trim().matches(Regex.AADHAAR, "Invalid Aadhar"),
  panNo: yup.string().required().trim().matches(Regex.PAN, "Invalid PAN"),
  termsAccepted: yup.boolean().required(),
}).stripUnknown()
export type step5Type = yup.InferType<typeof step5Schema>

// employment details - part 2 | officeEmail and file uploads in different route
export const step6Schema = yup.object({
  organizationName: yup.string().required().trim(),
}).stripUnknown()
export type step6Type = yup.InferType<typeof step6Schema>