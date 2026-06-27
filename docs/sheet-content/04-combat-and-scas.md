# SW 2.5 — Combat System & SCAs (Combat Feats)

Sources: ccxp.info parts 2-3, EN World Let's Read p.2-3, GM Binder, RPG Pub forum.

---

## SCAs (Special Combat Abilities / 戦闘特技)

**Количество:**
- 1 SCA при создании персонажа
- +1 SCA на каждом нечётном уровне авантюриста: 1, 3, 5, 7, 9, 11, 13, 15

### Четыре категории SCA

| Категория | Описание |
|-----------|----------|
| **Always-On** (常時) | Постоянный пассивный эффект, не требует активации |
| **Declaration** (宣言) | Объявляется до броска/действия |
| **Major Action** (主動作) | Занимает основное действие в бою |
| **Auto-Acquired** (自動取得) | Получается автоматически при достижении условия (класс/уровень) |

**Дизайн:** SCA занимают то же место, что Feats в D&D — баффы, штрафы к врагам, исключения из правил.

### Примеры автоматических SCA
- Grappler Level 1: Chain Attack feat
- Ranger Level 5: специфичная SCA
- Scout Level 5: специфичная SCA
- Battle Dancer Level 1: дополнительная SCA из ограниченного списка

### Combat Feats связанные с рангом снаряжения
- Для снаряжения ранга A и выше — требуются специальные Combat Feats
- Все классы могут использовать снаряжение ранга B без SCA

### Hawk Eye Feat
- Позволяет Marksman атаковать через зону (Allied Rearguard → Enemy Rearguard)

### Поля на листе для SCA

```
┌─────────────────────────────────────────────────────┐
│ SCA / Combat Feats                                  │
├───────────────────────────────────┬─────────────────┤
│ Название                          │ Тип (Always/    │
│                                   │ Declar/Action/  │
│                                   │ Auto)           │
├───────────────────────────────────┼─────────────────┤
│ Эффект / описание                 │ Источник        │
└───────────────────────────────────┴─────────────────┘
```

Рекомендуемое количество строк на листе: 8–10 (покрывает до Lv15).

---

## Weapon Fields (Поля оружия)

Каждое оружие на листе имеет следующие поля:

| Поле | Описание |
|------|----------|
| **Name** | Название оружия |
| **Stance** | Одноручное (1H) / Двуручное (2H) / Особое |
| **Min STR** | Минимальная сила для использования |
| **Weapon Accuracy** | Бонус точности самого оружия |
| **Total Accuracy** | Standard Value для броска точности = Warrior Lv + DEX mod + Weapon Accuracy |
| **Power** | Номер строки в таблице Power |
| **Critical Value** | Значение 2d6, при котором происходит dice explosion |
| **Extra Damage** | Дополнительный урон оружия (суммируется с личным Extra Damage) |
| **Range** | Для дальнобойного оружия |
| **Notes** | Особые свойства |

**Итоговая формула урона:**
```
Damage = Power Table(2d6) + Weapon Extra Damage + Personal Extra Damage
Personal Extra Damage = Warrior Class Level + STR modifier
```

### Пример расчёта
Warrior Lv2, STR mod +2, меч Power 12, Crit 10, WeaponExtra +0:
- Accuracy: 2d6 + DEX mod + 2
- Damage: Power Table(2d6 on row 12) + 2 + 2 = Power Table + 4
- Если бросок ≥ 10 → dice explosion

---

## Armor / Defence Fields (Поля брони)

| Поле | Описание |
|------|----------|
| **Armor Name** | Название брони |
| **Defense** | Значение защиты (вычитается из урона) |
| **Evasion Modifier** | Бонус/штраф к уклонению |
| **Min STR** | Минимальная сила для ношения |
| **Rank** | B / A / S |
| **Notes** | Спец. эффекты |
| **Shield** | Отдельное поле для щита |
| **Total Defense** | Броня + щит + другие источники |
| **Total Evasion** | Base Evasion + Armor modifiers |

**Аксессуары:** до 10 слотов для аксессуаров (кольца, пояса, артефакты).

### Базовая Evasion
```
Base Evasion = Warrior Class Level (выбранного для уклонения) + AGI modifier
Total Evasion = Base Evasion + Armor Evasion Modifier + другие бонусы
```

---

## Типы урона / сопротивление

- **Physical Damage** (физический) → вычитается Defense
- **Magic Damage** (магический) → другая формула (Magic Power vs Willpower)
- **Fire Damage** (огонь) — Dwarf имеет иммунитет
- **Poison / Disease** → Fortitude Check

---

## Полный список полей «Combat Stats» раздела листа

```
┌── HP ─────────────────────────────────────────────┐
│ Max:  [Adv.Lv × 3 + VIT]    Current: [___]       │
├── MP ─────────────────────────────────────────────┤
│ Max:  [Σ WizLv × 3 + SPR]   Current: [___]       │
├── Fortitude ──────────────────────────────────────┤
│ [Adv.Lv + VIT mod]                                │
├── Willpower ──────────────────────────────────────┤
│ [Adv.Lv + SPR mod]                                │
├── Accuracy ───────────────────────────────────────┤
│ [Warrior Lv + DEX mod]  (Standard Value)          │
├── Evasion ────────────────────────────────────────┤
│ Base: [Warrior Lv + AGI mod]                      │
│ Total: [Base + Armor mods]                        │
├── Extra Damage ───────────────────────────────────┤
│ [Warrior Lv + STR mod]                            │
├── Defense ────────────────────────────────────────┤
│ [Armor + Shield]                                  │
├── Magic Power ─────────────────────────────────────┤
│ Per wizard class: [Class Lv + INT mod]            │
├── Initiative ─────────────────────────────────────┤
│ [Scout Lv / Tactician Lv, если есть]             │
├── Movement ───────────────────────────────────────┤
│ [значение из расы и снаряжения]                   │
└───────────────────────────────────────────────────┘
```

---

## Check Packages (Пакеты проверок)

Предварительно рассчитанные Standard Values для быстрого использования:

| Пакет | Формула | Класс |
|-------|---------|-------|
| Accuracy | Warrior Lv + DEX mod | Fighter/Grappler/Fencer/etc. |
| Evasion | Warrior Lv + AGI mod | то же |
| Magic Power | Wizard Lv + INT mod | Sorcerer/Conjurer/etc. |
| Monster Knowledge | Sage Lv + INT mod | Sage |
| Observation / Danger Sense | Scout Lv + INT mod (или AGI) | Scout |
| Initiative | Scout Lv (или Tactician) | Scout/Tactician |
| Movement | — | все |
| Healing Power | Priest Lv + INT mod | Priest |
| First Aid | Adv.Lv + DEX mod | все |

---

## Status Effects (Статус-эффекты)

Трекер состояний (для MVP — упрощённый):
- Poison (яд)
- Paralysis (паралич)
- Stun (оглушение)
- Sleep (сон)
- Charm (очарование)
- Fear (страх)
- Unconscious (без сознания)
- Dead (мёртв)

---

## Fellow System (Система Фелло)

Позволяет отсутствующим игрокам или онлайн-персонажам виртуально участвовать в сессии.
Отдельный лист/секция для Fellow-данных.

---

## Combat Feats — Core II additions (подтверждено)

Source: Core Rulebook II, pp. 198–211.

### Replacement Combat Feats

Некоторые феаты Core II заменяют феаты Core I того же имени (суффикс I → II).
- Не требуют новых слотов; заменяют существующий феат [...I] в листе
- Замена происходит при получении нового слота (нечётный уровень)
- Автозамена, если условие выполнено (например [Cover II] заменяет [Cover I] при Adv 7+)
- Можно объявить [...I] даже после замены на [...II]

---

### Selectively Acquired Passive — новые (Core II)

| Феат | Условие | Использование | Эффект |
|------|---------|--------------|--------|
| **Footwork** | Adv Level 9+ | — | Может двигаться до 10m с Limited Move (если движение < 10m — ограничен фактическим значением) |
| **Guardian II** | [Guardian I]/Adv Level 9+ | — | Может защищать [Cover] одновременно до 5 целей |
| **Evasive Maneuvers II** | [Evasive Maneuvers I]/Fencer 9+ | Fencer класс | Evasion +2 (только с Fencer как SV) |
| **Archer's Grace** | Marksman Level 7+ | Marksman класс | Evasion может рассчитываться через Marksman Level + AGI modifier |
| **Intense Finale** | Bard Level 3+ | Bard класс | Сила урона/исцеления Finale +10 |
| **Additional Songs I** | Bard Level 1+ | — | Изучить дополнительный Spellsong или Finale; максимум = Bard Level + 1 |
| **Additional Songs II** | [Additional Songs II]/Bard Level 7+ | — | +1 дополнительный Spellsong/Finale (итого +2 от Additional Songs I) |
| **Throwing I** | Нет | — | Использовать зелья как метательное оружие; +1 к Accuracy метательных атак; Range 1(10m); автопопадание (если цель не сопротивляется) |
| **Throwing II** | [Throwing I]/Adv Level 5+ | — | Все метательные атаки Range 1(10m) → Range 2(20m) |
| **Super Tenacity** | Fighter или Grappler 7+, [Tenacity] | — | Max HP +15 (итого +30 вместе с [Tenacity]) |
| **Special Instrument Proficiency** | Bard Level 1+ | — | Можно экипировать и использовать Special Instruments (не увеличивают Extra Damage или Defense) |
| **Flying Kick** | Grappler Level 9+ | Grappler класс | После Normal Move (≥1 зоны/10m): атаковать Kick; не активирует [Chain Attack]; после можно делать обычный Major Action |
| **Improved Throw II** | [Improved Throw I]/Grappler Level 9+ | Grappler класс | Сила броска +20; можно бросать персонажей с до 3 секций одновременно; Accuracy бросается 1 раз |
| **Harmony** | Bard Level 5+ | Bard класс | Bard может начать Spellsong пока питомец уже играет; оба звучат одновременно; питомец использует SV Барда; питомец не генерирует Rhythm |
| **Block** | Adv Level 3+ | — | При блокировании/выходе из схватки персонаж считается вдвое большим (секции × 2); также при размещении в frontline |
| **Mako Stones Master** | Adv Level 9+ | — | Использовать до 2 Mako Stones одновременно; MP делится произвольно между камнями и собственным MP |
| **Marionette** | Adv Level 5+ | — | Голем/нежить/фея может действовать независимо (без фиксированного хода); команда «Obey Command» — игрок выбирает ход для существа в пределах хода союзников |
| **Powerful Magic I** | 2 Wizard-type Classes Level 6+ | — | Magic Power +1 для всех освоенных магических систем |
| **Pinpoint Attack I** | Adv Level 7+ | — | Accuracy +1 |
| **Muscle Mystery** | Enhancer Level 5+ | Enhancer класс | Тройная длительность всех Techniques (кроме «Duration: Instant») |

---

### Selectively Acquired Active — новые (Core II)

| Феат | Условие | Apply | Risk | Эффект |
|------|---------|-------|------|--------|
| **Infight II** | [Infight I]/Grappler 9+, Grappler | 10 сек (1 р) | Evasion -2 | Accuracy +2, Damage +4 (заменяет [Infight I]) |
| **Decoy Attack II** | [Decoy Attack I]/Adv 9+ | 1 melee attack | — | Accuracy -2, Damage +8; Evasion врага -2 при уклонении (стак до -8) |
| **Rhythm Conversion** | Bard Level 3+ | Instant | — | Один Rhythm с накоплением ≥1 снижается на 1; любой другой Rhythm +1; можно объявить в любое время хода |
| **Mirage Arrow** | Marksman Level 9+, Marksman | 1 ranged attack | — | Два броска метательного/лукового оружия; берётся лучший результат; использует одно оружие/боеприпас |
| **Cover II** | [Cover I]/Adv Level 7+ | 10 сек (1 р) | — | Защищает союзника вместо него; не считается как объявление активного феата; можно объявлять отдельно от других активных феатов |
| **Nerve Strike** | Grappler Level 9+, Grappler | 1 melee attack | — | При попадании: физический урон от врага в следующем раунде -8 (по секции) |
| **Repeated Strike II** | [Repeated Strike I]/Fencer или Fighter 7+, Fighter или Fencer, 2H | 1 melee attack | — | При уклонении врага: дополнительная атака; первое попадание +4 damage; при мульти-цели — дополнительный Accuracy check по всем уклонившимся |
| **Critical Cast I** | Adv Level 7+, Wizard-Type Class | 1 spell cast | — | Critical Threshold заклинания -1 (минимум 8) |
| **Aimed Attack II** | [Aimed Attack I]/Adv Level 7+ | 1 weapon attack | — | Accuracy +2 |
| **Confident Performer** | Bard Level 3+, Bard | 1 finale performance | — | Finale с Resistance: Half меняется на Can't; Critical Threshold → None |
| **Skillful Play** | Bard Level 7+, Bard | 1 spellsong/finale | — | Делает два Performance check; берётся лучший результат |
| **Power Strike II** | [Power Strike I]/Fighter или Grappler 9+, Fighter или Grappler | 1 melee attack | Evasion -2 | Melee Damage +12 |
| **Double Cast** | Wizard-type Class Level 9+, Wizard-type | 1 spell cast | — | После основного заклинания — немедленно ещё одно (≤½ максимального уровня системы; Magic Power -10, минимум 0) |
| **Taunting Strike II** | [Taunting Strike I]/Fencer 7+, Fencer | 1 weapon attack | — | При попадании: провоцирует атаку противника; INT 18+ или «Intellect: High» монстры не обязаны атаковать, но -2 к Accuracy и другим проверкам |
| **Tail Swing I** | Adv Level 3+, Tail | 1 melee attack | — | Хвостом атаковать до 3 персонажей в одной зоне; Accuracy -1; Accuracy бросается 1 раз |
| **Tail Swing II** | [Tail Swing I]/Adv Level 9+, Tail | 1 melee attack | — | Хвостом атаковать до 5 персонажей; без штрафа к Accuracy |
| **Cleave II** | [Cleave I]/Fighter 9+, Fighter, 2H melee | 1 melee attack | — | Атаковать до 5 персонажей; нет снижения урона |
| **Lethal Strike II** | [Lethal Strike I]/Adv Level 7+ | 1 melee attack | Evasion -1 | Power table roll +1 |
| **Armor Piercer II** | [Armor Piercer I]/Grappler 9+, Grappler | 1 melee attack | — | При крите: Defense цели = 0; Critical Threshold +1 |

---

### Automatically Acquired Passive — новые (Core II)

| Феат | Условие получения | Использование | Эффект |
|------|------------------|--------------|--------|
| **Toughness** | Fighter Level 7 | — | Max HP +15 |
| **Counter** | Grappler Level 7, Grappler | Grappler класс | Вместо Evasion — атаковать ближнего противника; решается после броска Accuracy врага; сторона с [Counter] = активная; при успехе: атака врага отменена, наносится Counter-урон |
| **Fast Action** | Scout Level 7 | — | В первом раунде боя: если SV Initiative > максимума врага — дополнительный Major Action |
| **Shadow Sneak** | Scout Level 9 | — | Движение нельзя заблокировать; можно покинуть схватку без Prepare to Withdraw |
| **Indomitable** | Ranger Level 7 | — | При Death Check — не теряет сознание при HP 0 или ниже; умирает только при провале Death Check |
| **Potion Master** △ | Ranger Level 9 | — | Может использовать зелье на себя в Combat Preparation или Minor Action; 1 зелье за фазу |
| **Weakness Exploit** | Sage Level 7 | — | При Monster Knowledge check с SV ≥ слабости монстра: все бонусы от слабой точки удваиваются |
| **Mana Save** | Sage Level 9 | — | Все расходы MP -1 (минимум 1); при удвоении MP от [Metamagic/**] — сначала снижение, потом удвоение |
