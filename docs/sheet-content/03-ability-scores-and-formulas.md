# SW 2.5 — Ability Scores, Formulas, and Tables

Sources: GM Binder rules intro, ccxp.info overview parts 1-3, EN World Let's Read (all pages),
RPG Pub forum, search results confirming formulas.

---

## Шесть характеристик

| ID | EN Name | JP Name | Применение в формулах |
|----|---------|---------|----------------------|
| DEX | Dexterity | 器用度 | Accuracy (точность атаки), Initiative (Fencer) |
| AGI | Agility | 敏捷度 | Evasion (уклонение), движение, Hide, Acrobatics |
| STR | Strength | 筋力 | Extra Damage, минимальный STR для снаряжения |
| VIT | Vitality | 生命力 | HP max, Fortitude, сопротивление яду/болезни |
| INT | Intelligence | 知力 | Magic Power (волшебные классы), Monster Knowledge (Sage) |
| SPR | Spirit | 精神力 | MP max, Willpower, Divine Magic (Priest) |

---

## Структура одной характеристики на листе

```
┌─────────────────────────────────────────────────────┐
│ DEX / Dexterity / 器用度                            │
├──────────┬───────────────────────────────┬──────────┤
│ Skill    │ Base                          │  A  B  C │
│ Base     │ (из Background / предыстории) │  □  □  □ │
├──────────┴───────────────────────────────┤  D  E  F │
│ Total: Base + ΣCorrections + Growths     │  □  □  □ │
│ Modifier: Total ÷ 6 (floor)             │          │
└─────────────────────────────────────────┴──────────┘
```

**Поля:**
- **Base** (基本値): из Background-пакета (Skill/Body/Mind)
- **Corrections A–F** (修正値): результаты расовых бросков кубиков
- **Growth** (成長): прирост от опыта
- **Item Bonus** (アイテム修正): бонусы от колец/артефактов
- **Total** (合計): Base + ΣCorrections + Growth + Item Bonus
- **Modifier** (修正値 для бросков): Total ÷ 6, округление вниз

---

## Таблица бонуса характеристики

| Значение (Total) | Modifier |
|-----------------|---------|
| 1–5 | +0 |
| 6–11 | +1 |
| 12–17 | +2 |
| 18–23 | +3 |
| 24–29 | +4 |
| 30–35 | +5 |
| 36–41 | +6 |
| … | … |

**Формула:** `modifier = floor(total / 6)`

Пример: Total = 15 → modifier = 15÷6 = 2 (floor) = **+2**

Примечание: значения могут значительно превышать 18 (в отличие от D&D).

---

## Background (Предыстория / 生まれ)

Background определяет:
1. **Стартовые базы Skill/Body/Mind** (распределяются по парам характеристик)
2. **Стартовые классы** на уровне 1
3. **Стартовый опыт** (переменный)

Skill = DEX + AGI база
Body = STR + VIT база
Mind = INT + SPR база

Пример: Lykant Spy/Scout background → Skill=13, Body=5, Mind=7, 2500 XP

---

## HP и MP

### HP

```
HP max = (Adventurer Level × 3) + VIT (значение, не модификатор)
```

- Adventurer Level = наивысший уровень среди всех классов
- VIT здесь — это **само значение** характеристики (Total), не modifier

### MP

```
MP max = (Σ всех Wizard-Type Class Levels × 3) + SPR (значение)
```

- Если у персонажа Sorcerer Lv3 + Priest Lv2 → MP = (3+2)×3 + SPR = 15 + SPR
- SPR — само **значение** (Total), не modifier
- Mako Stones (магические камни) дают дополнительный пул MP; рассыпаются при исчерпании

### Grassrunner

Раса без MP; специальный трекер — Willpower-проверка для нейтрализации заклинаний.

---

## Производные боевые параметры

| Параметр | Формула |
|----------|---------|
| **Fortitude** (стойкость) | Adventurer Level + VIT modifier |
| **Willpower** (воля) | Adventurer Level + SPR modifier |
| **Accuracy** (точность) | Warrior-type Class Level + DEX modifier |
| **Evasion** (уклонение) | Warrior-type Class Level (кроме Marksman) + AGI modifier |
| **Extra Damage** (бонус урона) | Warrior-type Class Level + STR modifier |
| **Magic Power** (мощь заклинания) | Wizard-type Class Level + INT modifier |
| **Initiative** | Scout/Tactician Level (если есть) |
| **Movement** | Зависит от расы и снаряжения |

**Примечание по Accuracy/Evasion/Extra Damage:** используется только один Warrior-type класс
(тот, который применяется для конкретного броска атаки).

---

## Система проверок (Skill Checks)

```
Roll: 2d6 + Standard Value vs Target Number (TN)
```

- **Standard Value** = Class Level + Ability Modifier
- Или: Adventurer Level + Ability Modifier (для универсальных проверок)
- Если нет нужного класса → бросок без модификатора класса (flat)
- Без нужного инструмента → штраф

**Автоматические результаты:**
- 2 (snake eyes / 目) → автоматический провал + 50 XP
- 12 (boxcars / 目) → автоматический успех

**При ничье:** преимущество у пассивной стороны (защитник/цель выигрывает).

---

## Универсальные проверки (не требуют класса)

Все персонажи могут делать (на Adventurer Level):

**DEX-основанные:**
- Hiding Traces (скрытие следов)
- First Aid (первая помощь)
- Open Locks (взлом замков)
- Pickpocketing (карманная кража)
- Disguise (маскировка)
- Setting Traps (расстановка ловушек)
- Accuracy Check (базовый)

**AGI-основанные:**
- Break Fall (смягчение падения)
- Hide — transitive/intransitive (прятаться)
- Acrobatics (акробатика)
- Climbing (лазание)
- Following (слежка)
- Initiative Check
- Evasion Check (базовый)

---

## Power Table (Таблица мощи)

Используется для расчёта урона оружием.

```
Шаг 1: Берём Power Rating оружия (число от 1 до 100+)
Шаг 2: Бросаем 2d6 на соответствующей строке таблицы Power
Шаг 3: Если результат ≥ Critical Value оружия → бросаем снова и добавляем (dice explosion)
Шаг 4: Добавляем Extra Damage (Warrior Level + STR modifier + бонус оружия)
Шаг 5: Вычитаем Defense врага → итоговый урон
```

**Характеристики таблицы:**
- Таблица из 100 строк (Power 1–100+)
- Максимальный базовый урон: ~30 (Power 100, бросок 12)
- Прирост ~+1 до +3 на каждые 10 единиц Power
- Не формульная — создавалась органически

**Диапазон критов:**
- Обычно 10–12 (16,6% успешных атак)
- Dice explosion: продолжать бросать, пока идут криты

**Применение таблицы для исцеления:** некоторые лечащие заклинания тоже используют Power Table.

---

## Броня и Defence

```
Defence (Защита) = от снаряжения (броня, щит)
Final Damage = Power Table Result + Extra Damage - Defence цели
```

Evasion Check: победитель бросков атака/уклонение определяет, попало ли оружие.

---

## Инициатива и порядок ходов

- **Side-based** (по сторонам): сначала всё ходит одна сторона, потом другая
- **Initiative**: добавляется уровень Scout / Tactician
- Без Scout/Tactician → базовая инициатива

---

## Combat Zones (Зоны боя)

### Упрощённые зоны (3 зоны):
1. Allied Rearguard (тыл союзников)
2. Frontline (линия фронта)
3. Enemy Rearguard (тыл врагов)

Перемещение между соседними зонами = 1 полное действие.
Дальнобойные атаки: только в соседние зоны (Hawk Eye feat — через зону).

### Стандартный бой (линейный):
- Метрические дистанции
- Movement Score персонажа
- «Skirmish» формируется при входе в зону атаки

### Продвинутый бой (2D сетка — Epic Treasury):
- Абстрактные тактические правила
- Вертикальная дистанция игнорируется (если GM не решит иначе)
