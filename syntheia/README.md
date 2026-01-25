# Syntheia

**Real insights. Synthetic speed.**

Syntheia is a B2B SaaS platform that generates synthetic survey respondents using LLMs for market research. It reduces research costs and time by 90%+ while maintaining statistical validity comparable to human panels.

## Features

- **SSR Engine**: Semantic Similarity Rating methodology for statistically valid responses
- **Synthetic Personas**: Generate diverse respondent profiles by demographics and psychographics
- **Survey Editor**: Create surveys with Likert, NPS, multiple choice, and open-ended questions
- **Results Dashboard**: View aggregated statistics, distributions, and qualitative insights
- **API Access**: Programmatic access to the simulation engine

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Drizzle ORM
- **AI**: Claude (Anthropic) + OpenAI Embeddings
- **Auth**: Better Auth
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd syntheia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your API keys.

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
syntheia/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── simulate/      # SSR simulation endpoint
│   │   │   └── studies/       # Study CRUD endpoints
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Auth pages
│   │   └── signup/
│   ├── components/            # React components
│   │   └── ui/                # UI primitives
│   ├── db/                    # Database schema
│   └── lib/                   # Core utilities
│       ├── ssr-engine.ts      # SSR methodology implementation
│       ├── persona-generator.ts # Synthetic persona generation
│       └── utils.ts           # Helper functions
├── drizzle/                   # Database migrations
└── public/                    # Static assets
```

## SSR Methodology

The Semantic Similarity Rating (SSR) methodology is based on research from arXiv 2510.08338:

1. **Text Response Generation**: LLM generates natural language responses from a synthetic persona
2. **Embedding Comparison**: Response is embedded and compared to scale anchor statements
3. **Distribution Mapping**: Cosine similarities are converted to probability distributions via softmax
4. **Rating Selection**: Final rating is sampled from the distribution

This approach produces realistic response distributions with 90% of the reliability of human panels.

## API Usage

### Simulate Endpoint

```bash
POST /api/simulate
Content-Type: application/json

{
  "questions": [
    {
      "id": "q1",
      "type": "likert",
      "text": "How likely are you to purchase this product?"
    }
  ],
  "panelConfig": {
    "preset": "general",
    "count": 100
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "totalRespondents": 100,
    "questions": [
      {
        "questionId": "q1",
        "statistics": {
          "mean": 3.65,
          "median": 4,
          "distribution": [5, 12, 22, 38, 23]
        },
        "sampleResponses": [...]
      }
    ]
  }
}
```

## Persona Presets

Available presets for quick panel configuration:

- `general` - General US population (18-75)
- `millennials` - Ages 28-43
- `genZ` - Ages 18-27
- `babyBoomers` - Ages 60-78
- `highIncome` - $125K+ household income
- `techWorkers` - Tech industry professionals
- `parents` - Adults with children
- `healthConscious` - Health & wellness focused
- `ecoConscious` - Sustainability minded

## Pricing

| Plan | Price/month | Credits | Cost/respondent |
|------|-------------|---------|-----------------|
| Starter | $99 | 1,000 | $0.10 |
| Growth | $499 | 7,500 | $0.07 |
| Scale | $1,499 | 30,000 | $0.05 |
| Enterprise | Custom | Unlimited | $0.03-0.05 |

## Ethical Guidelines

Syntheia is designed as a complement to human research, not a replacement:

**Appropriate Use Cases:**
- Concept exploration and validation
- Message and positioning testing
- Feature prioritization
- Price sensitivity analysis
- Augmenting small human studies

**Not Recommended For:**
- Critical health/safety decisions
- Legal or regulatory compliance
- Replacing human panels for final decisions
- Presenting as "real" human data

All reports include watermarks indicating synthetic data origin.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## License

Proprietary - All rights reserved.

## Support

For questions or issues, contact support@syntheia.ai
