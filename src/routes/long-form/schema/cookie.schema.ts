import { GENDER_VALUES } from "@/db/schemas/enums"
import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

export const createCookieSchema = yup.object({
  name: yup.string().required().trim(),
  fatherName: yup.string().required().trim(),
  dob: yup.string().datetime().required(),
  gender: yup.string().oneOf(GENDER_VALUES).required(),
  mobileNo: yup.string().matches(Regex.PHONE_NUMBER, "Invalid Phone Number").required(),
})
export type createCookieSchemaType = yup.InferType<typeof createCookieSchema>

