import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

export const basicInfoSchema = yup.object({
    name: yup.string().trim().required(),
    phoneNumber: yup.string().trim().matches(Regex.PHONE_NUMBER, "Invalid Phone Number").required(),
    email: yup.string().trim().email().notRequired(),
    city: yup.string().trim().required(),
    wantWhatsappUpdates: yup.boolean().required().default(false),
    loanAmount: yup.number().min(0).required(),

    utmMedium: yup.string().notRequired().trim(),
    utmSource: yup.string().notRequired().trim(),
    utmContent: yup.string().notRequired().trim(),
    utmCampaign: yup.string().notRequired().trim(),
})

export const verifyPhoneOtpSchema = yup.object({
    otp: yup.string().required(),
})