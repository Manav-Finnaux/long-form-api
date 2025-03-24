import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

export const basicInfoSchema = yup.object({
    name: yup.string().trim().required(),
    phoneNumber: yup.string().trim().matches(Regex.PHONE_NUMBER, "Invalid Phone Number").required(),
    email: yup.string().trim().email().notRequired(),
    city: yup.string().trim().required(),
    wantWhatsappUpdates: yup.boolean().required().default(false),
    loanAmount: yup.number().min(0).required(),

    utmMedium: yup.string().trim(),
    utmSource: yup.string().trim(),
    utmContent: yup.string().trim(),
    utmCampaign: yup.string().trim(),



})

export const loanInfoSchema = yup.object({
    loanType: yup.string().required(),
    loanPurpose: yup.string().required(),
    loanAmount: yup.number().min(0).required(),
    loanTenure: yup.number().integer().min(1).required(),
})

export const documentInfoSchema = yup.object({
    panNumber: yup.string().required(),
    aadhaar: yup.string().required(),
})

export const verifyPhoneOtpSchema = yup.object({
    otp: yup.string().required(),
})

export const verifyAadhaarOtpSchema = yup.object({
    otp: yup.string().required(),
})

export const bankInfoSchema = yup.object({
    accountNumber: yup.string().required(),
    ifsc: yup.string().required(),
})