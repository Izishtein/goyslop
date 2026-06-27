# SW 2.5 — Equipment (Снаряжение)

Sources: GM Binder, search results for weapon/armor fields, ccxp.info part 3,
Roll20 sheet-in-progress forum, reputation guide.

---

## Ранги снаряжения (Equipment Ranks)

| Ранг | Доступность |
|------|------------|
| **B** | Базовый; все классы могут использовать |
| **A** | Требует специальной SCA (Combat Feat) |
| **S** | Требует специальной SCA |

---

## Оружие (Weapons)

Каждое оружие записывается отдельной строкой на листе.

### Поля оружия

| Поле | JP Term | Описание |
|------|---------|----------|
| **Name** | 武器名 | Название оружия |
| **Stance** | 構え | 1H (одноручное) / 2H (двуручное) / особое |
| **Min STR** | 最低筋力 | Минимальная сила для использования (для Fencer: Min STR = STR/2) |
| **Weapon Accuracy Bonus** | 命中修正 | Бонус точности от оружия |
| **Total Accuracy (SV)** | 命中SV | Warrior Lv + DEX mod + Weapon Accuracy |
| **Power** | 打撃力 | Номер строки в таблице Power (1–100+) |
| **Critical Value** | 必殺値 | Минимальное 2d6 для dice explosion |
| **Weapon Extra Damage** | 追加ダメージ | Дополнительный урон оружия |
| **Total Extra Damage** | — | Warrior Lv + STR mod + Weapon Extra Damage |
| **Range** | 射程 | Для дальнобойного оружия (в метрах / зонах) |
| **Rank** | ランク | B / A / S |
| **Notes** | 備考 | Особые свойства, ключевые слова |

### Расчёт урона

```
Final Damage = PowerTable(2d6 on row Power) + Total Extra Damage - Target's Defense

if 2d6 >= Critical Value:
    Roll again, add result (dice explosion — repeat until no crit)
```

### Виды оружия (не исчерпывающий список)
- Мечи (одноручные и двуручные)
- Топоры
- Копья
- Bulette (кулаки / Grappler)
- Луки, арбалеты (Marksman)
- Пистолеты, ружья (Artificer с пулями)
- Метательное оружие (Dark Hunter)
- Танцевальное оружие (Battle Dancer — в т.ч. оружие Grappler)

---

## Броня (Armor)

### Поля брони

| Поле | JP Term | Описание |
|------|---------|----------|
| **Armor Name** | 鎧名 | Название |
| **Defense** | 防護点 | Значение, вычитаемое из физического урона |
| **Evasion Modifier** | 回避修正 | Бонус (+) или штраф (-) к Total Evasion |
| **Min STR** | 最低筋力 | Минимальная сила |
| **Rank** | ランク | B / A / S |
| **Magic Defense Modifier** | 魔法防御修正 | Бонус к магической защите (если есть) |
| **Cast Penalty** | 呪文詠唱ペナルティ | Штраф к кастованию (если есть) |
| **Notes** | 備考 | Особые эффекты |

### Поля щита

| Поле | Описание |
|------|----------|
| **Shield Name** | Название |
| **Defense Bonus** | Добавляется к Defense |
| **Evasion Bonus** | Добавляется к Total Evasion |
| **Min STR** | Минимальная сила |

### Итоговые боевые параметры защиты

```
Total Defense = Armor Defense + Shield Defense
Total Evasion = (Warrior Lv + AGI mod) + Armor Evasion Mod + Shield Evasion Mod + other
```

---

## Аксессуары (Accessories)

- До **10 слотов** для аксессуаров
- Каждый аксессуар: Название + Эффект

Типы аксессуаров:
- Кольца (ring bonuses → вносятся отдельно в расчёт характеристик)
- Пояса, наручи
- Ожерелья, амулеты
- Магические артефакты

---

## Магические предметы (Magic Items)

- Приобретаются через Reputation в гильдии авантюристов
- Хранятся в инвентаре / отдельный раздел
- Leprechaun имеет дополнительные слоты для магических предметов

---

## Расходники (Consumables)

| Предмет | Применение |
|---------|-----------|
| HP Potion | Восстанавливает HP |
| Awakening Potion | Снимает Sleep / Unconscious |
| Mana Crystal / Mako Stone | Дополнительный MP-пул |
| Antidote | Яд |
| Holy Water | Нежить |
| Ammunition (стрелы/пули) | Marksman / Artificer |
| Fairy Gems | Fairy Tamer — по цвету |
| Magispheres (S/M/L) | Artificer |

---

## Деньги (Currency)

- Единица: **Gamel** (G)
- Стартовый бюджет: **1 200 Gamels**
- Поля: Наличные / В банке (Savings) / Долг (Debt)

---

## Инвентарь (Inventory)

### Поля основного инвентаря

```
┌── Adventurer's Set ────────────────────────────────┐
│ Стандартный набор авантюриста: верёвка, фонарь,   │
│ рюкзак, инструменты (записывается как одна строка) │
├── Предметы ────────────────────────────────────────┤
│ # │ Название     │ Кол-во │ Вес │ Примечание      │
│ 1 │              │        │     │                 │
│ 2 │              │        │     │                 │
│ … │              │        │     │                 │
├── Боеприпасы ──────────────────────────────────────┤
│ Стрелы/болты/пули: [___]  Тип: [___]              │
├── Финансы ─────────────────────────────────────────┤
│ Наличные:  [_____] G                              │
│ В банке:   [_____] G                              │
│ Долг:      [_____] G                              │
│ Журнал трат: item::cost (свободный текст)          │
└────────────────────────────────────────────────────┘
```

---

## Система репутации (Reputation)

Поля на листе:
```
Reputation Points:  [___]   (числовой трекер)
Adventurer Rank:    [___]   (ранг в гильдии)
Rank Grade:         [___]   (оценка/подранг)
```

### Как зарабатывается репутация
- Пожертвование Sword Shards → 1d6 репутации (все PC получают одинаково)
- Успешное выполнение престижных миссий
- Другие достижения по решению GM

### Использование репутации
- Покупка Renown Items (артефакты/редкие предметы)
- Повышение ранга авантюриста
- Установление связей с NPC
- Доступ к тайным школам/классам

### Статус «полноценного авантюриста»
Требуется 100 Reputation Points. Ранг можно потерять за нежелательные действия.

---

## Оружие Barbaros PC (Специальный лист)

Barbaros PC имеет отдельный лист с:
- «Physical Master» техниками
- Трекером трансформации
- Enchantment List (список зачарований)
- Special Ability Value List (значения особых способностей)

---

## Abyss Enhancement (Бездна-усиление) — Core II

Source: Core Rulebook II, pp. 245–257.

Постоянное усиление оружия, брони и щитов с помощью силы Бездны (Abyss Shards).
Выполняется Магической Гильдией.

### Процедура

1. Выбрать снаряжение
2. Выбрать тип усиления
3. Потратить Gamel + Abyss Shards
4. Определить Abyss Curse (случайный негативный эффект)

### Ограничения

- Максимум **2 Abyss Enhancement** на одно снаряжение (разные типы)
- После 2 усилений — нельзя добавить ещё, но можно переопределить Abyss Curse
- После Abyss Enhancement: оружие = Magic Weapon, броня = Magic Armor

### Стоимость

| Ранг снаряжения | Цена усиления |
|----------------|--------------|
| B Rank | 2,000 G |
| A Rank | 4,000 G |
| S Rank | 8,000 G |

**Abyss Shards:** первое усиление = 3 шарда, второе = 6 шардов (оба платятся одновременно с ценой).
Abyss Shards нельзя купить; добываются из Shallow Abyss или как лут.

### Улучшения оружия (Weapon Enhancements)

| Улучшение | Эффект |
|-----------|--------|
| Accuracy +1 | +1 к Accuracy проверке |
| Extra Damage +1 | +1 к Extra Damage |
| Minimum Strength -2 | Min STR снаряжения -2 (минимум 1) |
| Critical Threshold -1 | Critical Threshold -1 (минимум 8) |
| Extra Damage +2 vs Category | +2 Extra Damage против определённой категории монстров (рандомно из Classification Table) |
| Extra Damage +1 vs Type | +1 Extra Damage урону определённого типа (рандомно из Type Determination Table) |
| Spellcasting SV +1 | Если используется как magical implement: +1 к SV Truespeech или Spiritualism |
| Spell Damage +1 | Если magical implement: +1 к урону Truespeech или Spiritualism (только Instant заклинания) |
| Spell Restoration +1 | Если magical implement: +1 к исцелению всех школ магии (только Instant заклинания) |

### Улучшения брони (Armor Enhancements)

| Улучшение | Эффект |
|-----------|--------|
| Defense +1 | +1 Defense |
| Minimum Strength -2 | Min STR -2 (минимум 1) |
| Magic Damage -1 | Получаемый магический урон -1 |
| Defense +2 vs Category | +2 Defense против определённой категории монстров |
| Damage of Type -2 | Физический и магический урон выбранного типа -2 |
| Check Package +1 | +1 к SV одного Check Package (выбирается при усилении) |

### Улучшения щита (Shield Enhancements)

| Улучшение | Эффект |
|-----------|--------|
| Defense +1 | +1 Defense (работает даже для щита с Defense 0) |
| Evasion +1 | +1 к Evasion при экипированном щите |
| Minimum Strength -2 | Min STR -2 (минимум 1) |
| Magic Damage -1 | Получаемый магический урон -1 при экипированном щите |
| Defense +2 vs Category | +2 Defense против определённой категории монстров |
| Damage of Type -2 | Физический и магический урон выбранного типа -2 |

### Abyss Curse

Каждое Abyss Enhancement сопровождается случайным негативным эффектом (Abyss Curse).
Определяется броском **1d дважды** (6×6 таблица = 36 вариантов).

**Redetermine Abyss Curse:** 3 Abyss Shards за одно усиление (или 6/12 за оба).

**Виды Abyss Curse:**

| Roll | Название | Условие | Эффект |
|------|---------|---------|--------|
| 1-1 | "Of Self-Harm" | При экипировке | При крите владельца: HP -5 |
| 1-2 | "Of Lamentation" | При экипировке | При виде врага или долгом напряжении — плачет; в бою нельзя выбирать цели кроме Range: Caster и Range: Touch |
| 1-3 | "Of Kindness" | При экипировке | Если HP цели снижен ≥1 — Accuracy и Spellcasting -2 |
| 1-4 | "Of Discrimination" | При экипировке | Физический и магический урон против случайной категории монстров (из Classification Table) -2 |
| 1-5 | "Vulnerable" | При экипировке | Получаемый магический урон +1 |
| 1-6 | "Reckless" | При экипировке | Defense -2 (минимум 0) |
| 2-1 | "Heavy" | При экипировке | Min STR +2 |
| 2-2 | "Difficult" | При экипировке | В Power Table колонки ③–④ = 0 (не авто-провал, Extra Damage работает) |
| 2-3 | "Wimp" | При экипировке | Willpower -1 |
| 2-4 | "Weak" | При экипировке | Fortitude -1 |
| 2-5 | "Sensitive" | При экипировке | Физический и магический урон определённого типа (Type Determination Table) +2 |
| 2-6 | "Hilarious" | При экипировке | При провале Willpower — -1 к action checks до конца следующего хода (стак) |
| 3-1 | "Stuttering" | При экипировке | -1 к Spellcasting checks |
| 3-2 | "Proxy" | При экипировке | Нельзя говорить ни на каком языке кроме Arcana; нельзя использовать Fairy Magic или Magitech |
| 3-3 | "No Charities" | При экипировке | При «Resistance: Optional» успех → -2 Fortitude/Willpower до начала следующего хода |
| 3-4 | "Near Death" | При ношении | Death Check всегда получает штраф = Adventurer Level |
| 3-5 | "Stylish" | При ношении | 10% дохода тратится на украшение снаряжения |
| 3-6 | "Mana Draining" | При ношении | Все MP-расходы +1 (включая Techniques) |
| 4-1 | "Slow" | При ношении | Movement / 2 (округление вверх) |
| 4-2 | "Undefined" | При ношении | Бросок 1d в начале хода; на 1 — персонаж не владеет [Targeting] и этим феатом на этот ход |
| 4-3 | "Of Confusion" | При ношении | Бросок 1d в начале хода; на 1 — при меlee или Range: Touch выбирает цель рандомно среди всех персонажей рядом |
| 4-4 | "Foot Tangling" | При ношении | Бросок 1d в начале хода; на 1 — немедленно падает (нельзя встать в этом ходу) |
| 4-5 | "Slippery" | При ношении | Бросок 1d в начале хода; на 1 — всё экипированное/в руках падает (можно подобрать Major Action) |
| 4-6 | "Stinking" | При ношении | Дискомфорт окружающим; -2 к Hide; Adventurer Rank считается на 1 ниже |
| 5-1 | "Disgusting" | При ношении | Продаётся за ¼ базовой цены; Adventurer Rank -1 при продаже |
| 5-2 | "Buzzing" | При ношении | Постоянный жужжащий звук; -4 к Hide и Danger Sense |
| 5-3 | "Soggy" | При ношении | Extra Damage -1 (оружие) или Defense -1 (броня/щит); -4 Fortitude/Willpower против болезни |
| 5-4 | "Of Old Wounds" | При ношении | Эффекты исцеления (включая отдых) -1 |
| 5-5 | "Dazzling" | При ношении | Всегда сверкает на свету; -1 к action checks из-за плохой видимости |
| 5-6 | "Fameless" | При ношении | Автоуспех в skill check не считается автоуспехом — перебросить 2d; 1 раз в день |
| 6-1 | "Honest" | При ношении | Ложь и обман быстро раскрываются; если цель Detect check — штраф -4 |
| 6-2 | "Motion Sick" | При ношении | После >10 мин. движения не на своих ногах: -1 к action checks 1 час |
| 6-3 | "Hater of Nature" | При ношении | В природном окружении (Core I p.101) все action checks -1 |
| 6-4 | "Can't Wait" | При ношении | В начале сессии тратит Adventurer Level × 10 G на хобби/личные вещи; если нельзя — Max HP и MP -Adv.Level до следующего дня |
| 6-5 | "Clinging" | При ношении | Оружие: -4 Accuracy при использовании чего-либо ещё или Spellcasting без него. Броня: -4 Evasion без этой брони |
| 6-6 | "Gullible" | При ношении | Всегда пропускает Combat Preparation |

### Classification Table (для Abyss Enhancement/Curse)

| Roll | Классификация |
|------|--------------|
| 1-1 | Barbarous |
| 1-2 | Animal |
| 1-3 | Plant |
| 1-4 | Undead |
| 1-5 | Construct |
| 1-6 | Any: Barbarous, Animal, Plant, Undead, or Construct |
| 2-1 | Magitech |
| 2-2 | Mythical Beast |
| 2-3 | Fairy |
| 2-4 | Daemon |
| 2-5 | Humanoid |
| 2-6 | Any: Magitech, Mythical Beast, Fairy, Daemon, or Humanoid |

### Type Determination Table (для Abyss Enhancement/Curse)

| Roll | Тип |
|------|-----|
| 1-1 | Earth |
| 1-2 | Water/Ice |
| 1-3 | Fire |
| 1-4 | Wind |
| 1-5 | Lightning |
| 1-6 | Energy |
| 2-1 | Slashing |
| 2-2 | Bludgeoning |
| 2-3 | Poison |
| 2-4 | Disease |
| 2-5 | Curse |
| 2-6 | Psychic |

### Abyss Enhancement на листе персонажа

Для каждой единицы снаряжения нужны поля:
```
[ Abyss Enhancement 1 ]: [ тип усиления ]
  Abyss Curse 1: [ roll result ] "[ название ]"
[ Abyss Enhancement 2 ]: [ тип усиления ]
  Abyss Curse 2: [ roll result ] "[ название ]"
```

Базовая цена Abyss Enhanced снаряжения:
`Оригинальная базовая цена + Цена всех усилений`
