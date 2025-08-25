import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import { env } from "@/env"
import ApiError from "@/lib/error-handler"
import { Logger } from "@/lib/logger"
import yup from "@/lib/yup"
import { yupValidator } from "@/lib/yup/validator"
import { decryptFromUrlSafe, isFullyFilled } from "@/utils"
import { eq, sql } from "drizzle-orm"

import { Hono } from "hono"
import { setCookie } from "hono/cookie"
import { sign } from "hono/jwt"
import HttpStatus from "http-status"

const app = new Hono()

app.get(
  "/:token",
  yupValidator("param", yup.object({ token: yup.string().required() })),
  async (c) => {
    const continueFormLogger = new Logger('ContinueFormLogger')
    const { token } = c.req.valid("param");

    // * decrypt encrypted id
    const id = decryptFromUrlSafe(token)

    // * check if id is of the form of an UUID
    const schema = yup.object({
      id: yup.string().uuid().required()
    })
    try {
      await schema.validate({ id })
    }
    catch (e: any) {
      continueFormLogger.error(e.message ?? "id could not be validated; it was not UUID")
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid request parameters.');
    }

    // * verify if this id exists in db or not
    const [row] = await db
      .select({
        // Step 1: Personal Info
        name: longFormTable.name,
        fatherName: longFormTable.fatherName,
        dob: longFormTable.dob,
        gender: longFormTable.gender,
        mobileNo: longFormTable.mobileNo,
        mobileVerified: longFormTable.isMobileOtpVerified,
        personalEmail: longFormTable.personalEmail,
        personalEmailVerified: longFormTable.isPersonalEmailOtpVerified,

        // Step 2: Income Details
        incomeType: longFormTable.incomeType,
        designation: longFormTable.designation,
        monthlyIncome: longFormTable.monthlyIncome,
        workingYears: longFormTable.workingYears,

        // Step 3: Loan Details
        loanAmount: longFormTable.loanAmount,
        loanPeriod: longFormTable.loanPeriod,
        loanPurpose: longFormTable.loanPurpose,
        preferredEmiDate: longFormTable.preferredEmiDate,
        bankAccountNo: longFormTable.bankAccountNo,
        ifscCode: longFormTable.ifscCode,
        bankName: longFormTable.bankName,

        // Step 4: Address
        address1: longFormTable.address1,
        address2: longFormTable.address2,
        landmark: longFormTable.landmark,
        pinCode: longFormTable.pinCode,
        area: longFormTable.area,
        district: longFormTable.district,
        state: longFormTable.state,

        // Step 5: Document Uploads
        aadhaarNo: longFormTable.aadhaarNo,
        canProceedWithAadhaarNo: sql<boolean>`false`,
        panNo: longFormTable.panNo,
        canProceedWithPanNo: sql<boolean>`false`,
        isProfilePictureUploaded: sql<boolean>`${longFormTable.profilePicture} is not null`,
        isAadhaarFrontUploaded: sql<boolean>`${longFormTable.aadhaarFront} is not null`,
        isAadhaarBackUploaded: sql<boolean>`${longFormTable.aadhaarBack} is not null`,
        isPanCardUploaded: sql<boolean>`${longFormTable.panCard} is not null`,
        termsAccepted: longFormTable.termsAccepted,

        // Step 6: Company details
        organizationName: longFormTable.organizationName,
        officeEmail: longFormTable.officeEmail,
        officeEmailVerified: longFormTable.isOfficeEmailVerified,
        isSalarySlipsUploaded: sql<boolean>`${longFormTable.salarySlips} is not null`,
        isBankStatementUploaded: sql<boolean>`${longFormTable.bankStatement} is not null`,

        // Step 6-b
        isEmploymentProofDocumentUploaded: sql<boolean>`${longFormTable.employmentProofDocument} is not null`,

        // meta
        lastFilledStep: longFormTable.stepsCompleted,
        isFullyFilled: longFormTable.isFullyFilled
      })
      .from(longFormTable)
      .where(eq(longFormTable.id, id))

    // * if no, throw error ortherwise create cookie from this id
    if (!row) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found')
    }

    if (row.isFullyFilled) {
      throw new ApiError(HttpStatus.CONFLICT, 'Form already filled.')
    }

    const jwt = await sign(
      { id },
      env.ANONYMOUS_CUSTOMER_JWT_SECRET
    )

    setCookie(c, env.COOKIE_NAME, jwt, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      expires: new Date(Date.now() + 1000 * 60 * 60), // 60 minutes
    })

    // * send ok!
    return c.json({ data: row }, HttpStatus.OK)
  }
)

export { app as continueForm }