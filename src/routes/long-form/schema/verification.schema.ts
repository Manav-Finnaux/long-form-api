import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

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