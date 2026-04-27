# ScholarEase

An AI-powered research paper workspace that turns static PDFs into interactive learning environments. Users upload research papers, view them in a built-in PDF viewer, and trigger AI simplification of any section — all processed asynchronously in the background.

---

## What It Does

1. **Upload** — Drop a PDF research paper into the platform.
2. **Parse** — A Python script extracts text from each page and saves it as `Section` records in the database.
3. **View** — A built-in PDF viewer renders the document with zoom and page navigation.
4. **Simplify** — Click any section to trigger an AI explanation job (via Google Gemini). A background worker processes it and stores the result.
5. **Annotate** — Attach notes and highlights to specific sections (backend ready, UI in progress).
6. **My Documents** — Browse all previously uploaded papers with pagination.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, react-pdf |
| Backend | Ruby on Rails 7.1 (API mode), Puma, Rack-CORS |
| Database | PostgreSQL |
| Job Queue | Sidekiq + Redis |
| AI / Parsing | Python 3, pypdf, LangExtract, Google Gemini 2.5 Flash |

---

## Project Structure

```
ScholarEase/
├── Client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # Landing, Upload, DocumentView, MyDocuments
│       ├── components/pdf/   # PdfViewer, PdfSidebar, PdfUploader, PdfToolbar
│       └── context/ # PdfContext — global document state
│
└── Server/          # Rails 7 API backend
    ├── app/
    │   ├── controllers/api/v1/   # documents, sections, ai_responses, annotations
    │   ├── models/               # User, Document, Section, AiResponse, Annotation
    │   └── sidekiq/              # ExplainSectionJob — background AI worker
    ├── lib/ai/
    │   ├── pdf_parser.py         # Extracts text per page from uploaded PDFs
    │   └── explainer.py          # Calls Gemini API to simplify text
    └── db/
        ├── schema.rb
        └── migrate/
```

---

## Prerequisites

Make sure the following are installed on your machine:

- **Node.js** >= 18 and **npm**
- **Ruby** 3.2.8 (use [rbenv](https://github.com/rbenv/rbenv) or [rvm](https://rvm.io/))
- **Bundler** (`gem install bundler`)
- **PostgreSQL** >= 14
- **Redis** >= 6
- **Python** >= 3.10 and **pip**

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd ScholarEase
```

---

### 2. Backend (Rails)

```bash
cd Server
```

**Install Ruby dependencies:**
```bash
bundle install
```

**Set up the Python virtual environment:**
```bash
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install pypdf langextract
```

**Configure environment variables:**

Create a `.env` file in the `Server/` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/scholar_ease_development
REDIS_URL=redis://localhost:6379/1
GEMINI_API_KEY=your_google_gemini_api_key_here
```

**Create and migrate the database:**
```bash
bundle exec rails db:create db:migrate
```

---

### 3. Frontend (React)

```bash
cd ../Client
npm install
```

No `.env` file is needed. The Vite dev server proxies all `/api` requests to `http://localhost:3000` automatically (configured in `vite.config.js`).

---

## Running the App

You need four terminals running simultaneously in development.

**Terminal 1 — Redis:**
```bash
redis-server
```

**Terminal 2 — Rails API server:**
```bash
cd Server
bundle exec rails server -p 3000
```

**Terminal 3 — Sidekiq (background job worker):**
```bash
cd Server
bundle exec sidekiq -c 5
```
> Sidekiq processes AI explanation jobs asynchronously. Without it, clicking "Simplify" will queue jobs but never process them.

**Terminal 4 — React dev server:**
```bash
cd Client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How It Works End-to-End

```
User uploads PDF
       |
       v
POST /api/v1/documents
       |
       |-- Rails saves file to Server/storage/uploads/
       |-- Calls pdf_parser.py (Python) to extract text per page
       |-- Creates Document + Section records in PostgreSQL
       |
       v
User opens DocumentView page
       |
       |-- react-pdf renders the PDF in the browser
       |-- Sidebar shows page-by-page sections
       |
       v
User clicks "Simplify" on a section
       |
       v
POST /api/v1/sections/:id/explain
       |
       |-- Enqueues ExplainSectionJob in Sidekiq/Redis
       |-- Returns { status: 'processing' }
       |
       v
Sidekiq worker picks up the job
       |
       |-- Calls explainer.py with the section text
       |-- explainer.py sends request to Google Gemini API
       |-- Saves result to AiResponse record
       |
       v
Frontend polls GET /api/v1/sections/:id/ai_response
       |
       v
Returns { status: 'completed', output: '...' } → shown in sidebar
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/documents` | Upload a PDF — triggers parsing |
| `GET` | `/api/v1/documents` | List all documents (paginated) |
| `GET` | `/api/v1/documents/:id` | Get document + all sections |
| `GET` | `/api/v1/documents/:id/pdf` | Stream the raw PDF file |
| `POST` | `/api/v1/sections/:id/explain` | Queue AI simplification job |
| `GET` | `/api/v1/sections/:id/ai_response` | Poll for AI result |
| `GET` | `/api/v1/annotations` | List annotations |
| `POST` | `/api/v1/annotations` | Create annotation |
| `GET` | `/sidekiq_web_portal` | Sidekiq admin dashboard |

---

## Database Schema

```
users           — email, first_name, last_name, role, location
documents       — user_id, title, file_url, status, page_count, about
sections        — document_id, content, page_number, position, section_type
ai_responses    — section_id, intent (simplify/explain/translate), output, target_language
annotations     — user_id, section_id, comment, selected_text, color
```

Document `status` transitions: `pending → processing → completed / failed`

---

## Production Build

**Frontend:**
```bash
cd Client
npm run build
# Output in Client/dist/
```

**Backend (Docker):**
```bash
cd Server
docker build -t scholarease-server .
docker run -p 3000:3000 --env-file .env scholarease-server
```

---

## Known Limitations / In Progress

- **Local file storage** — Uploaded PDFs are stored on disk at `Server/storage/uploads/`. For production, swap to S3 or similar.
- **Annotations UI** — The backend model and API exist but the frontend UI is not yet built.
- **Translations** — The database schema supports it but the API integration is not complete.

---

## Vision

ScholarEase aims to make research papers not just readable but *explorable* — with AI simplification, annotations, translations, and eventually audio/video generation built into one unified workspace.
