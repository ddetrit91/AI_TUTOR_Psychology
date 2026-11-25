# Project Sitemap & Route Catalog

## Client / Frontend Routes
| Route | File Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Public | Главная страница / Лендинг (особенности, этапы, тарифы, отзывы) |
| `/dashboard` | `src/app/dashboard/page.tsx` | Public / Demo / Auth | Панель пользователя: статус тарифа, виджет сброса в 12:00, прогресс обучения |
| `/coach` | `src/app/coach/page.tsx` | Public / Demo / Auth | Диалог с AI Коучем (таймер 10 мин для Free, Pro-модули состояния и проверки шагов) |
| `/roadmap` | `src/app/roadmap/page.tsx` | Public / Demo / Auth | Дорожная карта 3 этапов и 9 уровней психологии |
| `/lessons/[lessonId]` | `src/app/lessons/[lessonId]/page.tsx` | Free (1-5) / Pro (все) | Интерактивный урок: теория, квиз, кейс, шаги действий |
| `/pricing` | `src/app/pricing/page.tsx` | Public | Тарифная сетка (Free vs Pro) и оформление подписки Stripe |
| `/profile` | `src/app/profile/page.tsx` | Public / Demo / Auth | Профиль пользователя, настройки темы, управление подпиской Stripe |

## Backend / API Routes
| Endpoint | Method | File Path | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/chat` | `POST` | `src/app/api/chat/route.ts` | Общение с AI Коучем (`gemini-3.5-flash-lite`), проверка лимита Free, Pro-анализ |
| `/api/verify-steps` | `POST` | `src/app/api/verify-steps/route.ts` | Pro-функция: глубокая валидация шагов действий на избегание и саботаж |
| `/api/analyze-state` | `POST` | `src/app/api/analyze-state/route.ts` | Pro-функция: анализ соматического и эмоционального состояния |
| `/api/checkout` | `POST` | `src/app/api/checkout/route.ts` | Создание Stripe Checkout Session для подписки Pro |
| `/api/webhooks/stripe` | `POST` | `src/app/api/webhooks/stripe/route.ts` | Обработка событий Stripe (оплата, отмена, обновление подписки) |
| `/api/portal` | `POST` | `src/app/api/portal/route.ts` | Переход в Stripe Customer Portal для управления биллингом |
| `/api/user/state` | `GET`, `POST` | `src/app/api/user/state/route.ts` | Чтение и синхронизация профиля, квоты, уроков и шагов в Lakebase Postgres |
| `/api/journal` | `GET`, `POST`, `DELETE` | `src/app/api/journal/route.ts` | Загрузка/выдача заметок через Neon Object Storage (`uploads`) и Postgres |
| `/api/health/neon` | `GET` | `src/app/api/health/neon/route.ts` | Проверка доступности Lakebase Postgres и Neon Object Storage |
