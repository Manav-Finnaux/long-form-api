import { createEnum } from "../util"


export const {
    enum: EnquiryStatusEnum,
    values: ENQUIRY_STATUS_VALUES,
    pgEnum: enquiryStatusEnum
} = createEnum({
    name: "enquiryStatus",
    values: ["PENDING", "CALLED", "PROCESSED"]
})

export const {
    enum: ApplicationStatusEnum,
    values: APPLICATION_STATUS_VALUES,
    pgEnum: applicationStatusEnum
} = createEnum({
    name: "applicationStatus",
    values: ["PENDING", "IN_PROGRESS", "REJECTED", "COMPLETED", "CLOSED", "HOLD"]
})

export const {
    enum: GenderEnum,
    values: GENDER_VALUES,
    pgEnum: genderEnum
} = createEnum({
    name: "gender",
    values: ["MALE", "FEMALE", "OTHER"]
})


export const {
    enum: MaritalStatusEnum,
    values: MARITAL_STATUS_VALUES,
    pgEnum: maritalStatusEnum
} = createEnum({
    name: "maritalStatus",
    values: ["MARRIED", "SINGLE", "DIVORCED", "WIDOWED", "SEPARATED"]
})
