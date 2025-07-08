/** @jsxImportSource react */
import { Html, Head, Preview, Body, Container, Text, Section, render, Button, Link, Hr } from "@react-email/components";

type OtpEmailType = { name?: string; otp: string }

function OtpEmail({ name = "there", otp }: OtpEmailType) {
  const mainOtp = { backgroundColor: "#f6f9fc", fontFamily: "Helvetica, Arial, sans-serif", padding: "20px" };
  const containerOtp = { backgroundColor: "#ffffff", borderRadius: "8px", padding: "30px", maxWidth: "480px", margin: "0 auto" };
  const headingOtp = { fontSize: "20px", fontWeight: "bold", marginBottom: "20px" };
  const textOtp = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
  const otpBoxOtp = { backgroundColor: "#eef2ff", padding: "12px", borderRadius: "6px", textAlign: "center" as const };
  const otpTextOtp = { fontSize: "24px", fontWeight: "bold", letterSpacing: "4px" };
  const footerOtp = { fontSize: "14px", color: "#666" };

  return (
    <Html>
      <Head />
      <Preview>Your OTP code is {otp}</Preview>
      <Body style={mainOtp}>
        <Container style={containerOtp}>
          <Text style={headingOtp}>Hi {name},</Text>
          <Text style={textOtp}>Your One-Time Password (OTP) is:</Text>
          <Section style={otpBoxOtp}>
            <Text style={otpTextOtp}>{otp}</Text>
          </Section>
          <Text style={textOtp}>
            Please use this code to verify your identity. It expires in 10 minutes.
          </Text>
          <Text style={footerOtp}>If you didn’t request this, just ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export async function renderOtpEmail(credentials: OtpEmailType) {
  return await render(<OtpEmail otp={credentials.otp} name={credentials.name} />)
}

type VerificationMailPropType = {
  userName?: string
  verificationUrl: string
}

function VerificationMail({ userName, verificationUrl }: VerificationMailPropType) {
  const main = { backgroundColor: '#f9f9f9', padding: '20px 0' };

  const container = { backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px', margin: '0 auto', maxWidth: '480px', fontFamily: 'Arial, sans-serif' };

  const paragraph = { fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' };

  const button = { display: 'inline-block', padding: '12px 24px', backgroundColor: '#007BFF', color: '#ffffff', fontSize: '16px', textDecoration: 'none', borderRadius: '5px' };

  const hr = { border: 'none', borderTop: '1px solid #eee', margin: '30px 0' };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Verify your email</Text>
          <Text style={paragraph}>
            Hi {userName || 'there'},<br />
            Thanks for signing up. Please verify your email address by clicking the button below:
          </Text>

          <Button style={button} href={verificationUrl}>
            Verify Email
          </Button>

          <Text style={paragraph}>
            If the button doesn't work, copy and paste the link below into your browser:
          </Text>
          <Link href={verificationUrl} style={{ color: '#007BFF', wordBreak: 'break-all', }}>
            {verificationUrl}
          </Link>

          <Hr style={hr} />
          <Text style={{ fontSize: '12px', color: '#888888', textAlign: 'center' }}>
            If you didn't request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderVerificationLinkEmail(credentials: VerificationMailPropType) {
  return await render(<VerificationMail verificationUrl={credentials.verificationUrl} userName={credentials.userName} />)
}