# Orchestrator Studio

A small **command-center** for the [`agents-platform`](../agents-platform) package: a **React** UI plus a structured **Express** API that lists agents, validates requests, rate-limits writes, and runs the OpenAI Agents SDK with sensible timeouts.

## Repository layout

```text
orchestrator-studio/
├── README.md                 ← you are here
├── index.html
├── vite.config.ts            # dev server + /api proxy → backend
├── package.json
├── tsconfig.json
├── server/                   # Express backend
│   ├── index.ts              # process entry (listen)
│   ├── app.ts                # middleware + mount routes
│   ├── config/
│   │   └── env.ts            # dotenv paths + typed config
│   ├── middleware/
│   │   ├── requestContext.ts # x-request-id
│   │   ├── requestLogger.ts
│   │   ├── rateLimit.ts      # per-IP window (POST only)
│   │   ├── notFound.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── index.ts          # composes routers
│   │   ├── health.ts         # GET /health, /ready
│   │   ├── meta.ts           # GET /meta
│   │   ├── agents.ts         # GET /agents, /agents/:id
│   │   └── run.ts            # POST /run
│   ├── services/
│   │   └── agentService.ts   # thin wrapper over agents-platform
│   ├── types/
│   │   └── api.ts
│   └── utils/
│       ├── asyncHandler.ts
│       ├── requestId.ts
│       └── semaphore.ts      # max concurrent agent runs
└── src/                      # Vite + React frontend
    ├── main.tsx              # ThemeProvider → App
    ├── App.tsx               # Router + AppStateProvider
    ├── layout/
    │   └── AppShell.tsx      # masthead, tab nav, <Outlet />
    ├── pages/
    │   ├── HomePage.tsx      # overview + diagram + CTAs
    │   ├── ConsolePage.tsx # unified orchestrator only
    │   └── ToolsPage.tsx    # specialist grid + run workspace
    ├── context/
    │   └── AppStateContext.tsx
    ├── hooks/
    │   └── useAgentRunner.ts
    ├── theme/
    │   └── ThemeProvider.tsx
    ├── api/
    │   ├── client.ts
    │   └── types.ts
    ├── components/
    │   ├── NavTabs.tsx
    │   ├── ToolsGrid.tsx
    │   ├── HeroDiagram.tsx
    │   ├── TopBar.tsx
    │   ├── ThemeToggle.tsx
    │   └── Workspace.tsx
    └── constants/
        ├── examplePrompts.ts
        └── orchestrator.ts   # task-orchestrator id
```

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+ (workspaces / local `file:` deps)
- An **OpenAI API key** with access to models used by `@openai/agents`

## Setup

### 1. Install dependencies

From the **monorepo root** (parent of this folder):

```bash
cd "/path/to/Ai Agent sdk"
npm install
```

This installs `agents-platform` and `orchestrator-studio` and links them together.

### 2. Build the agents package

The API imports the compiled **`agents-platform`** output:

```bash
npm run build -w agents-platform
```

### 3. Configure environment

Create a **`.env`** file at the **repository root** (recommended) or inside `orchestrator-studio/`.

**Required:**

| Variable | Description |
| ------------------- | ------------------------------------------------ |
| `OPENAI_API_KEY`    | OpenAI key for `@openai/agents`                  |

**Optional (API / ops):**

| Variable | Default | Description                                      |
| ------------------------ | ------- | ------------------------------------------------ |
| `PORT`                   | `8787`  | API listen port                                  |
| `NODE_ENV`               | —       | `development` / `production`                     |
| `CORS_ORIGIN`          | `*`     | Comma-separated allowed origins, or `*`        |
| `BODY_LIMIT`           | `2mb`   | Max JSON body size                               |
| `MAX_CONCURRENT_RUNS`  | `4`     | Process-wide cap on parallel `/api/run`          |
| `RUN_SOFT_TIMEOUT_MS`  | `120000`| Soft timeout for a single agent run              |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate-limit window for mutating requests          |
| `RATE_LIMIT_MAX`       | `30`    | Max POSTs per IP per window (GETs not limited)   |
| `TRUST_PROXY`          | —       | Set to `1` if behind a reverse proxy (for `req.ip`) |

The server loads env in this order: **repo root `.env`**, then **`orchestrator-studio/.env`** (later overrides earlier).

### 4. Run in development

You **do not** need two terminals for normal use: **`npm run dev`** starts **both** the Express API and the Vite UI (`concurrently` in `package.json`).

From **orchestrator-studio** (or use the root script):

```bash
cd orchestrator-studio
npm run dev
```

- **UI:** [http://localhost:5173](http://localhost:5173) (Vite)
- **API:** [http://127.0.0.1:8787](http://127.0.0.1:8787)

Vite proxies **`/api/*`** to the API during dev.

**Optional — debug one process only:**

```bash
npm run dev:api    # Express only
npm run dev:ui     # Vite only
```

From **monorepo root:**

```bash
npm run dev -w orchestrator-studio
```

### 5. Production build (static UI)

```bash
cd orchestrator-studio
npm run build
```

Outputs static assets to `orchestrator-studio/dist/`. Serve that folder with any static host **and** run the API separately (same origin or configure CORS). For a single origin in production, put Vite’s `dist` behind nginx and **reverse-proxy** `/api` to the Node process.

## How to use

### Web UI

Routes (React Router):

| Path | Tab | Purpose |
| ---- | --- | ------- |
| `/` | **Home** | Overview, stats, inline diagram, links to Console and Tools |
| `/console` | **Console** | Single **task-orchestrator** agent — one brief, delegates to specialists |
| `/tools` | **Tools** | Grid of **specialist** agents (everything except the orchestrator); pick one, then run |

1. Open the dev URL (or your deployed site).
2. Use the **theme control** in the top bar for **dark** / **light** (`localStorage` key `orchestrator-theme`; `index.html` sets initial theme to reduce flash).
3. On **Console** or **Tools**, edit the brief and click **Execute run**. Output shows **duration** and **request id** (same as `x-request-id` on the API).

### HTTP API

| Method | Path               | Description |
| ------ | ------------------ | ----------- |
| `GET`  | `/api/health`      | Liveness; includes `openaiConfigured` |
| `GET`  | `/api/ready`       | Returns **503** if `OPENAI_API_KEY` missing |
| `GET`  | `/api/meta`        | Version, uptime, environment, key flag |
| `GET`  | `/api/agents`      | List agents (`id`, `title`, `description`) |
| `GET`  | `/api/agents/:id`  | Single agent metadata |
| `POST` | `/api/run`         | Run an agent (JSON body below) |

**`POST /api/run` body:**

```json
{
  "agentId": "task-orchestrator",
  "message": "Your natural-language task"
}
```

**Success (200):**

```json
{
  "output": "…model text…",
  "requestId": "…",
  "durationMs": 12345
}
```

**Common errors:**

- **400** — invalid body or unknown `agentId`
- **429** — rate limit (POST volume)
- **503** — OpenAI key not configured, or readiness check failed

**Example with curl:**

```bash
curl -sS http://127.0.0.1:8787/api/agents | jq
curl -sS http://127.0.0.1:8787/api/meta | jq

curl -sS -X POST http://127.0.0.1:8787/api/run \
  -H 'Content-Type: application/json' \
  -d '{"agentId":"research","message":"What is TypeScript? One short paragraph."}'
```

## Troubleshooting

- **`Could not reach API` in the UI** — Start `npm run dev:api` or full `npm run dev`; confirm port **8787**.
- **503 on `/api/run`** — Set `OPENAI_API_KEY` in `.env` and restart the API.
- **Import / TypeScript errors after git pull** — Run `npm run build -w agents-platform` again.
- **Rate limit during testing** — Increase `RATE_LIMIT_MAX` or narrow `RATE_LIMIT_WINDOW_MS` in `.env`.

## Related

- Agent definitions and tools: [`../agents-platform`](../agents-platform)
- OpenAI Agents SDK: [OpenAI Agents documentation](https://openai.github.io/openai-agents-js/)
