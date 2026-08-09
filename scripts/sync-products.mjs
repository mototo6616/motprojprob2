// Синхронизация каталога с Google Таблицей.
//
// Как это работает:
// 1. Таблица опубликована в веб как CSV (File → Share → Publish to web → CSV).
// 2. Этот скрипт скачивает CSV по ссылке из переменной окружения SHEET_CSV_URL.
// 3. Каждая строка превращается в объект товара и сохраняется в data/products.json.
// 4. GitHub Actions запускает это по расписанию и коммитит изменения — см. DEV_SETUP.md.
//
// Запуск вручную: SHEET_CSV_URL="https://...&output=csv" npm run sync

import { parse } from 'csv-parse/sync';
import { writeFileSync, readFileSync } from 'fs';

const SHEET_CSV_URL = process.env.SHEET_CSV_URL;
const OUTPUT_PATH = new URL('../data/products.json', import.meta.url);

if (!SHEET_CSV_URL) {
  console.error('Ошибка: не задана переменная окружения SHEET_CSV_URL.');
  console.error('См. инструкцию в DEV_SETUP.md, раздел "Настройка синхронизации".');
  process.exit(1);
}

function parseCharacteristics(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(';')
    .map(pair => pair.trim())
    .filter(Boolean)
    .map(pair => {
      const idx = pair.indexOf(':');
      if (idx === -1) return { label: pair.trim(), value: '' };
      return {
        label: pair.slice(0, idx).trim(),
        value: pair.slice(idx + 1).trim()
      };
    });
}

function parsePhotos(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
    .map(name => `img/products/${name}`);
}

function parseBool(raw) {
  return String(raw).trim().toUpperCase() === 'TRUE';
}

async function main() {
  console.log('Скачиваю CSV из таблицы…');
  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) {
    throw new Error(`Не удалось скачать таблицу: HTTP ${res.status}. Проверь, что ссылка опубликована и доступна всем.`);
  }
  const csvText = await res.text();

  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const requiredColumns = ['id', 'category', 'name', 'price'];
  const seenIds = new Set();
  const products = [];
  const errors = [];

  rows.forEach((row, i) => {
    const rowNum = i + 2; // +2: заголовок + 1-based

    for (const col of requiredColumns) {
      if (!row[col] || !String(row[col]).trim()) {
        errors.push(`Строка ${rowNum}: пустое обязательное поле "${col}" — строка пропущена.`);
        return;
      }
    }
    if (seenIds.has(row.id)) {
      errors.push(`Строка ${rowNum}: id "${row.id}" повторяется — строка пропущена.`);
      return;
    }
    seenIds.add(row.id);

    if (!['electro', 'pitbike', 'quad'].includes(row.category)) {
      errors.push(`Строка ${rowNum}: неизвестная категория "${row.category}" (ожидались electro/pitbike/quad) — строка пропущена.`);
      return;
    }

    products.push({
      id: row.id,
      category: row.category,
      name: row.name,
      price: row.price,
      specs: parseCharacteristics(row.characteristics),
      description: row.description || '',
      photos: parsePhotos(row.photos),
      inStock: parseBool(row.in_stock)
    });
  });

  if (errors.length) {
    console.warn('Предупреждения при разборе таблицы:');
    errors.forEach(e => console.warn('  - ' + e));
  }

  if (!products.length) {
    throw new Error('После разбора таблицы не осталось ни одного товара — прерываю, чтобы не затереть каталог пустым файлом.');
  }

  const previous = (() => {
    try { return readFileSync(OUTPUT_PATH, 'utf-8'); } catch { return null; }
  })();

  const next = JSON.stringify(products, null, 2) + '\n';

  if (previous === next) {
    console.log(`Изменений нет. Товаров в каталоге: ${products.length}.`);
    return;
  }

  writeFileSync(OUTPUT_PATH, next);
  console.log(`Готово. Товаров в каталоге: ${products.length}. Файл data/products.json обновлён.`);
}

main().catch(err => {
  console.error('Синхронизация не удалась:', err.message);
  process.exit(1);
});
