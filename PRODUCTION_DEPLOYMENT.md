# Production Deployment Guide - Quick Reference

## 🚀 Pre-Deployment Checklist

### 1. GitHub OAuth Configuration

#### Create Production OAuth App
1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   ```
   Application name: AcEMCP Production
   Homepage URL: https://yourdomain.com
   Authorization callback URL: https://yourdomain.com/auth/callback
   ```
4. Click **"Register application"**
5. **Copy Client ID**
6. Click **"Generate a new client secret"**
7. **Copy Client Secret** (save securely - shown only once)

### 2. Supabase Configuration

#### Update GitHub Provider
1. Go to: **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **GitHub** provider
3. Enable if not already enabled
4. Enter:
   - **Client ID**: (from step 1)
   - **Client Secret**: (from step 1)
5. Click **"Save"**

#### Configure Site URLs
1. Go to: **Authentication** → **URL Configuration**
2. Set:
   ```
   Site URL: https://yourdomain.com
   ```
3. Add to **Redirect URLs**:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/**
   ```
4. Click **"Save"**

### 3. Environment Variables

Set these in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to set**:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Railway**: Project → Variables
- **Custom Server**: `.env.production` file

### 4. Deploy Application

```bash
# Build locally to test
npm run build

# Deploy to your platform
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Or push to connected Git repository
git push origin main
```

---

## ✅ Post-Deployment Verification

### Test Authentication Flow

1. **Visit your production site**: `https://yourdomain.com`
   - ✓ Should redirect to `/landing`

2. **Test GitHub OAuth**:
   - Click "Sign in with GitHub"
   - ✓ Should redirect to GitHub
   - Authorize the app
   - ✓ Should redirect back to your site
   - ✓ Should be authenticated

3. **Test Email Sign-Up**:
   - Click "Create account"
   - Enter email and password
   - ✓ Should receive confirmation email
   - Click confirmation link
   - ✓ Should be authenticated

4. **Test Email Sign-In**:
   - Enter existing credentials
   - ✓ Should sign in successfully

5. **Test Complete Flow**:
   ```
   Landing → Enter Prompt → Auth → Onboarding → Project Dashboard
   ```
   - ✓ Prompt should be preserved
   - ✓ Project should be created
   - ✓ Dashboard should load

---

## 🔧 Common Production Issues

### Issue: GitHub OAuth "redirect_uri_mismatch"

**Fix**:
1. Verify GitHub OAuth app callback URL: `https://yourdomain.com/auth/callback`
2. Verify Supabase redirect URLs include: `https://yourdomain.com/auth/callback`
3. Ensure no trailing slashes
4. Use exact domain (www vs non-www matters)

### Issue: "Invalid login credentials"

**Fix**:
1. Check if email is confirmed (check Supabase Auth users table)
2. Verify password is correct
3. Check Supabase Auth logs for details
4. Try password reset flow

### Issue: Environment variables not working

**Fix**:
1. Verify variables are set in deployment platform
2. Ensure they start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after setting variables
4. Clear build cache if needed

### Issue: Session not persisting

**Fix**:
1. Check if cookies are enabled
2. Verify Site URL in Supabase matches deployment URL
3. Ensure HTTPS is enabled (required for secure cookies)
4. Check browser console for errors

---

## 📊 Monitoring

### Supabase Dashboard

**Check Auth Logs**:
1. Go to: **Authentication** → **Logs**
2. Monitor for:
   - Failed sign-in attempts
   - OAuth errors
   - Session creation issues

**Check Users**:
1. Go to: **Authentication** → **Users**
2. Verify:
   - Users are being created
   - Email confirmation status
   - Last sign-in times

### Application Logs

**Vercel**:
- Go to: **Deployments** → Select deployment → **Functions**
- Check for errors in auth callback

**Netlify**:
- Go to: **Deploys** → Select deploy → **Function logs**

---

## 🔐 Security Checklist

- [ ] GitHub OAuth uses separate app for production
- [ ] Client Secret is stored securely (not in code)
- [ ] Environment variables are set in deployment platform (not committed)
- [ ] HTTPS is enabled on production domain
- [ ] Supabase RLS (Row Level Security) policies are configured
- [ ] Email confirmation is enabled in Supabase
- [ ] Rate limiting is configured (if applicable)
- [ ] CORS is properly configured in Supabase

---

## 📝 Environment Variables Reference

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Database (if using Prisma or direct connection)
DATABASE_URL=postgresql://...
```

### Where to Find These Values

**Supabase URL & Anon Key**:
1. Go to: **Supabase Dashboard** → **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎯 Quick Commands

```bash
# Test build locally
npm run build
npm run start

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Check environment variables (Vercel)
vercel env ls

# Check environment variables (Netlify)
netlify env:list
```

---

## 📞 Support

If you encounter issues:

1. **Check Logs**:
   - Browser console
   - Supabase Auth logs
   - Deployment platform logs

2. **Verify Configuration**:
   - GitHub OAuth callback URL
   - Supabase Site URL
   - Environment variables

3. **Test Locally**:
   - Run `npm run dev`
   - Test with production environment variables
   - Check if issue persists

4. **Resources**:
   - [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
   - [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
   - [GitHub OAuth Docs](https://docs.github.com/en/apps/oauth-apps)

---

## ✨ Success Criteria

Your deployment is successful when:

- ✅ Root URL redirects to landing page
- ✅ GitHub OAuth works without errors
- ✅ Email sign-up sends confirmation emails
- ✅ Email sign-in works for confirmed users
- ✅ Prompts are preserved through auth flow
- ✅ Projects are created successfully
- ✅ Dashboard loads for authenticated users
- ✅ Sign out works correctly
- ✅ No console errors in production

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0
