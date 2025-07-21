import { applicationStatusEnum } from "@/db/schemas/enums";
import yup from "@/lib/yup";

// export const getDataInDateRange = yup.object({
//   from: yup
//     .string()
//     .required('From timestamp is required')
//     .datetime({ allowOffset: false, message: 'From must be a valid ISO datetime in UTC (Z)' }),

//   to: yup
//     .string()
//     .required('To timestamp is required')
//     .datetime({ allowOffset: false, message: 'To must be a valid ISO datetime in UTC (Z)' }),
// });

export const getLongFormData = yup.object({
  from: yup.date().required(),
  to: yup.date().required().min(yup.ref("from"), `The "to" query should be greater than or equal to "from" query`),
})

export type getLongFormDataType = yup.InferType<typeof getLongFormData>

export const putLongFormData = yup.object({
  id: yup.string().uuid().required("ID is required."),
  status: yup.string().oneOf(applicationStatusEnum.enumValues, "Invalid status value").required(),
  applicationNumber: yup.string(),
  loanAccountNumber: yup.string(),
  reason: yup.string(),
  employeeName: yup.string(),
})
  .stripUnknown()

export type putLongFormDataType = yup.InferType<typeof putLongFormData>