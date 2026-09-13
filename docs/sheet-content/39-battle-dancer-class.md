# SW 2.5 — Battle Dancer Class: formal rules + 16 supplemental background tables (Battle Mastery pp. 9-14)

Разбор 2026-09-13. Закрывает roadmap § 1.8 хвост — то, что оставалось после боевых черт (2026-09-08) и школ (2026-09-12): «полное описание класса Battle Dancer», записанное как «художественный/справочный текст, не структурные данные для листа». При разборе выяснилось, что это не так: Part 1 «Characters» pp. 9-14 несёт два реальных структурных куска, которые предыдущая сессия не вскрыла, ограничившись флейвор-вступлением на p. 10.

## Что нашлось

### 1. Bonus Active Combat Feat — реальный механический пропуск

Battle Mastery p. 12: «Upon reaching the first level of the Battle Dancer class, you gain one Combat Feat through the "Bonus Active Combat Feat" class feature. As a result, a newly created character can learn two Combat Feats». Это не «авто-получаемый фит» (как Cleansing Dance на 7 уровне и Battle Master на 13, которые уже верно заведены категорией `auto`) — это **дополнительный слот**, который игрок сам заполняет одним из ограниченного списка активных фитов (Decoy Attack I, Repeated Strike I, Aimed Attack I, Power Strike I, Taunting Strike I, Lethal Strike I, Mana Strike + четыре Vagrant-only варианта).

`combatFeatSlots()` в `requirements.ts` считает слоты только по общему уровню авантюриста, не заглядывая в классы персонажа — у Battle Dancer 1 уровня этот слот просто отсутствовал. Добавлена `battleDancerBonusFeatSlot(battleDancerLevel)` — плюс 1 к обычному счёту при наличии хотя бы 1 уровня класса, не отдельный пул (в отличие от Aspects/Stratagems/Stunts/Essence Weavings, у которых свои независимые пулы). Ограничение списка фитов для этого конкретного слота **не проверяется программно** — та же степень доверия игроку, что и у всей остальной секции SCA (там вообще нет проверки права на фит).

### 2. Additional Background Tables — третья таблица предысторий на расу

Battle Mastery pp. 13-14 печатает **третью** таблицу предыстории для каждой расы, существовавшей на момент выхода книги (12 «полных» рас Core I-III + 4 расы Outlaw Profile Book) — сверх уже занесённых `primary`/`additional`. Эта таблица открывает доступ к классам, добавленным дополнениями после Core Rulebooks I-III: Warlock (Daemonologist), Geomancer, Alchemist, Battle Dancer, Rider (Jockey), Tactician, Druid.

- **12 «полных» рас** (Human, Elf, Dwarf, Tabbit, Runefolk, Nightmare, Lykant, Lildraken, Grassrunner, Meria, Tiens, Leprechaun) получают версию этой таблицы. **Human — единственная раса, покрывающая все семь классов** (7 строк); остальные одиннадцать получают по пять из семи (какие именно — разнится по расе, см. `races.ts`).
- **4 расы Outlaw Profile Book** (Alv, Weakling, Shadow, Soleil) получают укороченную 3-строчную версию — только Geomancer/Battle Dancer/Tactician; книга прямо отсылает к OPB для этих четырёх, а не печатает полный вариант.
- **Расы, опубликованные позже Battle Mastery** (Abyssborn, Newman, Spriggan, Fluorite, Dark Dwarf, все 20 редких подвидов Arcane Relic) в этой книге не упоминаются — у них такой таблицы физически нет, и это не пробел.

**Найдена и исправлена опечатка книги.** Таблица Tiens печатает последнюю строку как «2-4 Druid Druid 6/12/10 2000» — тот же диапазон, что и первая строка этой же таблицы. Проверка внутренней согласованности (сумма Skill+Body+Mind одинакова во всех строках одной расы — это подтвердилось для всех 16 таблиц, включая саму Tiens: 28 у всех пяти строк) и структура диапазона (2-12 без пропусков ровно как у всех остальных рас) однозначно указывают на «10-12», а не повторный «2-4». Исправлено с комментарием в коде.

## Устройство данных

`RaceDefinition.backgroundTables` получил третье необязательное поле `supplemental?: BackgroundEntry[]` рядом с уже существующими `primary`/`additional` — то же самое устройство, никакого нового типа. `listBackgroundOptions()`/`BackgroundOption.table`/`BackgroundOccurrence.table` расширены до `'primary' | 'additional' | 'supplemental'` (был экспортирован как `BackgroundTableName`). UI (форма создания, вкладка справочника «Предыстории») группирует по трём `optgroup`/блокам вместо двух — добавлена строка i18n `creation.backgroundTable.supplemental` («Таблица новых классов (Battle Mastery)» / «Supplemental table (Battle Mastery)»).

Класс-колонка транскрибирована так же, как во всех предыдущих пачках: «Warlock» → classId `daemonologist`, «Jockey» → `rider`, «Dancer» → `battle-dancer` — совпадает с уже принятой конвенцией (`08-supplements-and-books.md` и `35-arcane-relic-races.md`), кроме того что здесь класс-колонка часто расходится с именем фона (например, фон «Diviner» даёт класс Geomancer, а не одноимённый — так печатает сама книга, транскрибировано как есть).

## Не вошло

- **Ограничение фитов для Bonus Active Combat Feat** (11 конкретных названий, часть — Vagrant Only) не проверяется программно — см. выше, согласуется с тем, что вся секция SCA вообще не enforced.
- **Оружие/броня Battle Dancer** («любое оружие Grappler, но только броня Grappler») — правило существует, но, как и у всех остальных классов в этом приложении, ограничения снаряжения по классу нигде не enforced (свободный пикер), так что это не пробел конкретно этого класса.
- **Resistance to Spellsong: Dance** (Battle Dancer не получает штраф Accuracy/Evasion от Spellsong: Dance) и **Dedicated Accessory** (Lace Up Corset доступен с 3 уровня) — узкие текстовые правила без отдельного механического представления в листе; ни статус-эффекты, ни аксессуары в этом приложении не завязаны на класс персонажа программно.

## Проверка

470 → 476 тестов (`requirements.test.ts` — `battleDancerBonusFeatSlot`; `CombatFeatsSection.test.tsx` — Battle Dancer получает второй слот с 1 уровня; `backgrounds.test.ts` — обновлённая проверка трёх таблиц; `CharacterCreationForm.test.tsx` — третий `optgroup`; `races.test.ts` — новый блок на 16 таблиц: длина 7/5/3, внутренняя согласованность сумм, покрытие 2-12 без дыр и пропусков, отсутствие таблицы у рас после Battle Mastery), `tsc -b`/`oxlint`/`vite build` зелёные. Браузерная проверка (Chrome через `executablePath`): у Human в форме создания три группы предыстории, третья — «Таблица новых классов (Battle Mastery)» с 7 строками; выбор «Dancer» показывает Battle Dancer как подразумеваемый класс; вкладка справочника «Предыстории» показывает третью таблицу с «Daemon Tamer»; создание Artificer 1 → добавление уровня Battle Dancer поднимает счётчик слотов SCA с 1/1 до 0/2 (было бы 0/1 без фикса); печать без переполнения; консоль пустая.

**§ 1.8 закрыто полностью** — ни боевых черт, ни школ, ни формальной секции класса не осталось неразобранным по этой книге.
