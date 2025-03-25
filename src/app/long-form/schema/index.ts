import { MARITAL_STATUS_VALUES } from "@/db/schemas/enums"
import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

export const longFormSchema = yup.object({
    firstName: yup.string().required().trim(),
    lastName: yup.string().trim(),
    dateOfBirth: yup.string().datetime().required(),
    gender: yup.string().required().trim(),
    phoneNumber: yup.string().required().matches(Regex.PHONE_NUMBER, "Invalid Phone Number"),
    email: yup.string().required().trim().email(),
    aadhar: yup.string().required().trim().matches(Regex.AADHAAR, "Invalid Aadhar"),
    pan: yup.string().required().trim().matches(Regex.PAN, "Invalid PAN"),
    maritalStatus: yup.string().oneOf(MARITAL_STATUS_VALUES).required(),
    relation: yup.string().required().trim(),
    relativeFirstName: yup.string().required().trim(),
    relativeLastName: yup.string().trim(),
    address: yup.string().required().trim(),
    pincode: yup.string().required().trim().length(6),
    area: yup.string().required().trim(),
    block: yup.string().required().trim(),
    district: yup.string().required().trim(),
    state: yup.string().required().trim(),
    purposeOfLoan: yup.string().required().trim(),
    loanAmount: yup.number().required().min(0),
    sourceOfIncome: yup.string().required().trim(),
    monthlyIncome: yup.number().required().min(0),
    jobProfile: yup.string().required().trim(),
    utmMedium: yup.string().trim(),
    utmSource: yup.string().trim(),
    utmContent: yup.string().trim(),
    utmCampaign: yup.string().trim()
})

export const verifyPhoneOtpSchema = yup.object({
    otp: yup.string().required(),
})