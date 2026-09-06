# SW 2.5 — Character Sheet Research Index

Всё собранное по листу персонажа Sword World 2.5 для разработки digital app.
Исследование проведено 2026-06-20.

---

## Файлы

| Файл | Содержание |
|------|-----------|
| [01-races.md](01-races.md) | 10 рас (Core I + II): Background-таблицы, кости A–F, расовые способности, Enhanced Racial Abilities, языки, XP до уровня 10 |
| [02-classes.md](02-classes.md) | Все 24 класса по типам (Warrior/Wizard/Other), XP-стоимость, ключевые характеристики |
| [03-ability-scores-and-formulas.md](03-ability-scores-and-formulas.md) | 6 характеристик, таблица модификаторов, HP/MP формулы, Power Table, все формулы |
| [04-combat-and-scas.md](04-combat-and-scas.md) | SCA (4 категории), поля оружия/брони, Check Packages, статус-эффекты; Combat Feats Core II (47 новых) |
| [05-magic-spells.md](05-magic-spells.md) | Все 12 магических школ/систем, структура секций заклинаний на листе |
| [06-equipment.md](06-equipment.md) | Ранги, поля оружия/брони/аксессуаров, расходники, валюта, репутация; **Abyss Enhancement (Core II)** |
| [07-general-skills-and-misc.md](07-general-skills-and-misc.md) | General Skills, расовые способности, Character Info, опыт, Fellow, доп. секции |
| [08-supplements-and-books.md](08-supplements-and-books.md) | Все книги и дополнения, что они добавляют, версии листов |
| [09-spells-core1.md](09-spells-core1.md) | Полные списки заклинаний Core I: Truespeech, Spiritualism, Divine, Magitech (кр. 1–6) |
| [10-spells-core2.md](10-spells-core2.md) | Дополнения Core II: Truespeech/Spiritualism/Divine/Magitech (кр. 7–10) + 5 новых богов Divine |
| [11-fairy-magic.md](11-fairy-magic.md) | Fairy Magic: 7 типов × 10 кругов (70 заклинаний), механика Fairy Tamer |
| [12-techniques-spellsongs.md](12-techniques-spellsongs.md) | Techniques (Enhancer, 20 штук) + Spellsongs (Bard, 17 штук) + Finales (8 штук) |
| [13-spells-supplements.md](13-spells-supplements.md) | Построчные списки Nature Magic (60), Summoning Arts (46), Abyssal Magic (35) — уровни 1–15 |
| [14-evocations.md](14-evocations.md) | Evocations Алхимика (26): требуемый уровень, Material Cards, эффекты по рангам B/A/S/SS |
| [15-items-core3.md](15-items-core3.md) | Снаряжение Core III (pp. 206–249): 63 оружия, 16 брони, 9 щитов, общее снаряжение и аксессуары, Ignidite/Manatite-улучшения |
| [16-mounts.md](16-mounts.md) | Маунты Core III (pp. 247–262): 17 маунтов по уровням и секциям, варианты за репутацию, вооружение и переноска |

---

## Ключевые факты для разработки

### Формулы (подтверждены)
- **HP max** = Adventurer Level × 3 + VIT (само значение, не модификатор)
- **MP max** = Σ всех Wizard Class Levels × 3 + SPR (само значение)
- **Modifier** = floor(Total / 6)
- **Fortitude** = Adv.Lv + VIT modifier
- **Willpower** = Adv.Lv + SPR modifier
- **Accuracy SV** = Warrior Lv + DEX modifier
- **Evasion SV** = Warrior Lv (не Marksman) + AGI modifier
- **Extra Damage** = Warrior Lv + STR modifier
- **Magic Power SV** = Wizard Lv + INT modifier

### Классы (24 итого)
- **Warrior** (5): Fighter, Grappler, Fencer, Marksman, Battle Dancer
- **Wizard** (9): Sorcerer, Conjurer, Priest, Artificer, Fairy Tamer, Druid, Daemonologist, Abyss Gazer, Bibliomancer
- **Other** (10): Scout, Ranger, Sage, Enhancer, Bard, Rider, Alchemist, Tactician, Geomancer, Dark Hunter

**Tactician и Geomancer — полная механика подтверждена (2026-07-09), книга Magus Arts** (не Epic Treasury/"Mage Arts", как считалось раньше) → `02-classes.md`. **Druid и Daemonologist — полная механика подтверждена (2026-07-09), книга Monstrous Lore** → `02-classes.md`. **Abyss Gazer и Dark Hunter — полная механика подтверждена (2026-07-09), книга Abyss Breaker** → `02-classes.md`. **Подтверждено: Abyss Gazer — отдельный класс от Daemonologist**, разные школы магии (Abyssal Magic ≠ Summoning Arts) — счётчик классов увеличен с 23 до 24 (раньше по ошибке считались синонимом).

### Расы (18 итого)
Core I: Human, Elf, Dwarf, Tabbit, Runefolk, Nightmare, Lykant
Core II: Lildraken, Grassrunner, Meria
Core III: Tiens, Leprechaun
Outlaw Profile Book: Alv, Shadow, Soleil, Weakling (Garuda/Tannoz/Basilisk/Minotaur варианты) — **используют альтернативную систему создания персонажа Vagrant**, не стандартные кости A–F
Arcane Relic (через реприз в Raxia Life): Abyssborn, Newman — только описание/способности, кости A–F требуют самой книги Arcane Relic (не скачана)

**Adventurer Level cap: 15** (Core III расширяет с 10 до 15, добавляет Enhanced Racial Abilities второго уровня — Adv Lv 11+ для 12 рас Core I–III)

### SCA категории (4, подтверждено — Core I называет их Combat Feats)
Selectively Acquired Passive | Selectively Acquired Active | Selectively Acquired Major | Automatically Acquired Passive
Начальное количество: 1; +1 на нечётном Adv.Lv (1, 3, 5, 7, 9, 11, 13, 15)
Полный список Core I (18 Passive + 23 Active + 2 Major + 4 Auto) → `04-combat-and-scas.md`; дополнения Core II — там же

### Магические школы (9 систем)
Truespeech | Spiritualism | Divine | Magitech | Fairy | Nature | Daemon/Summoning | Book | Geomancy
+ Spellsongs (Bard), Techniques (Enhancer), Essence Weavings (Dark Hunter)

### Power Table
- 100 строк (Power 1–100+)
- Dice explosion при ≥ Critical Value
- Максимум ~30 урона (Power 100, бросок 12)

---

## Открытые вопросы (актуальные)

### Закрыто по Core Rulebook I PDF
- ✅ **Расовые коррекции** — полные таблицы Skill/Body/Mind и кости A–F для 7 рас Core I (→ 01-races.md)
- ✅ **Background-таблицы** — точные Skill/Body/Mind для каждой расы × фона (→ 01-races.md)
- ✅ **Заклинания Core I** — все 4 школы × 6 кругов (Truespeech, Spiritualism, Divine, Magitech) (→ 09-spells-core1.md)
- ✅ **Specialized Divine Spells** — 8 богов × 2 заклинания (→ 09-spells-core1.md)

### Закрыто по Core Rulebook III PDF (2026-07-07, дополнено 2026-07-09)
- ✅ **Расы Tiens и Leprechaun** — полные данные: кости A–F, обе background-таблицы, расовые способности, языки (→ 01-races.md)
- ✅ **Enhanced Racial Abilities Adv Level 11+** — для всех 12 рас Core I–III (→ 01-races.md)
- ✅ **XP-таблица расширена до Level 15** (→ 01-races.md)
- ✅ **Rider класс** — Mount Rules (владение/аренда/бой), ~30 Stunts, полная механика → `02-classes.md`
- ✅ **Alchemist класс** — Evocations (Material Cards вместо MP, 5 цветов × 4 ранга), полная механика → `02-classes.md`; построчный список 26 Evocations (2026-09-06) → `14-evocations.md`
- ✅ **Combat Feats Core III** (pp.199–205) — 27 феатов: 12 selectively passive, 7 active, 8 automatic (2026-09-06) → `04-combat-and-scas.md`
- ✅ **Снаряжение Core III** (pp. 206–249) — 63 оружия, 16 брони, 9 щитов, общее снаряжение, аксессуары, Ignidite/Extra Manatite и цены усилений Core II на SS-ранге (2026-09-06) → `15-items-core3.md`
- ✅ **Маунты Core III** (pp. 247–262) — 17 маунтов с таблицами по уровням, 7 вариантов за репутацию, 27 предметов снаряжения маунта (2026-09-06) → `16-mounts.md`. Класс Rider получил на лист то, чем пользоваться
- Остаётся не задокументировано: боги "Second Sword" (Part 4), обширный бестиарий (pp. 327–439)

### Закрыто по Outlaw Profile Book PDF (2026-07-09)
- ✅ **Расы Alv, Shadow, Soleil, Weakling** — описание, языки, расовые способности (→ 01-races.md). Кости A–F отсутствуют — эти расы используют отдельную систему создания персонажа Vagrant (D66 Origin/Environment/Childhood Experience таблицы), не совместимую напрямую с форматом остальных рас.

### Закрыто/скорректировано по Epic Treasury PDF (2026-07-09)
- ✅ **Проверено и опровергнуто**: Epic Treasury НЕ содержит General Skills, Tactician, Druid, Warlock, Geomancer — вопреки тому, что было записано в `08-supplements-and-books.md` (источник ошибки — вторичный список fujimi-trpg-online.jp). Исправлено там же.
- ✅ **Work Skills** (проф. навыки для ролплея, отдельная от General Skills система) → `07-general-skills-and-misc.md`
- ✅ **Average Height by Race** (справочно) → `01-races.md`
- Обнаружено: Point Buy Character Creation, Advanced Combat (2D grid), Treasure Drop, Fellow Extended Action Table, Mount Data (pp. 165–179) — не задокументированы подробно, опциональные post-MVP системы

### Закрыто/скорректировано по Raxia Life PDF (2026-07-09)
- ✅ **Проверено и опровергнуто повторно**: Raxia Life тоже НЕ содержит General Skills (72+) — только расширение той же системы Work Skills (pp. 47–108) → `07-general-skills-and-misc.md`, `08-supplements-and-books.md`
- ✅ **Расы Abyssborn, Newman** (из Arcane Relic, реприз на pp. 45–46) — описание и расовые способности → `01-races.md`. Полные данные (кости A–F) требуют саму книгу Arcane Relic (не скачана)

### Закрыто по повторной проверке Core Rulebook I/II (2026-07-09)
- ✅ **Полный список SCA (Combat Feats) Core I** — pp. 249–265 → `04-combat-and-scas.md`
- ✅ **Adventurer Rank Chart с точными порогами Reputation** — Core II, pp. 110–115 (Core I лишь отсылает к Core II) → `06-equipment.md`
- ❌ **General Skills (72+) — гипотеза не подтвердилась в третий раз.** Термина "General Skills" нет в оглавлении ни Core I, ни Core II. Есть только "Skill Checks" (класс-привязанные проверки: Conceal, First Aid, Disable Device, Pickpocket и т.д.) и Work Skills (проф. навыки для ролплея, Epic Treasury/Raxia Life). Похоже, "General Skills (72+)" — изначально ошибочное допущение из раннего исследования, не подтверждённая механика SW2.5.

### Закрыто по Magus Arts PDF (2026-07-09)
- ✅ **Geomancer класс** — Aspects/Qi Points/Geograph, полная механика → `02-classes.md`
- ✅ **Tactician класс** — Stratagems/Maneuvers/Edge, полная механика → `02-classes.md`
- ❌ **Druid, Daemonologist** — в Magus Arts только лор-комментарий (Class Commentary), НЕ полные механики; книга сама отсылает к "ML" (Monstrous Lore) за Nature Magic/Summoning Arts
- ✅ **Evocations в Magus Arts (pp.181–184) — точная перепечатка Core III pp.190–198** (те же 26 названий, карты и эффекты), сверено 2026-09-06 → `14-evocations.md`. Половина вопроса «дубликат или расширение» закрыта; Stunts (pp.173–177) построчно не сверялись, но раздел устроен так же — правила со ссылкой «список см. p. 175»
- Обнаружено, но не задокументировано подробно: новая школа **Deep Magic** (Sorcerer+Conjurer), 9 новых богов (1st/2nd/3rd Sword — пересекается с "Second Sword" гэпом Core III), расширенная Fairy Magic (3-type/6-type selection)

### Закрыто по Monstrous Lore PDF (2026-07-09)
- ✅ **Druid класс** — Nature Magic, Symbols of Beneficence/Symbolic Lore, полная механика → `02-classes.md`; построчный список 60 заклинаний (2026-09-06) → `13-spells-supplements.md`
- ✅ **Daemonologist класс (Summoner/Daemon Tamer)** — Summoning Arts, Gate Imp/Abyss Gate/Daemon Action Chart/Banishment, полная механика → `02-classes.md`; построчный список 46 заклинаний (2026-09-06) → `13-spells-supplements.md`
- ✅ **New Backgrounds для Daemon Tamer/Druid/Jockey(Rider)/Alchemist** по всем расам Core I–III → `02-classes.md`
- Обнаружено, но не задокументировано подробно: ~400 монстров (Part 2, pp.56+), Golem Enhancing Items (доп. к Core II Conjurer, pp.225–235), Familiar Data (для Sorcerer [Familiar]/[Familiar II], pp.236–243)

### Закрыто по Abyss Breaker PDF (2026-07-09)
- ✅ **Abyss Gazer класс** — Abyssal Magic (система Enhancement через Daemon's Blood/Abyss Shards), полная механика → `02-classes.md`; построчный список 35 заклинаний (2026-09-06) → `13-spells-supplements.md`. **Подтверждено: отдельный класс от Daemonologist** (не синоним) — счётчик классов скорректирован с 23 до 24
- ✅ **Dark Hunter класс** — Essence Weaving (~28 штук), Mental Power = Class Level + SPR modifier, полная механика → `02-classes.md`
- ✅ **Thrown Weapons** (B/A/S/SS ранги) и **Abyss Skills/Abyss Corruption** (расширение Abyss Enhancement) → `06-equipment.md`
- Обнаружено, но не задокументировано подробно: World lore (Part 2), Random Shallow Abyss generation rules (Part 3), Monster Data (Part 4, 80+ монстров Бездны)

### Закрыто по Tyrants Crypts PDF — Preview-версия (2026-07-09)
- ✅ **Bibliomancer класс** — Arcane Magic, полная механика класса (Grimoire, Prepared/Emergency Spell Slots по таблице ур.1–15, Critical Failure Value, покупка/находка заклинаний поштучно) → `02-classes.md`. **Это была последняя книга по классам — все 24 класса SW2.5 теперь подтверждены по первоисточникам.**
- ❌ **Не в Preview (эмбарго переводчиков, нужен оригинал):** сам список заклинаний Arcane Magic, 8 Work Skills, Dig Arts/Challenges, Leondar Archipelago lore, Random Tomb Creation Rules, Magic Items, 80+ монстров

### Закрыто по Core Rulebook III — Rider/Alchemist (2026-07-09)
- ✅ **Rider класс** — Mount Rules, ~30 Stunts → `02-classes.md` (см. выше)
- ✅ **Alchemist класс** — Evocations, Material Cards → `02-classes.md` (см. выше)
- Обнаружено, но не задокументировано подробно: Epic Treasury тоже содержит доп. Mount Data (pp.165–179); Magus Arts тоже содержит свои Stunts (pp.173–177) и Evocations (pp.178–184) — неясно, дублируют ли они Core III или расширяют (не проверено)

### Остаётся открытым
1. **War Leader** — отдельный класс или вариант Tactician? (не встретился ни в Magus Arts, ни в Monstrous Lore, ни в Abyss Breaker, ни в Tyrants Crypts) — возможно, никогда не существовал как класс, аналогично прежней General Skills-гипотезе
2. **Core III прочий контент**: новое снаряжение и mounts data (pp.206–262), боги "Second Sword" (Part 4), обширный бестиарий (pp. 327–439) — Combat Feats закрыты 2026-09-06
3. **Magus Arts Stunts/Evocations (pp.173–184)** — соотношение с Core III версией не проверено (дубликат для справки или расширение — по аналогии с Abyss Enhancement/Abyss Skills в Abyss Breaker)
4. **Система создания персонажа Vagrant** (Outlaw Profile Book) — отдельная, большая механика (D66 Origin/Environment/Childhood tables, категории Warrior/Spy/Remote Support/Magic Warrior вместо классов) — вне текущего MVP, но может понадобиться, если решим поддерживать не-авантюристов
5. **Кости A–F для Abyssborn, Newman** — требуют книгу Arcane Relic (не скачана)

---

## Источники

- https://www.groupsne.co.jp/products/sw/character_2.5.html
- https://fujimi-trpg-online.jp/download/sw25.html
- https://fujimi-trpg-online.jp/game/sw25rule.html
- https://www.gmbinder.com/share/-O9xxbHe0uFqFkdIEi5r
- https://ccxp.info/sword-world-2-5-an-overview-part-one/ (и parts 2, 3, 6, 7)
- https://ccxp.info/sword-world-2-5-new-supplements/
- https://www.enworld.org/threads/lets-read-sword-world-2-5.691213/ (и pages 2-3)
- https://app.roll20.net/forum/post/11523212/sword-world-2-dot-5-sheet-in-progress
- https://steamcommunity.com/sharedfiles/filedetails/?id=3006150901
- https://danielhkwan.substack.com/p/tabletop-rpgs-of-asia-sword-world
- https://ameblo.jp/laytontrpg/entry-12901437363.html
- https://trpg.syachi.work/sw25/forbeginner/ytsheet/
- https://yutorize.work/ytsheet/sw2.5/
- https://www.scribd.com/document/703207328/Character-Sheet-Fillable-by-MomijiLoop
- https://www.rpgpub.com/threads/sword-world-2-5-english-translation-to-get-a-ks.12243/page-4
