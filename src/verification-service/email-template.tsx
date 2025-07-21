/** @jsxImportSource react */
import { Html, Head, Preview, Body, Container, Text, Section, render, Button, Link, Hr, Heading } from "@react-email/components";

type OtpEmailType = { name?: string; otp: string }

function OtpEmail({ name = "", otp }: OtpEmailType) {
  const mainOtp = { backgroundColor: "#f6f9fc", fontFamily: "Helvetica, Arial, sans-serif", padding: "20px" };
  const containerOtp = { backgroundColor: "#ffffff", borderRadius: "8px", padding: "30px", maxWidth: "480px", margin: "0 auto" };
  const headingOtp = { fontSize: "20px", fontWeight: "bold", marginBottom: "20px" };
  const textOtp = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
  const otpBoxOtp = { backgroundColor: "#eef2ff", padding: "12px", borderRadius: "6px", textAlign: "center" as const };
  const otpTextOtp = { fontSize: "24px", fontWeight: "bold", letterSpacing: "4px" };

  return (
    <Html>
      <Head />
      <Preview>Email Verification - Your OTP Code</Preview>
      <Body style={mainOtp}>
        <Container style={containerOtp}>
          <Heading style={headingOtp}>Email Verification</Heading>
          <Text style={textOtp}>Dear {name},</Text>

          <Text style={textOtp}>
            Thanks for signing up with <strong>Northwestern Finance</strong>. To unlock borrowing features,
            please validate your email address using the following One Time Password (OTP):
          </Text>

          <Section style={otpBoxOtp}>
            <Text style={otpTextOtp}>{otp}</Text>
          </Section>

          <Text style={textOtp}>
            If you did not create a new account, please ignore this email and don't tap the link above.
          </Text>

          <Text style={textOtp}>Sincerely,</Text>
          <Text style={textOtp}><strong>Northwestern Finance</strong></Text>
        </Container>
      </Body>
    </Html>
  )
}

export async function renderOtpEmail(credentials: OtpEmailType) {
  return await render(<OtpEmail otp={credentials.otp} name={credentials.name} />)
}

type ConfirmationEmailType = {
  name: string
}

function ConfirmationEmail({ name }: ConfirmationEmailType) {
  const mainContainer = { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#333333', lineHeight: '1.5' };

  const textStyle = { marginBottom: '16px' };

  const footerStyle = { fontSize: '12px', color: '#666666', marginTop: '40px', borderTop: '1px solid #dddddd', paddingTop: '16px' };

  const linkStyle = { color: '#0066cc', textDecoration: 'underline' };

  return (
    <Html>
      <Head />
      <Preview>
        Thank you for submitting your information - we&apos;re reviewing everything.
      </Preview>
      <Container style={mainContainer}>
        <Section>
          <Text style={textStyle}>
            Dear {name},
          </Text>

          <Text style={textStyle}>
            Thank you for submitting your information! We&apos;re currently reviewing everything to ensure everything is in order.
          </Text>

          <Text style={textStyle}>
            If anything else is needed, we&apos;ll reach out. Otherwise, you&apos;ll be notified once the process is complete.
          </Text>

          <Text style={{ ...textStyle, marginTop: '24px' }}>
            Sincerely, <br />
            Northwestern Finance
          </Text>

          <Text style={footerStyle}>
            Please do not reply directly to this email. If you have any questions or need assistance, reach out to us at{' '}
            <a href="mailto:team@nwfinance.in" style={linkStyle}>
              team@nwfinance.in
            </a>.
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

export async function renderConfirmationEmail(name: string) {
  return await render(<ConfirmationEmail name={name} />)
}