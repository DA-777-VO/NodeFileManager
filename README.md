[//]: # (# NodeFileManager)

[//]: # ()
[//]: # (A web app for managing personal files: sign up, upload, preview, download, delete, and favorite. The project is split into `fileManager-backend` and `fileManager-frontend`.)

[//]: # ()
[//]: # (**Features**)

[//]: # (- JWT-based registration and login.)

[//]: # (- File upload &#40;multipart&#41; with disk storage.)

[//]: # (- In-app preview for images, videos, and text files &#40;txt/json&#41;.)

[//]: # (- Download and delete files.)

[//]: # (- Favorites and category filtering &#40;images/documents/videos/audio&#41;.)

[//]: # (- Search by file name.)

[//]: # ()
[//]: # (**Tech Stack**)

[//]: # (- Frontend: React 18, Vite, Redux Toolkit, React Router, Axios.)

[//]: # (- Backend: Node.js, Express, SQLite, Multer, JWT, bcryptjs.)

[//]: # ()
[//]: # (**Structure**)

[//]: # (- `fileManager-frontend` — client &#40;Vite + React&#41;.)

[//]: # (- `fileManager-backend` — API and file storage.)

[//]: # (- `fileManager-backend/database.sqlite` — SQLite database.)

[//]: # (- `fileManager-backend/uploads/` — uploaded files.)

[//]: # ()
[//]: # (## Quick Start)

[//]: # ()
[//]: # (### Backend Setup)

[//]: # ()
[//]: # (1. Navigate to backend directory:)

[//]: # (```bash)

[//]: # (   cd fileManager-backend)

[//]: # (```)

[//]: # ()
[//]: # (2. Install dependencies:)

[//]: # (```bash)

[//]: # (   npm install)

[//]: # (```)

[//]: # ()
[//]: # (3. Create `.env` file with the following content:)

[//]: # (```)

[//]: # (   SECRET_KEY=your_secret_key)

[//]: # (```)

[//]: # ()
[//]: # (4. Start development server:)

[//]: # (```bash)

[//]: # (   npm run dev)

[//]: # (```)

[//]: # ()
[//]: # (API will be available at `http://localhost:5000`)

[//]: # ()
[//]: # (### Frontend Setup)

[//]: # ()
[//]: # (1. Navigate to frontend directory:)

[//]: # (```bash)

[//]: # (   cd fileManager-frontend)

[//]: # (```)

[//]: # ()
[//]: # (2. Install dependencies:)

[//]: # (```bash)

[//]: # (   npm install)

[//]: # (```)

[//]: # ()
[//]: # (3. Start development server:)

[//]: # (```bash)

[//]: # (   npm run dev)

[//]: # (```)

[//]: # ()
[//]: # (Open `http://localhost:5173` in your browser)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (## Available Scripts)

[//]: # ()
[//]: # (### Backend &#40;`fileManager-backend`&#41;)

[//]: # ()
[//]: # (| Command | Description |)

[//]: # (|---------|-------------|)

[//]: # (| `npm run dev` | Start development server with nodemon |)

[//]: # (| `npm start` | Start production server |)

[//]: # (| `npm test` | Run tests with Node test runner |)

[//]: # ()
[//]: # (### Frontend &#40;`fileManager-frontend`&#41;)

[//]: # ()
[//]: # (| Command | Description |)

[//]: # (|---------|-------------|)

[//]: # (| `npm run dev` | Start Vite development server |)

[//]: # (| `npm run build` | Create production build |)

[//]: # (| `npm run preview` | Preview production build |)

[//]: # (| `npm test` | Run tests with Vitest |)

[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (**API**)

[//]: # (- `POST /register` — sign up)

[//]: # (- `POST /login` — sign in)

[//]: # (- `GET /files` — list user files &#40;Authorization: Bearer&#41;)

[//]: # (- `POST /upload` — upload a file &#40;multipart, field `file`&#41;)

[//]: # (- `GET /files/:filename` — get/preview file)

[//]: # (- `DELETE /files/:filename` — delete file)

[//]: # (- `PATCH /files/:filename/favorite` — favorite &#40;`{ "favorite": true|false }`&#41;)

[//]: # (- `GET /health` — server health check)

[//]: # ()
[//]: # (**Notes**)

[//]: # (- Backend listens on port `5000` &#40;hardcoded in `fileManager-backend/index.js`&#41;.)

[//]: # (- CORS is enabled for `http://localhost:5173`.)



# NodeFileManager

A web application for managing personal files with user authentication, file uploads, previews, and organization features.

## Features

- User authentication with JWT-based registration and login
- File upload with multipart form data and disk storage
- In-app preview for images, videos, and text files (txt/json)
- File operations: download, delete, and favorite
- Filtering by categories: images, documents, videos, audio
- Search files by name

## Tech Stack

**Frontend:** React 18, Vite, Redux Toolkit, React Router, Axios  
**Backend:** Node.js, Express, SQLite, Multer, JWT, bcryptjs

## Project Structure
```
fileManager-backend/
├── database.sqlite    # SQLite database
├── uploads/          # Uploaded files storage
└── index.js          # Server entry point

fileManager-frontend/
└── src/              # React application
```

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
   cd fileManager-backend
```

2. Install dependencies:
```bash
   npm install
```

3. Create a `.env` file in the root of `fileManager-backend`:
```env
   SECRET_KEY=your_secret_key
```

4. Start the development server:
```bash
   npm run dev
```

The API will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
   cd fileManager-frontend
```

2. Install dependencies:
```bash
   npm install
```

3. Start the development server:
```bash
   npm run dev
```

Open your browser at `http://localhost:5173`

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run tests with Node test runner |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests with Vitest |

## API Endpoints

### Authentication
- `POST /register` — Create new user account
- `POST /login` — Sign in and receive JWT token

### Files
- `GET /files` — List all user files (requires Authorization header)
- `POST /upload` — Upload a file (multipart/form-data, field: `file`)
- `GET /files/:filename` — Get or preview a file
- `DELETE /files/:filename` — Delete a file

## Configuration

- Backend server runs on port `5000`
- CORS is enabled for `http://localhost:5173`
- Uploaded files are stored in `fileManager-backend/uploads/`
- Database file: `fileManager-backend/database.sqlite`