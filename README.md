<div align="center">

# GGResume

High-performance, ATS-optimized software engineering resume builder.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![RustFS](https://img.shields.io/badge/RustFS-Object_Storage-dea584?style=flat-square&logo=rust)](https://github.com/rustfs/rustfs)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

[Features](#features) • [Quick Start (Docker)](#quick-start-with-docker-compose) • [Local Development](#local-development) • [Architecture](#architecture) • [Environment Variables](#environment-variables)

</div>

---

## Overview

**GGResume** is a fast, minimalist, and document-first resume builder built specifically for software engineers. Instead of generic "AI-styled" templates, GGResume follows strict typography, spacing, and ATS (Applicant Tracking System) layout principles so your resume parses accurately and reads cleanly.

All resume data is persisted directly as JSON documents in a self-hosted **RustFS** object storage cluster via an S3-compatible API.

---

## Features

### ATS-Optimized Typography & Layout
- **Source Sans & Monospace Typography**: Designed to match high-signal software engineering resumes with clean hierarchy.
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

### Self-Hosted RustFS Persistence
- Direct S3-compatible JSON storage powered by the official `rustfs/rustfs:latest` image.
- No third-party tracking, external database subscriptions, or vendor lock-in.
- Persistent local volume keeps all resume data private and under your control.

---

## Quick Start with Docker Compose

The fastest way to run GGResume and RustFS together is using Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/belikesohan/ggresume.git
cd ggresume

# 2. Start the services
docker compose up -d --build
```

Once running:
- **GGResume App**: [http://localhost:3000](http://localhost:3000)
- **RustFS S3 API**: [http://localhost:9000](http://localhost:9000)
- **RustFS Web Console**: [http://localhost:9001](http://localhost:9001) (User: `rustfsadmin`, Password: `rustfsadmin`)

---

## Local Development

If you prefer to run the Next.js development server locally while running RustFS in Docker:

### 1. Start RustFS

```bash
docker run -d \
  --name rustfs \
  -p 9000:9000 \
  -p 9001:9001 \
  -e RUSTFS_ROOT_USER=rustfsadmin \
  -e RUSTFS_ROOT_PASSWORD=rustfsadmin \
  -v rustfs_data:/data \
  rustfs/rustfs:latest
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

## Architecture

```
ggresume/
├── Dockerfile                   # Multi-stage standalone Next.js + Chromium build
├── docker-compose.yml           # Orchestrates RustFS & Next.js frontend
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── export-pdf/      # Puppeteer headless Chromium PDF renderer
│   │   │   └── resumes/         # Direct RustFS CRUD API routes (GET, POST, PUT, DELETE)
│   │   ├── dashboard/           # Resumes management workspace
│   │   ├── editor/              # Full-screen resume editor & live preview
│   │   └── layout.tsx           # Global HTML shell & font imports
│   ├── components/
│   │   ├── common/              # Brand logo (GGLogo), headers, toast alerts
│   │   ├── dashboard/           # DashboardHeader, ResumeCard, ResumeRow, Modals
│   │   ├── editor/              # Modular editor sections (Experience, Skills, Projects, etc.)
│   │   ├── preview/             # A4 preview canvas, BulletMarker, Toolbar, Icons
│   │   └── ui/                  # Clean primitive components (Button, Input, Textarea)
│   ├── hooks/
│   │   ├── useResumeData.ts     # Direct RustFS synchronization & debounced auto-save
│   │   └── useResumeZoom.ts     # Responsive preview scaling and fit-to-window calculation
│   ├── lib/
│   │   ├── rustfsClient.ts      # AWS S3-compatible client connected to RustFS
│   │   ├── resumeStorage.ts     # Client-side API wrappers for RustFS operations
│   │   └── pdfServer.ts         # Chromium Puppeteer print generation logic
│   └── types/
│       └── resume.ts            # Complete TypeScript types for resumes & document schemas
```

---

## Environment Variables

| Variable | Default (Local / Docker) | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for the Next.js frontend service |
| `RUSTFS_ENDPOINT` | `http://rustfs:9000` (Docker) / `http://localhost:9000` (Dev) | RustFS S3-compatible endpoint |
| `RUSTFS_ACCESS_KEY` | `rustfsadmin` | Root user / access key for RustFS |
| `RUSTFS_SECRET_KEY` | `rustfsadmin` | Root password / secret key for RustFS |
| `RUSTFS_BUCKET` | `resumes` | S3 bucket name for storing JSON resumes |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` (Docker container) | Custom path to Chromium executable |

---

## Keyboard & Editor Shortcuts

- **Bold Keyword**: Wrap terms with `**keyword**` inside summaries, bullet points, or skill lists.
- **Section Ordering**: Use the **Settings** tab to toggle visibility or change section priority on the page.
- **Page Overflow Control**: Toggle between **Compact** (9.5pt), **Standard** (10pt), and **Spacious** (10.5pt) or adjust line spacing (0.9 – 1.4) to fit standard 1-page limits.

---

## License

MIT