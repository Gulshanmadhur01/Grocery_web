# Deployment Guide 🚀

This guide provides step-by-step instructions to deploy your **Grocery Web Application**. 

Since this is a full-stack application (React frontend + Node/Express backend), you have two excellent choices for deployment:
1. **Render (Full Stack - Recommended)**: Easiest deployment using the pre-configured `render.yaml` blueprint.
2. **Vercel (Frontend) + Render/Vercel (Backend)**: Optimized Vercel hosting for the frontend, combined with Render or Vercel for the backend.

---

## Option 1: Full-Stack Deployment on Render (Easiest)

Render allows you to deploy both the frontend and backend together using the `render.yaml` configuration in your root directory.

### Steps to Deploy:
1. **Push your code to GitHub**:
   Ensure your repository is initialized and pushed to a remote GitHub repository.
2. **Log in to Render**:
   Go to [dashboard.render.com](https://dashboard.render.com) and log in.
3. **Deploy Blueprint**:
   - Click on the **New** button and select **Blueprint**.
   - Connect your GitHub repository.
   - Render will automatically read the `render.yaml` file and show you the services to create:
     - `grocery-backend` (Node Web Service)
     - `grocery-frontend` (Static Site)
4. **Link the API URL**:
   - Once the blueprint finishes deploying, the backend web service will get a public URL (e.g. `https://grocery-backend-xyz.onrender.com`).
   - Go to your **grocery-frontend** settings in Render dashboard.
   - Under **Environment Variables**, locate `VITE_API_URL`.
   - Update its value to `https://grocery-backend-xyz.onrender.com/api` (replace with your actual backend URL + `/api`).
   - Trigger a new deploy for the frontend so Vite can build with the updated environment variable.

---

## Option 2: Frontend on Vercel + Backend on Render (Highly Recommended)

Deploying the React frontend on Vercel gives you instant page loads and automatic CDN caching, while Render keeps your Express backend running smoothly with local file writes.

### Step 1: Deploy Backend on Render
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New** > **Web Service**.
3. Connect your repository.
4. Set the following configurations:
   - **Name**: `grocery-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `JWT_SECRET` = `your_super_secret_jwt_key`
6. Click **Create Web Service**. Note down the URL when it's live (e.g., `https://grocery-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New** > **Project** and import your repository.
3. In the project setup, set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://grocery-backend.onrender.com/api` *(use your deployed Render backend URL here)*
5. Click **Deploy**.

---

## Option 3: Full Vercel Deployment (Serverless)

We have modified the backend code to support Vercel Serverless environment out-of-the-box by writing database changes to the `/tmp` folder.

### Step 1: Deploy Backend on Vercel
1. In the Vercel dashboard, click **Add New** > **Project**.
2. Connect your repository.
3. Configure the backend project:
   - **Root Directory**: `backend`
   - **Framework Preset**: `Other` / `None`
4. Add the **Environment Variables**:
   - `JWT_SECRET` = `your_super_secret_jwt_key`
5. Click **Deploy**. Copy the backend URL (e.g., `https://grocery-backend-vercel.vercel.app`).

### Step 2: Deploy Frontend on Vercel
1. Import the same repository as a new Vercel project.
2. Configure the frontend project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. Add the **Environment Variables**:
   - `VITE_API_URL` = `https://grocery-backend-vercel.vercel.app/api`
4. Click **Deploy**.

> [!IMPORTANT]
> Since Vercel runs serverless functions, the local file system (including `/tmp/data.json`) resets frequently. Writes to user registration, product uploads, or order database will NOT persist permanently on Vercel Serverless. For persistent database changes, Render (Option 2) or connecting a real MongoDB/PostgreSQL database is required.
