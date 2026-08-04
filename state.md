# Состояние проекта — SW 2.5 Character Sheet

Дата: 2026-08-04

---

## Текущий статус

**Стадия: планирование и документационный ресёрч. Разработка кода не начата.**

Стек, MVP и все продуктовые решения приняты (2026-07-07, дополнены 2026-08-04). Контент листа персонажа задокументирован в `docs/sheet-content/` (00–12 + новые находки) для Core Rulebook I–III полностью по расам/классам/формулам/заклинаниям базового уровня. **Все 8 дополнений сообщества разобраны** (7 полностью + 1 частично из-за эмбарго переводчиков) — книжный ресёрч по классам завершён, **все 24 класса SW2.5 подтверждены по первоисточникам**. Полная структура и навигация: `docs/sheet-content/00-index.md`.

**2026-08-04:** пройден пред-стартовый аудит доков, дозакрыты 2 продуктовых вопроса — HP/MP трекер + статус-эффекты (полноценно, с автоматикой, в MVP) и стратегия тестирования (Vitest + Testing Library) — см. `docs/features.md`, `docs/tech-stack.md`. Аудитом также найдены, но пока **не зафиксированы в докaх** 2 риска: (1) GitHub Pages без GitHub Pro/Team сделает сайт публичным, что противоречит приватности, на которой держится `legal.md`; (2) скачанные fan-translation PDF в `files/` не в `.gitignore` — риск закоммитить эмбаргованный контент в git-историю. Обсудить и решить, стоит ли их фиксировать/исправлять, в следующей сессии.

---

## Сводка по источникам (какая книга что даёт)

Все PDF — community EN-переводы, лежат в `files/`. Метод проверки: полнотекстовое извлечение через `pymupdf` + поиск по оглавлению/ключевым словам (не по скриншотам).

| Книга | Статус | Ключевые находки | Куда записано |
|---|---|---|---|
| **Core Rulebook I** | ✅ Разобрана полностью | 7 рас (кости A–F, Background-таблицы), заклинания Truespeech/Spiritualism/Divine/Magitech ур.1–6, **полный список Combat Feats/SCA** (pp.249–265) | `01-races.md`, `09-spells-core1.md`, `04-combat-and-scas.md` |
| **Core Rulebook II** | ✅ Разобрана полностью | 3 расы (Lildraken/Grassrunner/Meria), классы Fairy Tamer/Enhancer/Bard, заклинания ур.7–10, **Adventurer Rank Chart с точными порогами Reputation** (pp.110–115), Abyss Enhancement, ~47 новых Combat Feats | `01-races.md`, `09/10-spells-core*.md`, `02-classes.md`, `06-equipment.md`, `04-combat-and-scas.md` |
| **Core Rulebook III** | 🟡 Классы и расы закрыты, мир/предметы — нет | 2 расы (Tiens/Leprechaun) + Enhanced Racial Abilities Lv11+ для всех 12 рас, XP-таблица до 15 ур. **Rider** (Mount Rules, ~30 Stunts) и **Alchemist** (Evocations, Material Cards) — полная механика подтверждена 2026-07-09. Не задокументированы: новые Combat Feats, снаряжение/mounts data, боги "Second Sword", бестиарий | `01-races.md`, `02-classes.md` |
| **Outlaw Profile Book** | ✅ Разобрана (для целей листа) | 4 расы (Alv/Shadow/Soleil/Weakling + 4 варианта Weakling) — описание/языки/способности. **Без костей A–F** — расы созданы для альтернативной системы персонажа Vagrant (не-авантюрист), не для стандартного создания | `01-races.md` |
| **Epic Treasury** | ✅ Проверена | Work Skills (проф. навыки для ролплея), Point Buy Character Creation, Advanced Combat (2D grid), Mount Data, Average Height by Race. **НЕ содержит** General Skills/Tactician/Druid (ошибочно считалось ранее) | `07-general-skills-and-misc.md`, `01-races.md` |
| **Raxia Life** | ✅ Проверена | Расширение Work Skills (по локациям); бонус — расы **Abyssborn/Newman** (реприз из Arcane Relic, только описание+способности). **НЕ содержит** General Skills | `01-races.md`, `07-general-skills-and-misc.md` |
| **Magus Arts** | ✅ Geomancer + Tactician закрыты | Полная механика: Geomancer (Aspects/Qi/Geograph), Tactician (Stratagems/Maneuvers/Edge). Druid/Daemonologist — только лор. Бонусы (не задокументированы): Deep Magic, Stunts, Evocations, боги "Second Sword", расширенная Fairy Magic | `02-classes.md` |
| **Monstrous Lore** | ✅ Разобрана полностью | Druid (Nature Magic, ~59 заклинаний, Symbols of Beneficence/Symbolic Lore) и Daemonologist/Summoner (Summoning Arts, ~46 заклинаний, Gate Imp/Abyss Gate/Daemon Action Chart/Banishment) — оба Major-класса с полной механикой. Плюс: New Backgrounds, ~400 монстров, Golem Enhancing Items, Familiar Data | `02-classes.md` |
| **Abyss Breaker** | ✅ Разобрана полностью | Abyss Gazer (Wizard-type, Abyssal Magic, ~27 заклинаний с системой Enhancement через Daemon's Blood/Abyss Shards — **подтверждён отдельным классом от Daemonologist**) и Dark Hunter (Other-type, Essence Weaving, ~28 штук, Mental Power=Lv+SPR). Плюс Thrown Weapons (B/A/S/SS), Abyss Skills/Abyss Corruption (риск потери PC как Daemon) | `02-classes.md`, `06-equipment.md` |
| **Tyrants Crypts** | 🟡 Разобрана (только Preview, 20 стр.) | Bibliomancer (Wizard-type, Arcane Magic) — полная механика класса: Grimoire, Prepared/Emergency Spell Slots (табл. ур.1–15), Critical Failure Value, заклинания покупаются/находятся поштучно. Список заклинаний и весь остальной контент книги — под эмбарго переводчиков | `02-classes.md` |
| **Arcane Relic** | ⬜ Не скачана | Полные данные (кости A–F) для Abyssborn/Newman — сейчас есть только реприз-описание из Raxia Life | — |

### Важные коррекции (запомнить на будущее)

- **General Skills (72+) как отдельная механика листа, вероятно, не существует.** Проверено в 4 источниках (Core I, Core II, Epic Treasury, Raxia Life) — термина нет нигде. Изначальное допущение — ошибка раннего (доpymupdf) исследования. Не тратить время на дальнейший поиск без новых оснований.
- **Tactician и Geomancer** — правильный источник **Magus Arts** (не Epic Treasury, не несуществующая книга "Mage Arts" — опечатка/путаница из старых заметок).
- **Druid и Daemonologist (Summoner/Daemon Tamer)** — подтверждённый источник **Monstrous Lore** (не Epic Treasury, не Magus Arts — там только лор-комментарий). Полная механика (Nature Magic / Summoning Arts) → `02-classes.md`.
- **Abyss Gazer** (Abyss Breaker) — подтверждён **отдельный класс от Daemonologist**, не синоним (разные школы: Abyssal Magic ≠ Summoning Arts, нет Gate Imp/Abyss Gate/призыва). Счётчик классов скорректирован с 23 до **24**.
- **Базовый Abyss Enhancement уже был задокументирован из Core Rulebook II** (`06-equipment.md`) — Abyss Breaker его только переиздаёт для справки, ничего нового. Новый контент там — **Abyss Skills/Abyss Corruption** (именные способности вместо типовых бонусов + риск постоянных штрафов вплоть до потери персонажа как Daemon).
- **Bibliomancer** (Tyrants Crypts) — подтверждён, Wizard-Type Major, школа **Arcane Magic** (не "Book Magic", как формулировалось ранее). Уникальная механика: заклинания не даются автоматически по уровню, покупаются/находятся поштучно и готовятся в Grimoire через слоты.
- Полный список из 8 дополнений сообщества (Outlaw Profile Book, Epic Treasury, Raxia Life, Magus Arts, Monstrous Lore, Abyss Breaker, Tyrants Crypts) разобран — **книжный ресёрч по классам закрыт**. Незакрыт только контент под эмбарго (Tyrants Crypts полностью) и книга Arcane Relic (не скачана, нужна только для костей A–F Abyssborn/Newman).
- **Rider и Alchemist (Core Rulebook III)** — полная механика подтверждена (pp.84–113, 190–198). Это закрывает последний гэп по классам самого Core III (все 24 класса SW2.5 теперь имеют полную механику, кроме списка заклинаний Bibliomancer под эмбарго).
- Найдена **community-библиотека всех переводов SW2.5** — общая папка Google Drive проекта Sword World Translation Project (прямые ссылки на файлы уже использованы для скачивания). Справочная вики `sw25.wikidot.com` существует, но геоблокирована для RU/BY — недоступна напрямую (WebFetch/curl), только через WebSearch-сниппеты.

---

## Что известно о листе (итоги разбора)

24 класса, 18 рас (Core I–III + Outlaw + Abyssborn/Newman), 12+ магических школ, Adventurer Level cap = 15. Ключевые формулы подтверждены:

- `HP = Adv.Level × 3 + VIT`
- `MP = Σ Wizard Class Levels × 3 + SPR`
- `Modifier = floor(stat / 6)`
- `DEX = Skill + A`, `AGI = Skill + B`, `STR = Body + C`, `VIT = Body + D`, `INT = Mind + E`, `SPR = Mind + F`
- `Bardic Power = Bard Level + INT modifier` (для Finales)
- `Enhancer SV = Enhancer Level + INT modifier` (для Fire Breath)

Полная структура: `docs/sheet-content/00-index.md`

**Заклинания Core I (подтверждено):**
- Truespeech: 18 (кр. 1–6) · Spiritualism: 21 (кр. 1–6) · Divine Basic: 20 (кр. 1–6) + 16 Specialized (8 богов × 2) · Magitech: 23 (кр. 1–6)

**Заклинания Core II (подтверждено):**
- Truespeech: +16 → 34 · Spiritualism: +16 → 37 · Divine Basic: +12 → 32 · Divine Specialized: 13 богов, 48 заклинаний всего · Magitech: +14 → ~37 · Fairy Magic: 70 (7×10) · Techniques: 20 · Spellsongs: 17 · Finales: 8

---

## Открытые вопросы по продукту

Стек/фичи/легальность закрыты 2026-07-07 (`docs/tech-stack.md`, `docs/features.md`, `docs/legal.md`): Vite + CSS Modules + Radix UI + Jotai + Zod, GitHub Pages (приватный репо), умная автокалькуляция, dice roller вне MVP, несколько персонажей в localStorage, печать через "Скачать PDF", проект приватный. Дополнено 2026-08-04: HP/MP трекер + статус-эффекты в MVP, тестирование — Vitest + Testing Library.

Остаётся открытым:
1. **Визуальная концепция листа** (`docs/design.md`) — отложено намеренно (бумажный TTRPG-стиль vs современный clean UI, тема, раскладка, локализация UI-терминов)
2. **Миграция JSON при импорте старой `schemaVersion`** — silent migration или предупреждение?
3. **Нужен ли домен** для GitHub Pages деплоя?
4. **Схема статус-эффектов** — enum модифицируемых полей vs свободный ввод, один общий счётчик раундов на бой или per-эффект, пресеты частых эффектов или только ручной ввод (детали в `docs/features.md`)
5. **Риск GitHub Pages без Pro/Team** (публичность) и **риск fan-translation PDF без `.gitignore`** — найдены при аудите 2026-08-04, пока не решены (см. заметку выше)

---

## Открытые пробелы в контенте (не блокируют старт разработки MVP)

1. Список заклинаний Arcane Magic, 8 Work Skills, Dig Arts, Magic Items, монстры — **Tyrants Crypts под эмбарго переводчиков**, недоступно без покупки оригинала
2. Детальные механики Conjurer Golems/Undead — Core II pp.87–93 (доп. Golem Enhancing Items уже найдены в Monstrous Lore pp.225–235)
3. Magitech кр.7–10 — имена подтверждены, детальные механики некоторых нет
4. Некоторые Specialized Divine Core I (Daybreak/Tidan 10 и др.)
5. Core III прочий контент — новые Combat Feats (pp.199–205), снаряжение/mounts data (pp.206–262), боги "Second Sword", бестиарий (Part 4-5)
6. Magus Arts Stunts/Evocations (pp.173–184) — соотношение с версией Core III не проверено (дубликат для справки или расширение?)
7. Deep Magic (новая школа, Magus Arts, требует Sorcerer+Conjurer)
8. Расширенная Fairy Magic (3-type/6-type selection, Chaos-заклинания, Magus Arts)
9. Система Vagrant (Outlaw Profile Book) — D66 таблицы для не-авантюристов, вне MVP
10. Point Buy/Advanced Combat/Treasure Drop (Epic Treasury) — опциональные post-MVP системы
11. Кости A–F для Abyssborn/Newman — нужна книга Arcane Relic (не скачана; единственная известная недостающая книга)
12. Полные построчные списки заклинаний Nature Magic (~59), Summoning Arts (~46), Abyssal Magic (~27), Evocation Data (~28) — в `02-classes.md` задокументирована механика и счётчик, но не построчный список названий/эффектов (низкий приоритет, объёмная работа)
13. Abyss Breaker Part 2–4 (World lore, Random Shallow Abyss generation, Monster Data 80+ монстров) — не приоритет для листа персонажа
14. War Leader — возможно, никогда не существовал как класс (не встретился ни в одной из 8 разобранных книг), аналогично прежней General Skills-гипотезе

---

## Следующий шаг — развилка для новой сессии

**Книжный ресёрч по классам завершён.** Все 8 дополнений сообщества разобраны (7 полностью, Tyrants Crypts частично из-за эмбарго), **все 24 класса SW2.5 подтверждены по первоисточникам с полной механикой** (включая Rider и Alchemist из Core III, закрытые 2026-07-09). Оставшиеся пробелы (список выше) — это либо контент под эмбарго, либо мелкие детали снаряжения/бестиария/бонусных систем, либо расширенные построчные списки заклинаний — ничего из этого не блокирует MVP.

Два пути, оба доступны прямо сейчас:

**А) Добить мелкие пробелы.** Все классы закрыты — из содержательных пробелов, влияющих на лист, остался в основном п.11 (Arcane Relic, не найдена в прошлых попытках поиска) и п.5 (снаряжение/Combat Feats Core III, если нужна полнота списка предметов). Остальное — низкий приоритет (построчные списки заклинаний, лор, бонусные системы).

**Б) Начать разработку.** Стек и MVP определены с 2026-07-07, контента по Core I–III + всем 8 дополнениям достаточно с большим запасом:
```bash
npm create vite@latest . -- --template react-ts
npm install jotai react-i18next i18next zod @radix-ui/react-*
```
Затем спроектировать JSON-схему персонажа (`src/types/character.ts`) на основе `docs/sheet-content/`. Визуальная концепция (`docs/design.md`) намеренно отложена — решать по ходу вёрстки.

Книжный ресёрч закрыт полностью (все классы имеют механику) — путь Б выглядит логичнее, но выбор за пользователем в начале следующей сессии.
