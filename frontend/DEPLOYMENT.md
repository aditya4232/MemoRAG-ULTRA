# 🚀 Complete Deployment Guide - CodeGenesis Beta v0.45

## Prerequisites
- Supabase account ([https://supabase.com](https://supabase.com))
- Clerk account ([https://clerk.com](https://clerk.com))
- Vercel account (for deployment)

## Step 1: Database Setup (CRITICAL)

### 1.1 Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "SQL Editor" in the left sidebar

### 1.2 Run the Complete Schema
1. Click "New Query"
2. Copy the **entire** contents of `supabase/schema.sql`
3. Paste into the SQL editor
4. Click "Run" or press `Ctrl+Enter`
5. Wait for completion (should take 5-10 seconds)

### 1.3 Verify Tables Created
Go to "Table Editor" and confirm you see:
- ✅ `profiles`
- ✅ `projects`
- ✅ `generations`
- ✅ `user_settings`
- ✅ `encrypted_api_keys` (NEW - for secure key storage)
- ✅ `model_preferences` (NEW)
- ✅ `usage_tracking` (NEW)

### 1.4 Verify Functions Created
Go to "Database" → "Functions" and confirm:
- ✅ `encrypt_api_key`
- ✅ `decrypt_api_key`
- ✅ `update_updated_at_column`
- ✅ `increment_generation_count`

## Step 2: Environment Variables

### 2.1 Local Development (.env.local)
Ensure your `.env.local` has:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Key Encryption (CHANGE IN PRODUCTION!)
API_KEY_ENCRYPTION_SECRET=your-super-secret-encryption-key-min-32-chars

# Backend API (optional)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2.2 Vercel Deployment
Add the same environment variables in Vercel:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable from `.env.local`
4. **IMPORTANT**: Generate a strong `API_KEY_ENCRYPTION_SECRET` (use a password generator, min 32 characters)

## Step 3: Security Configuration

### 3.1 Generate Secure Encryption Key
For production, generate a strong encryption key:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use an online generator (ensure it's 32+ characters)
```

### 3.2 Update Supabase RLS Policies (Optional)
The schema includes basic RLS policies. For production, you may want to customize them in the Supabase dashboard under "Authentication" → "Policies".

## Step 4: Test the Application

### 4.1 Start Development Server
```bash
npm run dev
```

### 4.2 Test Database Connection
1. Sign in with Clerk
2. Go to Dashboard
3. Try creating a new project
4. Check browser console for errors
5. Check terminal for server logs

### 4.3 Test API Key Storage
1. Go to Settings → API Keys
2. Add an OpenAI API key
3. Click "Save"
4. Verify you see "Configured" badge
5. Check Supabase → Table Editor → `encrypted_api_keys` to see the encrypted entry

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub
```bash
git add .
git commit -m "feat: complete secure backend setup"
git push origin main
```

### 5.2 Connect to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Add all environment variables
5. Deploy!

### 5.3 Post-Deployment Checks
1. Visit your deployed URL
2. Sign in
3. Test project creation
4. Test API key storage
5. Check Supabase logs for any errors

## Troubleshooting

### Error: "relation does not exist"
**Solution**: You haven't run the SQL schema. Go back to Step 1.

### Error: "function encrypt_api_key does not exist"
**Solution**: The SQL schema wasn't fully executed. Re-run the entire `schema.sql` file.

### Error: "Failed to create project" (500)
**Possible causes**:
1. Database tables not created → Run schema
2. Foreign key constraint → Ensure `profiles` table has your user
3. RLS policy blocking → Check Supabase logs

**Debug steps**:
1. Check browser console for detailed error
2. Check terminal (npm run dev) for server logs
3. Check Supabase → Logs → Postgres Logs

### Error: "Failed to save API key"
**Possible causes**:
1. `encrypted_api_keys` table doesn't exist
2. Encryption functions not created
3. `API_KEY_ENCRYPTION_SECRET` not set

**Solution**: Re-run the complete schema and ensure `.env.local` has the encryption secret.

### API Keys Not Working in Generation
**Solution**: The backend needs to retrieve keys from the database. Ensure:
1. Keys are saved (check `encrypted_api_keys` table)
2. The `/api/generate` route is updated to use `getDecryptedApiKey()`

## Security Best Practices

### ✅ DO:
- Use a strong, unique `API_KEY_ENCRYPTION_SECRET` (32+ characters)
- Store the secret in Vercel environment variables, never in code
- Rotate the encryption secret periodically
- Monitor Supabase logs for suspicious activity
- Enable 2FA on Clerk and Supabase accounts

### ❌ DON'T:
- Commit `.env.local` to Git (it's in `.gitignore`)
- Use the default encryption secret in production
- Share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- Store unencrypted API keys in the database

## Data Flow

### API Key Storage:
1. User enters key in Settings → API Keys
2. Frontend sends key to `/api/keys` (POST)
3. Backend verifies Clerk session
4. Backend calls `encrypt_api_key()` Supabase function
5. Encrypted key stored in `encrypted_api_keys` table
6. Original key is never stored

### API Key Usage:
1. User triggers code generation
2. Backend calls `getDecryptedApiKey(userId, provider)`
3. Supabase function decrypts key server-side
4. Backend uses decrypted key to call LLM API
5. Key is never sent to client

## Need Help?

1. Check the browser console (F12)
2. Check the terminal running `npm run dev`
3. Check Supabase → Logs
4. Review `DATABASE_SETUP.md` for detailed SQL instructions
5. Ensure all environment variables are set correctly

## Success Checklist

Before deploying to production:
- [ ] Database schema executed successfully
- [ ] All 7 tables created
- [ ] All 4 functions created
- [ ] Environment variables set in Vercel
- [ ] Strong encryption secret generated
- [ ] Test project creation works
- [ ] Test API key storage works
- [ ] Test code generation works
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Supabase RLS policies reviewed

---

**🎉 Congratulations!** Your CodeGenesis instance is now secure and production-ready!
