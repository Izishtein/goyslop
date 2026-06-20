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
