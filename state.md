# Состояние проекта — SW 2.5 Character Sheet

Дата: 2026-06-20

---

## Что сделано

- Определён стек и архитектура (см. `docs/tech-stack.md`)
- Определён MVP (см. `docs/features.md`)
- Проведено глубокое исследование листа персонажа SW 2.5 из 15+ источников
- Вся структура листа задокументирована в `docs/sheet-content/` (12 файлов)
- **Изучён Core Rulebook I PDF (EN перевод Cardia's Library)**:
  - Полные Background-таблицы и кости A–F для всех 7 рас Core I
  - Полные списки заклинаний: Truespeech, Spiritualism, Divine (Basic + 8 богов Specialized), Magitech
  - Все данные: `docs/sheet-content/01-races.md` и `09-spells-core1.md`
- **Изучён Core Rulebook II PDF (EN перевод)**:
  - 3 новые расы: Lildraken, Grassrunner, Meria — полные данные
  - Дополнительные Background-таблицы для всех 7 рас Core I (Fairy Tamer / Enhancer / Bard фоны)
  - Enhanced Racial Abilities при Adv Level 6+ для всех рас Core I
  - Полный список языков (21+ язык)
  - XP-таблица до Level 10
  - Новые классы: Fairy Tamer, Enhancer, Bard — механики и способности
  - Дополнения к Conjurer: Create Golem, Create Undead (новые заклинания кр. 3)
  - Дополнения к Priest: Battle Hymn, Fist of God и другие + 5 новых богов
  - Truespeech: 16 новых заклинаний (кр. 7–10)
  - Spiritualism: 16 новых заклинаний (кр. 3 + 7–10)
  - Divine Basic: 12 новых заклинаний (кр. 7–10)
  - Magitech: ~14 новых заклинаний (кр. 7–10)
  - 5 новых богов Divine: Asteria, Grendal, Dalion, Miritsa, Strasford (4 заклинания каждый)
  - 6 богов Core I получили ещё по 2 заклинания (уровни 7 и 10)
  - Fairy Magic: 7 типов × 10 кругов = 70 заклинаний
  - Techniques (Enhancer): 20 штук (12 уровня 1 + 8 уровня 5)
  - Spellsongs (Bard): 17 штук (9 уровня 1 + 8 уровня 5)
  - Finales (Bard): 8 штук (4 уровня 1 + 4 уровня 5)
  - Combat Feats Core II: ~47 новых феатов (Passive/Active/Auto)
  - Abyss Enhancement: полная механика (оружие/броня/щит, 36 Abyss Curses)
  - Система репутации/Adventurer Rank подтверждена

---

## Текущий статус

**Стадия: планирование завершено, разработка не начата.**

Код отсутствует. Все решения по стеку приняты, содержимое листа задокументировано для Core I и Core II.

---

## Что известно о листе (итоги двух книг)

23 класса, 10 рас (Core I+II), 12+ магических школ. Ключевые формулы подтверждены:

- `HP = Adv.Level × 3 + VIT`
- `MP = Σ Wizard Class Levels × 3 + SPR`
- `Modifier = floor(stat / 6)`
- `DEX = Skill + A`, `AGI = Skill + B`, `STR = Body + C`, `VIT = Body + D`, `INT = Mind + E`, `SPR = Mind + F`
- `Bardic Power = Bard Level + INT modifier` (для Finales)
- `Enhancer SV = Enhancer Level + INT modifier` (для Fire Breath)

Полная структура: `docs/sheet-content/00-index.md`

**Заклинания Core I (подтверждено):**
- Truespeech: 18 (кр. 1–6)
- Spiritualism: 21 (кр. 1–6)
- Divine Basic: 20 (кр. 1–6) + 8 богов × 2 заклинания = 16 Specialized
- Magitech: 23 (кр. 1–6)

**Заклинания Core II (подтверждено):**
- Truespeech: +16 (кр. 7–10) → итого 34
- Spiritualism: +16 (кр. 3, 7–10) → итого 37
- Divine Basic: +12 (кр. 7–10) → итого 32
- Divine Specialized Core I боги: +12 (по 2 на каждого из 6) → итого 28 для 8 богов
- Divine Specialized 5 новых богов: 5 × 4 = 20 новых → итого 13 богов, 48 Specialized заклинаний
- Magitech: +14 → итого ~37
- Fairy Magic: 70 (7 типов × 10 кругов)
- Techniques: 20
- Spellsongs: 17
- Finales: 8

---

## Открытые вопросы (нужно решить перед разработкой)

1. **Стили**: Tailwind vs CSS Modules? UI-библиотека (shadcn/ui)?
2. **Умный лист**: автокалькуляция всего vs ручной ввод с подсказками
3. **Dice roller**: в MVP или нет
4. **Деплой**: GitHub Pages / Vercel / Netlify
5. **Публичный или приватный**: влияет на встраивание данных из книги

---

## Что ещё осталось изучить (открытые пробелы)

1. **Полный список SCA из Core I** — конкретные способности требуют Core I Part 3 (pp. 248–265)
2. **Расы Core III** — Tiens, Leprechaun: нужен PDF Core III
3. **General Skills список** — 72+ навыков, нужен Epic Treasury PDF
4. **Fairy Magic / Nature / Daemon / Book / Geomancy** — школы из дополнений
5. **Детальные механики Conjurer Golems/Undead** — Core II pp. 87–93
6. **Adventurer Rank пороги** — точные значения Reputation Points для каждого ранга
7. **Magitech кр. 7–10** — имена подтверждены, детальные механики некоторых не задокументированы
8. **Некоторые Specialized Divine Core I** — Daybreak (Tidan 10) и другие, чьи страницы не были в скриншотах

---

## Следующий шаг

**Инициализировать проект:**

```bash
npm create vite@latest . -- --template react-ts
npm install zustand react-i18next i18next zod
```

Затем спроектировать JSON-схему персонажа (`src/types/character.ts`) на основе `docs/sheet-content/`.

Или сначала ответить на открытые вопросы выше — особенно про стили и уровень автоматизации.
