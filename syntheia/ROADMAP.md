# Syntheia Roadmap

## Completed Sprints

### Sprint 1-2: Foundation
- [x] Next.js 16 setup with TypeScript
- [x] Better Auth authentication system
- [x] SQLite database with Drizzle ORM
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

---

## Upcoming Improvements

### High Priority

#### Better Product/Service Context
- [ ] Add product/service description field to studies
- [ ] Include brand name, industry, and product category
- [ ] Pass context to persona prompts for more relevant responses
- [ ] Allow custom context instructions per study

#### Simulation UX Improvements
- [ ] Real-time progress indicator during simulation
- [ ] Show estimated time remaining
- [ ] Display persona being processed in UI
- [ ] Add ability to cancel running simulations

#### Results Enhancement
- [ ] More detailed statistical analysis
- [ ] Comparison between demographic segments
- [ ] Word cloud for open-ended responses
- [ ] Trend analysis across multiple studies

### Medium Priority

#### Persona Customization
- [ ] Custom persona builder
- [ ] Import personas from CSV
- [ ] Persona templates by industry
- [ ] Save and reuse persona panels

#### Advanced Question Types
- [ ] Matrix questions
- [ ] Slider scales
- [ ] Image-based questions
- [ ] Conditional logic / branching

#### Collaboration Features
- [ ] Team member invitations
- [ ] Role-based permissions
- [ ] Study sharing and commenting
- [ ] Activity log

### Low Priority

#### Integrations
- [ ] Webhook notifications
- [ ] Zapier integration
- [ ] Slack notifications
- [ ] Google Sheets export

#### Analytics Dashboard
- [ ] Organization-wide analytics
- [ ] Credit usage tracking
- [ ] API usage metrics
- [ ] Performance benchmarks

---

## Technical Debt

- [ ] Add comprehensive test suite
- [ ] Implement proper error boundaries
- [ ] Add request validation with Zod
- [ ] Optimize database queries
- [ ] Add caching layer for frequent queries
- [ ] Migrate middleware to Next.js proxy pattern

---

## Notes

- Current rate limit: 40 requests/minute to Anthropic API
- Sequential processing used to avoid rate limits
- Consider upgrading Anthropic tier for parallel processing
