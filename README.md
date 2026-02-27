# CoHooter

A **Vue 3 + Tailwind CSS + Supabase** starter project scaffolded with Vite.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) project (free tier works)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in your Supabase credentials
cp .env.example .env

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
CoHooter/
├── public/              # Static assets
├── src/
│   ├── assets/          # CSS / images
│   ├── components/      # Reusable Vue components
│   ├── lib/             # Supabase client & utilities
│   ├── pages/           # Route-level page components
│   ├── router/          # Vue Router config
│   ├── App.vue          # Root component
│   └── main.js          # App entry point
├── .env.example         # Environment variable template
├── index.html           # Vite entry HTML
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── package.json
```

## Available Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm run dev`     | Start dev server          |
| `npm run build`   | Build for production      |
| `npm run preview` | Preview production build  |

## Environment Variables

| Variable                  | Description                          |
| ------------------------- | ------------------------------------ |
| `VITE_SUPABASE_URL`      | Your Supabase project URL            |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key   |
