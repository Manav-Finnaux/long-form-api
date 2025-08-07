# API – Long Form

This is the backend API for the project, built with [Hono](https://hono.dev/), PostgreSQL, and Drizzle ORM. It handles core business logic and authentication using cookie-based JWT sessions.

---

## 🛠 Tech Stack

- **Framework:** Hono (Edge-compatible, lightweight)
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Auth:** Cookie-based JWT (no user creation, just session validation)

---

## 🚀 Getting Started

### 1. Clone and install dependencies

```bash
git clone git@github.com:Manav-Finnaux/long-form-api.git
cd long-form-api
npm install
```

### 2. Setup environment variables
Create a .env file based on the following:
```env
NODE_ENV=development
PORT=4001
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<db_name>
ANONYMOUS_CUSTOMER_JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=32-character-key-here
API_AUTHORIZATION_HEADER_SECRET=your-api-header-secret
COOKIE_NAME=session_token
SERVER_URL=http://localhost:4001
EMAIL_ID=your-verified-ses-email@example.com
EMAIL_REGION=us-east-1-example
AWS_SES_ACCESS_KEY_ID=your-ses-key
AWS_SES_SECRET_ACCESS_KEY=your-ses-secret
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Scripts
```json
"scripts": {
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop",
    "db:check": "drizzle-kit check",
    "db:up": "drizzle-kit up",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "dev": "bun run --hot src/index.ts",
    "start": "tsx src/index.ts"
  }
```

## 🗒️ Notes
<ul>
<li>No Swagger/Postman is used yet.</li>
<li>All authentication is handled via JWT stored in cookies.</li>
<li>No user registration or creation logic is required for this project.</li>
</ul>

## 🌱 Flow
1. Create the cookies `/api/long-form/initiate/`
2. Store data based on each step `/api/long-form/step/[1-6]`
3. Along with saving data, verify email and phone number via the verification APIs `/api/long-form/verification/`
4. Handle file uploads separately `/api/long-form/upload/:fileType` & `/api/long-form/upload/salarySlips`
5. Validate if the user can proceed with given aadhaar and pan via `/api/long-form/verification/can-proceed?type=abc&value=def`
