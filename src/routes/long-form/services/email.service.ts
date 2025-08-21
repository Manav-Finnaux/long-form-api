import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import ApiError from "@/lib/error-handler"
import { renderConfirmationEmail, renderOtpEmail } from "@/lib/email-template"
import { generateOtp, saveToken, sendMail, verifyToken } from "@/utils"
import { eq } from "drizzle-orm"
import HttpStatus from "http-status"


export async function sendEmailOtpService(id: string, isPersonal: boolean) {
  const [row] = await db
    .select({ name: longFormTable.name, email: isPersonal ? longFormTable.personalEmail : longFormTable.officeEmail })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!row?.email || !row.name) {
    throw new ApiError(404, "User not found")
  }

  const otp = generateOtp()
  const html = await renderOtpEmail({ otp, name: row.name })
  const subject = 'Verify your email'
  await sendMail(row.email, subject, html)

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

export async function sendConfirmationEmail(id: string) {
  const [data] = await db
    .select({ personalEmail: longFormTable.personalEmail, name: longFormTable.name })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!data.name || !data.personalEmail) {
    throw new ApiError(HttpStatus.NOT_FOUND, "User not found")
  }

  const confirmationEmailTemplateHtml = await renderConfirmationEmail(data.name)

  await sendMail(data.personalEmail, 'Review in progress', confirmationEmailTemplateHtml)

  return { message: "Confirmation Email Sent" }
}