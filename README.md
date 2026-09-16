# FrameGuide

Мобильная PWA-камера с локальным анализом композиции и опциональным AI-разбором через Hugging Face.

## Что уже работает

- камера iPhone/Android через `getUserMedia`;
- переключение фронтальной/основной камеры;
- hardware zoom и torch, если браузер/камера дают capability;
- локальная оценка света, контраста, резкости и движения;
- детекция лица (BlazeFace) и объектов/людей (COCO-SSD) в браузере;
- композиционные подсказки и rule-of-thirds target;
- голосовые подсказки;
- автоснимок при хорошем стабильном кадре;
- локальная галерея IndexedDB;
- share/download/delete;
- PWA manifest + service worker;
- серверный Hugging Face Vision review без утечки токена в клиент;
- fallback: если ML-модели не загрузились, камера продолжает работать с локальными метриками.

## Стек

Next.js 16.3.3, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zustand, IndexedDB/idb, TensorFlow.js, COCO-SSD, BlazeFace, Hugging Face Inference Providers.

## Локальный запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Открой `http://localhost:3000`. На телефоне камера требует HTTPS, поэтому для реального теста удобнее Vercel.

## Hugging Face

AI-разбор необязателен. Без токена всё кроме облачного разбора продолжает работать.

1. Создай fine-grained HF token с правом `Make calls to Inference Providers`.
2. В Vercel → Project → Settings → Environment Variables добавь `HF_TOKEN`.
3. По желанию измени `HF_VISION_MODEL`.

Токен используется только в `app/api/ai-review/route.ts` и никогда не отправляется в браузер.

## Deploy на Vercel

1. Загрузи этот проект в GitHub.
2. На Vercel нажми **Add New → Project**.
3. Выбери репозиторий FrameGuide.
4. Framework Preset определится как Next.js автоматически.
5. Добавь `HF_TOKEN` (необязательно).
6. Нажми Deploy.

## Ограничения браузеров

Web API камеры отличается между iOS/Android и устройствами. Zoom/torch включаются только когда `MediaStreamTrack.getCapabilities()` сообщает поддержку. ML-модели при первом запуске требуют интернет для загрузки весов; после сбоя приложение переключается на локальный fallback-анализ.
