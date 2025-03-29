import { db } from "@/db"
import { shortFormTable } from "@/db/schemas/short-form"
import ApiError from "@/lib/error-handler"
import { compareHash, generateOtp, getHashedValue } from "@/utils"
import axios from "axios"
import { and, eq } from "drizzle-orm"

const sendOtp = async (phoneNumber: string, otp?: string) => {
  const key = process.env.SMI_API_KEY
  const route = 1
  const senderId = process.env.SMS_API_SENDER_ID
  const sms = `${otp} is your OTP for Finnaux Login. Never disclose this OTP with anybody else. MSFIN Credit Pvt Ltd`
  const templateId = "1407170970390002027"
  const url = `http://sms.par-ken.com/api/smsapi?key=${key}&route=${route}&sender=${senderId}&number=${phoneNumber}(s)&sms=${sms}&templateid=${templateId}`

  axios.get(url);
}

const getOtpService = async (phoneNumber: string) => {
  const otp = generateOtp()
  // sendOtp(phoneNumber, otp);
  console.log(otp)
  const hashedOtp = await getHashedValue(otp)
  return hashedOtp
}


export async function saveBasicInfoService(data: any) {

  const { rows } = await db.transaction(async (tx) => {

    await tx.update(shortFormTable).set({ isActive: false })
      .where(
        and(
          eq(shortFormTable.phoneNumber, data.phoneNumber),
          eq(shortFormTable.status, "PENDING"),
        )
      )

    const rows = await tx.insert(shortFormTable).values(data).returning({ id: shortFormTable.id })

    return { rows }
  })

  return {
    message: "User created",
    data: { row: { id: rows[0].id } },
  }
}

export async function updateBasicInfoService(id: any, data: any) {

  const row = await db.select({ phoneNumber: shortFormTable.phoneNumber, isOtpVerified: shortFormTable.isOtpVerified }).from(shortFormTable).where(eq(shortFormTable.id, id))
  await db
    .update(shortFormTable)
    .set({
      ...data,
      isOtpVerified: row[0]?.phoneNumber === data.phoneNumber ? row[0]?.isOtpVerified : false
    })
    .where(and(eq(shortFormTable.isActive, true), eq(shortFormTable.id, id)))

  return { message: "User updated", data: null }

}

export async function sendMobileOtpService(id: any) {
  const [row] = await db
    .select({ phoneNumber: shortFormTable.phoneNumber })
    .from(shortFormTable)
    .where(eq(shortFormTable.id, id))

  if (!row.phoneNumber) {
    throw new ApiError(404, "User not found")
  }

  const hashedOtp = await getOtpService(row.phoneNumber)

  await db
    .update(shortFormTable)
    .set({ otp: hashedOtp })
    .where(eq(shortFormTable.id, id))

  return { message: "OTP Sent!", data: null }
}


export async function verifyMobileOtpService(id: any, data: any) {

  const rows = await db
    .select({ hashedOtp: shortFormTable.otp })
    .from(shortFormTable)
    .where(eq(shortFormTable.id, id))

  const row = rows[0]

  if (!row.hashedOtp) {
    throw new ApiError(404, "User not found")
  }

  const isMatch = await compareHash(data.otp, row.hashedOtp)
  if (!isMatch) throw new ApiError(400, "Invalid OTP")

  await db
    .update(shortFormTable)
    .set({ otp: null, isOtpVerified: true })
    .where(eq(shortFormTable.id, id))

  return { message: "OTP verified", data: null }
}

