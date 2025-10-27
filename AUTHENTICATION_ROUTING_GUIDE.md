# Authentication & Routing Guide

## Overview
This document provides a comprehensive guide to the authentication flow and routing logic in the AcEMCP application.

---

## Table of Contents
1. [Application Flow](#application-flow)
2. [Routing Architecture](#routing-architecture)
3. [Authentication System](#authentication-system)
4. [GitHub OAuth Setup](#github-oauth-setup)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Application Flow

### User Journey
```
┌─────────────────────────────────────────────────────────────────┐
│                         Entry Point (/)                          │
│                              ↓                                   │
│                    Landing Page (/landing)                       │
│                              ↓                                   │
│              User enters prompt or clicks CTA                    │
│                              ↓                                   │
│                   ┌──────────────────────┐                       │
│                   │  Is User Authenticated?                      │
│                   └──────────────────────┘                       │
│                    ↓                    ↓                        │
│                  YES                   NO                        │
│                    ↓                    ↓                        │
│         Generate Project ID    Authentication Page               │
│                    ↓              (/authentication)              │
│         Onboarding Page                  ↓                       │
│          (/onboarding)          Sign In / Sign Up                │
│                    ↓                     ↓                       │
│         Project Dashboard        Auth Callback                   │
│         (/project/[id])         (/auth/callback)                 │
│                                          ↓                       │
│                                  Back to Landing                 │
│                                   (with prompt)                  │
│                                          ↓                       │
│                                  Generate Project                │
│                                          ↓                       │
│                                    Onboarding                    │
│                                          ↓                       │
│                                  Project Dashboard               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Routing Architecture

### Route Structure

#### 1. **Root Route (`/`)**
- **Purpose**: Entry point for all users
- **Behavior**: Immediately redirects to `/landing`
- **File**: `src/app/page.tsx`

```typescript
// Always redirects to landing page
router.replace("/landing");
```

#### 2. **Landing Page (`/landing`)**
- **Purpose**: Main marketing page and prompt entry
- **Features**:
  - Hero section with prompt input
  - Feature showcase
  - Authentication status awareness
- **File**: `src/app/landing/page.tsx`

**Key Logic**:
```typescript
// When user submits prompt
if (!session) {
  // Redirect to auth with prompt preserved
  router.push(`/authentication?mode=signin&redirectTo=/landing&prompt=${prompt}`);
} else {
  // Create project and go to onboarding
  router.push(`/onboarding?prompt=${prompt}`);
}
```

#### 3. **Authentication Page (`/authentication`)**
- **Purpose**: Sign in / Sign up
- **Modes**: 
  - `?mode=signin` - Sign in form
  - `?mode=signup` - Sign up form
- **File**: `src/app/authentication/page.tsx`

**URL Parameters**:
- `mode`: `signin` or `signup`
- `redirectTo`: Where to redirect after auth
- `prompt`: User's original prompt (preserved)
- `error`: Error code from failed auth

**Features**:
- Email/password authentication
- GitHub OAuth
- User existence check on sign-up
- Friendly error messages
- Auto-redirect if already authenticated

#### 4. **Auth Callback (`/auth/callback`)**
- **Purpose**: Handle OAuth redirects and session establishment
- **File**: `src/app/auth/callback/page.tsx`

**Process**:
1. Exchange OAuth code for session
2. Verify session validity
3. Sync user to database
4. Redirect to original destination with prompt

#### 5. **Onboarding Page (`/onboarding`)**
- **Purpose**: Configure project and MCP servers
- **Protected**: Requires authentication
- **File**: `src/app/onboarding/page.tsx`

**Steps**:
1. Project metadata (name, description, identity, tone)
2. Review and edit metadata
3. Configure MCP servers
4. Deploy and redirect to project dashboard

#### 6. **Project Dashboard (`/project/[id]`)**
- **Purpose**: Main workspace for AI agent
- **Protected**: Requires authentication and project ownership
- **File**: `src/app/project/[id]/page.tsx`

**Features**:
- Chat playground
- Workflow visualization
- Agent configuration

---

## Authentication System

### Supabase Configuration

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Authentication Methods

#### 1. **Email/Password**

**Sign Up**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

**Sign In**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

#### 2. **GitHub OAuth**

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: "github",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### Session Management

**Provider**: `SupabaseAuthProvider` (`src/providers/supabase-auth-provider.tsx`)

**Usage**:
```typescript
const { user, session, isLoading, signOut } = useSupabaseAuth();
```

**Features**:
- Automatic session refresh
- Real-time auth state changes
- Centralized auth context

---

## GitHub OAuth Setup

### Development Setup (Localhost)

1. **Create GitHub OAuth App**:
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in details:
     - **Application name**: Akron AI 
     - **Homepage URL**: `http://localhost:3000`
     - **Authorization callback URL**: `http://localhost:3000/auth/callback`
   - Click "Register application"

2. **Get Credentials**:
   - Copy **Client ID**
   - Generate and copy **Client Secret**

3. **Configure Supabase**:
   - Go to: Supabase Dashboard → Authentication → Providers
   - Enable GitHub provider
   - Enter Client ID and Client Secret
   - Save

### Production Setup

#### Step 1: Update GitHub OAuth App

**Option A: Update Existing App**
1. Go to: https://github.com/settings/developers
2. Select your OAuth app
3. Update URLs:
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/auth/callback`
4. Save changes

**Option B: Create New Production App** (Recommended)
1. Create a separate OAuth app for production
2. Use production URLs:
   - **Application name**: AcEMCP Production
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/auth/callback`
3. Get new Client ID and Secret

#### Step 2: Update Supabase Configuration

1. **For Production Project**:
   - Go to your production Supabase project
   - Navigate to: Authentication → Providers → GitHub
   - Update with production credentials
   - Save

2. **Site URL Configuration**:
   - Go to: Authentication → URL Configuration
   - Set **Site URL**: `https://yourdomain.com`
   - Add **Redirect URLs**:
     - `https://yourdomain.com/auth/callback`
     - `https://yourdomain.com/**` (wildcard for flexibility)

#### Step 3: Environment Variables

**Production `.env` or deployment platform**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

#### Step 4: Verify Deployment

1. Deploy your application
2. Test authentication flow:
   - Visit `https://yourdomain.com`
   - Click "Sign in with GitHub"
   - Verify redirect to GitHub
   - Verify callback to your site
   - Confirm successful authentication

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update GitHub OAuth app with production URLs
- [ ] Configure Supabase with production credentials
- [ ] Set production environment variables
- [ ] Update Supabase Site URL and Redirect URLs
- [ ] Test email authentication (if using)
- [ ] Verify database migrations are applied
- [ ] Test complete user flow end-to-end

### Deployment Platforms

#### Vercel
```bash
# Set environment variables in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

#### Netlify
```bash
# Set in Netlify environment variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

#### Custom Server
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Post-Deployment Verification

1. **Test Authentication**:
   ```
   ✓ Email sign-up
   ✓ Email sign-in
   ✓ GitHub OAuth
   ✓ Session persistence
   ✓ Sign out
   ```

2. **Test Routing**:
   ```
   ✓ Root → Landing
   ✓ Landing → Auth (unauthenticated)
   ✓ Landing → Onboarding (authenticated)
   ✓ Onboarding → Project Dashboard
   ✓ Direct project URL (authenticated)
   ✓ Direct project URL (unauthenticated) → Auth
   ```

3. **Test Prompt Preservation**:
   ```
   ✓ Enter prompt → Auth → Back to landing with prompt
   ✓ Complete flow with prompt → Project created
   ```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid login credentials"

**Causes**:
- Wrong email/password
- Email not confirmed
- User doesn't exist

**Solutions**:
- Check credentials
- Verify email confirmation
- Try "Forgot Password" flow
- Check Supabase Auth logs

#### 2. GitHub OAuth Redirect Error

**Error**: `redirect_uri_mismatch`

**Causes**:
- GitHub OAuth callback URL doesn't match
- Supabase redirect URL not configured

**Solutions**:
```bash
# Verify GitHub OAuth App settings
Homepage URL: https://yourdomain.com
Callback URL: https://yourdomain.com/auth/callback

# Verify Supabase settings
Site URL: https://yourdomain.com
Redirect URLs: https://yourdomain.com/auth/callback
```

#### 3. "No session created" after OAuth

**Causes**:
- Code exchange failed
- Session cookie not set
- CORS issues

**Solutions**:
- Check browser console for errors
- Verify Supabase project URL is correct
- Check if cookies are enabled
- Verify CORS settings in Supabase

#### 4. User Already Exists Error

**Behavior**: Sign-up detects existing user and prevents duplicate registration

**Expected**: 
- If credentials match: "This email is already registered. Signing you in instead..." → Auto sign-in
- If email exists but wrong password: "This email is already registered. Please sign in instead." → Redirect to sign-in
- If email not confirmed: "This email is already registered but not confirmed..." → Redirect to sign-in

**How it works**: App attempts sign-in first to check if user exists before attempting sign-up

#### 5. Prompt Lost After Authentication

**Cause**: URL parameters not preserved

**Solution**: Already fixed - prompt is now preserved through:
```
Landing → Auth → Callback → Landing (with prompt) → Onboarding
```

#### 6. Infinite Redirect Loop

**Causes**:
- Auth state not loading
- Middleware conflict
- Session not persisting

**Solutions**:
- Clear browser cache and cookies
- Check `SupabaseAuthProvider` is wrapping app
- Verify no middleware is interfering
- Check browser dev tools for errors

### Debug Mode

Enable detailed logging:

```typescript
// In auth callback
console.log('Auth callback - code:', code);
console.log('Auth callback - session:', session);
console.log('Auth callback - redirectTo:', redirectTo);
```

### Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Next.js Docs**: https://nextjs.org/docs/app/building-your-application/routing
- **GitHub OAuth**: https://docs.github.com/en/apps/oauth-apps

---

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use different OAuth apps** for dev/staging/production
3. **Rotate secrets regularly** - Especially after team changes
4. **Enable email confirmation** - Prevent fake accounts
5. **Use HTTPS in production** - Required for OAuth
6. **Implement rate limiting** - Prevent brute force attacks
7. **Monitor auth logs** - Detect suspicious activity

---

## Summary of Changes Made

### Files Modified

1. **`src/app/page.tsx`**
   - Changed from dashboard to simple redirect to `/landing`
   - All users now start at landing page

2. **`src/app/auth/callback/page.tsx`**
   - Added proper OAuth code exchange
   - Improved error handling
   - Better session verification
   - Preserves redirect and prompt parameters

3. **`src/app/authentication/page.tsx`**
   - Added user existence check for sign-up
   - Improved error messages (user-friendly)
   - Auto-redirect when user already exists
   - Display URL error parameters
   - Better password/email validation feedback

### Routing Flow (Before vs After)

**Before**:
```
/ → Dashboard → (checks auth) → /authentication or /landing
```

**After**:
```
/ → Landing → (user action) → /authentication → /onboarding → /project/[id]
```

### Authentication Improvements

- ✅ Proper OAuth code exchange
- ✅ User-friendly error messages
- ✅ User existence check on sign-up
- ✅ Auto-redirect for existing users
- ✅ Prompt preservation through auth flow
- ✅ Production-ready GitHub OAuth setup
- ✅ Better session handling

---

## Next Steps

1. **Test the complete flow**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Test: Root → Landing → Auth → Onboarding → Dashboard
   ```

2. **Update GitHub OAuth for production**:
   - Follow [GitHub OAuth Setup](#github-oauth-setup) section
   - Update callback URLs before deploying

3. **Deploy to production**:
   - Set environment variables
   - Verify OAuth configuration
   - Test complete flow in production

4. **Monitor and iterate**:
   - Check Supabase Auth logs
   - Monitor error rates
   - Gather user feedback

---

## Contact & Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review Supabase Auth logs
- Check browser console for errors
- Verify environment variables are set correctly

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0
