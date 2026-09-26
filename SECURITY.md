# SECURITY.md - Protection Protocols for <PROJECT_NAME>

> Non-negotiable rules. If a task conflicts with this file, this file wins.

## 1. Secrets

- Secrets live in env vars / secret manager only. Never in code, docs, logs, or screenshots.
- Required env vars are listed in `DEPLOYMENT.md` with no real values committed.
- AI must never print tokens, API keys, or full `process.env` output.

## 2. Input validation

- Every external input is validated with Zod (or equivalent) before use: API bodies, query params, form data, file uploads, webhooks.
- Reject invalid input with HTTP 400 + `{ error, message }`. Fail closed, never default to permissive.

## 3. Error handling

- try-catch at every trust boundary (API route, server action, background job, event handler).
- Client receives user-safe messages only. Full stack traces go to server logs.
- Unhandled rejections and failed jobs must alert, not fail silently (see DEPLOYMENT.md logging).

## 4. Auth and data access

- Auth model: <e.g. session cookie + role field: admin | cashier>.
- Every data query is scoped to the caller's permissions. Never trust `userId` from the client body; take it from the session.
- Sensitive fields (password hashes, tokens) are never selected or returned by default.

## 5. Dependencies

- New packages need approval per `AGENTS.md`. Prefer maintained packages with no known CVEs; run the audit command (`<npm audit / pnpm audit>`) before release.
