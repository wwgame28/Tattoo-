import type { FrameMetrics, Guidance, SubjectBox } from "./types";

let previousGray: Uint8Array | null = null;

export function analyzePixels(ctx: CanvasRenderingContext2D, width: number, height: number): FrameMetrics {
  const image = ctx.getImageData(0, 0, width, height);
  const px = image.data;
  const count = width * height;
  const gray = new Uint8Array(count);

  let sum = 0;
  let sumSq = 0;
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    const g = Math.round(px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114);
    gray[p] = g;
    sum += g;
    sumSq += g * g;
  }

  const brightness = sum / count;
  const variance = Math.max(0, sumSq / count - brightness * brightness);
  const contrast = Math.sqrt(variance);

  let laplacian = 0;
  let edges = 0;
  let horizontalWeight = 0;
  let verticalWeight = 0;
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = y * width + x;
      const c = gray[i] * 4 - gray[i - 1] - gray[i + 1] - gray[i - width] - gray[i + width];
      laplacian += Math.abs(c);
      edges++;
      const gx = gray[i + 1] - gray[i - 1];
      const gy = gray[i + width] - gray[i - width];
      const mag = Math.abs(gx) + Math.abs(gy);
      if (mag > 36) {
        horizontalWeight += Math.abs(gy);
        verticalWeight += Math.abs(gx);
      }
    }
  }

  let motion = 0;
  if (previousGray && previousGray.length === gray.length) {
    let diff = 0;
    for (let i = 0; i < gray.length; i += 4) diff += Math.abs(gray[i] - previousGray[i]);
    motion = diff / Math.ceil(gray.length / 4);
  }
  previousGray = gray;

  // Это не полноценный Hough transform, а дешёвая оценка наклона сцены для real-time на телефоне.
  const ratio = (horizontalWeight + 1) / (verticalWeight + 1);
  const horizonAngle = Math.max(-8, Math.min(8, (1 - ratio) * 4));

  return {
    brightness,
    contrast,
    sharpness: edges ? laplacian / edges : 0,
    motion,
    horizonAngle,
  };
}

function nearestThird(value: number) {
  return Math.abs(value - 1 / 3) < Math.abs(value - 2 / 3) ? 1 / 3 : 2 / 3;
}

export function buildGuidance(metrics: FrameMetrics, subject?: SubjectBox): Guidance {
  let score = 100;
  const issues: Array<{ penalty: number; headline: string; detail: string; status: Guidance["status"] }> = [];

  if (metrics.brightness < 58) issues.push({ penalty: 24, headline: "Добавь света", detail: "Кадр слишком тёмный. Повернись к источнику света или включи освещение.", status: "bad" });
  else if (metrics.brightness < 82) issues.push({ penalty: 10, headline: "Чуть светлее", detail: "Лица и детали могут потеряться в тенях.", status: "warn" });
  if (metrics.brightness > 215) issues.push({ penalty: 18, headline: "Слишком ярко", detail: "Уменьши свет или отверни камеру от яркого источника.", status: "bad" });
  if (metrics.sharpness < 18) issues.push({ penalty: 18, headline: "Держи телефон ровнее", detail: "Кадр выглядит мягким. Зафиксируй телефон на секунду.", status: "bad" });
  if (metrics.motion > 14) issues.push({ penalty: 18, headline: "Не двигайся", detail: "Камера ещё движется — дождись стабилизации.", status: "warn" });
  if (metrics.contrast < 24) issues.push({ penalty: 8, headline: "Мало контраста", detail: "Попробуй изменить ракурс или добавить боковой свет.", status: "warn" });

  let target: Guidance["target"];
  if (subject) {
    const cx = (subject.x + subject.width / 2);
    const cy = (subject.y + subject.height / 2);
    const isFace = subject.label === "face";
    target = isFace ? { x: 0.5, y: 0.34 } : { x: nearestThird(cx), y: nearestThird(cy) };
    const distance = Math.hypot(cx - target.x, cy - target.y);

    if (distance > 0.22) {
      issues.push({ penalty: 18, headline: cx < target.x ? "Сдвинь камеру влево" : "Сдвинь камеру вправо", detail: "Поставь главный объект ближе к сильной точке композиции.", status: "bad" });
    } else if (distance > 0.11) {
      issues.push({ penalty: 9, headline: "Ещё немного", detail: "Чуть подправь положение главного объекта.", status: "warn" });
    }

    const area = subject.width * subject.height;
    if (isFace && area < 0.025) issues.push({ penalty: 8, headline: "Подойди ближе", detail: "Лицо слишком маленькое для портретного кадра.", status: "warn" });
    if (isFace && area > 0.28) issues.push({ penalty: 8, headline: "Немного дальше", detail: "Оставь больше воздуха вокруг лица.", status: "warn" });
  } else {
    issues.push({ penalty: 5, headline: "Ищу главный объект", detail: "Наведи камеру на человека или заметный предмет.", status: "warn" });
  }

  issues.forEach((issue) => { score -= issue.penalty; });
  score = Math.max(0, Math.min(100, Math.round(score)));
  const top = issues.sort((a, b) => b.penalty - a.penalty)[0];

  if (!top || score >= 90) {
    return { score, headline: "Кадр готов", detail: "Композиция и свет выглядят хорошо. Можно снимать.", status: "good", target };
  }
  return { score, headline: top.headline, detail: top.detail, status: top.status, target };
}
