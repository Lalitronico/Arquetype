// Global test setup
// Mock environment variables
process.env.DATABASE_URL = "file:test.db";
process.env.BETTER_AUTH_SECRET = "test-secret-key-for-testing";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.STRIPE_SECRET_KEY = "test-stripe-key";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
