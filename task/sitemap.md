# Project Sitemap & Route Catalog

## Client / Frontend Routes
| Route | File Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Public | Главная страница / Лендинг (особенности, этапы, тарифы, отзывы) |
| `/auth/sign-in` | `src/app/auth/sign-in/page.tsx` | Public (Signed-out) | Вход в аккаунт через Neon Auth (email + пароль) |
| `/auth/sign-up` | `src/app/auth/sign-up/page.tsx` | Public (Signed-out) | Регистрация нового пользователя через Neon Auth |
| `/auth/reset-password` | `src/app/auth/reset-password/page.tsx` | Public (Signed-out) | Запрос сброса пароля |
| `/dashboard` | `src/app/dashboard/page.tsx` | Auth Required | Панель пользователя: статус тарифа, виджет сброса в 12:00, прогресс, архив заметок |
| `/coach` | `src/app/coach/page.tsx` | Auth Required | Диалог с AI Коучем (таймер 10 мин для Free, Pro-модули состояния и проверки шагов) |
| `/roadmap` | `src/app/roadmap/page.tsx` | Public | Дорожная карта 3 этапов и 9 уровней психологии |
| `/lessons/[lessonId]` | `src/app/lessons/[lessonId]/page.tsx` | Public (1-5) / Pro | Интерактивный урок: теория, квиз, кейс, шаги действий |
| `/pricing` | `src/app/pricing/page.tsx` | Public | Тарифная сетка (Free vs Pro) и оформление подписки Stripe |
| `/profile` | `src/app/profile/page.tsx` | Auth Required | Профиль пользователя, привязанная подписка Stripe, выход |

## Backend / API Routes
| Endpoint | Method | File Path | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/[...path]` | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` | `src/app/api/auth/[...path]/route.ts` | Прокси Neon Auth (Managed Better Auth: регистрация, вход, сессии, выход) |
| `/api/chat` | `GET`, `POST` | `src/app/api/chat/route.ts` | Общение с AI Коучем (`gemini-3.5-flash-lite`), проверка сессии и лимита Free/Pro |
| `/api/verify-steps` | `POST` | `src/app/api/verify-steps/route.ts` | Pro-функция: глубокая валидация шагов действий на избегание и саботаж |
| `/api/analyze-state` | `POST` | `src/app/api/analyze-state/route.ts` | Pro-функция: анализ соматического и эмоционального состояния |
| `/api/checkout` | `POST` | `src/app/api/checkout/route.ts` | Создание Stripe Checkout Session с привязкой к `session.user.id` |
| `/api/checkout/verify` | `POST` | `src/app/api/checkout/verify/route.ts` | Серверная верификация Stripe Checkout Session и активация Pro в БД |
| `/api/webhooks/stripe` | `POST` | `src/app/api/webhooks/stripe/route.ts` | Обработка событий Stripe и обновление подписки конкретного пользователя |
| `/api/portal` | `POST` | `src/app/api/portal/route.ts` | Переход в Stripe Customer Portal для управления подпиской пользователя |
| `/api/user/state` | `GET`, `POST` | `src/app/api/user/state/route.ts` | Чтение и синхронизация профиля, квоты, уроков и шагов авторизованного пользователя |
| `/api/journal` | `GET`, `POST`, `DELETE` | `src/app/api/journal/route.ts` | Загрузка/выдача заметок пользователя через Neon Object Storage (`uploads`) и Postgres |
| `/api/health/neon` | `GET` | `src/app/api/health/neon/route.ts` | Проверка доступности Lakebase Postgres и Neon Object Storage |
