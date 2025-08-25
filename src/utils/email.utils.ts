import { renderOtpEmail } from "../lib/email-template"
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"
import nodemailer from 'nodemailer'
import { env } from "@/env"
import { Logger } from "@/lib/logger"

const sesClient = new SESv2Client({
  region: env.EMAIL_REGION,
  credentials: {
    accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY
  }
})

export const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand }
})

export async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `Northwestern Finance <${env.EMAIL_ID}>`,
    to,
    subject,
    html
  })
}

export async function sendEmailOtp(receiverEmailID: string, name: string, otp: string) {
  const sendEmailOtpLogger = new Logger('SendEmailOTP')
  try {
    const emailHtml = await renderOtpEmail({ otp, name });

    await sendMail(receiverEmailID, `Verify your email`, emailHtml)

    return { message: "OTP sent" };
  }
  catch (e: any) {
    sendEmailOtpLogger.error(e.message ?? 'Failed to send email OTP')
    return { message: 'Something went wrong!' }
  }
}