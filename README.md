# PromptFlow

> A minimal, polished prompt workflow platform. Create reusable prompt templates with variables, generate filled prompts, and chain them into multi-step workflows.

## Features

- **Prompt Templates** — define templates with `{{variable}}` syntax; variables auto-detected
- **Prompt Generator** — fill variables → copy final prompt with one click
- **Workflow Builder** — chain prompts into step-by-step workflows
- **Prompt Library** — browse, edit, duplicate, delete all prompts
- **Shareable Links** — share any prompt at `/prompt/:id`
- **Live Preview** — see the rendered prompt as you type

## Tech Stack

| Layer    | Tech                      |
|----------|---------------------------|
| Frontend | React 18 + Vite           |
| Styling  | Tailwind CSS              |
| Backend  | Node.js + Express         |
| Database | SQLite via Prisma ORM     |
| Routing  | React Router v6           |

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm 9+

### 2. Clone & Install

```bash
git clone <repo-url>
cd AI_Prompt_Variables

# Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..
```

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 4. Run (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API runs at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

Or with `concurrently` from root:
```bash
npm install   # installs concurrently
npm start     # starts both servers
```

## Project Structure

```
/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # DB schema (SQLite)
│   └── src/
│       ├── index.js                # Express entry point
│       ├── routes/                 # Route definitions
│       ├── controllers/            # Request handlers
│       └── services/
│           └── variableExtractor.js  # {{variable}} parser & renderer
│
├── frontend/
│   └── src/
│       ├── App.jsx                 # Router setup
│       ├── components/             # Layout, Toast, PromptCard, etc.
│       ├── pages/                  # Dashboard, Library, Editor, Generator, Workflows
│       ├── hooks/useToast.js       # Toast notification hook
│       └── lib/
│           ├── api.js              # Backend API client
│           └── utils.js            # Client-side variable extraction & rendering
│
└── README.md
```

## API Reference

| Method | Endpoint                   | Description          |
|--------|----------------------------|----------------------|
| GET    | /api/prompts               | List all prompts     |
| GET    | /api/prompts/:id           | Get single prompt    |
| POST   | /api/prompts               | Create prompt        |
| PUT    | /api/prompts/:id           | Update prompt        |
| DELETE | /api/prompts/:id           | Delete prompt        |
| POST   | /api/prompts/:id/duplicate | Duplicate prompt     |
| POST   | /api/prompts/:id/render    | Render with values   |
| GET    | /api/workflows             | List all workflows   |
| GET    | /api/workflows/:id         | Get workflow + steps |
| POST   | /api/workflows             | Create workflow      |
| PUT    | /api/workflows/:id         | Update workflow      |
| DELETE | /api/workflows/:id         | Delete workflow      |

## Variable Syntax

Use double curly braces anywhere in a prompt template:

```
Write a {{tone}} blog post about {{topic}} for {{audience}}.
```

Variables are automatically extracted and shown as input fields in the generator.