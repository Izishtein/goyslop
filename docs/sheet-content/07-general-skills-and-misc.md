# SW 2.5 — General Skills, Misc Sections & Sheet Layout

Sources: fujimi-trpg supplement list (Epic Treasury, Lacshia Life),
trpg.syachi.work ytsheet guide, GM Binder, ccxp.info part 6, search results.

---

## General Skills (汎用技能)

General Skills отличаются от классовых — это навыки общего применения.

### Книжные данные
- **Epic Treasury**: полнотекстовая проверка PDF (2026-07-09) **не подтвердила** наличие General Skills в этой книге — вероятно, ошибка/устаревшая инфа из вторичного источника. См. `08-supplements-and-books.md`, примечание.
- **"Lacshia Life" / Raxia Life** (скачана и проверена 2026-07-09): **тоже не содержит General Skills.** Реальное содержание — Part 2 "Expansion of Work Skills" (pp. 47–108), т.е. это ещё одно расширение той же системы Work Skills из Epic Treasury (не General Skills листа). "81 general skill" из старой заметки — по всей видимости, тоже неточность вторичного источника, спутавшая Work Skills с General Skills.
- **Core Rulebook I/II — перепроверены полнотекстовым поиском (2026-07-09), гипотеза не подтвердилась в третий раз.** В оглавлении обеих книг термина "General Skills" нет вообще. Есть только "Skill Checks" (Core I, pp. 90–117) — раздел с class-based проверками, привязанными к конкретным классам (Conceal, First Aid, Disable Device, Pickpocket, Disguise, Tumble, Hide и т.д. — Standard Value = Class Level + ability modifier), и опциональные Work Skills (см. ниже).
- **Вывод:** "General Skills (72+)" — по всей видимости, изначально ошибочное допущение раннего (доpymupdf) исследования проекта; такой отдельной механики в SW2.5 не подтверждено ни в одной из 5 проверенных книг (Core I, Core II, Epic Treasury, Raxia Life + оглавления). Если пользователь захочет продолжить поиск — придётся проверять оставшиеся дополнения (Magus Arts, Monstrous Lore и др.), но приоритет этому пункту, вероятно, стоит понизить.

### Work Skills — расширенная система (Epic Treasury + Raxia Life)

Обе книги описывают **одну и ту же опциональную систему Work Skills** (профессиональные навыки для ролплея, НЕ General Skills листа, не боевые):
- До 15 уровней, но PC ограничены максимум 5 уровнями на один Work Skill и 10 суммарно на старте (правило из Epic Treasury).
- Считается как обычный класс-чек: Standard Value = Level + ability modifier, Target Number — по усмотрению GM (CR I, p.94).
- **Epic Treasury** (pp. 65–75): базовый список профессий — Armorer, Inventor, Weaver, Witch Doctor, Waiter/Waitress, Weatherman, Weaponsmith, Woodworker, Engineer, Author, Official, Gardener, Carpenter, Color Man, Locksmith, Cleric, Gravekeeper, Carriage Driver, Courtesan, Cook, Composer, Surgeon, Signalman, Cobbler, Whitesmith, Singer, Scholar, Sculptor, Scribe, Sailor, Soldier, Towerman, Dancer, Tour Guide, Distiller, Prestidigitator и др.
- **Raxia Life** (pp. 47–108) значительно расширяет список, организуя профессии по месту/контексту: Towns and Villages (pp.53+), Craftsmen and Workshops (pp.69+), Knowledge/Research/Arts (pp.79+), Castles/Temples/Courts/Military (pp.94+), Suburbs — Countryside/Mountains/Highways (pp.100+), Suburbs — Rivers and Seas (pp.106+). Детальный список профессий из Raxia Life ещё не извлечён построчно (низкий приоритет — чисто ролплей-контент).
- Не даёт боевого преимущества — чисто нарративный слой.
- **Для нашего листа:** вероятно, опциональная секция post-MVP (см. `docs/features.md`), не входит в базовый MVP.

### Категории (предполагаемые по контексту)

| Категория | Примеры навыков |
|-----------|----------------|
| **Знания (Scholar)** | History, Geography, Arcane Lore, Religion, Nature |
| **Ремесло (Craft)** | Blacksmithing, Alchemy, Cooking, Tailoring |
| **Социальные** | (Нет социальных механических навыков в базе — только RP) |
| **Выживание** | Herbalism, Tracking, Navigation |
| **Городские** | Streetwise, Underworld, Trade |
| **Прочие** | Music, Riding, Swimming, Climbing (без класса) |

**Важно:** В базовом SW 2.5 нет отдельных навыков переговоров/запугивания — это чистый RP.

### Структура поля General Skill на листе

```
┌── General Skills ──────────────────────────────────┐
│ Название │ Уровень │ Характ. │ Standard Value (SV) │
│          │         │         │ [SV = Lv + mod]     │
│ ──────── │ ─────── │ ─────── │ ─────────────────── │
│          │         │         │                     │
│          │         │         │                     │
└────────────────────────────────────────────────────┘
```

---

## Расовые способности (Racial Abilities)

На листе: отдельная секция для 1–3 расовых способностей.

```
┌── Racial Abilities ───────────────────────────────┐
│ Раса: [________________]                          │
│                                                   │
│ 1. [Название] — [Краткое описание]                │
│ 2. [Название] — [Краткое описание]                │
│ 3. [Название] — [Краткое описание]                │
└───────────────────────────────────────────────────┘
```

Примеры:
- Human: Change Fate (перебросить 2d6 1×/день)
- Elf: Darkvision, Aquatic Movement, Disease/Poison Resistance
- Dwarf: Darkvision, Fire Immunity
- Tabbit: Danger Sense Bonus (+ Level), [нельзя быть Priest]
- Runefolk: Darkvision, HP→MP Conversion (1×/day), [нельзя быть Priest/Fairy Tamer]
- Nightmare: Alternate Form (игнорирует штрафы магической брони, silent cast)
- Lykant: Beast Form (голова животного, Darkvision)
- Lildraken: Scaly Hide, Tail Whip, Flight (1 min/day)
- Grassrunner: Mana Interference, Natural Communication
- Meria: No Sleep, Dawn Heal (20% HP + all MP)
- Tiens: Intercommunication (10m radius, any language)
- Leprechaun: Darkvision, Extra Magic Item Slots, Permanent Invisibility

---

## Background & Origin (Предыстория)

```
┌── Background ─────────────────────────────────────┐
│ Background Package: [________________]            │
│ Starting Classes: [___] [___] [___]              │
│ Base Skill (DEX+AGI): [__]                       │
│ Base Body (STR+VIT):  [__]                       │
│ Base Mind (INT+SPR):  [__]                       │
│ Starting XP: [_____]                             │
├── Narrative ──────────────────────────────────────┤
│ Motivation / История:                             │
│ [свободный текст]                                 │
└───────────────────────────────────────────────────┘
```

---

## Character Information (Основная информация)

```
┌── Character Info ─────────────────────────────────┐
│ Имя: [________________]  Никнейм: [__________]   │
│ Раса: [____________]     Пол: [___]  Возраст: [_]│
│ Религия / Deity: [________________]              │
│ Corruption Level: [__]   (Abyss Taint, обычно 0) │
│ Портрет: [изображение]                           │
├── Adventurer Status ──────────────────────────────┤
│ Adventurer Level: [__]                           │
│ Reputation:       [___]                          │
│ Guild Rank:       [________________]              │
│ Rank Grade:       [________________]              │
└───────────────────────────────────────────────────┘
```

---

## Experience & Progression (Опыт и развитие)

```
┌── Experience ─────────────────────────────────────┐
│ Total XP Earned:  [______]                       │
│ XP Spent:         [______]                       │
│ XP Remaining:     [______]                       │
├── Class Levels ───────────────────────────────────┤
│ Класс      │ Тип │ Уровень │ Потрачено XP        │
│ ────────── │ ─── │ ─────── │ ─────────────────── │
│            │     │         │                     │
├── Growth Log ─────────────────────────────────────┤
│ Что росло │ Когда │ Примечание                   │
│ ───────── │ ───── │ ─────────────────────────── │
└───────────────────────────────────────────────────┘
```

**Стоимость повышения уровня:**
- Major class: 1000 XP/уровень
- Minor class: 500 XP (уровень 1) + 1000 XP/уровень далее

---

## Languages (Языки)

```
┌── Languages ──────────────────────────────────────┐
│ Знаю: [_____] [_____] [_____] [_____] [_____]  │
│ Доступно слотов: [__]                             │
└───────────────────────────────────────────────────┘
```

---

## Связи / NPC (Connections)

```
┌── NPC Connections / Allies ───────────────────────┐
│ Имя NPC │ Тип связи │ Репутация │ Примечание     │
│ ─────── │ ───────── │ ───────── │ ───────────── │
│         │           │           │               │
└───────────────────────────────────────────────────┘
```

---

## Session Log / Notes (Журнал сессий)

```
┌── Session Notes ──────────────────────────────────┐
│ Сессия │ Дата │ Событие / Достижение             │
│ ────── │ ──── │ ────────────────────────────────  │
│        │      │                                   │
├── Player Notes ───────────────────────────────────┤
│ [свободный текст]                                 │
└───────────────────────────────────────────────────┘
```

---

## Fellow System (Фелло)

Позволяет отсутствующим игрокам или зарегистрированным онлайн-персонажам виртуально участвовать в сессии.

```
┌── Fellow ─────────────────────────────────────────┐
│ Fellow Name: [____________]  Race: [____________] │
│ Class: [__________]  Level: [__]                 │
│ HP: [__]  Key Stats: [___________________]       │
│ Special Ability: [________________________]      │
└───────────────────────────────────────────────────┘
```

---

## Трекер статус-эффектов

```
┌── Status Effects ─────────────────────────────────┐
│ ☐ Poison    ☐ Disease   ☐ Paralysis  ☐ Stun     │
│ ☐ Sleep     ☐ Charm     ☐ Fear       ☐ Blind    │
│ ☐ Unconscious  ☐ Dead                            │
│ Custom: [________________________]               │
└───────────────────────────────────────────────────┘
```

---

## Секции только для определённых классов

### Для Fairy Tamer
```
Fairy Gem Stock:
  □□□ Fire   □□□ Water  □□□ Earth
  □□□ Wind   □□□ Light  □□□ Dark   □□□ Fairy
Contracted Fairies: [________________]
```

### Для Artificer
```
Magispheres: S[__] M[__] L[__]
Bullets: [Type: ___] [Qty: ___]
Guns/Weapons list: отдельная строка
```

### Для Bard
```
Current Rhythm: [__] / Max
Spellsongs Active: [________________]
```

### Для Rider
```
Mount: [________________]
Mount Stats: HP[__] Speed[__] Attack[__]
Guild Membership: Rider's Guild □
```

### Для Conjurer
```
Animated Doll: ☐ Created  HP: [__]  Location: [____]
Doll Sight: ☐ Active
Summoned Creatures:
  Creature │ HP │ Remaining Duration
```

### Для Tactician
```
Edge Points: [__] / Max [__]
Stratagems Available: [________________]
Active Maneuvers: [________________]
```

---

## Supplement-specific Fields

### Epic Treasury
- Adventurer Rank system (16 rank tiers)
- Advanced Combat (2D grid rules)
- Druid / Tactician class sections

### Abyss Breaker
- Corruption Level tracker (Abyss Taint)
- Daemon contracts list
- Essence Weaving tracker

### Barbaros Rage (Barbaros PC Sheet)
- Transformation Status tracker
- Physical Master techniques
- Enchantment List

### Battle Mastery
- Battle Schools (18 новых боевых школ)
- Battle Dancer dance maneuvers

### Dragon Bone Saga
- Отдельная боевая система
- Samurai/Ninja/Miko секции
