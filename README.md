# AI Study Assistant

A study dashboard that turns your notes into a **summary**, a **practice quiz** and **flashcards**, plus a simple **study planner**.

- **Frontend:** React + Vite + plain CSS
- **Backend:** Python + Flask (REST API)
- **No database, no login, no paid services, no API keys.**

> **Honest note:** the summary, quiz and flashcards are made with *basic text-processing logic* (counting words, scoring sentences, matching patterns like "X is ..."). It is **not** a real AI model, so results are best with clear, well-written notes and can sometimes be imperfect. The app says this on every tool page.

## Features

| Page | What it does |
|------|--------------|
| Notes | Type or paste notes, load sample notes, clear them. Saved in your browser (localStorage). |
| Summary | Picks the most important sentences. Copy button included. |
| Quiz | Fill-in-the-blank multiple-choice questions, score check, correct answers and explanations. |
| Flashcards | Question/answer cards with flip, previous, next and shuffle. |
| Planner | Add tasks with optional due dates, tick them off, delete them. Saved in localStorage. |

## Project structure

```
ai-study-assistant/
├── README.md
├── .gitignore
├── backend/
│   ├── app.py              <- the whole Flask API
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env.example        <- shows the VITE_API_URL variable
    ├── public/favicon.svg
    └── src/
        ├── main.jsx        <- entry point
        ├── App.jsx         <- page switching + saved data
        ├── api.js          <- all calls to the backend
        ├── styles.css
        ├── sampleData.js
        ├── utils.js
        ├── hooks/useLocalStorage.js
        ├── components/     <- Sidebar, icons, loading/error pieces
        └── pages/          <- Dashboard, Notes, Summary, Quiz, Flashcards, Planner
```

## Run it on your computer

You need **Python 3.9+** and **Node.js 18+** (check with `python --version` and `node --version`).
Use **two terminal windows**: one for the backend, one for the frontend.

### Terminal 1: backend

1. Go into the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   - Mac / Linux: `python3 -m venv venv`
   - Windows: `python -m venv venv`
3. Activate it:
   - Mac / Linux: `source venv/bin/activate`
   - Windows (PowerShell): `venv\Scripts\Activate.ps1`
   - Windows (Command Prompt): `venv\Scripts\activate.bat`
4. Install Flask and Flask-CORS (plus gunicorn, which is only used for deployment):
   ```bash
   pip install -r requirements.txt
   ```
5. Start the backend:
   ```bash
   python app.py
   ```
6. Check it works: open <http://localhost:5001/api/health>. You should see `{"service":"AI Study Assistant API","status":"ok",...}`.

Leave this terminal running.

### Terminal 2: frontend

1. Go into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open <http://localhost:5173>. The bottom of the sidebar should say **Backend connected** with a green dot.

### How the frontend finds the backend

`frontend/src/api.js` reads the `VITE_API_URL` environment variable.

- **While developing** (`npm run dev`) it defaults to `http://localhost:5001`, so you don't need to configure anything.
- **In production** there is no default. You must set `VITE_API_URL` (see deployment below), so the live site never points at localhost.

To override it locally, copy `frontend/.env.example` to `frontend/.env` and edit it, then restart `npm run dev`.

## API reference

All requests and responses use JSON. Errors look like `{"error": "message"}`.

| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| GET | `/api/health` | none | Returns `{"status": "ok"}` |
| POST | `/api/summarize` | `{"text": "...", "sentences": 3}` | `sentences` optional, 1-10 |
| POST | `/api/generate-quiz` | `{"text": "...", "count": 5}` | `count` optional, 1-10 |
| POST | `/api/generate-flashcards` | `{"text": "...", "count": 8}` | `count` optional, 1-20 |

Text must be 50 to 20,000 characters. Try it from a terminal:

```bash
curl -X POST http://localhost:5001/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Photosynthesis is how plants make food. Plants use sunlight, water and carbon dioxide. The process happens in the leaves. Chlorophyll absorbs the light."}'
```

## Put it on GitHub

1. Create an **empty** repository on github.com (do not add a README there).
2. In the project's root folder (the one containing `backend` and `frontend`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Study Assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/ai-study-assistant.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME` with your GitHub username. The `.gitignore` already keeps `node_modules` and `venv` out of the repository.

## Deploy

Deploy the **backend first** (you need its URL for the frontend).

### 1. Backend on Render (free option)

1. Sign in at <https://render.com> with GitHub.
2. Click **New +** → **Web Service** and choose your repository.
3. Fill in:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** Free
4. Click **Create Web Service** and wait for the build to finish.
5. Copy your service URL (for example `https://ai-study-assistant-api.onrender.com`) and open `<your-url>/api/health` to confirm it returns `"status": "ok"`.

### 2. Frontend on Vercel

1. Sign in at <https://vercel.com> with GitHub and click **Add New** → **Project**.
2. Import the same repository.
3. Set **Root Directory** to `frontend`. Vercel detects **Vite** automatically (build command `npm run build`, output directory `dist`).
4. Open **Environment Variables** and add:
   - **Name:** `VITE_API_URL`
   - **Value:** your Render URL, with **no trailing slash**
5. Click **Deploy**. Copy your Vercel URL when it finishes.

> If you change `VITE_API_URL` later, you must **redeploy** on Vercel. The value is baked in when the site is built.

### 3. Lock the backend to your frontend (recommended)

By default the backend accepts requests from any website. Once you have your Vercel URL:

1. In Render, open your service → **Environment** → add `CORS_ORIGINS` = `https://your-app.vercel.app` (no trailing slash; separate several with commas).
2. Save. Render redeploys automatically.

Note that Vercel "preview" deployments use different URLs, so add them to `CORS_ORIGINS` too if you want them to work.

### Free hosting limits

Free tiers have limits, and they can change, so check each provider's current pricing page.

- **Render free web services go to sleep** after a period without traffic. The first request afterwards can take around a minute while it wakes up. The app shows a "taking longer than usual" message and waits up to 60 seconds. Usage hours are also limited.
- **Vercel's free (Hobby) plan** has usage limits and is intended for personal, non-commercial projects.

## Troubleshooting

1. **Sidebar says "Backend offline"**: the backend is not running or not reachable. Start it with `python app.py` (with the virtual environment active) and click **Retry**.
2. **`python` or `pip` not found**: try `python3` and `pip3` instead (common on Mac/Linux).
3. **PowerShell refuses to activate the venv**: run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then try again. Or use Command Prompt.
4. **Port already in use**: change the backend port with `PORT=5002 python app.py` (Mac/Linux) or `$env:PORT=5002; python app.py` (PowerShell), and set `VITE_API_URL=http://localhost:5002` in `frontend/.env`.
5. **Works locally but not when deployed**: check that `VITE_API_URL` is set on Vercel and you redeployed, and that `CORS_ORIGINS` on Render exactly matches your Vercel URL.

## Known limitations

- Because the logic is simple, quiz distractors can occasionally be weak, and a blank may have more than one reasonable answer.
- Sentence splitting is basic, so abbreviations like "e.g." can split a sentence early.
- The tools are tuned for English notes.
- Your notes and tasks live only in your browser. Clearing browser data deletes them.
