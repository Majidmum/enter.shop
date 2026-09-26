// Serverless-функция (Vercel): автозаполнение описания и характеристик
// товара через ИИ (Anthropic Claude) — кнопка "Заполнить через ИИ" в
// карточке товара в админке.
//
// Зачем отдельная функция, а не вызов Anthropic прямо из браузера: ключ
// API нельзя класть в клиентский код (VITE_*) — он попадёт в собранный
// бандл и его сможет увидеть/использовать кто угодно. Поэтому ключ живёт
// только в переменной окружения Vercel (ANTHROPIC_API_KEY, без префикса
// VITE_) и используется только здесь, на сервере.
//
// Доступ только для админов/менеджеров: функция принимает access_token
// текущей сессии Supabase, проверяет им пользователя и его роль в
// public.profiles — иначе кто угодно смог бы дергать эндпоинт и расходовать
// оплаченные токены Anthropic.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Ты — помощник интернет-магазина ENTER.TJ (компьютерная техника, электроника и офисная мебель, город Душанбе, Таджикистан). По названию товара составляешь короткое продающее описание и список технических характеристик на русском языке.

Отвечай СТРОГО одним валидным JSON-объектом, без markdown-разметки, без пояснений до или после. Формат:
{"description": "строка", "specs": [{"label": "строка", "value": "строка"}, ...]}

Правила:
- "description": 2–4 предложения, по делу, без воды и превосходных степеней вроде "лучший в мире". Пиши так, как будто описываешь товар для карточки в интернет-магазине.
- "specs": от 4 до 8 пар параметр/значение, релевантных именно этой категории товара (для ноутбука/ПК — процессор, оперативная память, накопитель, экран, видеокарта; для мебели — материал, размеры, вес, максимальная нагрузка; для техники/периферии — подключение, совместимость, комплектация и т.п.). Если категория не позволяет определить специфичные параметры — предложи разумные общие (материал, цвет, комплектация, страна производитель).
- Не выдумывай точные цифры (частоту процессора, ёмкость батареи и т.п.), если не уверен — используй общую формулировку без точного числа или пропусти этот параметр.
- Если админ уже указал часть характеристик (см. "already filled labels" в запросе) — не дублируй их своими вариантами с другой формулировкой, предлагай остальные.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      res.status(500).json({ error: 'ИИ-сервис не настроен: отсутствует ANTHROPIC_API_KEY в переменных окружения Vercel' });
      return;
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      res.status(500).json({ error: 'Supabase env vars are not configured' });
      return;
    }

    // Проверяем, что запрос пришёл от залогиненного админа/менеджера
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    if (!token) {
      res.status(401).json({ error: 'Не авторизовано' });
      return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      res.status(401).json({ error: 'Сессия недействительна, войдите заново' });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
      res.status(403).json({ error: 'Доступно только администраторам и менеджерам' });
      return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      res.status(400).json({ error: 'Не указано название товара' });
      return;
    }
    const categoryName = typeof body.categoryName === 'string' ? body.categoryName.trim() : '';
    const brandName = typeof body.brandName === 'string' ? body.brandName.trim() : '';
    const price = typeof body.price === 'number' && body.price > 0 ? body.price : undefined;
    const existingDescription = typeof body.existingDescription === 'string' ? body.existingDescription.trim() : '';
    const existingSpecLabels = Array.isArray(body.existingSpecLabels)
      ? body.existingSpecLabels.filter((l) => typeof l === 'string' && l.trim()).slice(0, 30)
      : [];

    const userLines = [
      `Название товара: ${name}`,
      categoryName && `Категория: ${categoryName}`,
      brandName && `Бренд: ${brandName}`,
      price && `Цена: ${price} сомони`,
      existingDescription && `Уже есть черновик описания (можешь опираться на него, но не копируй дословно): ${existingDescription}`,
      existingSpecLabels.length > 0 && `already filled labels (не дублировать): ${existingSpecLabels.join(', ')}`,
    ].filter(Boolean);

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userLines.join('\n') }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text().catch(() => '');
      console.error('Anthropic API error', anthropicRes.status, errText);
      res.status(502).json({ error: 'Сервис ИИ временно недоступен, попробуйте позже' });
      return;
    }

    const anthropicData = await anthropicRes.json();
    const rawText = anthropicData?.content?.[0]?.text || '';

    let parsed;
    try {
      // Модель иногда оборачивает JSON в ```json ... ``` несмотря на инструкцию — на всякий случай снимаем обёртку.
      const cleaned = rawText.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response as JSON', rawText);
      res.status(502).json({ error: 'Не удалось разобрать ответ ИИ, попробуйте ещё раз' });
      return;
    }

    const description = typeof parsed.description === 'string' ? parsed.description.trim() : '';
    const specs = Array.isArray(parsed.specs)
      ? parsed.specs
          .filter((s) => s && typeof s.label === 'string' && typeof s.value === 'string' && s.label.trim() && s.value.trim())
          .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
          .slice(0, 12)
      : [];

    res.status(200).json({ description, specs });
  } catch (e) {
    console.error('ai-fill-product error', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
