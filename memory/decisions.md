# Architectural Decision Records (ADRs)

## ADR-001: Next.js 16+ App Router Architecture
- **Context**: Need a fast, secure, modern fullstack framework supporting React 19, server actions/routes for hidden API keys (Stripe, Gemini), and static/dynamic rendering.
- **Decision**: Used Next.js 16+ with App Router.
- **Consequences**: Fast Turbopack builds, clean server/client separation, zero-leak API key security.

## ADR-002: Dual Theme Design System with Brand Palette
- **Context**: User Rule 2 requires confirming theme strategy. User selected Dual Theme (Light + Dark switchable via `class="dark"`).
- **Decision**: Brand colors `#223125`, `#729969`, `#A1C0C2`, `#E6E7EB`, `#F6F6F6` mapped to CSS variables `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--card`, `--border`. Light mode uses `#F6F6F6` background with `#223125` text and `#729969` accents; Dark mode uses `#141D16` / `#223125` deep forest background with `#A1C0C2` / `#729969` luminous accents.

## ADR-003: Daily Quota Reset at Noon (12:00 PM)
- **Context**: Free tier provides 10 minutes of coaching/practice per day, resetting every day at 12:00 (полдень).
- **Decision**: Implementation tracks `usedSeconds` and `lastResetDate` (targeting next 12:00 PM local/ISO window). Countdown timer in the UI calculates milliseconds remaining until 12:00:00.

## ADR-004: Psychology Learning Stages (3 Stages, 9 Levels)
- **Context**: Requirement to structure psychology curriculum into Initial (Начальный), Advanced (Продвинутый), and Expert (Эксперт) with levels. Free tier gets 5 free lessons from Level 1, quizzes, cases, tips, action steps. Pro gets full access.
- **Decision**: Curriculum structured into 3 distinct stages, 9 detailed levels, with interactive quiz engine and action step builder.

## ADR-005: Gemini 3.5 Flash Lite with CBT/ACT/Schema Therapy Prompts
- **Context**: Required model is `gemini-3.5-flash-lite`.
- **Decision**: Dedicated system prompts for empathetic coaching, cognitive distortion deconstruction, action step verification (avoidance vs authentic action), and state description analysis.
