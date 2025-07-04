import { GENDER_VALUES, MARITAL_STATUS_VALUES } from "@/db/schemas/enums"
import { Regex } from "@/lib/regex"
import yup from "@/lib/yup"

export const longFormSchema = yup.object({
    name: yup.string().required().trim(),
    fatherName: yup.string().required().trim(),
    dob: yup.string().datetime().required(),
    gender: yup.string().oneOf(GENDER_VALUES).required(),
    mobileNo: yup.string().required().matches(Regex.PHONE_NUMBER, "Invalid Phone Number"),

    personalEmail: yup.string().required().trim().email(),
    officeEmail: yup.string().required().trim().email(),

    address1: yup.string().required().trim(),
    address2: yup.string().trim(),
    landmark: yup.string().required().trim(),
    pinCode: yup.string().required().trim().length(6),
    area: yup.string().required().trim(),
    district: yup.string().required().trim(),
    state: yup.string().required().trim(),

    aadharNo: yup.string().required().trim().matches(Regex.AADHAAR, "Invalid Aadhar"),
    panNo: yup.string().required().trim().matches(Regex.PAN, "Invalid PAN"),
    profilePicture: yup.string().required().trim().url(),
    aadhaarFront: yup.string().required().trim().url(),
    aadhaarBack: yup.string().required().trim().url(),
    panCard: yup.string().required().trim().url(),
    termsAccepted: yup.boolean().required(),

    incomeType: yup.string().required().trim(),
    organizationName: yup.string().required().trim(),
    designation: yup.string().required().trim(),
    monthlyIncome: yup.number().required().min(0),
    workingYears: yup.number().min(0.5).required(),
    salarySlips: yup.array().of(yup.string()).length(3).required(),

    loanAmount: yup.number().required().min(0),
    loanPeriod: yup.number().required().min(6),
    bankAccountNumber: yup.number().required(),
    ifscCode: yup.string().required(),
    bankName: yup.string().required(),
    bankStatement: yup.string().required(),

    loanPurpose: yup.string()
})

export const verifyOtpSchema = yup.object({
    otp: yup.string().required(),
})