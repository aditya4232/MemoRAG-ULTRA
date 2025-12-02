# Verification Plan - Advanced Features

## 1. Project Limits (Max 5)
- [ ] Create 5 projects.
- [ ] Try to create a 6th project.
- [ ] Verify you receive an error message: "Project limit reached".

## 2. Auto-Cleanup (15 Days)
- [ ] (Backend Test) This is hard to test manually without manipulating database dates.
- [ ] Verify the code logic in `api/projects/route.ts` includes the delete query.

## 3. Auto-Save
- [ ] Open a project in the Editor.
- [ ] Make a change (e.g., generate new code).
- [ ] Wait 10 seconds.
- [ ] Reload the page.
- [ ] Verify the changes persist.

## 4. API Key Usage
- [ ] Go to Settings -> API Keys.
- [ ] Remove all keys.
- [ ] Try to generate code in the Editor.
- [ ] Verify you get a "Missing API Keys" error.
- [ ] Add a valid key.
- [ ] Verify generation works.

## 5. Live Preview
- [ ] Generate code that includes HTML/CSS/JS.
- [ ] Verify the preview pane updates and renders correctly.
- [ ] Verify interactive elements (buttons, etc.) work in the preview.

## 6. Share & Download
- [ ] Click "Share". Verify link is copied.
- [ ] Click "Download ZIP". Verify the file downloads.
