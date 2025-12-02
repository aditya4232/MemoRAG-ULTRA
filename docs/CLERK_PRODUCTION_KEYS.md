# How to Get and Configure Clerk Production Keys

To deploy your application to production, you need to switch from Clerk's **Development** keys to **Production** keys.

## Step 1: Get Production Keys from Clerk Dashboard

1.  Log in to your [Clerk Dashboard](https://dashboard.clerk.com/).
2.  Select your application (e.g., **CodeGenesis**).
3.  In the sidebar, go to **API Keys**.
4.  At the top of the page, you will see a toggle or tab for **Development** and **Production**. Switch to **Production**.
5.  Copy the following keys:
    *   **Publishable Key** (starts with `pk_live_...`)
    *   **Secret Key** (starts with `sk_live_...`)

## Step 2: Configure Environment Variables

### For Local Production Testing (Optional)
If you want to test production keys locally (not recommended for daily development), update your `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### For Deployment (Vercel, Netlify, etc.)
Add these keys to your deployment platform's environment variables settings.

*   **Key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    *   **Value**: `pk_live_...`
*   **Key**: `CLERK_SECRET_KEY`
    *   **Value**: `sk_live_...`

## Step 3: Update Redirect URLs (Important!)

In production, your redirect URLs must match your production domain.

1.  In the Clerk Dashboard, go to **Paths** (or **Routing**).
2.  Ensure your **Sign-in**, **Sign-up**, **After sign-in**, and **After sign-up** paths are correct.
3.  If you are using a custom domain, make sure it is configured in the **Domains** section.

## Step 4: Verify

After deploying, visit your production URL. You should no longer see the "Development Mode" banner at the bottom of the screen.
