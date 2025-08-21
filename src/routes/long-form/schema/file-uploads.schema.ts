import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

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