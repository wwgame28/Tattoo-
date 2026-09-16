import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "HF_TOKEN не настроен" }, { status: 503 });
  }

  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Нужно передать image" }, { status: 400 });
  }
  if (image.size > 5_000_000) {
    return NextResponse.json({ error: "Изображение слишком большое" }, { status: 413 });
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const mime = image.type || "image/jpeg";
  const dataUrl = `data:${mime};base64,${bytes.toString("base64")}`;
  const model = process.env.HF_VISION_MODEL || "deepseek-ai/DeepSeek-V4.1-Flash:baseten";

  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: 260,
      messages: [
        {
          role: "system",
          content: "Ты профессиональный фотограф. Оценивай кадр кратко и практично. Не выдумывай детали, которых не видно.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Проанализируй фото по композиции, свету, резкости, фону и ракурсу. Ответ на русском: оценка 0-100, затем 3 конкретных улучшения. Не более 120 слов.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ error: "Hugging Face error", detail: errorText.slice(0, 600) }, { status: 502 });
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const review = data.choices?.[0]?.message?.content?.trim();
  if (!review) return NextResponse.json({ error: "AI не вернул текст" }, { status: 502 });
  return NextResponse.json({ review, model });
}
