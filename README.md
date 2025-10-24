# AcEMCP - AI Agent Platform

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (or local Supabase setup)
- PostgreSQL database

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Copy `env-template.txt` to `.env.local`
   - Fill in your Supabase credentials
   - (Optional) Add GitHub OAuth credentials for social login

3. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Start Supabase (if using local)**
   ```bash
   npx supabase start
   ```

## Authentication Setup

### Email/Password Authentication

The application supports email/password authentication out of the box. Configuration is in `supabase/config.toml`:

```toml
[auth.email]
enable_confirmations = false  # Set to true to require email verification
```

### GitHub OAuth (Optional)

To enable GitHub sign-in:

1. **Create GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Set callback URL to: `http://127.0.0.1:54321/auth/v1/callback` (local) or `https://your-project.supabase.co/auth/v1/callback` (production)

2. **Add credentials to `.env.local`**
   ```bash
   SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_client_id
   SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_client_secret
   ```

3. **Restart Supabase**
   ```bash
   npx supabase stop
   npx supabase start
   ```

### Authentication Flow

1. User lands on `/landing` and enters a prompt
2. If not authenticated, redirected to `/authentication` with prompt preserved
3. User signs up or signs in (email/password or GitHub)
4. After authentication, redirected to `/auth/callback`
5. Callback syncs user to database
6. User is redirected back to `/landing` with their original prompt
7. User can now generate their agent with the prompt

### Troubleshooting Authentication

**Issue: "Unauthorized" error**
- Check `.env.local` has correct Supabase credentials
- Restart dev server

**Issue: GitHub sign-in doesn't work**
- Verify callback URL in GitHub OAuth app settings
- Check environment variables are set
- Restart Supabase

**Issue: Email confirmation not working**
- Check `enable_confirmations` setting in `supabase/config.toml`
- Verify `site_url` matches your development URL

---

# Understanding OpenTelemetry in Simple Terms (The Restaurant Analogy)

Imagine your application is a busy restaurant. You want to know how well it's running. OpenTelemetry is a system that helps you watch everything without getting in the way of the chefs.

---

## The Big Picture: Your Restaurant

Your application is the entire restaurant. A "request" is like a customer's **order**.

```
     [Customer]  ->  (Order)  ->  [Restaurant]  ->  [Food]
     (Request)                  (Application)     (Response)
```

---

## The Three Types of Monitoring

OpenTelemetry gives you three different ways to "watch" your restaurant.

### 1. Tracing: Following a Single Order

A **Trace** is like watching one single order from the moment the customer places it until the food is on their table. It helps you see the entire journey and find out where there are delays.

*   **What it answers:** "Why was this specific customer's order slow?"
*   **Jargon:** `Tracer`, `Span`

**Visual:**

```
[Order Taken] -----> [Kitchen Prep] -----> [Cooking] -----> [Plating] -----> [Delivered]
|------------------------------------------------------------------------------------|
                      (This is a TRACE of one order)
```
Each step (like `[Kitchen Prep]`) is called a **Span**.

---

### 2. Metrics: The Manager's Dashboard

**Metrics** are like the big dashboard in the manager's office. It shows you numbers and statistics about the whole kitchen.

*   **What it answers:** "How many orders are we getting per minute?" or "What's the average cooking time?"
*   **Jargon:** `Meter`, `MetricReader`

**Visual:**

```
+---------------------------------+
|      KITCHEN DASHBOARD          |
+---------------------------------+
|                                 |
| Orders per Minute:  ||||||| 25  |
|                                 |
| Avg. Cook Time:     ||||| 5 min |
|                                 |
| Happy Customers:    |||||||| 95% |
|                                 |
+---------------------------------+
```

---

### 3. Logging: The Kitchen Logbook

**Logging** is like a simple logbook where chefs write down important events.

*   **What it answers:** "What specific errors happened today?"
*   **Jargon:** `Logger`, `LogRecordProcessor`

**Visual:**

```
+------------------------------------+
|           KITCHEN LOGBOOK          |
+------------------------------------+
| 10:30 AM: Oven #2 is not heating.  |
| 11:15 AM: Ran out of tomatoes.     |
| 12:00 PM: Fire alarm test.         |
+------------------------------------+
```

---

## Putting It All Together: The `NodeSDK` (The General Manager)

The `NodeSDK` is the **General Manager** you hire to set up all this monitoring.

You give the manager a configuration file (the "instructions") that tells them:
1.  **What to trace:** "Watch every order."
2.  **What to measure:** "Track orders per minute and cooking time."
3.  **What to log:** "Write down any errors."
4.  **Where to send the data:** "Show the metrics on the dashboard and send the logs to the main office."

When you call `.start()`, the manager reads your instructions and sets up the whole system. When you call `.shutdown()`, the manager makes sure all the final reports are sent before closing for the day.

---

## Watching Your AI Calls: Telemetry (The Package Tracking Analogy)

The `ai` library has built-in support for telemetry. Think of it as adding a **tracking number** to every AI request you make. This helps you see what's happening inside the AI calls.

### The Analogy: Sending a Package

*   **Your AI Call (`generateText`)**: This is you sending a package.
*   **Telemetry**: This is the **tracking number** you put on the package.
*   **A Tracer**: This is the **shipping company** (like FedEx) that scans your package at every stop.
*   **`TelemetrySettings`**: These are the **shipping options** you choose on the form.

### How to Use It

When you call a function like `generateText`, you can give it a set of telemetry instructions.

```javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// This is you telling the 'ai' library HOW you want to track your package.
const myTrackingOptions = {
  isEnabled: true, // "Yes, I want to add tracking."
  functionId: 'JokeGenerator', // Give this type of package a name.
  recordInputs: true, // "Log the starting address (the prompt)."
  recordOutputs: true, // "Log where it was delivered (the AI's answer)."
};

// Now, send your package with the tracking options.
const { text } = await generateText({
  model: openai('gpt-4'),
  prompt: 'Why did the computer cross the road?',
  experimental_telemetry: myTrackingOptions, // Attach the tracking options here
});
```

### Why Is This Useful?

By adding this "tracking," you can answer important questions about your AI:
*   **"Which AI calls are taking the longest?"** (Is a package stuck somewhere?)
*   **"Are any of my AI calls failing?"** (Is a package getting lost?)
*   **"What are people asking my AI?"** (Where are my packages going?)

This helps you find and fix problems and understand how your AI is being used.

