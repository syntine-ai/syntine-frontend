# 🔗 Frontend - Backend Connection Configuration

## ✅ Configuration Complete!

Your frontend is now configured to connect to the production backend:

**Backend URL**: `https://king-prawn-app-ldya6.ondigitalocean.app`

---

## 📁 Files Created

### 1. `.env.production` ✅
Used when building for production (e.g., deploying to cPanel).

```env
VITE_API_URL=https://king-prawn-app-ldya6.ondigitalocean.app
```

### 2. `.env.local` ✅
Used for local development. Now pointing to production backend for easy testing.

```env
VITE_API_URL=https://king-prawn-app-ldya6.ondigitalocean.app
```

> **Note**: `.env.local` is gitignored. `.env.production` will be committed.

---

## 🧪 Test Locally Right Now

Restart your dev server to pick up the new environment variable:

```bash
cd d:\Code\syntine-saas\syntine-frontend

# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

Now your local frontend will connect to the production backend! 🎉

---

## ⚠️ CRITICAL: Update Backend CORS

Your backend needs to allow requests from your frontend. You need to update the `CORS_ORIGINS` environment variable in Digital Ocean.

### What URLs to Add?

1. **Your cPanel frontend URL** (where your production frontend is hosted)
2. **http://localhost:5173** (for local development)

### How to Update:

1. Go to Digital Ocean → Your App
2. **Settings** → **App-Level Environment Variables**
3. Click **"Edit"**
4. Find `CORS_ORIGINS` and update:

```env
CORS_ORIGINS=http://localhost:5173,https://your-cpanel-frontend-url.com,https://www.your-cpanel-frontend-url.com
```

**Replace** `https://your-cpanel-frontend-url.com` with your actual frontend URL!

5. Click **"Save"** (will trigger a redeploy)

---

## 📊 Verify Connection

### 1. Test Backend Health (should work now)
```bash
curl https://king-prawn-app-ldya6.ondigitalocean.app/health
```

### 2. Check API Docs
Open in browser: https://king-prawn-app-ldya6.ondigitalocean.app/docs

### 3. Test Frontend Connection
Once you restart your dev server and update CORS:
- Open frontend: http://localhost:5173
- Open browser DevTools → Console
- You should see: `🔗 Backend URL: https://king-prawn-app-ldya6.ondigitalocean.app`
- Try logging in or making a test call
- Check for CORS errors (should be none after updating CORS_ORIGINS)

---

## 🚀 Deploy to Production

When ready to deploy frontend to cPanel:

```bash
cd d:\Code\syntine-saas\syntine-frontend
git add .
git commit -m "feat: configure production backend URL"
git push origin main
```

Your GitHub Actions will automatically build and deploy to cPanel with the production backend URL! 🎯

---

## 🐛 Troubleshooting

### CORS Errors?
```
Access to fetch at 'https://king-prawn-app-ldya6...' has been blocked by CORS
```

**Fix**: Update `CORS_ORIGINS` in Digital Ocean (see above)

### Still pointing to localhost:8003?
```bash
# Restart dev server
# Or rebuild for production
npm run build
```

### Environment variable not loading?
- Check file name is exactly `.env.production` (not `.env.prod`)
- Rebuild: `npm run build`
- Check browser console for the backend URL log

---

## ✅ Next Steps Checklist

- [ ] Update `CORS_ORIGINS` in Digital Ocean with your frontend URLs
- [ ] Wait for backend redeploy (~2-3 minutes)
- [ ] Restart frontend dev server locally
- [ ] Test login/authentication
- [ ] Test making a call from Agents page
- [ ] Verify no CORS errors
- [ ] Push frontend changes to GitHub
- [ ] Deploy to cPanel (automatic via GitHub Actions)
- [ ] Test production frontend → production backend

---

**Your backend is live and ready! Just update CORS and you're good to go!** 🎉
