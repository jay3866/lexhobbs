# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hobbs Junk Removal & Hauling LLC — a single-page React landing site for a local junk removal business in Moncks Corner, SC. Features an AI-powered quote tool (Gemini vision for junk photo analysis) and email notifications via Resend.

## Commands

- `npm run dev` — Start Vite dev server on port 3000
- `npm run server` — Start Express API server on port 3001
- `npm run dev:full` — Start both API server and Vite concurrently
- `npm run build` — Production build via Vite
- `npm run preview` — Preview production build

No test runner or linter is configured.

## Architecture

**Frontend:** React 19 + TypeScript SPA. Tailwind CSS loaded via CDN (`<script src="https://cdn.tailwindcss.com">`) with config inline in `index.html`. Uses hash-based routing (`#/privacy` for privacy policy, everything else is home). No React Router — routing is manual via `window.location.hash` in `App.tsx`.

**Backend:** Express server (`server/api.js`, plain JS) on port 3001. Single endpoint `POST /api/quote` sends formatted HTML emails via Resend. Vite proxies `/api` requests to the backend.

**AI Integration:** `services/geminiService.ts` uses `@google/genai` (Gemini 2.5 Flash) client-side to analyze uploaded junk photos and estimate volume. The API key is injected at build time via Vite's `define` config from `GEMINI_API_KEY` in `.env.local`.

**Key types:** `types.ts` defines `QuoteFormData`, `QuoteStep` enum (multi-step quote wizard), `ServiceItem`, and `CONTACT_INFO` constants.

## Environment Variables

- `GEMINI_API_KEY` — Set in `.env.local`, used client-side for AI image analysis
- `RESEND_API_KEY` — Set in environment for the Express server, used for sending quote emails

## Design System

- Colors: `brand-yellow` (#FFD700), `brand-dark` (#1A1A1A), `brand-gray` (#2D2D2D)
- Fonts: Inter (body), Oswald (display/headings)
- Icons: lucide-react
- Path alias: `@/*` maps to project root
