# TESTING.md - Quality Assurance for <PROJECT_NAME>

## 1. Levels

| Level | Tool | What is covered |
|-------|------|-----------------|
| Unit | <e.g. Vitest> | Pure logic: pricing, validation schemas, helpers |
| Integration | <e.g. Vitest + test DB> | API routes + DB queries per feature |
| E2E (critical paths only) | <e.g. Playwright> | <e.g. cashier completes a sale> |

## 2. Coverage target

- Minimum: <e.g. 70%> lines on `features/` and `lib/`. New logic in a phase must include tests in the same phase.
- Never lower the target to make tests pass.

## 3. Commands

```bash
<Test command, e.g. pnpm test>
<Test single file, e.g. pnpm vitest orders>
<Coverage, e.g. pnpm test --coverage>
```

## 4. What the AI must do per feature

1. Write the test for the acceptance criteria in `PRD.md` first (or alongside).
2. Include edge cases: empty input, invalid input, unauthorized access, failure of the dependency.
3. Run lint + full test suite before marking the phase done; paste the output into `TASK_INSTRUCTION.md`.

## 5. Test data

- Use factories/fixtures, never production data. No real secrets or real user data in tests.
