import express from 'express';

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '200kb' }));

const PORT = Number(process.env.PORT || 3000);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3.1-flash-lite-image';
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'https://wwgame28.github.io')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
);

const buckets = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 8;

function cors(req, res) {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.has(origin)) {
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    return true;
  }
  return false;
}

function safeText(value, max = 120) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function rateOk(ip) {
  const now = Date.now();
  const prev = buckets.get(ip);
  if (!prev || now - prev.started > WINDOW_MS) {
    buckets.set(ip, { started: now, count: 1 });
    return true;
  }
  if (prev.count >= LIMIT) return false;
  prev.count += 1;
  return true;
}

const styleMap = {
  'Графика': 'graphic tattoo, crisp expressive linework, controlled shading',
  'Fine line': 'fine line tattoo, elegant thin linework, delicate details',
  'Blackwork': 'blackwork tattoo, bold black shapes, strong negative space',
  'Реализм': 'realistic tattoo illustration, refined tonal rendering',
  'Нео-традишнл': 'neo-traditional tattoo, strong silhouette, ornamental detail',
  'Японский': 'Japanese tattoo inspired composition, flowing rhythm, traditional balance',
  'Dotwork': 'dotwork tattoo, stippling, ornamental texture',
  'Минимализм': 'minimal tattoo, restrained clean linework, simple readable silhouette'
};

const genreMap = {
  'Ботаника': 'botanical subject, flowers, leaves, organic forms',
  'Животные': 'animal subject with expressive anatomy',
  'Мистика': 'mystical symbolism, occult atmosphere without readable text',
  'Готика': 'gothic atmosphere, dark romantic motifs',
  'Хоррор': 'horror-inspired imagery, eerie but tattooable, no gore',
  'Аниме': 'original anime-inspired character, no copyrighted character copy',
  'Фэнтези': 'fantasy creature or character, imaginative ornamental forms',
  'Абстракция': 'abstract flowing forms, artistic negative space'
};

const moodMap = {
  'Нежно': 'soft, elegant, airy mood',
  'Смело': 'bold, confident, high-impact mood',
  'Тёмно': 'dark, mysterious, dramatic mood',
  'Романтика': 'romantic, poetic mood',
  'Странно': 'surreal, unusual, slightly weird mood',
  '18+': 'mature sensual adult aesthetic, adults only, tasteful and non-explicit, no graphic sexual content'
};

const placementMap = {
  'Рука': 'composition for arm',
  'Предплечье': 'vertical composition for forearm',
  'Плечо': 'rounded composition for shoulder',
  'Бедро': 'large flowing composition for thigh',
  'Голень': 'vertical composition for lower leg',
  'Спина': 'large balanced composition for back',
  'Рёбра': 'elongated composition for ribs',
  'Кисть': 'compact composition for hand'
};

const sizeMap = {
  'Мини': 'small tattoo, very readable, low detail density',
  'Средняя': 'medium tattoo, balanced detail density',
  'Крупная': 'large tattoo, richer detail and stronger composition',
  'Полурукав': 'half-sleeve tattoo composition, connected flow',
  'Рукав': 'full sleeve tattoo composition, continuous visual flow'
};

function buildPrompt(body) {
  const style = safeText(body.style);
  const genre = safeText(body.genre);
  const mood = safeText(body.mood);
  const placement = safeText(body.placement);
  const size = safeText(body.size);
  const idea = safeText(body.idea, 400);

  if (!style || !genre || !mood || !placement || !size) return null;

  return [
    'Professional original tattoo flash design for a real tattoo artist.',
    styleMap[style] || style,
    genreMap[genre] || genre,
    moodMap[mood] || mood,
    placementMap[placement] || placement,
    sizeMap[size] || size,
    idea ? `Client idea: ${idea}` : '',
    'Create one strong finished tattoo concept only.',
    'Clean light paper background, centered readable silhouette, tattooable anatomy and line hierarchy.',
    'No skin mockup, no body photo, no typography, no letters, no watermark, no logo, no frame, no duplicated limbs or elements.',
    'Editorial tattoo flash presentation, high visual clarity.'
  ].filter(Boolean).join(' ');
}

app.use((req, res, next) => {
  if (!cors(req, res)) return res.status(403).json({ error: 'ORIGIN_NOT_ALLOWED' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, provider: 'openrouter', model: IMAGE_MODEL });
});

app.post('/api/generate', async (req, res) => {
  if (!OPENROUTER_API_KEY) return res.status(503).json({ error: 'OPENROUTER_NOT_CONFIGURED' });
  if (!rateOk(req.ip || 'unknown')) return res.status(429).json({ error: 'RATE_LIMIT', message: 'Слишком много генераций. Попробуй позже.' });

  const prompt = buildPrompt(req.body || {});
  if (!prompt) return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Выбери все пять параметров.' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/images', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://wwgame28.github.io/Tattoo-/',
        'X-Title': 'ORLICA Tattoo Constructor'
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        aspect_ratio: '3:4',
        n: 1
      }),
      signal: AbortSignal.timeout(90000)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      console.error('OpenRouter error', response.status, data?.error?.message || data?.error || 'unknown');
      return res.status(response.status >= 500 ? 502 : 400).json({ error: 'GENERATION_FAILED', message: 'Генератор не ответил. Попробуй ещё раз.' });
    }

    const item = data?.data?.[0];
    if (!item?.b64_json) return res.status(502).json({ error: 'EMPTY_IMAGE', message: 'Модель не вернула изображение.' });

    const media = safeText(item.media_type || 'image/png', 40);
    return res.json({
      ok: true,
      image: `data:${media};base64,${item.b64_json}`,
      model: IMAGE_MODEL,
      prompt,
      usage: data?.usage || null
    });
  } catch (error) {
    console.error('Generation exception', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'GENERATION_FAILED', message: 'Генерация временно недоступна.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ORLICA AI API listening on ${PORT}`);
});
