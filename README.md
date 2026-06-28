# Grocery Web Application

A full-stack Grocery Web Application featuring a React frontend (powered by Vite) and an Express backend API.

## Features
- **Frontend**: Clean, responsive grocery shopping user interface with React Router, Lucide icons, and modern design.
- **Backend**: Express server with JWT authentication, custom middlewares, product management, and order routing.
- **Concurrently Managed**: Easy setup to run both servers with a single command.

## Tech Stack
- **Frontend**: React 19, React Router DOM, Vite, Vanilla CSS, Lucide React
- **Backend**: Node.js, Express, JSON Web Token (JWT), bcryptjs, CORS
- **Tooling**: Concurrently, nodemon, oxlint

---

## Project Structure
```text
Grocery web/
├── backend/            # Express REST API
│   ├── middleware/     # Authentication & other middlewares
│   ├── routes/         # API Route definitions (auth, orders, products)
│   ├── db.js           # Database helper / configuration
│   ├── data.json       # Mock/sample grocery products & user data
│   └── server.js       # Main server entrypoint
├── frontend/           # React + Vite application
│   ├── src/            # React components, pages, context, and styles
│   ├── public/         # Static assets (images, icons)
│   └── index.html      # Main HTML file
├── package.json        # Root package definition (concurrent start script)
└── README.md           # Project documentation
```

---

## Installation

To install all dependencies for the root, backend, and frontend directories, run:

```bash
npm run install:all
```

Alternatively, you can install them manually:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

## Running the Application

To start both the frontend and backend development servers concurrently, run:

```bash
npm run dev
```

- **Frontend** will be running at `http://localhost:5173` (or the port specified by Vite).
- **Backend** will be running at `http://localhost:5000` (or your configured port).
