# TASK_INSTRUCTION.md - Step-by-Step Work Order for <PROJECT_NAME>

> The AI works through these phases in order. One active phase at a time. No skipping.

## Rules

1. Read `AGENTS.md`, `PRD.md`, and `ARCHITECTURE.md` before starting Phase 1.
2. Exactly one phase is `DOING` at a time. Mark it `DONE` only with proof: test/lint output pasted under the phase.
3. If a phase reveals a wrong assumption, stop and update the doc first, then continue.
4. End every phase with: files changed, how to verify manually, remaining TODOs.

## Phase list

| Phase | Scope (maps to PRD) | Status | Proof |
|-------|---------------------|--------|-------|
| 0 - Docs fill | Fill all `<...>` in PRD/ARCHITECTURE/DESIGN for v1 scope | TODO | Review of filled docs |
| 1 - Foundation | Repo, stack, env, CI, folder map, health endpoint | TODO | `build` + `test` green |
| 2 - <Feature 1, e.g. Product catalog> | <US-01, FR-01> | TODO | Tests + manual check |
| 3 - <Feature 2, e.g. Checkout> | <US-02, FR-02> | TODO | Tests + manual check |
| 4 - Hardening | SECURITY.md + TESTING.md targets met | TODO | Audit + coverage report |
| 5 - Release | DEPLOYMENT.md checklist fully ticked | TODO | Prod smoke test |

Statuses: `TODO` / `DOING` / `DONE`.

## Phase log

### Phase 0 - Docs fill - <STATUS>

- Changed: <files>
- Verify: <how>
- TODO: <...>
- Test output: <paste>
