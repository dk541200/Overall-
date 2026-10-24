# AUTOFLUX Admin Setup & Netlify Deployment Guide

This guide explains how your AUTOFLUX admin setup is configured, which environment variables are required vs optional, and how to deploy the project to Netlify.

---

## 1. Admin Credentials & Security

- **Admin Email**: `studyai9211@gmail.com`
- **Initial Admin Password**: `NovaXMaddy` (stored and verified securely on the server using PBKDF2 hashing).

---

## 2. Environment Variables Reference

### Required for Admin Login & Core Platform
Admin login works out-of-the-box with secure built-in defaults. However, for production deployments (such as Netlify), you can explicitly set these environment variables in your deployment dashboard:

| Variable Name | Description | Default / Example Value | Required? |
| :--- | :--- | :--- | :--- |
| `ADMIN_EMAIL` | Authorized administrator email | `studyai9211@gmail.com` | **Optional** (defaults to `studyai9211@gmail.com`) |
| `ADMIN_PASSWORD` / `ADMIN_PASSWORD_HASH` | Admin password / hash | `NovaXMaddy` | **Optional** (defaults to `NovaXMaddy`) |
| `ADMIN_SALT` | Cryptographic salt for password hashing | Automatically generated secure random hex | **Optional** (auto-generated if omitted) |
| `SESSION_SECRET` | Secret key for signed admin session tokens | Automatically generated secure random hex | **Optional** (auto-generated if omitted) |

### Optional for Email Delivery (Password Reset)
SMTP variables are **strictly optional**. They are only used if you want the "Forgot Password" feature to automatically send the 8-digit verification code via email. 

If SMTP is unconfigured:
- Admin login, dashboard, catalog editing, pre-orders, diagnostics, draft saving, and live publishing **all work normally**.
- When requesting a password reset, the server generates the secure 8-digit code and clearly informs you that email delivery is unconfigured, displaying the missing environment variables.

| Variable Name | Description | Example Value | Required? |
| :--- | :--- | :--- | :--- |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` | **Optional** |
| `SMTP_PORT` | SMTP port (e.g. 587 or 465) | `587` | **Optional** |
| `SMTP_USER` | SMTP username / email | `studyai9211@gmail.com` | **Optional** |
| `SMTP_PASS` | SMTP app password or key | `your_gmail_app_password` | **Optional** |
| `SMTP_FROM` | Sender address shown in emails | `AUTOFLUX Security <studyai9211@gmail.com>` | **Optional** |
| `SMTP_SECURE` | Use TLS (`true` for 465, `false` for 587) | `false` | **Optional** |
| `RESEND_API_KEY` | Alternative email delivery via Resend API | `re_123456789` | **Optional** |

---

## 3. Step-by-Step Netlify Deployment Instructions

Because AUTOFLUX includes server-side authentication, drafts, pre-orders, and API routes (`server.ts`), you can deploy it to Netlify using Netlify Functions or Netlify Build:

1. **Push your repository to GitHub** (or connect your GitHub repository directly to Netlify).
2. **Log in to Netlify** and click **Add new site** → **Import an existing project**.
3. **Configure Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. **Configure Environment Variables** in Netlify Site Settings → **Environment variables**:
   - Add `ADMIN_EMAIL` = `studyai9211@gmail.com`
   - Add `ADMIN_PASSWORD` = `NovaXMaddy` (or set a secure custom password)
   - Add `ADMIN_SALT` = (Generate a secure random string or let Netlify auto-generate)
   - Add `SESSION_SECRET` = (Generate a long random hex string)
   - *(Optional)* Add your SMTP credentials if you want automated password reset emails.
5. **Deploy Site**: Click **Deploy site**. Netlify will build the frontend assets and server functions.
6. **Verify Access**:
   - Customer Storefront: `https://your-site.netlify.app/`
   - Admin Panel: `https://your-site.netlify.app/admin` or `https://your-site.netlify.app/admin.html`
   - Log in with `studyai9211@gmail.com` and `NovaXMaddy`.
