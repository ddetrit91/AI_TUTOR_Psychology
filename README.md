# MindBalance AI — Персональный AI-коуч по психологии

🌐 **Live Demo (Vercel):** [https://ai-tutor-psychology.vercel.app](https://ai-tutor-psychology.vercel.app)

SaaS-сервис персонального когнитивно-поведенческого AI-коуча по психологии на базе доказательных подходов (**КПТ**, **ACT**, **Схема-терапия** и **DBT**).

---

## Основные возможности

### Тарифы и логика доступа
* **Free**:
  * **10 минут практики в день** с активным таймером сессии в чате.
  * **Автоматический ежедневный сброс лимита в 12:00 дня (полдень)** с живым обратным отсчётом.
  * **5 интерактивных уроков бесплатно** (Начальный этап), квизы, жизненные кейсы, советы и шаги действий.
* **Pro (Stripe Subscription)**:
  * **Неограниченное время практики (∞)**.
  * **Модуль «Описание состояния»**: спектр эмоций, соматические телесные маркеры и шкала интенсивности переживания.
  * **Углублённый диалог с коучем**: деконструкция когнитивных искажений и раскрытие глубинных установок.
  * **AI-супервизия шагов действий**: выявление скрытого избегания, перфекционизма и самосаботажа.
  * Полный доступ ко всем **3 этапам** и **9 уровням** программы (Начальный, Продвинутый, Эксперт).

---

## Технологический стек

* **Framework**: Next.js 16+ (App Router, Turbopack), React 19, TypeScript
* **UI & Styling**: Tailwind CSS, shadcn/ui (Radix UI), Lucide Icons, Dual Theme (Light & Dark)
* **Typography & Brand Palette**: `Montserrat Alternates` + `Commissioner`, цвета `#223125`, `#729969`, `#A1C0C2`, `#E6E7EB`, `#F6F6F6`
* **AI Model**: Google Gemini (`gemini-3.5-flash-lite`)
* **Database & Storage (Neon)**:
  * **Lakebase Postgres** (`@neondatabase/serverless`) — профили, квоты, прогресс уроков, шаги действий, история диалогов, метаданные заметок
  * **Neon Object Storage** (`files-sdk/neon`, приватный бакет `uploads`) — архив личных практик и заметок по presigned URL
* **Payments**: Stripe (Checkout Sessions, Webhooks, Customer Portal)

---

## Быстрый старт

1. Скопируйте `.env.example` в `.env.local` и заполните ключи (`GEMINI_API_KEY`, `STRIPE_*`, `DATABASE_URL`, `AWS_*`).
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Примените миграцию схемы БД:
   ```bash
   npm run db:migrate
   ```
4. Запустите проект:
   ```bash
   npm run dev
   ```
