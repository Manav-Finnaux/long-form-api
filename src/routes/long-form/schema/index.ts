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
  name: yup.string().required().trim(),
  fatherName: yup.string().required().trim(),
  dob: yup.string().datetime().required(),
  gender: yup.string().oneOf(GENDER_VALUES).required(),
  mobileNo: yup.string().matches(Regex.PHONE_NUMBER, "Invalid Phone Number").required(),
})
export type createCookieSchemaType = yup.InferType<typeof createCookieSchema>

export const fileUploadSchema = yup.object({
  file: yup.mixed().nonNullable().required()
})

export type fileUploadSchemaType = yup.InferType<typeof fileUploadSchema>

export const fileTypeParamSchema = yup.object({
  fileType: yup.string().oneOf(['aadhaarFront', 'profilePicture', 'aadhaarBack', 'panCard', 'salarySlips', 'employmentProofDocument', 'bankStatement']).required()
})
export type fileTypeParamSchemaType = yup.InferType<typeof fileTypeParamSchema>

export const verifyDocumentNoSchema = yup.object({
  type: yup.string().oneOf(['aadhaarNo', 'panNo']).required(),
  value: yup.string().required()
    .when(
      'type', {
      is: 'aadhaarNo',
      then: (schema) => schema.matches(Regex.AADHAAR, "Invalid Aadhar"),
      otherwise: (schema) => schema.matches(Regex.PAN, "Invalid PAN"),
    }
    )
})
export type verifyDocumentNoSchemaType = yup.InferType<typeof verifyDocumentNoSchema>