# AGENTS.md

Standing expectations for development on this repository.

## Code Quality

- Use strict TypeScript mode. All code must pass `tsc --strict`.
- Follow the existing code structure and patterns.

## Build and Test

- Run `npm run build` before declaring work complete.
- Run `npm run test:ci` before declaring work complete.
- Both must exit with status 0.

## Dependencies

- Do not add a production dependency without explicit human approval.
- The course-required stack is: `next`, `react`, `react-dom`, `typescript`, `@types/*`.
- Do not use: Tailwind CSS, Material UI, Bootstrap, CSS-in-JS libraries, authentication frameworks, databases, ORM/query libraries, payment SDKs, cloud service SDKs.

## Sensitive Code

- Do not edit `src/lib/pricing.ts` without explicit human review and approval.
- If a task requires changing that file: stop, explain the proposed change, ask for approval, and wait for response.

## Money Representation

- Money is represented as floating-point dollar values (e.g., `12.5`, `18.0`, `22.75`).
- Never use cents, minor units, `Decimal.js`, `BigInt`, or specialized money libraries unless explicitly required.

## Security

- Never place secrets, API keys, credentials, or real personal data in the repository.
- `.env` and `node_modules/` are in `.gitignore`.
- All test data must be synthetic (userIds like `"guest"`, synthetic email domains).

## Scope

- This is a small training application, not production software.
- Do not add authentication, user accounts, databases, persistent order storage, payment processing, email, notifications, analytics, or admin features.
- Keep the implementation intentionally small and focused.

## Testing

- Tests run via `npm run test:ci` using Node's built-in test runner with `--experimental-strip-types`.
- Test files are located in `src/lib/*.test.ts`.
- Minimal coverage is acceptable; aim for basic validation and happy path tests.

## Review Checklist

Before submitting work:

- [ ] `npm run build` passes (exit 0)
- [ ] `npm run test:ci` passes (exit 0)
- [ ] `npm run dev` runs without errors
- [ ] Home page loads and displays correctly
- [ ] Checkout page loads and displays products
- [ ] GET `/api/products` returns exactly three products
- [ ] POST `/api/checkout` accepts valid requests and returns `{ "total": number }`
- [ ] Invalid requests return HTTP 400 with `{ "error": "message" }`
- [ ] Quantities of 0, negative, or fractional are rejected
- [ ] Unknown product IDs are rejected
- [ ] Empty userId or items array are rejected
- [ ] Server-side prices are used (not client-supplied prices)
- [ ] No Tailwind, Material UI, Bootstrap, or component libraries
- [ ] No authentication, database, Docker, external APIs
- [ ] No secrets or real personal data in the repository
- [ ] `src/lib/pricing.ts` contains only the approved stub
