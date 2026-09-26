# AGENTS.md - AI Guardrails for <PROJECT_NAME>

> This file is the permanent system prompt for every AI agent working in this repo. Read it first, follow it always.

## 1. Project snapshot

- **Name:** <PROJECT_NAME>
- **One-liner:** <WHAT_IT_DOES in one sentence>
- **Stack:** <e.g. Next.js 15 + TypeScript + Tailwind CSS + PostgreSQL via Prisma>
- **Package manager:** <npm / pnpm / bun> - use only this one, never mix lockfiles.
- **Commands:** dev `<cmd>` | test `<cmd>` | lint `<cmd>` | build `<cmd>`

## 2. Before writing any code

1. Read `PRD.md`, `ARCHITECTURE.md`, and the active phase in `TASK_INSTRUCTION.md`.
2. Never assume the stack, folder layout, or UI style. If it is not documented, ask.
3. Work phase by phase. Finish and verify one phase before starting the next.

## 3. Coding rules

- TypeScript `strict` is on. `any` is forbidden. Use `unknown` + narrowing or a precise type.
- Validate every external input (API body, query params, forms, env vars) with Zod or equivalent. Reject invalid input with a clear error.
- Handle errors at boundaries (API routes, handlers, jobs) with try-catch and user-safe messages. Never leak stack traces or secrets to the client.
- No secrets in code. Read from env. Never log tokens or dump `process.env`.
- Follow the folder map in `ARCHITECTURE.md`. Do not create duplicate/parallel folders (e.g. `components/` plus `ui/`). Reuse existing components, utils, and types.
- One responsibility per file. Match the existing formatter/linter config.

## 4. Dependencies

- Do NOT install new packages without asking first. Prefer the standard library and what is already in `package.json`.
- When a new package is approved, record name, version, and reason in `ARCHITECTURE.md`.

## 5. UI rules

- The tokens in `DESIGN.md` are law (colors, fonts, spacing). No hardcoded hex values outside the theme.
- Every data view needs empty, loading, and error states. No dead buttons. No fake data, fake testimonials, or invented statistics.

## 6. Testing

- Add or update unit tests for new logic per `TESTING.md`. Keep coverage at or above the target.
- Run lint + tests before marking a phase done, and paste the result into the phase checklist.

## 7. Git and communication

- Small commits with conventional messages (`feat:`, `fix:`, `docs:`).
- Summarize each phase: files changed, how to verify, what is still TODO.
