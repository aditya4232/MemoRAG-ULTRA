# Verification Plan

## 1. Clerk Production Keys
- [ ] Read `CLERK_PRODUCTION_KEYS.md` for instructions.
- [ ] Verify you can find the keys in the Clerk Dashboard.
- [ ] (Optional) Update `.env.local` with production keys if you want to test production mode locally.

## 2. Project Management
- [ ] Navigate to `/dashboard/projects`.
- [ ] Click "Create Test Project".
- [ ] Verify a new project appears in the list.
- [ ] Click the three dots (menu) on the project card.
- [ ] Click "Delete".
- [ ] Verify the project is removed from the list.
- [ ] Verify a success toast message appears.

## 3. Editor
- [ ] Click "Open in Editor" on any project.
- [ ] Verify the editor loads without 404 errors (if the project exists).
- [ ] Verify the project name is displayed correctly.

## 4. Console Errors
- [ ] Open Browser Console (F12).
- [ ] Check for any red errors.
- [ ] Ignore "hydration mismatch" warnings (these are from browser extensions).
- [ ] Ignore "Clerk development keys" warning (unless you switched to production keys).

## 5. Overall Health
- [ ] Navigate between Dashboard, Projects, and Settings.
- [ ] Ensure navigation is smooth and no pages crash.
