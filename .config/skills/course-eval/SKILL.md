---
name: course-eval
description: Evaluate this checkout course repository against REQUIREMENTS.md and report evidence without fixing the project.
---

# Course Evaluation Skill

Comprehensive evaluation of the checkout-service repository against course requirements.

## When to Use This Skill

Use this skill when:
- Verifying the complete project meets all REQUIREMENTS.md specifications
- Running pre-submission validation
- Checking code quality and compliance with constraints
- Validating TypeScript strict mode
- Confirming no forbidden dependencies or patterns
- Testing all API endpoints
- Verifying order persistence
- Checking for secrets or unintended files

## Evaluation Procedure

### Phase 1: Static Code Analysis

#### 1.1 Repository Structure Check
```bash
# Verify required files exist
- REQUIREMENTS.md
- PLAN.md
- AGENTS.md
- README.md
- package.json
- src/ directory
- src/app.js or src/server.js
- src/lib/pricing.ts
- .config/skills/course-eval/SKILL.md (this file)
- .config/agents/course-reviewer.md (read-only subagent)
```

**Success criteria:** All files present and accessible

#### 1.2 Forbidden Pattern Detection
```bash
# Search for forbidden patterns:
- "Tailwind" or "tailwindcss" (forbidden CSS framework)
- "Material" or "@mui" (forbidden UI library)
- "Bootstrap" (forbidden CSS framework)
- "postgresql" or "postgres" (forbidden database)
- "mongodb" (forbidden database)
- "firebase" (forbidden backend service)
- "docker" or "Dockerfile" (forbidden deployment)
- "express" (forbidden framework - should use Next.js)
- "mongoose" or "sequelize" (forbidden ORM)
- "stripe" or "paypal" (forbidden payment)
- "AUTH" in capitals (indicates authentication implementation)
- "process.env.DB_" or similar (indicates secrets)
- "API_KEY" or "SECRET" in .gitignore (indicates secrets might be present)
```

**Success criteria:** No forbidden patterns found in code

#### 1.3 Dependencies Check
```bash
# Read package.json and verify:
- Only course-required stack present: next, react, react-dom, typescript, @types/*
- No Tailwind, Material UI, Bootstrap, CSS-in-JS libraries
- No authentication frameworks
- No database drivers (pg, mongodb, etc.)
- No ORM libraries (sequelize, typeorm, etc.)
- No payment SDKs
- No cloud service SDKs
- version fields for all production dependencies
```

**Success criteria:** Dependencies whitelist matches requirements

#### 1.4 TypeScript Strict Mode Check
```bash
# Read tsconfig.json and verify:
- "strict": true
- "target": "ES2020" or higher
- "module": "ESNext" or "esnext"
- All other strict compiler options enabled
```

**Success criteria:** tsconfig.json has strict mode enabled

#### 1.5 Pricing Module Protection Check
```bash
# Read src/lib/pricing.ts and verify:
- Contains only the baseline stub:
  export function calculateDiscount(_subtotal: number): number { return 0; }
- No real discount logic implemented
- Function signature unchanged
```

**Success criteria:** pricing.ts contains only the approved baseline

### Phase 2: Build and Test Validation

#### 2.1 Build Compilation
```bash
cd /Users/plodiwal/Desktop/checkout-service-vscode
npm run build
# Expected: Successful compilation, exit code 0
# Expected output: Next.js build with routes listed, no errors
```

**Success criteria:** 
- Exit code 0
- No TypeScript errors
- All routes compile (/, /checkout, /api/products, /api/checkout, /api/orders)

#### 2.2 Unit Tests Execution
```bash
npm run test:ci
# Expected: 23 tests passing, exit code 0
# Expected suites:
# - pricing (1 test)
# - products (5 tests)
# - checkout validation (10 tests)
# - checkout calculation (4 tests)
# - order building (3 tests)
```

**Success criteria:**
- Exit code 0
- 23 tests pass (0 failures)
- All test suites complete successfully
- No test timeouts

#### 2.3 Development Server Start
```bash
npm run dev
# Expected: Server starts, ready in <3 seconds
# Expected: Local: http://localhost:3000 or http://localhost:3001
```

**Success criteria:**
- Exit code 0 (when sent SIGTERM)
- Server becomes ready within 3 seconds
- Port accessible (3000 or 3001 if 3000 in use)

### Phase 3: API Endpoint Validation

#### 3.1 GET /api/products Endpoint

**Test:** Fetch products list
```bash
curl -s http://localhost:3001/api/products | jq .
```

**Expected response:**
```json
[
  { "id": "prod-001", "name": "Enamel Mug", "price": 12.5 },
  { "id": "prod-002", "name": "Canvas Tote", "price": 18 },
  { "id": "prod-003", "name": "Wool Beanie", "price": 22.75 }
]
```

**Validation checklist:**
- [ ] HTTP 200 status
- [ ] Array contains exactly 3 products
- [ ] Product IDs: prod-001, prod-002, prod-003 (in order)
- [ ] Product names: Enamel Mug, Canvas Tote, Wool Beanie
- [ ] Prices: 12.5, 18.0, 22.75 (floating-point, no cents notation)
- [ ] Valid JSON format
- [ ] No client-side data modification (server-side only)

**Success criteria:** All 7 checks pass

#### 3.2 POST /api/checkout Endpoint - Valid Request

**Test 1: Single item checkout**
```bash
curl -s -X POST http://localhost:3001/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"userId":"guest","items":[{"productId":"prod-001","quantity":1}]}'
```

**Expected response:**
```json
{
  "id": "ord-1",
  "userId": "guest",
  "items": [
    {
      "productId": "prod-001",
      "name": "Enamel Mug",
      "quantity": 1,
      "unitPrice": 12.5
    }
  ],
  "subtotal": 12.5,
  "discount": 0,
  "total": 12.5,
  "status": "confirmed",
  "createdAt": "2026-09-28T..."
}
```

**Validation checklist:**
- [ ] HTTP 200 status
- [ ] Order ID: "ord-1" (sequential)
- [ ] userId preserved: "guest"
- [ ] Items array contains enriched item (productId, name, quantity, unitPrice)
- [ ] Product name from catalogue: "Enamel Mug"
- [ ] Unit price from server catalogue: 12.5 (not client-supplied)
- [ ] Subtotal calculated: 12.5 = 1 × 12.5
- [ ] Discount applied: 0 (baseline calculateDiscount)
- [ ] Total calculated: 12.5 = 12.5 - 0
- [ ] Status: "confirmed"
- [ ] Created timestamp in ISO 8601 format
- [ ] Valid JSON response

**Test 2: Multiple items checkout**
```bash
curl -s -X POST http://localhost:3001/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"userId":"guest","items":[{"productId":"prod-002","quantity":2},{"productId":"prod-003","quantity":1}]}'
```

**Expected response:**
```json
{
  "id": "ord-2",
  "userId": "guest",
  "items": [
    {
      "productId": "prod-002",
      "name": "Canvas Tote",
      "quantity": 2,
      "unitPrice": 18
    },
    {
      "productId": "prod-003",
      "name": "Wool Beanie",
      "quantity": 1,
      "unitPrice": 22.75
    }
  ],
  "subtotal": 58.75,
  "discount": 0,
  "total": 58.75,
  "status": "confirmed",
  "createdAt": "2026-09-28T..."
}
```

**Validation checklist:**
- [ ] HTTP 200 status
- [ ] Order ID incremented: "ord-2"
- [ ] Items array contains 2 enriched items
- [ ] Subtotal: 58.75 = (2 × 18) + (1 × 22.75)
- [ ] Total: 58.75
- [ ] All other fields as expected

**Success criteria:** Both tests pass all validation checks

#### 3.3 POST /api/checkout Endpoint - Validation Tests

**Test 1: Reject zero quantity**
```bash
curl -s -X POST http://localhost:3001/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"userId":"guest","items":[{"productId":"prod-001","quantity":0}]}'
```

**Expected response (HTTP 400):**
```json
{"error": "quantity must be a positive integer"}
```

**Test 2: Reject unknown product**
```bash
curl -s -X POST http://localhost:3001/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"userId":"guest","items":[{"productId":"prod-999","quantity":1}]}'
```

**Expected response (HTTP 400):**
```json
{"error": "product prod-999 not found"}
```

**Test 3: Reject empty cart**
```bash
curl -s -X POST http://localhost:3001/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"userId":"guest","items":[]}'
```

**Expected response (HTTP 400):**
```json
{"error": "items array must be non-empty"}
```

**Test 4: Reject empty userId**
```bash
curl -s -X POST http://localhost:3001/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"userId":"","items":[{"productId":"prod-001","quantity":1}]}'
```

**Expected response (HTTP 400):**
```json
{"error": "userId must be a non-empty string"}
```

**Test 5: Reject malformed JSON**
```bash
curl -s -X POST http://localhost:3001/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{invalid json}'
```

**Expected response (HTTP 400):**
```json
{"error": "invalid JSON"}
```

**Success criteria:** All 5 validation tests return HTTP 400 with error messages

#### 3.4 GET /api/orders Endpoint

**Test:** Retrieve all orders
```bash
curl -s http://localhost:3001/api/orders | jq .
```

**Expected response:**
```json
[
  {
    "id": "ord-1",
    "userId": "guest",
    "items": [...],
    "subtotal": 12.5,
    "discount": 0,
    "total": 12.5,
    "status": "confirmed",
    "createdAt": "2026-09-28T..."
  },
  {
    "id": "ord-2",
    "userId": "guest",
    "items": [...],
    "subtotal": 58.75,
    "discount": 0,
    "total": 58.75,
    "status": "confirmed",
    "createdAt": "2026-09-28T..."
  }
]
```

**Validation checklist:**
- [ ] HTTP 200 status
- [ ] Array contains all created orders
- [ ] Each order has id, userId, items, subtotal, discount, total, status, createdAt
- [ ] Orders appear in creation order
- [ ] Order IDs increment correctly (ord-1, ord-2, etc.)
- [ ] Valid JSON format

**Success criteria:** All checks pass

### Phase 4: File System Persistence Check

#### 4.1 Orders File Existence
```bash
ls -la /Users/plodiwal/Desktop/checkout-service-vscode/data/orders.json
```

**Success criteria:** File exists and is readable

#### 4.2 Orders File Format
```bash
cat /Users/plodiwal/Desktop/checkout-service-vscode/data/orders.json | jq .
```

**Expected:** Valid JSON array of order objects

**Success criteria:** 
- Valid JSON format
- Contains orders from Phase 3 tests
- No corrupted data

#### 4.3 Order Persistence Verification
```bash
# Verify orders were persisted (not in-memory only)
# Kill server and restart
# Query /api/orders again
# Verify same orders returned
```

**Success criteria:** Orders persist across server restarts

### Phase 5: Documentation Verification

#### 5.1 REQUIREMENTS.md Check
```bash
# Verify document contains:
- Goal and baseline requirements
- Technology stack (Next.js, App Router, TypeScript)
- Forbidden patterns (Tailwind, MUI, Bootstrap, etc.)
- Money representation (floating-point)
- Products API specification (3 products)
- Checkout API specification (validation rules)
- Persistence specification (data/orders.json)
```

**Success criteria:** All sections present and up-to-date

#### 5.2 PLAN.md Check
```bash
# Verify document exists and describes implementation plan
```

**Success criteria:** Document is readable and coherent

#### 5.3 AGENTS.md Check
```bash
# Verify document contains:
- Code Quality expectations (strict TypeScript)
- Build and Test requirements
- Dependencies whitelist
- Sensitive Code protection (pricing.ts)
- Money representation rules
- Security expectations
- Scope limitations
- Review checklist
```

**Success criteria:** All sections complete

#### 5.4 README.md Check
```bash
# Verify document contains:
- Installation instructions
- Development server (npm run dev)
- Build command (npm run build)
- Test command (npm run test:ci)
- API endpoints documentation
- Project structure overview
```

**Success criteria:** All sections present

### Phase 6: Security & Secrets Check

#### 6.1 Git Ignore Verification
```bash
# Verify .gitignore contains:
- node_modules/
- .env
- .env.local
```

**Success criteria:** Key sensitive paths ignored

#### 6.2 Repository Scan
```bash
# Check for:
- No real API keys in code
- No real database credentials
- No real personal data
- No hardcoded secrets
```

**Success criteria:** No secrets found

## Summary Checklist

- [ ] Repository structure complete
- [ ] No forbidden dependencies or patterns
- [ ] TypeScript strict mode enabled
- [ ] pricing.ts contains only baseline
- [ ] npm run build succeeds (exit 0)
- [ ] npm run test:ci passes (23 tests, exit 0)
- [ ] npm run dev starts without errors
- [ ] GET /api/products returns 3 products correctly
- [ ] POST /api/checkout creates orders with correct shape
- [ ] POST /api/checkout validates all invalid inputs (5+ tests)
- [ ] GET /api/orders retrieves persisted orders
- [ ] data/orders.json created and populated
- [ ] Orders persist across server restarts
- [ ] REQUIREMENTS.md up-to-date
- [ ] PLAN.md complete
- [ ] AGENTS.md complete
- [ ] README.md complete
- [ ] No secrets or real personal data in repository

## Success Determination

**Course Requirement Met When:**
- ✅ All 23 unit tests pass
- ✅ Build succeeds with no errors
- ✅ All API endpoints function as specified
- ✅ No forbidden dependencies or patterns
- ✅ TypeScript strict mode passes
- ✅ pricing.ts unmodified
- ✅ Orders persist to data/orders.json
- ✅ Documentation complete

**Rejection Indicators (Any of These = Fail):**
- ❌ npm run build fails
- ❌ npm run test:ci fails (any test)
- ❌ API endpoints return unexpected responses
- ❌ Forbidden dependencies or patterns detected
- ❌ pricing.ts modified beyond baseline
- ❌ TypeScript strict mode errors
- ❌ Missing documentation
- ❌ Secrets or real personal data in repo

## Usage Notes

This skill is designed to be used by the `course-reviewer` subagent in a fresh session. The subagent will invoke this skill and report findings.

To use this skill independently:
1. Read this entire document
2. Execute each phase in order
3. Document results in a checklist
4. Report any failures with specific error messages
5. Provide final pass/fail determination

## Related Files

- `.config/agents/course-reviewer.md` - Read-only subagent that uses this skill
- `REQUIREMENTS.md` - Authoritative requirements specification
- `AGENTS.md` - Project constraints and standards
- `PLAN.md` - Implementation plan
