# Arquetype Roadmap

## Completed Sprints

### Sprint 1-2: Foundation
- [x] Next.js 16 setup with TypeScript
- [x] Better Auth authentication system
- [x] PostgreSQL database with Drizzle ORM (migrated from SQLite)
- [x] Organization and user management
- [x] Basic UI components with shadcn/ui

### Sprint 3-4: Core Features
- [x] Study creation and management
- [x] Survey question types (Likert, NPS, multiple choice, open-ended)
- [x] Synthetic persona generation
- [x] SSR Engine (Semantic Similarity Rating)

### Sprint 5-6: Billing & Export
- [x] Stripe integration for billing
- [x] Credit system
- [x] CSV/JSON export functionality
- [x] User onboarding flow

### Sprint 7-8: API & Templates
- [x] API key management system
- [x] Public API v1 endpoints
- [x] Survey templates (8 pre-built templates)
- [x] Sentiment analysis for results
- [x] Rate limiting and retry logic for Anthropic API

### Sprint 9: UX & Analysis Improvements
- [x] Product/service context fields (name, description, brand, industry, category)
- [x] Custom context instructions per study
- [x] Real-time simulation progress indicator with estimated time
- [x] Progress page showing persona being processed
- [x] Demographic segment comparison analysis
- [x] Word cloud visualization for text responses
- [x] Demographic insights generation

### Sprint 10: UX Polish
- [x] Onboarding dialog redesign (modern hero layout, dot indicators, transitions, brand dot icon)

---

## Upcoming Improvements

### High Priority

#### Simulation Cancellation
- [x] Add ability to cancel running simulations
- [x] Graceful cleanup of partial results
- [x] Option to keep or discard partial results
- [x] Cancel button with confirmation dialog

#### Results Enhancement
- [x] Trend analysis across multiple studies
- [x] Cross-study comparison dashboard
- [x] Common question detection across studies
- [x] Key insights generation for trends

### Medium Priority

#### Response Quality & Naturalness
- [x] Remove formulaic response patterns ("As a [age]-year-old [gender]...")
- [x] Make responses sound more human and conversational
- [x] Avoid repeating demographic info in responses (already in persona context)
- [x] Vary response styles based on persona personality traits (12 personality types)
- [x] Add natural language variation and authenticity
- [x] Reduce token waste from demographic repetition
- [x] Test different prompt engineering approaches for more natural outputs

#### Persona Customization
- [x] Custom persona builder
- [x] Import personas from CSV
- [x] Persona templates by industry
- [x] Save and reuse persona panels
- [x] Sample size calculator (confidence level, margin of error, population size)
- [x] Socioeconomic Level (NSE) system with 6 levels (AMAI/Census-based)
- [x] Expanded education levels (10 levels: no formal education to doctoral)
- [x] Expanded occupations (70+ by category: professional, skilled, manual, etc.)
- [x] Realistic correlations between income, education, and occupation
- [x] NSE presets for targeting specific socioeconomic segments

#### Advanced Question Types
- [x] Matrix questions
- [x] Slider scales
- [x] Image-based questions (Claude Vision)
- [x] Conditional logic / branching

#### Collaboration Features
- [x] Team member invitations
- [x] Role-based permissions
- [x] Study sharing and commenting
- [x] Activity log
- [x] Settings dashboard with user profile management

### Low Priority

#### Integrations
- [ ] Webhook notifications
- [ ] Zapier integration
- [ ] Slack notifications
- [ ] Google Sheets export

#### Analytics Dashboard
- [x] Organization-wide analytics
- [x] Credit usage tracking
- [x] API usage metrics
- [ ] Performance benchmarks

---

## Technical Debt ✅

- [x] Add comprehensive test suite (Vitest — 67 tests)
- [x] Implement proper error boundaries (7 error.tsx + 4 loading.tsx + 2 not-found.tsx)
- [x] Add request validation with Zod (centralized schemas + validateBody helper)
- [x] Optimize database queries (COUNT, projection, N+1, batch inserts, SQL aggregation)
- [x] Add caching layer for frequent queries (in-memory TTL cache with invalidation)
- [x] Migrate middleware to Next.js pattern (cookie-based edge middleware)

---

## Production Readiness

### Code Changes (Completed)
- [x] Migrate schema from SQLite to PostgreSQL (`pgTable`, `jsonb`, `timestamp`, `boolean`, FK indexes)
- [x] Switch driver from `@libsql/client` to `postgres` (postgres.js)
- [x] Update Drizzle config for PostgreSQL dialect
- [x] Update Better Auth provider to `"pg"` with `useSecureCookies`, rate limiting, `trustedOrigins`
- [x] Remove all `JSON.parse`/`JSON.stringify` on jsonb columns (18+ files)
- [x] Update all timestamp handling (`new Date()` instead of `.toISOString()` for DB writes)
- [x] Replace `.get()`/`.all()` libsql methods with standard Drizzle patterns
- [x] Add security headers (HSTS, X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy)
- [x] Add CORS for public API v1 with OPTIONS preflight
- [x] Add Stripe webhook middleware bypass
- [x] Create `vercel.json` (5-min timeout for simulation routes)
- [x] Update `.env.example` for production (Supabase, Stripe live, OAuth)
- [x] 0 TypeScript errors, 67/67 tests pass, clean production build

### Manual Setup (Next Session)
- [ ] Create Supabase project → get Transaction pooler connection string (port 6543)
- [ ] Run `npx drizzle-kit generate` then `npx drizzle-kit push` against Supabase
- [ ] Create Vercel project → connect GitHub repo, add all env vars
- [ ] Configure Google OAuth credentials (production redirect URLs)
- [ ] Configure GitHub OAuth credentials (production redirect URLs)
- [ ] Set secure BETTER_AUTH_SECRET (`openssl rand -base64 32`)
- [ ] Create Stripe live products → get live Price IDs (starter/growth/scale)
- [ ] Add Stripe webhook endpoint (`https://yourdomain.com/api/billing/webhook`)
- [ ] Deploy to Vercel (push to main)
- [ ] Test end-to-end: signup → create study → run simulation → billing

---

## Validation Study — Synthetic vs. Real Respondents

Scientific comparison between Arquetype synthetic responses and real survey data
to validate the SSR methodology. Dual purpose: academic publication + product proof.

> **Prerequisite:** Production Readiness must be complete. The study runs on the
> final deployed platform to ensure reproducibility.

### Study Design
- [ ] Select a completed real study from the market research firm
- [ ] Document original methodology (sample size, demographics, questions)
- [ ] Define comparison metrics (mean differences, distribution shape, effect sizes)
- [ ] Design the replication protocol (same questions, same demographic profiles)
- [ ] Pre-register hypotheses and statistical tests

### Simulation Execution
- [ ] Recreate the original survey in Arquetype (identical questions and scales)
- [ ] Configure persona panel to match original sample demographics
- [ ] Run simulation on production platform
- [ ] Export both real and synthetic datasets for analysis

### Statistical Comparison
- [ ] Descriptive statistics comparison (means, medians, std devs, distributions)
- [ ] Inferential tests (t-tests, chi-square, KS tests for distribution similarity)
- [ ] Effect size analysis (Cohen's d, Cramér's V)
- [ ] Correlation analysis between real and synthetic response patterns
- [ ] Demographic subgroup comparison (do synthetic segments match real ones?)
- [ ] Sensitivity analysis across different question types

### Article Preparation
- [ ] Write methodology section describing SSR engine and study design
- [ ] Produce comparison tables and visualizations
- [ ] Draft discussion: where synthetic matches real, where it diverges, and why
- [ ] Identify target journal(s) for submission
- [ ] Internal review and revision cycle

---

## Notes

- Current rate limit: 40 requests/minute to Anthropic API
- **Parallel processing implemented**: 4 personas processed in parallel with rate limit management
- 30-minute timeout configured for large simulations (400+ personas)
- **PostgreSQL via Supabase for production** (code ready, manual setup pending)
