import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import ApiError from "@/lib/error-handler"
import { generateOtp, transporter } from "@/utils"
import { saveToken, sendEmailOtp, sendMobileOtp, verifyToken } from "@/verification-service"
import { eq } from "drizzle-orm"
import HttpStatus from "http-status"
import { createCookieSchemaType } from "./schema"
import { env } from "@/env"
import { renderConfirmationEmail, renderOtpEmail } from "@/verification-service/email-template"

export async function sendMobileOtpService(id: string) {
  const [row] = await db
    .select({ mobileNo: longFormTable.mobileNo })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!row?.mobileNo) {
    throw new ApiError(404, "User not found")
  }

  const otp = generateOtp()
  await sendMobileOtp(row.mobileNo, otp)
  await saveToken(row.mobileNo, otp, new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes

  return { message: "OTP Sent!", data: null }
}

export async function verifyMobileOtpService(id: any, data: any) {
  const [row] = await db
    .select({ mobileNo: longFormTable.mobileNo })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  await verifyToken(data.otp as string, row.mobileNo as string)
  await db
    .update(longFormTable)
    .set({ isMobileOtpVerified: true })
    .where(eq(longFormTable.id, id))

  return { message: "OTP verified", data: { verificationSuccessful: true } }
}

export async function sendEmailOtpService(id: string, isPersonal: boolean) {
  const [row] = await db
    .select({ name: longFormTable.name, email: isPersonal ? longFormTable.personalEmail : longFormTable.officeEmail })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!row?.email || !row.name) {
    throw new ApiError(404, "User not found")
  }

  const otp = generateOtp()
  await sendEmailOtp(row.email, row.name, otp)
  await saveToken(row.email, otp, new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes

  return { message: "OTP Sent!", data: null }
}

type VerifyEmailOtpServiceType = {
  id: string
  otp: string
  isPersonal: boolean
}
export async function verifyEmailOtpService({ id, otp, isPersonal }: VerifyEmailOtpServiceType) {
  const [row] = await db
    .select({ email: isPersonal ? longFormTable.personalEmail : longFormTable.officeEmail })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  await verifyToken(otp, row.email as string)

  await db
    .update(longFormTable)
    .set(isPersonal ? { isPersonalEmailOtpVerified: true } : { isOfficeEmailVerified: true })
    .where(eq(longFormTable.id, id))

  return { message: "OTP verified", data: { verificationSuccessful: true } }
}

type SaveEmailServiceType = {
  id: string
  email: string
  isPersonal: boolean
}
export async function saveEmailService({ id, email, isPersonal }: SaveEmailServiceType) {
  await db.transaction(async (tx) => {
    const [isMobileVerified] = await tx.select({ isMobileVerified: longFormTable.isMobileOtpVerified }).from(longFormTable)

    if (!isMobileVerified) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Mobile number is not verified.")
    }

    const emailData = isPersonal ?
      {
        personalEmail: email,
        isPersonalEmailOtpVerified: false
      } :
      {
        officeEmail: email,
        isOfficeEmailVerified: false
      };

    await tx
      .update(longFormTable)
      .set(emailData)
      .where(eq(longFormTable.id, id))
      .returning({
        id: longFormTable.id,
        personalEmail: longFormTable.personalEmail,
      })
  })

  return {
    message: `${isPersonal ? "Personal" : "Office"} email added`,
    data: { sendOtp: true }
  }
}

export async function saveStep1Data(data: createCookieSchemaType): Promise<{ id: string }> {
  const rows = await db.insert(longFormTable).values(data).returning({ id: longFormTable.id })

  return { id: rows[0].id }
}

export async function updateStep1Data(id: string, data: createCookieSchemaType) {
  const rows = await db
    .update(longFormTable)
    .set(data)
    .where(eq(longFormTable.id, id))
    .returning({ id: longFormTable.id })

  return { id: rows[0].id }
}

export async function sendConfirmationEmail(id: string) {
  const [data] = await db
    .select({ personalEmail: longFormTable.personalEmail, name: longFormTable.name })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!data.name || !data.personalEmail) {
    throw new ApiError(HttpStatus.NOT_FOUND, "User not found")
  }

  const confirmationEmailTemplateHtml = await renderConfirmationEmail(data.name)

  await transporter.sendMail({
    from: `Northwestern Finance <${env.EMAIL_ID}>`,
    to: data.personalEmail,
    subject: 'Review in progress',
    html: confirmationEmailTemplateHtml
  })

  return { message: "Confirmation Email Sent" }
}