# SW 2.5 — Abyss Skills и Additional Abyss Curse Table (Abyss Breaker pp. 38–46)

Разбор 2026-09-12. Закрывает roadmap § 1.2. Источник — `files/Sword World 2.5 - Abyss Breaker.pdf`, Part 1 «Characters»: «Abyss Enhancement» pp. 38–43, «Abyss Skills» pp. 44–46 (границы подтверждены оглавлением книги, pp. 10–11).

## Где что лежит

| Страницы | Раздел |
|---|---|
| 38–39 | Правила Abyss Enhancement + список типовых усилений (weapon/armor/shield) — уже в каталоге (`src/data/abyss.ts`), сверено построчно, расхождений нет |
| 40 | Цена/Abyss Shards, Classification Table, Type Determination Table — уже в каталоге (`06-equipment.md`), сверено, расхождений нет |
| 41 | Redetermine Abyss Curse — правило, не данные |
| 42 | **Abyss Curse Table** (базовая, 36 записей) — уже в каталоге, сверено построчно с `ABYSS_CURSES`, расхождений нет |
| 43 | **Additional Abyss Curse Table** (36 записей) — новое, см. ниже |
| 44–46 | **Abyss Skills** (12 именных способностей) + Abyss Corruption Table (12 результатов 2d) — Corruption Table уже задокументирована в `06-equipment.md`, сверена, расхождений нет; Abyss Skills — новое, см. ниже |

Весь раздел уместился в девять страниц простого одноколоночного текста — `pdftotext -raw` отдал всё чисто, отрисовка страниц не понадобилась (в отличие от заклинаний, где круг — графический бейдж; здесь всё текстовые таблицы).

## Как устроены Abyss Skills

12 способностей делятся по типу снаряжения ровно так же, как типовые усиления — по 6 на оружие, 3 на броню, 3 на щит (совпадает с `AbyssTarget` схемы, ничего нового заводить не пришлось):

- **Оружие (6):** Crimson Breath, Arrow of Darkness, Afterimage Flash, Free Flying Tentacles, Extending Tail, Poisonous Blade
- **Броня (3):** Daemonic Shell, Translucent Armor, Mobile Form
- **Щит (3):** Daemonic Stare, Daemonic Droplets, Phantom of a Lovely Figure

Процедура и цена — те же, что у типового Abyss Enhancement (книга прямо это говорит: «choose the corresponding Abyss Skill... processing cost and required Abyss Shards remain the same»). Отличия: (а) не даёт числового бонуса — даёт именной эффект с условием применения (обычно раз/день или раз/раунд); (б) Abyss Curse берётся из Additional-таблицы, не из базовой; (в) многие эффекты триггерят Abyss Corruption при определённом условии (крит, высокий бросок Power Table и т.п.) — текст условия у каждой способности свой.

Текст эффектов (что именно делает каждая способность) не переносился — то же решение, что для заклинаний и черт: приложение двуязычное, ресёрч-доки только русские, а описания этих способностей — не механические индексы, а полноценные абзацы.

## Additional Abyss Curse Table (Abyss Breaker p. 43)

Используется **только** при выборе Abyss Skill — обычный Abyss Enhancement её не использует (и наоборот, Abyss Skill не может взять проклятие из базовой таблицы). Книга также предлагает опциональный режим «расширенная таблица на 72 записи» (объединение базовой и Additional) для обычного Abyss Enhancement — этот режим не реализован: он опциональный по решению стола, а два раздельных селекта уже покрывают оба режима игры (для «72 записи» игрок может просто использовать любой из двух селектов вручную).

| 1d-1d | Название | | 1d-1d | Название |
|---|---|---|---|---|
| 1-1 | Of Decay | | 4-1 | Mocking |
| 1-2 | Slothful | | 4-2 | Not learning |
| 1-3 | Panicked | | 4-3 | Perfectionist |
| 1-4 | Choking | | 4-4 | Dislikes Ostentation |
| 1-5 | Wasteful | | 4-5 | Comatose |
| 1-6 | Hungry | | 4-6 | Branded |
| 2-1 | Persistent Fatigue | | 5-1 | Distracted |
| 2-2 | Resistant to Medicines | | 5-2 | Life Drain |
| 2-3 | Scavenger's | | 5-3 | Mana Drain |
| 2-4 | Of Disobey | | 5-4 | Show Off |
| 2-5 | Take a Break | | 5-5 | Unable to Hold Ground |
| 2-6 | Show Composure | | 5-6 | Exposing |
| 3-1 | Short of Breath | | 6-1 | Torment |
| 3-2 | Tone-deaf | | 6-2 | Affection |
| 3-3 | Not Fully Trustworthy | | 6-3 | Mana Leakage |
| 3-4 | Slipping Through Fingers | | 6-4 | Eager to Retreat |
| 3-5 | Choking | | 6-5 | Go Easy |
| 3-6 | Heaven and Earth in Turmoil | | 6-6 | In Bad Shape |

## Грабли

- **«Choking» встречается дважды** (1-4 и 3-5) с разными эффектами (1-4: нельзя разговаривать в Combat Preparation и первом раунде; 3-5: теряется Edge в начале хода). Не опечатка транскрипции — обе записи отрисованы на p. 43 книги под разными номерами броска. В `ADDITIONAL_ABYSS_CURSES` — два отдельных объекта с одинаковым `name`, различаются только `roll` (у этой таблицы, в отличие от каталога заклинаний, `id` вообще нет — адресация всегда по `roll`, коллизий имён не бывает).
- **Три строки (2-4 «Of Disobey», 3-5 «Choking», 3-6 «Heaven and Earth in Turmoil») зависят от контента Magus Arts** (Stratagems Тактика, Edge, Aspects Геоманта) — книга сама пишет: «If you are not using MA... please reroll». Проект уже содержит классы Tactician/Geomancer (`classes.ts`), но не их каталоги способностей (Stratagems/Aspects — roadmap § 1.6, не закрыт), так что эти три строки описывают механики, которых пока целиком нет на листе. Транскрибированы как есть (лист не решает за стол, использовать ли конкретную строку), но помечены в коде.
- Разночтений между книгой и уже существующим кодом (типовые усиления, базовая Curse Table, Classification/Type Table, Abyss Corruption Table) не найдено — все пять кусков, ранее перенесённых в `06-equipment.md`/`abyss.ts`, сошлись построчно.

## Что добавлено в код

- `src/data/abyss.ts`: `WEAPON_ABYSS_SKILLS`/`ARMOR_ABYSS_SKILLS`/`SHIELD_ABYSS_SKILLS` + `abyssSkillsFor()`, `ADDITIONAL_ABYSS_CURSES` (36) + `getAdditionalAbyssCurse()`, `ABYSS_CORRUPTION_DAEMONIZATION_LEVEL = 5`.
- `src/types/character.ts`: `AbyssEnhancementSchema.kind` (`'typical' | 'skill'`, default `'typical'`) определяет, какую пару каталогов (усиление/способность + таблица проклятий) использует строка; `Character.abyssCorruptionLevel` — персонажный счётчик (не по предмету), с `.default(0)`.
- UI (`EquipmentSection.tsx`): переключатель «Вид» в строке Бездны меняет источник списков усиления и проклятия; смена вида сбрасывает оба выбранных значения (типовое усиление ↔ способность не взаимозаменяемы, как и две таблицы проклятий). Отдельное поле «Abyss Corruption Level» под таблицей усилений с предупреждением при значении ≥5.
- Справочник (`CatalogReference.tsx`): две новые группы во вкладке «Предметы и Бездна» — Abyss Skills по типу снаряжения, Additional Abyss Curse Table.
- Тест `src/data/abyss.test.ts` — раньше у этого каталога не было теста на счётчики/уникальность, хотя базовые 36 проклятий там были с самого начала.
