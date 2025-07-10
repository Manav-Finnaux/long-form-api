import { db } from "@/db";
import { tokenTable } from "@/db/schemas/token";
import { env } from "@/env";
import ApiError from "@/lib/error-handler";
import { compareHash, getHashedValue } from "@/utils";
import axios from "axios";
import { eq } from "drizzle-orm";
import nodemailer from 'nodemailer';
import { renderOtpEmail, renderVerificationLinkEmail } from "./email-template";

export async function saveToken(target: string, otp: string, otpExpireAt: Date) {
  const hashedOtp = await getHashedValue(otp);
  const otpExpireAtIso = new Date(otpExpireAt).toISOString();
  const rows = await db
    .insert(tokenTable)
    .values({ target, token: hashedOtp, tokenExpireAt: otpExpireAtIso })
    .onConflictDoUpdate({
      set: { token: hashedOtp, tokenExpireAt: otpExpireAtIso },
      target: tokenTable.id,
    })
    .returning({ id: tokenTable.id });

  return rows[0].id
}

export async function verifyToken(token: string, target: string) {
  const [row] = await db.select().from(tokenTable).where(eq(tokenTable.target, target));

  if (!row) {
    throw new ApiError(400, "Token not found");
  }
  if (new Date(row.tokenExpireAt) < new Date()) {
    throw new ApiError(400, "Token expired, please generate new token.");
  }

  const isValid = await compareHash(token, row.token);
  if (!isValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  const [tokenRow] = await db.delete(tokenTable).where(eq(tokenTable.target, target)).returning()
  console.log({ tokenRow })

  return true;
}

export async function verifyOfficialEmail(id: string, token: string) {
  const [row] = await db.select().from(tokenTable).where(eq(tokenTable.id, id))

  if (!row) {
    throw new ApiError(400, "Token not found");
  }
  if (new Date(row.tokenExpireAt) < new Date()) {
    throw new ApiError(400, "Token expired, please generate new token.");
  }

  const isValid = await compareHash(token, row.token);
  if (!isValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  const [magicLinkRow] = await db.delete(tokenTable).where(eq(tokenTable.id, id)).returning()
  console.log({ magicLinkRow })

  return true;
}

export async function sendMobileOtp(mobileNo: string, otp: string) {
  // extract these to .env OR even better, create a table and store it there
  const key = '9997e7329aa372c275648410a5637f64'
  const route = '1'
  const senderId = 'MSFINP'
  const sms = "{otp} is your OTP for Finnaux Login. Never disclose this OTP with anybody else. MSFIN Credit Pvt Ltd ".replace("{otp}", otp);
  const templateId = '1407170970390002027'
  const url = `http://sms.par-ken.com/api/smsapi?key=${key}&route=${route}&sender=${senderId}&number=${mobileNo}(s)&sms=${sms}&templateid=${templateId}`

  axios.get(url);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_ID,
    pass: env.GOOGLE_APP_PASSWORD,
  },
});

export async function sendEmailOtp(personalEmail: string, otp: string) {
  try {
    const emailHtml = await renderOtpEmail({ otp });
    const subject = `Your OTP code`;

    await transporter.sendMail({
      from: env.GMAIL_ID,
      to: personalEmail,
      subject,
      html: emailHtml
    });

    return { message: "OTP sent" };
  }
  catch (e) {
    console.log(e);
    return { message: 'Something went wrong!' }
  }
}

export async function sendOfficialMailVerificationLink(officeEmail: string, token: string, tokenId: string) {
  try {
    const verificationUrl = `${env.SERVER_URL}/long-form/verification/verify-office-email/${tokenId}@${token}`
    const emailHtml = await renderVerificationLinkEmail({ verificationUrl });
    const subject = `Verify your email`;

    await transporter.sendMail({
      from: env.GMAIL_ID,
      to: officeEmail,
      subject,
      html: emailHtml
    });

    return { message: 'Verification link sent' };
  }
  catch (e) {
    console.log(e);
    return { message: 'Something went wrong!' }
  }
}