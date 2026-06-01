# Complete Deployment Guide

Deploy your Inventory System to Render (PostgreSQL + Backend) and Vercel (Frontend).

---

## PART 1: Deploy PostgreSQL on Render

### Step 1: Sign In to Render
1. Go to [render.com](https://render.com)
2. Click **Sign Up** (or sign in if you have an account)
3. Create an account using GitHub, Google, or email

### Step 2: Create a PostgreSQL Database
1. In Render dashboard, click **New** → **PostgreSQL**
2. Fill in the form:
   - **Name**: `inventory-db` (or any name you prefer)
   - **Database**: `inventory_db`
   - **User**: `inventory_user`
   - **Region**: Choose the closest to you (e.g., `Oregon`)
   - **PostgreSQL Version**: `16`
3. Click **Create Database**

### Step 3: Wait for Database to Be Ready
- The database will take 2-5 minutes to spin up
- You'll see a "Provisioning" status, then "Available"

### Step 4: Copy Database Connection Details
Once the database is ready, Render will show a connection panel:

```
Host: dpg-xxxxx.oregon-postgres.render.com
Port: 5432
Database: inventory_db
User: inventory_user
Password: (long password string)
Internal Database URL: postgresql://inventory_user:PASSWORD@dpg-xxxxx.oregon-postgres.render.com/inventory_db
External Database URL: postgresql://inventory_user:PASSWORD@dpg-xxxxx.oregon-postgres.render.com/inventory_db
```

**Save these values** — you'll need them for the backend.

---

## PART 2: Deploy Backend on Render

### Step 1: Make Sure Your Code is Pushed to GitHub
```bash
cd c:\Users\satwi\OneDrive\Desktop\inventory-system
git push origin main
```

### Step 2: Create a Web Service on Render
1. In Render dashboard, click **New** → **Web Service**
2. Click **Deploy an existing repository** (GitHub)
3. Search for and select your repo: `Inventory-order-management-system`

### Step 3: Configure the Web Service
Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `inventory-backend` |
| **Environment** | `Docker` |
| **Region** | Same as PostgreSQL (e.g., `Oregon`) |
| **Branch** | `main` |
| **Root Directory** | `backend` |

### Step 4: Set Advanced Options
1. Scroll to **Advanced** section
2. Click **Add Environment Variable**
3. Add this variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Copy the **External Database URL** from your PostgreSQL database panel (from Part 1, Step 4)
   - Example: `postgresql://inventory_user:wTadPTUmf336hLzMaZ9TjRm2VzD1RwyP@dpg-d8ereo6k1jcs73a9sadg-a.oregon-postgres.render.com/inventory_db`

4. Add second variable:
   - **Key**: `PORT`
   - **Value**: `10000` (or any port you prefer)

### Step 5: Configure Build & Start Commands
Scroll to find these fields:

| Field | Value |
|-------|-------|
| **Build Command** | (leave empty - Render auto-detects from Dockerfile) |
| **Start Command** | (leave empty - Render auto-detects from Dockerfile) |

> The `backend/Dockerfile` already contains the correct commands.

### Step 6: Deploy
1. Click **Create Web Service**
2. Render will:
   - Clone your repo
   - Build the Docker image
   - Start the container
   - This takes 3-5 minutes

### Step 7: Wait for "Live" Status
Watch the logs in the Render dashboard:
```
Creating tables in database...
Database already has data. Refreshing demo records if needed...
Demo records refreshed successfully!
INFO:     Started server process
INFO:     Application startup complete.
```

When you see **"Your service is live"** at the top, the backend is ready!

### Step 8: Copy Your Backend URL
At the top of the service page, you'll see:
```
Your service is live at: https://inventory-backend-xxxxx.onrender.com
```

**Save this URL** — you'll need it for the frontend.

---

## PART 3: Deploy Frontend on Vercel

### Step 1: Sign In to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** and choose **Continue with GitHub**
3. Authorize Vercel to access your GitHub account

### Step 2: Create a New Project
1. In Vercel dashboard, click **Add New...** → **Project**
2. Click **Import Git Repository**
3. Search for and select: `Inventory-order-management-system`
4. Click **Import**

### Step 3: Configure Project Settings
1. In the configuration page, fill:
   - **Project Name**: `inventory-frontend` (or similar)
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 4: Add Environment Variable
1. Scroll to **Environment Variables** section
2. Click **Add**
3. Fill in:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render backend URL + `/api/v1`
   - Example: `https://inventory-backend-xxxxx.onrender.com/api/v1`
4. Click **Add**

### Step 5: Deploy
1. Click **Deploy**
2. Vercel will:
   - Clone your repo
   - Install dependencies
   - Build with Vite
   - Deploy to CDN
   - This takes 2-3 minutes

### Step 6: Wait for Deployment to Complete
Watch the logs. When complete, you'll see:
```
✓ Build completed
✓ Deployment complete
```

### Step 7: Copy Your Frontend URL
Vercel will show:
```
Your production deployment is ready at: https://inventory-frontend-xxxxx.vercel.app
```

---

## PART 4: Test Your Deployed Application

### Step 1: Open the Frontend
1. Click the Vercel deployment URL
2. You should see the Inventory Control Panel login/dashboard

### Step 2: Test the Dashboard
1. Click **Dashboard** in the sidebar
2. Verify data loads (products, customers, orders)

### Step 3: Test Other Pages
- Click **Products** → should load products
- Click **Customers** → should load customers
- Click **Orders** → should load orders
- Click **New Order** → should allow creating an order

### Step 4: Check Browser Console
If pages don't load, open **DevTools** (F12):
1. Go to **Console** tab
2. Look for error messages
3. Common issues:
   - `CORS error` → Backend not accessible
   - `404 Not Found` → Wrong API URL
   - `Connection refused` → Backend not running

---

## TROUBLESHOOTING

### Backend Not Starting on Render

Check the logs in Render:
1. Go to your backend service
2. Click **Logs** tab
3. Look for error messages

Common errors:
- **`database connection failed`** → Wrong `DATABASE_URL`
- **`port already in use`** → Change `PORT` to different number
- **`module not found`** → Missing dependencies in `requirements.txt`

**Fix**: Update environment variable and redeploy by pushing new commit to GitHub.

### Frontend Can't Connect to Backend

Check the deployed frontend logs:
1. Go to your Vercel project
2. Click **Deployments** → select the latest deployment
3. Click **Functions** or **Logs** to see errors

Common issues:
- **`VITE_API_URL` not set** → Add it in Vercel project settings
- **Wrong URL format** → Must include `/api/v1` at the end
- **CORS error** → Backend needs to allow the frontend domain

**Fix**: Update `VITE_API_URL` in Vercel and redeploy.

### Database Connection Issues

If backend can't connect to PostgreSQL:
1. Verify `DATABASE_URL` in Render backend settings is exactly correct
2. Check that PostgreSQL database is still "Available" in Render
3. Ensure the password in `DATABASE_URL` has no special characters that break the URL

---

## QUICK REFERENCE

| Service | Platform | URL Format | Environment |
|---------|----------|-----------|-------------|
| PostgreSQL | Render | `postgresql://user:pass@host/db` | `DATABASE_URL` |
| Backend API | Render Docker | `https://xxx.onrender.com/api/v1` | `DATABASE_URL`, `PORT` |
| Frontend | Vercel | `https://xxx.vercel.app` | `VITE_API_URL` |

---

## Summary

✅ PostgreSQL running on Render  
✅ Backend API running on Render Docker  
✅ Frontend running on Vercel  
✅ Frontend connects to Backend via API  
✅ Backend connects to PostgreSQL

Your full-stack application is now deployed!
