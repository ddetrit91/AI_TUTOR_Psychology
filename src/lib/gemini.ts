import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

function getPreferredModel() {
  return process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
}

export const PSYCHO_COACH_SYSTEM_PROMPT = `
Вы — "MindBalance AI", элитный персональный AI-коуч по психологии и когнитивно-поведенческой трансформации.
Ваша методологическая база:
1. Когнитивно-поведенческая терапия (КПТ / CBT Аарона Бека и Альберта Эллиса): работа с автоматическими мыслями, Сократовский диалог, разделение фактов и домыслов.
2. Терапия принятия и ответственности (ACT Стивена Хейса): психологическая гибкость, когнитивное расцепление (Defusion), контакт с ценностями.
3. Схема-терапия (Джеффри Янг): бережное распознавание уязвимых детских режимов, работа с критикующими голосами и забота о потребностях.
4. Осознанность и соматическая калибровка (Mindfulness & Somatics).

СТИЛЬ ОБЩЕНИЯ:
- Теплый, глубокий, чуткий, безоценочный, валидирующий чувства собеседника.
- Вы не даете плоских советов вроде «просто успокойся» или «мысли позитивно».
- Вы задаете сильные открытые вопросы, помогающие человеку увидеть то, что скрыто за поверхностной защитой.
- Вы возвращаете внимание в тело («Где сейчас в теле отзывается эта тревога?», «Что с дыханием?»).
- Вы используете чистый, грамотный русский язык без бюрократизмов и шаблонности.

ЭТИЧЕСКИЙ ДИСКЛЕЙМЕР:
Вы коуч и проводник по психообразованию и самопознанию. Если пользователь сообщает о прямом суицидальном намерении или тяжелом психическом расстройстве в остром психозе, мягко предложите обратиться на кризисную горячую линию психологической помощи.
`;

export const PRO_DEEP_ANALYSIS_ADDENDUM = `
РЕЖИМ PRO-АНАЛИЗА (УГЛУБЛЕННЫЙ РАЗБОР):
Пользователь находится на тарифе Pro. Вы проводите глубокую деконструкцию его сообщений:
1. Выявляйте скрытые когнитивные ошибки (катастрофизация, персонализация, чтение мыслей, сверхобобщение, дихотомическое мышление, эмоциональное обоснование). Называйте их деликатно и объясняйте механизм.
2. Анализируйте скрытые первичные эмоции за фасадом вторичных реакций (например, обида или злость как щит для уязвимости и страха отвержения).
3. Исследуйте защитные паттерны (избегание, гиперконтроль, перфекционизм, угождение).
4. Задавайте вопросы, раскрывающие подлинное «Я» человека.
`;

export async function generateCoachResponse(
  history: { role: "user" | "model"; parts: string }[],
  isPro: boolean,
  stateDetails?: {
    emotions?: string[];
    somaticMarkers?: string[];
    intensity?: number;
    notes?: string;
  }
): Promise<string> {
  const genAI = getGenAI();
  const preferredModel = getPreferredModel();

  // If API key is present, attempt Gemini call
  if (genAI) {
    try {
      const systemInstruction = isPro
        ? `${PSYCHO_COACH_SYSTEM_PROMPT}\n${PRO_DEEP_ANALYSIS_ADDENDUM}`
        : PSYCHO_COACH_SYSTEM_PROMPT;

      // Try preferred model, fallback if needed
      const candidateModels = [
        preferredModel,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash",
      ];

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: {
              role: "system",
              parts: [{ text: systemInstruction }],
            },
          });

          let promptText = history[history.length - 1]?.parts || "";
          if (stateDetails && isPro) {
            promptText = `[КОНТЕКСТ СОСТОЯНИЯ PRO]:
- Выбранные эмоции: ${stateDetails.emotions?.join(", ") || "не указаны"}
- Телесные соматические сигналы: ${stateDetails.somaticMarkers?.join(", ") || "не указаны"}
- Уровень интенсивности переживания: ${stateDetails.intensity || 5} из 10
- Заметки о триггере: ${stateDetails.notes || "нет"}

СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ:
${promptText}`;
          }

          const chat = model.startChat({
            history: history.slice(0, -1).map((h) => ({
              role: h.role,
              parts: [{ text: h.parts }],
            })),
          });

          const result = await chat.sendMessage(promptText);
          const response = await result.response;
          const text = response.text();
          if (text) return text;
        } catch {
          // Try next model fallback
          continue;
        }
      }
    } catch {
      // Fall through to rich psychological fallback
    }
  }

  // High quality simulated psychological response when API key is not configured or rate-limited
  return getRichSimulatedResponse(history, isPro, stateDetails);
}

export async function verifyActionStepAI(
  stepTitle: string,
  userReflection: string
): Promise<{
  isValid: boolean;
  score: number;
  analysis: string;
  pitfalls: string[];
  recommendation: string;
}> {
  const genAI = getGenAI();
  const preferredModel = getPreferredModel();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: preferredModel,
        systemInstruction: {
          role: "system",
          parts: [
            {
              text: `Вы — супервизор психологических шагов действий в когнитивно-поведенческой и ACT-терапии.
Ваша задача — проанализировать запланированный шаг действия пользователя и его описание.
Проверьте:
1. Является ли шаг конкретным и выполнимым (SMART)?
2. Нет ли в нем скрытого избегания (например, "я просто подумаю об этом позже")?
3. Нет ли признаков невротического перфекционизма ("сделать всё идеально с первого раза")?
4. Согласован ли шаг с заботой о себе и подлинными ценностями?

Верните строгий JSON формата:
{
  "isValid": boolean,
  "score": number (1-100),
  "analysis": "краткий глубокий разбор шага на русском языке",
  "pitfalls": ["ловушка 1", "ловушка 2"],
  "recommendation": "как скорректировать шаг, чтобы он стал безопасным и эффективным"
}`,
            },
          ],
        },
      });

        const prompt = `ШАГ ДЕЙСТВИЯ: "${stepTitle}"\nОПИСАНИЕ ИЛИ ПЛАН ПОЛЬЗОВАТЕЛЯ: "${userReflection}"`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fall back
      }
    }

  // Built-in intelligent clinical evaluation fallback
  const isAvoidance = /подумаю|потом|завтра|как-нибудь|может быть|не уверен/i.test(userReflection);
  const isPerfectionism = /идеально|на 100%|всегда|никогда|без единой ошибки/i.test(userReflection);

  let score = 88;
  const pitfalls: string[] = [];
  if (isAvoidance) {
    score -= 25;
    pitfalls.push("Элемент откладывания / прокрастинации из-за страха фрустрации");
  }
  if (isPerfectionism) {
    score -= 20;
    pitfalls.push("Завышенные перфекционистские ожидания, провоцирующие паралич действия");
  }

  return {
    isValid: score >= 60,
    score,
    analysis: `Ваш шаг "${stepTitle}" затрагивает важную зону роста. Вы искренне стремитесь изменить привычный паттерн, однако в описании чувствуется напряжение между контролем и реальной готовностью к уязвимости.`,
    pitfalls: pitfalls.length > 0 ? pitfalls : ["Риск переоценки эмоционального ресурса в момент усталости"],
    recommendation: isAvoidance
      ? "Разбейте этот шаг на 2 микро-действия длительностью не более 2 минут. Сделайте первое уже сегодня."
      : "Разрешите себе выполнить этот шаг 'на троечку с плюсом'. Главное — не безупречность, а факт нового поведенческого опыта.",
  };
}

function getRichSimulatedResponse(
  history: { role: "user" | "model"; parts: string }[],
  isPro: boolean,
  stateDetails?: {
    emotions?: string[];
    somaticMarkers?: string[];
    intensity?: number;
    notes?: string;
  }
): string {
  const lastMsg = history[history.length - 1]?.parts?.toLowerCase() || "";

  if (isPro && stateDetails) {
    const emotionsStr = stateDetails.emotions?.join(", ") || "тревога и неопределенность";
    const somaticStr = stateDetails.somaticMarkers?.join(", ") || "напряжение в теле";
    
    return `Я очень внимательно слышу то, чем вы поделились. 

Когда внутри одновременно переплетаются **${emotionsStr}**, а тело сигнализирует через **${somaticStr}** при интенсивности ${stateDetails.intensity || 7}/10 — это не просто мысли, это мощная биологическая волна перегрузки.

### Разбор в режиме Pro:
1. **Соматический якорь**: Обратите внимание, как тело пытается удержать контроль через ${somaticStr}. Это реакция защиты, а не слабости. Сделайте медленный выдох через слегка сомкнутые губы — дайте сигнал блуждающему нерву, что прямо в эту секунду непосредственной физической угрозы нет.
2. **Когнитивный фильтр**: В том, о чем вы пишете, прослеживается автоматическая установка: *«Я должен(на) с этим справиться мгновенно, иначе со мной что-то не так»*. Это классическая ловушка *долженствования* и *персонализации*.
3. **Глубинная потребность**: За этой тревогой всегда стоит потребность в безопасности и принятии. 

Спросите себя прямо сейчас: **если бы самый любящий и мудрый взрослый был рядом с вами в эту минуту, какие слова поддержки он бы вам сказал?**`;
  }

  if (lastMsg.includes("привет") || lastMsg.includes("здравствуй") || lastMsg.length < 15) {
    return `Здравствуйте. Я рад быть рядом с вами в этом пространстве безопасности и осознанности. 

Я ваш персональный AI-коуч по психологии. Здесь вы можете открыто исследовать всё, что волнует: тревогу, усталость, сомнения, конфликты в отношениях или поиск внутренних опор.

Скажите, с чем вы приходите прямо сейчас? Какая ситуация или чувство занимает ваше внимание?`;
  }

  if (lastMsg.includes("тревог") || lastMsg.includes("страх") || lastMsg.includes("паник")) {
    return `Спасибо за доверие. Тревога — это невероятно энергозатратное состояние, но важно помнить: **тревога — это сигнал нервной системы о неопределенности, а не подтвержденный факт опасности**.

Давайте прямо сейчас сделаем микро-заземление:
1. Почувствуйте стопами пол или спиной спинку стула. Ощутите физическую опору.
2. Сделайте мягкий вдох через нос на 4 счета и очень длинный плавный выдох через рот на 6–7 счетов.
3. Отделите факт от прогноза: какая конкретная мысль сейчас пугает вас больше всего? Что это за сценарий?`;
  }

  if (lastMsg.includes("устал") || lastMsg.includes("выгора") || lastMsg.includes("сил нет")) {
    return `Я слышу вашу сильную усталость. Когда ресурсы на нуле, внутренний критик часто начинает требовать от нас еще больше продуктивности, усугубляя истощение.

Позвольте себе прямо сейчас легализовать это состояние: вы имеете полное право быть уставшим(ей). 
Что прямо сегодня вы можете безопасно отложить или сделать на минимальном уровне, чтобы подарить себе 30 минут истинного восстановления?`;
  }

  return `Я слышу глубину того, о чем вы говорите. За этими словами стоит важный внутренний процесс.

В психологии есть правило: **мы не можем изменить то, чего не замечаем**. Тот факт, что вы вынесли этот вопрос в наш диалог — уже первый шаг к ясности.

Давайте исследуем это чуть глубже:
- Что в этой ситуации ранит или триггерит вас сильнее всего?
- Как вам кажется, какой привычный сценарий из прошлого здесь снова пытается проиграться?`;
}
