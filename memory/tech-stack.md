# Tech Stack

## Core Technologies
- **Runtime**: Node.js v24.21.0
- **Framework**: Next.js 16+ (App Router, Turbopack, TypeScript)
- **UI Library**: React 19, shadcn/ui (Radix UI primitives), Lucide React
- **Styling**: Tailwind CSS with custom CSS variables & Dual Theme (`class="dark"`) support
- **Brand Palette**:
  - Dark Pine / Deep Forest: `#223125`
  - Sage Leaf / Foliage: `#729969`
  - Celadon Aqua / Clarity: `#A1C0C2`
  - Light Platinum Grey: `#E6E7EB`
  - Warm Alabaster / Porcelain: `#F6F6F6`
- **Typography**:
  - Headings: `Montserrat Alternates` (Google Font via `next/font/google`)
  - Body: `Commissioner` (Google Font via `next/font/google`)
- **AI Engine**:
  - Model: `gemini-3.5-flash-lite` (via `@google/genai` or `@google/generative-ai` with CBT, ACT, Schema therapy prompt engineering)
- **Billing & Subscriptions**:
  - Stripe (`stripe`, `@stripe/stripe-js`) with Checkout Sessions, Webhooks, Customer Portal & Mock mode for test environments.
- **Database, Auth & Storage (Neon)**:
  - **Neon Auth** (`@neon/auth` Managed Better Auth) — регистрация, вход, сессии в схеме `neon_auth` и защита роутов в `src/proxy.ts`
  - **Lakebase Postgres** (branch `production`, project `cool-forest-97420522`) via `@neondatabase/serverless` (`DATABASE_URL` pooled for runtime, `DATABASE_URL_UNPOOLED` direct for migrations)
  - **Neon Object Storage** (private bucket `uploads`) via `files-sdk/neon` (`AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
  - **Infrastructure as Code**: `neon.ts` (`@neon/config/v1`)
- **State & Persistence**:
  - Postgres persistence (`user_profiles`, `completed_lessons`, `action_steps`, `coach_messages`, `journal_attachments`) + optimistic LocalStorage mirror.
