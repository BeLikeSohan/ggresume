<div align="center">
  
<img src="https://raw.githubusercontent.com/BeLikeSohan/ggresume/refs/heads/main/public/ggresume-logo.png" width="350">

High-performance, ATS-optimized software engineering resume builder.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

[Features](#features) • [Quick Start (Docker)](#quick-start-with-docker-compose) • [Local Development](#local-development) • [Environment Variables](#environment-variables)

<br />
<br />

![GGResume Screenshot](docs/screenshot-1.png)

</div>

## Overview

**GGResume** is a fast, minimalist, and document-first resume builder built specifically for software engineers. Instead of generic "AI-styled" templates, GGResume follows strict typography, spacing, and ATS (Applicant Tracking System) layout principles so your resume parses accurately and reads cleanly.

## Features

### ATS-Optimized Typography & Layout
- **10 ATS Fonts & Monospace Typography**: Literata, Merriweather, Lora, EB Garamond, Source Sans 3, Inter, Roboto, Open Sans, Lato, and Plus Jakarta Sans.
- **Natural CSS Float Text-Wrapping**: Accomplishment bullets flow seamlessly around right-aligned dates and locations without arbitrary vertical gaps or collisions.
- **ATS Bullet Indents**: Hanging indents with square markers (`■`), discs, or dashes.
- **Keyword Formatting**: Instant Markdown bold helpers (`**tech_stack**`) for ATS keyword recognition.
- **Two-Column Contact Headers**: Clean vector iconography for GitHub, LinkedIn, Email, Phone, and Portfolio.

### Document Dashboard
- **Manage Multiple Resumes**: Create blank resumes, clone existing versions, rename, and organize tailored resumes for different roles.
- **Search & Filter**: Instant search across job titles, candidate names, skills, and companies.
- **Sort & Views**: Sort by recently updated, oldest, or alphabetical order; toggle between responsive Grid and Table/List views.
- **Import & Export**: Backup or restore any resume as a standalone JSON file.

### Live Side-by-Side Editor
- **Real-Time A4 Preview**: True-to-scale A4 page rendering with zoom controls (Zoom In, Zoom Out, Fit to Window).
- **Drag & Reorder Sections**: Personal Info, Summary, Skills, Work Experience, Projects, Education, References, and Custom Sections.
- **Density Controls**: Configurable font sizing (Compact, Standard, Spacious), line heights, page margins, and divider styles.

### High-Fidelity PDF Export
- **Puppeteer Headless Chromium**: Generates pixel-perfect, vector-sharp PDFs via the `/api/export-pdf` server endpoint.
- **Browser Print Fallback**: Clean print stylesheet (`@media print`) for instant native browser printing (`Ctrl+P` / `Cmd+P`).

### Direct PostgreSQL Persistence
- Resumes are stored directly in PostgreSQL with `JSONB` for schema flexibility and fast queries.
- Automatic table initialization with persistent Docker volume.
- Zero third-party cloud database dependencies or vendor lock-in.

---

## Quick Start with Docker Compose

The fastest way to run GGResume and PostgreSQL together is using Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/belikesohan/ggresume.git
cd ggresume

# 2. Start the services
docker compose up -d --build
```

Once running:
- **GGResume App**: [http://localhost:3000](http://localhost:3000)
- **PostgreSQL**: `localhost:5432` (`POSTGRES_DB=ggresume`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres`)

---

## Local Development

If you prefer to run the Next.js development server locally while running PostgreSQL in Docker:

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Install Dependencies & Start Dev Server

```bash
# Install node packages
npm install

# Start Next.js in development mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Type Check

```bash
# Type check and build standalone production bundle
npm run build

# Start production server
npm run start
```
---

## Environment Variables

| Variable | Default (Local / Docker) | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/ggresume` | Full PostgreSQL connection string |
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `ggresume` | PostgreSQL database name |
| `POSTGRES_HOST` | `postgres` (Docker) / `localhost` (Dev) | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `AUTH_LOCAL_MODE` | `true` | When `true`, email verification is bypassed (instant sign up for local/Docker dev) |
| `AUTH_SECRET` | `secret` | Secret key for signing session tokens |
| `RESEND_API_KEY` | `(optional)` | Resend API key for sending verification emails |
| `EMAIL_FROM` | `GGResume <noreply@ggresume.com>` | Sender address for transactional emails |
| `APP_URL` | `http://localhost:3000` | Application base URL used in verification email links |
| `PORT` | `3000` | Port for the Next.js frontend service |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` (Docker container) | Custom path to Chromium executable |

---

## Keyboard & Editor Shortcuts

- **Bold Keyword**: Wrap terms with `**keyword**` inside summaries, bullet points, or skill lists.
- **Section Ordering**: Use the **Settings** tab to toggle visibility or change section priority on the page.
- **Page Overflow Control**: Toggle between **Compact** (9.5pt), **Standard** (10pt), and **Spacious** (10.5pt) or adjust line spacing (0.9 – 1.4) to fit standard 1-page limits.

---

## License

MIT
