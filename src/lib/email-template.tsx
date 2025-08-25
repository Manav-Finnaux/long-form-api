/** @jsxImportSource react */
import { env } from "@/env";
import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, render } from "@react-email/components";

type OtpEmailType = { name?: string; otp: string }

type ConfirmationEmailType = {
  name: string
}

type ContinueLoanEmailType = {
  name: string;
  continueUrl: string;
}

const SOCIAL_MEDIA_LINKS = {
  faceBook: "https://www.facebook.com/people/Northwestern-Finance/61572646620869/",
  x: "https://x.com/",
  linkedIn: "https://in.linkedin.com/company/northwesternfinance",
  instagram: "https://www.instagram.com/northwesternfinance",
}

function Footer() {
  const footerText = { fontSize: "12px", lineHeight: "18px", color: "#6b7280", marginBottom: "12px" };
  const footerLink = { color: "#374151", fontSize: "14px", textDecoration: "none", display: "block", marginBottom: "6px", width: "fit-content" };
  const footerContainer = { marginTop: "40px", paddingTop: "30px", borderTop: "1px solid #e5e7eb" as const };
  const iconStyle = { width: "20px", height: "20px", margin: "0 8px", fontSize: '8' as const };
  const socialLink = { display: "inline-block", fontSize: '8' as const }

  return (
    <Section style={footerContainer}>
      <Section style={{ marginBottom: "16px" }}>
        <Link href={SOCIAL_MEDIA_LINKS.faceBook} style={socialLink} aria-label="Facebook">
          <Img
            src={`${env.SERVER_URL}/public/fb.png`}
            alt="Facebook Logo"
            width={'12'}
            height={'12'}
            style={iconStyle}
            fetchPriority="high"
          />
        </Link>
        <Link href={SOCIAL_MEDIA_LINKS.linkedIn} style={socialLink} aria-label="LinkedIn">
          <Img
            src={`${env.SERVER_URL}/public/linkedin.png`}
            alt="LinkedIn Logo"
            width={'12'}
            height={'12'}
            fetchPriority="high"
            style={iconStyle}
          />
        </Link>
        <Link href={SOCIAL_MEDIA_LINKS.instagram} style={socialLink} aria-label="Instagram">
          <Img
            src={`${env.SERVER_URL}/public/insta.jpg`}
            alt="Instagram Logo"
            width={'12'}
            height={'12'}
            fetchPriority="high"
            style={iconStyle}
          />
        </Link>
      </Section>
      <Link href="https://www.nwfinance.in/" style={footerLink}>Home</Link>
      <Link href="https://www.nwfinance.in/contact" style={footerLink}>Contact Us</Link>
      <Link href="https://www.nwfinance.in/privacypolicy" style={footerLink}>Privacy Policy</Link>

      <Text style={footerText}>
        Please do not reply directly to this email. If you have any questions or need assistance, reach out to us at{' '}
        <a href="mailto:team@nwfinance.in" style={{ color: "#374151", textDecoration: "underline" }}>team@nwfinance.in</a>.
      </Text>

      <Text style={footerText}>
        This e-mail is intended for the addressee shown. It contains information that is confidential and protected from disclosure. Any review, dissemination or use of this transmission or its contents by persons or unauthorized employees of the intended organizations is strictly prohibited.
      </Text>
      <Text style={footerText}>
        Northwestern Finance is a division of Shahji Fintech Private Ltd, a Non-Banking Financial Company (NBFC) registered with the Reserve Bank of India (RBI) under the RBI Act, 1934 with CIN U72900RJ2016PTC055249.
      </Text>
      <Text style={footerText}>&copy; 2025 Northwestern Finance</Text>
      <Text style={footerText}>
        Northwestern Finance, NW Finance, and the Northwestern Finance brand mark are trademarks of Shahji Fintech Private Ltd.
      </Text>
    </Section>
  )
}

function Header() {
  return (
    <Section style={{ textAlign: "center", marginBottom: "30px" }}>
      <Img
        src={`${env.SERVER_URL}/public/company_logo.jpg`}
        alt="Northwestern Finance Logo"
        width="120"
        height="auto"
        fetchPriority="high"
        style={{ margin: "0 auto" }}
      />
    </Section>
  )
}

function OtpEmail({ name, otp }: OtpEmailType) {
  const mainOtp = { backgroundColor: "#f6f9fc", fontFamily: "Helvetica, Arial, sans-serif", padding: "20px" };
  const containerOtp = { backgroundColor: "#ffffff", borderRadius: "8px", padding: "30px", maxWidth: "480px", margin: "0 auto" };
  const headingOtp = { fontSize: "20px", fontWeight: "bold", marginBottom: "20px" };
  const textOtp = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
  const otpBoxOtp = { backgroundColor: "#eef2ff", padding: "12px", borderRadius: "6px", textAlign: "center" as const };
  const otpTextOtp = { fontSize: "24px", fontWeight: "bold", letterSpacing: "4px" };

  return (
    <Html>
      <Head />
      {/* <Preview>Email Verification - Your OTP Code</Preview> */}
      <Body style={mainOtp}>
        <Container style={containerOtp}>
          <Header />

          <Heading style={headingOtp}>Let's get started</Heading>
          <Text style={textOtp}>Dear {name},</Text>
          <Text style={textOtp}>
            Thanks for signing up with <strong>Northwestern Finance</strong>. To unlock borrowing features,
            please validate your email address using the following One Time Password (OTP):
          </Text>

          <Section style={otpBoxOtp}>
            <Text style={otpTextOtp}>{otp}</Text>
          </Section>

          <Text style={textOtp}>
            If you did not create a new account, please ignore this email and don't share this code with anyone.
          </Text>

          <Text style={textOtp}>Sincerely,</Text>
          <Text style={textOtp}><strong>Northwestern Finance</strong></Text>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

function ConfirmationEmail({ name }: ConfirmationEmailType) {
  const mainContainer = { backgroundColor: "#f6f9fc", fontFamily: "Helvetica, Arial, sans-serif", padding: "20px" };
  const container = { backgroundColor: "#ffffff", borderRadius: "8px", padding: "30px", maxWidth: "480px", margin: "0 auto" };
  const headingText = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };

  return (
    <Html>
      <Head />
      <Preview>Thank you for submitting your information - we&apos;re reviewing everything.</Preview>
      <Body style={mainContainer}>
        <Container style={container}>
          <Header />

          <Text style={headingText}>Dear {name},</Text>
          <Text style={headingText}>Thank you for submitting your information! We&apos;re currently reviewing everything to ensure it&apos;s all in order.</Text>
          <Text style={headingText}>If anything else is needed, we&apos;ll reach out. Otherwise, you&apos;ll be notified once the process is complete.</Text>
          <Text style={{ ...headingText, marginTop: "24px" }}>Sincerely,<br /><strong>Northwestern Finance</strong></Text>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

function ContinueLoanEmail({ name, continueUrl }: ContinueLoanEmailType) {
  const mainContainer = { backgroundColor: "#f6f9fc", fontFamily: "Helvetica, Arial, sans-serif", padding: "20px" };
  const container = { backgroundColor: "#ffffff", borderRadius: "8px", padding: "30px", maxWidth: "480px", margin: "0 auto" };
  const headingText = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px", color: "#333333" };
  const buttonStyle = {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#004085",
    color: "#ffffff",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "15px"
  };

  return (
    <Html>
      <Head />
      <Preview>Continue your loan application with Northwestern Finance.</Preview>
      <Body style={mainContainer}>
        <Container style={container}>
          <Header />

          <Text style={headingText}>Dear {name},</Text>
          <Text style={headingText}>
            Your cash advance progress has been saved so far.
          </Text>
          <Text style={headingText}>
            Please click the link below to continue your application.
            <br />
            <strong>This link is valid for 10 days.</strong>
          </Text>

          <Section style={{ textAlign: "center", margin: "30px 0" }}>
            <a href={continueUrl} style={buttonStyle}>
              Continue Application
            </a>
          </Section>

          <Text style={headingText}>
            If this link does not work, navigate to this URL in your browser:
            <br />
            <a href={continueUrl} style={{ color: "#004085" }}>{continueUrl}</a>
          </Text>

          <Text style={{ ...headingText, marginTop: "24px" }}>
            Sincerely,<br /><strong>Northwestern Finance</strong>
          </Text>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

export async function renderConfirmationEmail(name: string) {
  return await render(<ConfirmationEmail name={name} />)
}

export async function renderOtpEmail(credentials: OtpEmailType) {
  return await render(<OtpEmail otp={credentials.otp} name={credentials.name} />)
}

export async function renderContinueLoanApplicationEmail(name: string, continueUrl: string) {
  return await render(<ContinueLoanEmail name={name} continueUrl={continueUrl} />)
}