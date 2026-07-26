# Lucky Scratch & Win Campaign App

A high-performance, mobile-first, full-stack web application designed for interactive promotional campaigns. The application allows customers to verify their emails, claim a digital scratch card, scratch to reveal random rewards (e.g., cashback, store items), and view winners. It also features a secure, full-fledged Admin Control Panel to manage the campaign state, monitor metrics, search registered users, and redeem rewards.
---

## Architecture & Technology Stack

The application employs a decoupled client-server architecture:

*   **Frontend**: React 19, Vite, Tailwind CSS, Axios, Lucide React, HTML5 Canvas (for high-fidelity scratch card interaction), and React Router DOM.
*   **Backend**: Node.js, Express, MongoDB (Mongoose ODM), JWT Authentication, Helmet (security headers), Compression, Morgan (logging), and Nodemailer (SMTP OTP delivery).
*   **Database**: MongoDB (local development database name: `lucky_scratch`, auto-seeds 500 pre-shuffled rewards and a default admin user on startup).

---

## Key Capabilities & Features Analysis

### 📱 Customer Portal (Frontend)
1.  **Mobile-First Design**: Fully responsive, optimized for modern smartphone viewports mimicking a native app frame.
2.  **Email Verification (OTP)**: Customers enter their email to request a secure 6-digit one-time passcode. Features resend timers and state preservation.
3.  **Registration Flow**: New customers complete their profiles (Name, Phone, City) only after proving email ownership.
4.  **Interactive Scratch Card**: Uses HTML5 Canvas to simulate realistic scratch-off physics. Once 50% of the canvas is cleared, it auto-reveals the assigned reward and locks it in the database.
5.  **Winners Board**: A public leaderboard displaying recent campaign winners and prizes in real time.
6.  **Shop Locator**: Informational store locator page listing physical store details.

### 🛡️ Secure API & Backend
1.  **Strict Admin-Only Authorization**:
    *   Separate authentication schemes for regular users and administrators.
    *   Admin logins are verified using hashed passwords (`bcryptjs`).
    *   Admin actions (stats, customer details, redemption, exports) are guarded by a JWT token validator checking for the `admin` role parameter (`decoded.role === 'admin'`).
2.  **Robust Rate Limiting & Protection**:
    *   **IP-Based Limiters**: Strict limit on OTP requests (3 per 10 minutes) and registrations (15 per 15 minutes) per IP to block spam and API abuse.
    *   **Global "Server Busy" Protection**: System-wide global rate-limiting applied to `/auth/otp/request`, `/auth/register`, and `/admin/login`. If a high volume of requests hits these authentication endpoints simultaneously, the server returns status code `429` with the response: `"Server is busy. Please try again later."` to maintain uptime.
3.  **Automatic Seeding Engine**: Shuffles and inserts exactly 500 cards (including specified reward tiers such as ₹200, ₹100, 6D Glass, Data Cables, etc.) and the initial admin account upon database connection.

### 📊 Admin Control Panel
1.  **Real-Time Metrics Grid**: Monitors total users, cards left, cards claimed, and cards redeemed.
2.  **Campaign Lifecycle Controls**: Seamlessly switch the campaign status between `Coming Soon`, `Active`, `Paused`, and `Ended`. The frontend UI adapts reactively to these state updates.
3.  **Customer Registry**: Paginated registry with real-time filters (redeemed vs pending) and live searching across names, emails, phone numbers, cities, and scratch card numbers.
4.  **Manual Redemption Management**: Admin can click to mark a customer's card as "Redeemed" when they claim their prize in-store, or cancel a redemption to reactivate the card.
5.  **Flexible Campaign Reset Options**:
    *   **Reset Cards Back (Release Assignments)**: A confirmation prompt requiring the input `RELEASE` which resets all 500 scratch cards back to unassigned and active (unredeemed) states, unassigns the card references on all registered customer profiles, and clears the redemption log history. This keeps all customer registries in the system while freeing up all cards for a new scratch round.
    *   **Reset Campaign (Complete Wipe)**: A confirmation prompt requiring the input `RESET` which completely wipes the database (deletes all users, cards, and redemption logs) and regenerates a fresh batch of 500 pre-shuffled, unassigned scratch cards.
6.  **CSV Export**: Instant download of customer registration databases formatted for Excel analysis.

---

## Local Development Guide

### Prerequisites
*   Node.js (>= 18.0.0)
*   MongoDB installed and running locally on `mongodb://127.0.0.1:27017/lucky_scratch`

### Step 1: Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables by creating `.env`:
    ```ini
    PORT=5000
    NODE_ENV=development
    MONGODB_URI=mongodb://127.0.0.1:27017/lucky_scratch
    CORS_ORIGIN=http://localhost:5173
    SMTP_HOST="smtp.gmail.com"
    SMTP_USER="your-email@gmail.com"
    SMTP_PASS="your-gmail-app-password"
    ```
    *(Note: If SMTP variables are left empty, the server will output OTP codes to the terminal console for ease of development testing).*
4.  Start the backend server in development mode:
    ```bash
    npm run dev
    ```

### Step 2: Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser.
5.  Access the Admin Login portal at [http://localhost:5173/admin/login](http://localhost:5173/admin/login) using:
    *   **Username**: `admin`
    *   **Password**: `RamdevMobile2026`

---

## Live Production Deployment Manual

To publish the website live, follow these steps to host your backend, frontend, and database securely.

### Phase 1: Database Cloud Hosting (MongoDB Atlas)
1.  Sign up for a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create a Cluster**: Choose the free shared tier (M0) in a region closest to your target audience.
3.  **Configure Network Access**:
    *   Go to **Network Access** > **Add IP Address**.
    *   For testing/initial launch, select **Allow Access From Anywhere** (`0.0.0.0/0`). For tighter production security, bind it to your backend host's static IPs.
4.  **Create a Database User**:
    *   Go to **Database Access** > **Add New Database User**.
    *   Set authentication method to **Password**. Make a secure password.
    *   Assign the role **Read and write to any database**.
5.  **Get Connection String**:
    *   Click **Connect** on your cluster dashboard.
    *   Choose **Drivers** (Node.js).
    *   Copy the connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/ramdev_lucky_scratch?retryWrites=true&w=majority`).
    *   Keep this ready for your backend environment configuration.

### Phase 2: Live Backend Hosting (Render, Railway, or Heroku)
We recommend **Render** or **Railway** for lightweight Node.js Express deployments:

#### Option A: Deploying on Render (Web Service)
1.  Log in to [Render](https://render.com) and click **New** > **Web Service**.
2.  Connect your Git repository (GitHub/GitLab) containing the codebase.
3.  Configure the service details:
    *   **Name**: `lucky-scratch-backend`
    *   **Root Directory**: `backend` (Important: points Render to run in the sub-folder)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
4.  Open the **Environment** tab and add the Production Environment Variables:
    *   `PORT` = `10000` (Render binds automatically, but good to declare)
    *   `NODE_ENV` = `production`
    *   `MONGODB_URI` = *(Your MongoDB Atlas connection URI from Phase 1)*
    *   `JWT_SECRET` = *(Generate a long, random cryptographically secure string)*
    *   `ADMIN_USERNAME` = `admin` *(or any custom admin username)*
    *   `ADMIN_PASSWORD` = *(A strong, secure password for production)*
    *   `CORS_ORIGIN` = *(Your production frontend URL, e.g., `https://lucky-scratch.pages.dev`)*
    *   `SMTP_HOST` = *(e.g. `smtp.sendgrid.net` or `smtp.gmail.com`)*
    *   `SMTP_PORT` = `587`
    *   `SMTP_SECURE` = `false` (for TLS/STARTTLS)
    *   `SMTP_USER` = *(Your SMTP auth username)*
    *   `SMTP_PASS` = *(Your SMTP app password or API token)*
    *   `SMTP_FROM` = `no-reply@yourdomain.com`
5.  Click **Create Web Service**. Wait for the build and deployment to succeed. Render will assign you a live HTTPS backend URL (e.g., `https://lucky-scratch-backend.onrender.com`).

### Phase 3: Live Frontend Hosting (Netlify, Vercel, or Cloudflare Pages)
We recommend **Vercel** or **Cloudflare Pages** for static site assets:

#### Option A: Deploying on Vercel
1.  Log in to [Vercel](https://vercel.com) and click **Add New** > **Project**.
2.  Import your Git repository.
3.  Configure the build settings:
    *   **Framework Preset**: `Vite` (Vercel auto-detects this)
    *   **Root Directory**: `frontend` (Important: points Vercel to run in the frontend sub-folder)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  Under **Environment Variables**, add the single connection variable pointing to your backend:
    *   `VITE_API_URL` = *(Your live Render backend URL from Phase 2, e.g., `https://lucky-scratch-backend.onrender.com/api/v1`)*
5.  Click **Deploy**. Once completed, Vercel will give you a live HTTPS frontend URL (e.g., `https://lucky-scratch.vercel.app`).

### Phase 4: Production SMTP Mailer Setup
To ensure OTP codes reach real customers:
1.  **Transactional Service**: Sign up for a service like **SendGrid**, **Mailgun**, or **Postmark**. They have free tiers for low email counts.
2.  **Gmail Alternative**:
    *   If using a personal Gmail account, enable 2-Factor Authentication on the account.
    *   Go to Account Settings > Security > **App Passwords**.
    *   Generate a password labeled "Scratch Campaign App".
    *   Use this 16-character code as `SMTP_PASS` and your Gmail address as `SMTP_USER` in the backend configuration.

### Phase 5: Custom Domain & SSL (Optional but Recommended)
1.  **Custom Domains**: Both Vercel/Netlify (frontend) and Render/Railway (backend) allow you to bind custom domains (e.g., `campaign.ramdevmobile.com`).
2.  **DNS Routing**: Add `CNAME` records at your DNS registrar (GoDaddy, Namecheap) pointing to the platform domains as instructed in their dashboards.
3.  **SSL/HTTPS**: Both hosts automatically provision Let's Encrypt SSL certificates for your custom domains to ensure all traffic is encrypted and secure.
# RamdevMobiles-ScratchCards
