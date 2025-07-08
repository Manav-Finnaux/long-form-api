import { db } from "@/db"
import { longFormTable } from "@/db/schemas/long-form"
import ApiError from "@/lib/error-handler"
import { saveToken, sendEmailOtp, sendMobileOtp, sendOfficialMailVerificationLink, verifyToken } from "@/verification-service"
import { generateOtp, generateVerificationToken } from "@/utils"
import { eq } from "drizzle-orm"
import HttpStatus from "http-status"

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

  await verifyToken(data.token as string, row.mobileNo as string)
  await db
    .update(longFormTable)
    .set({ isMobileOtpVerified: true })
    .where(eq(longFormTable.id, id))

  return { message: "OTP verified", data: null, verificationSuccessful: true }
}

export async function sendEmailOtpService(id: string) {
  const [row] = await db
    .select({ personalEmail: longFormTable.personalEmail })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!row?.personalEmail) {
    throw new ApiError(404, "User not found")
  }

  const otp = generateOtp()
  await sendEmailOtp(row.personalEmail, otp)
  await saveToken(row.personalEmail, otp, new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes

  return { message: "OTP Sent!", data: null }
}

export async function verifyEmailOtpService(id: any, otp: string) {
  const [row] = await db
    .select({ personalEmail: longFormTable.personalEmail })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  await verifyToken(otp, row.personalEmail as string)

  await db
    .update(longFormTable)
    .set({ isPersonalEmailOtpVerified: true })
    .where(eq(longFormTable.id, id))

  return { message: "OTP verified", data: null, verificationSuccessful: true }
}

export async function sendOfficialMailVerificationLinkService(id: string) {
  const [{ officeEmail }] = await db
    .select({
      officeEmail: longFormTable.officeEmail
    })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (!officeEmail) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'User not found')
  }

  const token = generateVerificationToken()
  await sendOfficialMailVerificationLink(officeEmail, token)
  await saveToken(officeEmail as string, token, new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24 hours

  return { message: 'Verification mail sent!', data: null }
}

export async function verifyOfficialEmailService(id: string, token: string) {
  const [row] = await db
    .select({ officeEmail: longFormTable.officeEmail })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  await verifyToken(token, row.officeEmail as string)

  await db
    .update(longFormTable)
    .set({ isOfficeEmailVerified: true })
    .where(eq(longFormTable.id, id))

  return { message: "Office email verified", data: null }
}



export async function saveStep1DataService(data: any, step: number) {
  return await db.transaction(async (tx) => {
    const rows = await tx.insert(longFormTable).values(data).returning({ id: longFormTable.id })

    return step === 1 ? { message: "data added successfully", data: rows[0], sendOtp: true } : { message: "data added successfully", data: rows[0] }
  })
}

export async function updateStep1DataService(id: string, data: any, step: number) {
  const row = await db
    .select({
      mobileNo: longFormTable.mobileNo,
      isMobileOtpVerified: longFormTable.isMobileOtpVerified
    })
    .from(longFormTable)
    .where(eq(longFormTable.id, id))

  if (row.length === 0) throw new ApiError(HttpStatus.NOT_FOUND, 'User not found')

  const isMobileOtpVerified = row[0]?.mobileNo === data.mobileNo ? row[0]?.isMobileOtpVerified : false

  await db
    .update(longFormTable)
    .set({ ...data, isMobileOtpVerified })
    .where(eq(longFormTable.id, id))

  return step === 1 ? { message: "User updated", data: null, sendOtp: isMobileOtpVerified } : { message: "User updated", data: null }
}

export async function savePersonalEmailService(id: string, personalEmail: string) {
  await db
    .update(longFormTable)
    .set({
      personalEmail,
      isPersonalEmailOtpVerified: false
    })
    .where(eq(longFormTable.id, id))
    .returning({
      id: longFormTable.id,
      personalEmail: longFormTable.personalEmail,
    })

  return { message: "Personal email added", data: { sendOtp: true } }
}

export async function saveOfficeEmailService(id: string, officeEmail: string) {
  await db
    .update(longFormTable)
    .set({
      officeEmail,
      isOfficeEmailVerified: false
    })
    .where(eq(longFormTable.id, id))
    .returning({
      id: longFormTable.id,
      officeEmail: longFormTable.officeEmail,
    })

  return { message: "Office email added", data: { sendVerificationLink: true } }
}