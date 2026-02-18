# NoteVault Frontend

React + TypeScript + Tailwind CSS frontend for the NoteVault API.

## Stack

- **React 18** + **TypeScript**
- **Tailwind CSS** (custom dark theme)
- **React Router v6** (routing)
- **Axios** (API calls)
- **Lucide React** (icons)
- **Vite** (bundler)

## Setup

```bash
npm install
cp .env.example .env    # Set VITE_API_URL to your backend URL
npm run dev             # Runs on http://localhost:5173
```

## Pages & Routes

| Route           | Page             | Auth Required |
|-----------------|------------------|---------------|
| `/login`        | Login            | ❌            |
| `/register`     | Register         | ❌            |
| `/dashboard`    | Notes dashboard  | ✅            |
| `/notes/:id`    | Single note view | ✅            |
| `/profile`      | Edit profile     | ✅            |

## Features

- ✅ Register / Login with JWT
- ✅ Protected routes (auto redirect)
- ✅ Create notes (book, video, article, course, general)
- ✅ Cover image upload or color picker for general notes
- ✅ Filter by category & status
- ✅ Search notes
- ✅ Rich note content editor (per-note document)
- ✅ Edit & delete notes
- ✅ Drag & drop reorder
- ✅ Public/private toggle
- ✅ Edit profile + avatar upload
