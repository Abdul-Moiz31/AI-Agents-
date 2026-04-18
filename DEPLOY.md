# Deploying (Render)

The **web app** is **Orchestrator Studio** (`orchestrator-studio/`). The file `demo-haiku.ts` at the repo root is only a **local demo** (`npm run start:demo`).

## If the service was created before this repo was updated

Open your Web Service → **Settings** and set:

| Field | Value |
| ----- | ----- |
| **Build Command** | `npm install && npm run build -w orchestrator-studio` |
| **Start Command** | `npm start` |

Do **not** use `node index.ts` or `node demo-haiku.ts` as the Render start command — those are one-shot demos, not the web server.

Then **Manual Deploy** → **Deploy latest commit**.

## Blueprint

If you use [Infrastructure as Code](https://render.com/docs/infrastructure-as-code), connect the repo and select the root [`render.yaml`](./render.yaml). That sets build/start and env hints automatically.

## Environment

- **`PORT`** — set by Render; the app already reads it.
- **`TRUST_PROXY=1`** — recommended behind Render’s proxy.
- **`NODE_ENV=production`** — usually set by Render; required so Express serves the Vite `dist/` UI.
- **`COOKIE_SECRET`** — use a long random string in production (or `generateValue` in Blueprint).
- **`OPENAI_API_KEY`** — optional; needed for server demo / anonymous run modes.

## Procfile

This repo includes a [`Procfile`](./Procfile) with `web: npm start` so platforms that honor it start the studio by default.
