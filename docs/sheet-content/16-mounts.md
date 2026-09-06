# SW 2.5 — Маунты и снаряжение маунта (Core Rulebook III, pp. 247–262)

Source: Core Rulebook III, pp. 247–262 («Mount and Mount Equipment» + «Mount Data»).

Вторая половина последнего неразобранного куска Core-книг. Механика класса **Rider**
(Jockey, Mount Rules, Stunts, бой в паре с маунтом) разобрана в `02-classes.md` — здесь
данные, на которых эти правила работают. Снаряжение самого персонажа из тех же страниц —
в `15-items-core3.md`.

**Маунт — не предмет, а маленький монстр.** У него своя атака, Evasion, Defense, HP, MP и
сопротивления, и все они меняются с **уровнем маунта** — а уровень маунта равен
Adventurer Level'у Jockey'я, ограниченному сверху и снизу диапазоном Appropriate Level.
Поэтому в книге у каждого маунта не одна строка, а таблица «уровень × секция», и в
`src/data/mounts.ts` она перенесена как есть.

**Как получены цифры.** Здесь текстовый слой добрый: `pdftotext -layout` отдал все
характеристики. Но у **многосекционных** маунтов (Tilgris, Draconet, Lesser Dragon) он
сдвигает колонку Level относительно строк секций — на глаз получается, что у 9-го уровня
данные 8-го. Эти три таблицы сверены с отрисованными страницами 258–260
(`scripts/render-pdf-pages.mjs`), остальные — с текстом.

---

## Как читать данные маунта (p. 251–253)

| Поле | Смысл |
|------|-------|
| **Price** | Покупка / аренда (Mount Contract или Contract Sphere) / цена «Secret Medicine of Section Regeneration». Третье число печатается только у маунтов с секциями |
| **Appropriate Level** | Диапазон уровней. Нижняя граница — минимальный уровень Rider, при котором маунтом вообще можно управлять. Уровень маунта = Adventurer Level Jockey'я, но не выше верхней границы |
| **Intelligence** | `None` — воли нет, без команды ничего не делает. `Animal` / `Low` — бережёт свою жизнь, из боя старается сбежать. `Average` / `High` — ставит безопасность Jockey'я выше своей |
| **Perception** | Восприятие маунта; у Jockey'я и маунта оно независимое |
| **Language** | Если Jockey и маунт знают общий язык — могут разговаривать |
| **Weak Point** | Определяется Weakness-проверкой в Combat Preparation (см. `02-classes.md`) |
| **Movement Speed** | Как у монстров: наземная / воздушная-или-водная |
| **Sections / Main Section** | Сколько секций и какая главная. Fortitude и Willpower печатаются **только у главной** — бросок сопротивления делается один на всю тушу |
| **Unique Skills** | Как уникальные способности монстра. `Prerequisite: (Stunt)` — способность доступна, только если Jockey выучил этот Stunt; `Enhance: (Stunt)` — Stunt её усиливает. Если в способности упомянут Rider Level или Intelligence Bonus — берутся у Jockey'я |

**Proprietary Contract даёт +10 Max HP каждой секции** (`02-classes.md`, механика владения).
Это единственное число на листе, которое зависит не от уровня, а от способа приобретения.

---

## Животные (pp. 254–257)

Формат строки уровня: **Атака · Accuracy · Damage · Evasion · Defense · HP · MP · Fort · Will**.

### Horse — 5,000 / 250 G · Appropriate Level 1–4
Animal · Five Senses · языков нет · Weak Point: Physical Damage +2 · Движение 30 (4 Legs)/-

| Ур. | Данные |
|-----|--------|
| 1 | Hoof · 3 · 2d · 2 · 1 · 22 · 8 · 4 · 3 |
| 2 | Hoof · 4 · 2d+1 · 3 · 2 · 26 · 9 · 5 · 4 |
| 3 | Hoof · 5 · 2d+2 · 4 · 3 · 30 · 10 · 6 · 5 |
| 4 | Hoof · 6 · 2d+3 · 5 · 4 · 34 · 11 · 7 · 6 |

Unique Skills: нет.

### War Horse — 10,000 / 1,000 G · Appropriate Level 4–7
Animal · Five Senses · языков нет · Physical Damage +2 · Движение 25 (4 Legs)/-

| Ур. | Данные |
|-----|--------|
| 4 | Hoof · 6 · 2d+4 · 5 · 4 · 40 · 15 · 7 · 7 |
| 5 | Hoof · 7 · 2d+6 · 6 · 5 · 45 · 17 · 8 · 8 |
| 6 | Hoof · 8 · 2d+7 · 7 · 6 · 50 · 19 · 10 · 9 |
| 7 | Hoof · 9 · 2d+9 · 8 · 7 · 55 · 21 · 11 · 10 |

Unique Skills: **Techniques** [треб. Stunt «Unique Skill Release»] — умеет [Beetleskin] и [Bear Muscle].

### Legendary Horse — 20,000 / 2,000 G · Appropriate Level 7–10
Animal · Five Senses · языков нет · Physical Damage +2 · Движение 25 (4 Legs)/-

| Ур. | Данные |
|-----|--------|
| 7 | Hoof · 10 · 2d+10 · 9 · 8 · 62 · 25 · 11 · 11 |
| 8 | Hoof · 11 · 2d+12 · 10 · 9 · 68 · 28 · 12 · 12 |
| 9 | Hoof · 13 · 2d+13 · 12 · 10 · 74 · 31 · 13 · 13 |
| 10 | Hoof · 14 · 2d+15 · 13 · 11 · 80 · 34 · 15 · 14 |

Unique Skills: **Techniques**, **Indomitable** [треб. «Unique Skill Perfect Release»] — на 0 HP
может пройти Death Check и остаться на ногах; провал = смерть.

### Divine Horse — 50,000 / 5,000 G · Appropriate Level 10–13
Low · Five Senses · языков нет · Physical Damage +2 · Движение 30 (4 Legs)/-

| Ур. | Данные |
|-----|--------|
| 10 | Hoof · 14 · 2d+16 · 13 · 12 · 88 · 40 · 15 · 15 |
| 11 | Hoof · 15 · 2d+17 · 14 · 14 · 95 · 44 · 16 · 16 |
| 12 | Hoof · 16 · 2d+19 · 15 · 15 · 102 · 48 · 17 · 17 |
| 13 | Hoof · 17 · 2d+21 · 16 · 16 · 109 · 52 · 18 · 18 |

Unique Skills: **Techniques** ([Strong Blood], [Beetleskin], [Recovery (5 HP)], [Bear Muscle]), **Indomitable**.

### Dowles — 4,500 / 300 G · Appropriate Level 2–4
Animal · Five Senses · языков нет · **Magic** Damage +2 · Движение 20/-

| Ур. | Данные |
|-----|--------|
| 2 | Tail · 4 · 2d+3 · 2 · 4 · 20 · 5 · 4 · 2 |
| 3 | Tail · 5 · 2d+4 · 3 · 5 · 24 · 6 · 5 · 4 |
| 4 | Tail · 6 · 2d+5 · 4 · 6 · 28 · 7 · 6 · 5 |

Unique Skills: **Tail Sweep** — хвостом до 5 целей в одной свалке, не два хода подряд.

### Dondowles — 9,000 / 900 G · Appropriate Level 5–7

| Ур. | Данные |
|-----|--------|
| 5 | Tail · 8 · 2d+8 · 5 · 8 · 39 · 10 · 8 · 6 |
| 6 | Tail · 9 · 2d+9 · 6 · 9 · 45 · 12 · 9 · 8 |
| 7 | Tail · 10 · 2d+10 · 7 · 10 · 51 · 14 · 10 · 9 |

Unique Skills: **Tail Sweep**, **Wind Breath** [треб. «Unique Skill Release»] — 5 MP маунта,
Power 10 / Crit 10 + Rider Level + INT mod, ветер, «Range/Area: 2(20m)/Shot», Fortitude/Half.

### Mordondowles — 30,000 / 3,000 G · Appropriate Level 10–12

| Ур. | Данные |
|-----|--------|
| 10 | Tail · 14 · 2d+15 · 12 · 13 · 84 · 15 · 14 · 12 |
| 11 | Tail · 15 · 2d+17 · 13 · 14 · 91 · 18 · 15 · 13 |
| 12 | Tail · 16 · 2d+19 · 14 · 15 · 98 · 21 · 16 · 14 |

Unique Skills: **Tail Sweep**, **Wind Breath**, **Gale Breath** [треб. «Unique Skill Perfect
Release»] — 7 MP маунта, та же Power 10, но по области 3 м.

### Dolphin — 6,000 / 600 G · Appropriate Level 2–5
Animal · Five Senses · язык **Sea Animal** · **Fire** Damage +3 · Движение -/25 (Swimming)

| Ур. | Данные |
|-----|--------|
| 2 | Tackle · 4 · 2d+2 · 3 · 3 · 23 · 9 · 4 · 4 |
| 3 | Tackle · 5 · 2d+3 · 4 · 3 · 30 · 11 · 5 · 5 |
| 4 | Tackle · 6 · 2d+4 · 5 · 4 · 37 · 13 · 6 · 6 |
| 5 | Tackle · 7 · 2d+5 · 6 · 5 · 44 · 15 · 7 · 7 |

Unique Skills: **Underwater** — вне воды не двигается и не действует, зато в воде ни у него,
ни у Jockey'я нет штрафов за воду; Jockey может ехать и по поверхности, и под водой (но
под водой, как правило, не дышит и не говорит).

---

## Мифические звери (pp. 257–260)

### Pegasus — 20,000 / 2,000 G · Appropriate Level 5–7
Average · Five Senses · языков нет · Weak Point: **Accuracy +1** · Движение 20 (4 Legs)/40 (Flying)

| Ур. | Данные |
|-----|--------|
| 5 | Hoof · 7 · 2d+5 · 6 · 3 · 41 · 23 · 7 · 7 |
| 6 | Hoof · 8 · 2d+6 · 7 · 5 · 46 · 26 · 8 · 8 |
| 7 | Hoof · 9 · 2d+8 · 8 · 6 · 51 · 29 · 9 · 9 |

Unique Skills: **Flight** (+1 Accuracy в ближнем бою и Evasion обоим), **Poison/Disease
Immunity**, **Mounted = 1 Character** [треб. «Unique Skill Release»] — везёт одного пассажира
кроме Jockey'я. В бою слабее прочих — расплата за пассажира.

### Emerald Raccoon — 25,000 / 2,500 G · Appropriate Level 6–8
Average · Five Senses (Darkvision) · языки **Lycant, Sylvan** · **Earth** Damage +3 · Движение 16 (4 Legs)/-

| Ур. | Данные |
|-----|--------|
| 6 | Arm · 8 · 2d+8 · 8 · 6 · 52 · 48 · 8 · 9 |
| 7 | Arm · 9 · 2d+9 · 9 · 7 · 57 · 51 · 9 · 10 |
| 8 | Arm · 11 · 2d+10 · 10 · 8 · 62 · 54 · 10 · 11 |

Unique Skills: **Fairy Magic 6 Level** [треб. Stunt «Magic Command»] / Magic Power 9 — земля,
вода/лёд, ветер, свет; **Magic Aptitude** — владеет [Targeting] и [Metamagic/Targets].
Бьёт плохо, зато колдует.

### Tilgris — 60,000 / 6,000 / 3,000 G · Appropriate Level 8–10
Average · Five Senses · языков нет · **Slashing** Damage +3 · Движение 30 (4 Legs)/-
**Секций: 2 (Front / Back), главная — Front.**

| Ур. | Секция | Данные |
|-----|--------|--------|
| 8 | Front | Claws · 11 · 2d+8 · 11 · 8 · 69 · 24 · 11 · 10 |
| 8 | Back | Tail · 10 · 2d+10 · 10 · 8 · 77 · 12 · — · — |
| 9 | Front | Claws · 12 · 2d+9 · 12 · 9 · 76 · 28 · 12 · 11 |
| 9 | Back | Tail · 11 · 2d+12 · 11 · 9 · 84 · 14 · — · — |
| 10 | Front | Claws · 13 · 2d+11 · 13 · 10 · 83 · 32 · 13 · 12 |
| 10 | Back | Tail · 12 · 2d+14 · 12 · 10 · 93 · 16 · — · — |

Unique Skills: Front — **Double Attack** [треб. «Unique Skill Release»], **Lightning Breath**
(Power 20, молния + вода/лёд, область 3 м); Back — **Long Tail** (атака хвостом на «1(10m)»),
**Painful Strike** (если 2d урона ≥ 10, урон +7).

### Draconet — 120,000 / 12,000 / 4,000 G · Appropriate Level 10–12
Average · Five Senses (Darkvision) · язык **Dragonic** · Physical Damage +2 · Движение 13/25 (Flying)
**Секций: 3 (Body / Wing ×2), главная — Body.**

| Ур. | Секция | Данные |
|-----|--------|--------|
| 10 | Body | Bite · 13 · 2d+14 · 12 · 12 · 105 · 32 · 13 · 12 |
| 10 | Wing ×2 | Wing · 12 · 2d+9 · 10 · 10 · 66 · 16 · — · — |
| 11 | Body | Bite · 14 · 2d+15 · 13 · 13 · 113 · 36 · 14 · 14 |
| 11 | Wing ×2 | Wing · 13 · 2d+11 · 11 · 11 · 71 · 18 · — · — |
| 12 | Body | Bite · 15 · 2d+17 · 14 · 14 · 121 · 40 · 15 · 15 |
| 12 | Wing ×2 | Wing · 14 · 2d+12 · 12 · 12 · 76 · 20 · — · — |

Unique Skills: все секции — **✳✳Immunity** (полный иммунитет к одному стихийному типу на
выбор при покупке/аренде: огонь, вода/лёд, ветер, земля, молния, энергия); Body —
**✳✳Breath** [усиливается «Unique Skill Perfect Release»], Power 20, тип = выбранный в
Immunity; Wing — **Flight**, **All-Out Attack** [треб. «Unique Skill Release»] (+8 урона
следующей атаке крыла ценой −3 к его Evasion в этом ходу). Flight не работает, если хоть
одно крыло на 0 HP.

### Lesser Dragon — 360,000 / 36,000 / 9,000 G · Appropriate Level 13–15
High · Five Senses (Darkvision) · языки **Trade Common, Arcana, Dragonic** · Physical Damage +2 ·
Движение 15/30 (Flying) · **Секций: 4 (Head / Body / Wings ×2), главная — Head.**

| Ур. | Секция | Данные |
|-----|--------|--------|
| 13 | Head | Bite · 17 · 2d+18 · 15 · 14 · 119 · 84 · 17 · 17 |
| 13 | Body | Tail · 16 · 2d+16 · 13 · 16 · 133 · 30 · — · — |
| 13 | Wings ×2 | Wing · 15 · 2d+14 · 13 · 13 · 84 · 28 · — · — |
| 14 | Head | Bite · 18 · 2d+20 · 16 · 15 · 128 · 90 · 18 · 18 |
| 14 | Body | Tail · 17 · 2d+17 · 14 · 18 · 142 · 36 · — · — |
| 14 | Wings ×2 | Wing · 17 · 2d+16 · 14 · 14 · 90 · 32 · — · — |
| 15 | Head | Bite · 19 · 2d+22 · 17 · 16 · 137 · 96 · 19 · 19 |
| 15 | Body | Tail · 18 · 2d+18 · 15 · 20 · 151 · 42 · — · — |
| 15 | Wings ×2 | Wing · 18 · 2d+18 · 15 · 15 · 96 · 36 · — · — |

Unique Skills: все секции — **✳✳Immunity**, **Techniques** ([Strong Blood], [Beetleskin],
[Recovery (7 HP)]); Head — **Truespeech Magic и Spiritualism Magic 10 уровня** [треб. Stunt
«Magic Command»] / Magic Power 14, **Magic Aptitude** ([Targeting], [Magic Convergence],
[Magic Control], [Universal Metamagic], [Wordbreak]), **✳✳Breath** (Power 30, область 6 м);
Body — **Mounted = 2 Character**, **Tail Sweep**, **Attack Obstacle = Impossible** (Head
нельзя атаковать в ближнем бою, пока Body не упал до 0 HP); Wings — **Flight**, **All-Out
Attack**. Jockey'ев, приручивших такого, называют **Dragoon**.

---

## Магитех (pp. 261–262)

У магитех-маунтов **нет MP вообще** (книга печатает прочерк) и нет воли — без команды они
не делают ничего. Зато их не надо кормить, и упаковка/распаковка в сферу стоит 1 MP Jockey'я.

### Mini Manabike — 3,000 / 300 G · Appropriate Level 1–2
None · Mechanical · Magic Damage +2 · Движение 30 (Wheels)

| Ур. | Данные |
|-----|--------|
| 1 | Tackle · 3 · 2d+2 · 1 · 3 · 25 · — · 3 · 3 |
| 2 | Tackle · 4 · 2d+3 · 2 · 3 · 25 · — · 3 · 3 |

Unique Skills: **Off-Road Handling** — игнорирует все −2 за плохую проходимость.
Продаётся и вне Rider's Guild.

### Manabike — 10,000 / 1,000 G · Appropriate Level 3–6
Движение 50 (Wheels)

| Ур. | Данные |
|-----|--------|
| 3 | Tackle · 5 · 2d+4 · 5 · 5 · 40 · — · 6 · 6 |
| 4 | Tackle · 7 · 2d+6 · 7 · 5 · 40 · — · 6 · 6 |
| 5 | Tackle · 8 · 2d+8 · 8 · 5 · 40 · — · 6 · 6 |
| 6 | Tackle · 9 · 2d+10 · 9 · 5 · 40 · — · 6 · 6 |

Unique Skills: **Off-Road Handling**, **Grenade Launcher** [усиливается «Unique Skill
Release»] — 10 MP **Jockey'я**, Power 10, огонь, область 3 м; после выстрела нужна
перезарядка Major Action'ом.

### Superior Manabike — 20,000 / 2,000 G · Appropriate Level 7–9
Движение 50 (Wheels). Продаётся только в Rider's Guild.

| Ур. | Данные |
|-----|--------|
| 7 | Tackle · 9 · 2d+10 · 9 · 9 · 75 · — · 10 · 10 |
| 8 | Tackle · 11 · 2d+12 · 11 · 9 · 75 · — · 10 · 10 |
| 9 | Tackle · 12 · 2d+14 · 12 · 9 · 75 · — · 10 · 10 |

Unique Skills: **Off-Road Handling**, **Grenade Launcher**.

### Skybike — 60,000 / 6,000 G · Appropriate Level 11–13
Движение -/50 (Flying)

| Ур. | Данные |
|-----|--------|
| 11 | Tackle · 14 · 2d+14 · 14 · 14 · 120 · — · 14 · 14 |
| 12 | Tackle · 16 · 2d+16 · 16 · 14 · 120 · — · 14 · 14 |
| 13 | Tackle · 17 · 2d+18 · 17 · 14 · 120 · — · 14 · 14 |

Unique Skills: **Flight**, **High Speed Retreat** [треб. «Unique Skill Release»] — только на
Full Move, работает как [Shadow Sneak], но маунт получает 40 фикс. урона в конце движения;
**Laser Gun** [усиливается «Unique Skill Perfect Release»] — 15 MP Jockey'я, Power 30,
энергия, «Range/Area: 2(30m)/Line».

---

## Варианты за репутацию (pp. 247–248)

Семь маунтов из сводных таблиц, у которых **нет собственного блока данных**: это те же
базовые маунты с **+5 к движению**, продаются только за деньги плюс репутацию, в аренду не
сдаются.

| Название | Базовый маунт | Цена |
|----------|---------------|------|
| Fast Horse | Horse | 5,000 + 30 репутации |
| Exceptional Horse | War Horse | 10,000 + 60 |
| Daredevil Horse | Legendary Horse | 20,000 + 100 |
| King of Horses | Divine Horse | 50,000 + 150 |
| Manabike G | Manabike | 10,000 + 60 |
| Superior Manabike K | Superior Manabike | 20,000 + 100 |
| Skybike S | Skybike | 60,000 + 150 |

---

## Переноска и восстановление (pp. 248–249)

| Предмет | Цена | Для кого | Что делает |
|---------|------|----------|-----------|
| Mount Contract | 250+ | Animal, Mythical Beast | Аренда и переноска |
| Mount Contract Sphere | 300+ | Magitech | Аренда и переноска |
| Proprietary Mount Contract | 0 | Animal, Mythical Beast | Переноска купленного |
| Proprietary Mount Sphere | 0 | Magitech | Переноска купленного |
| Mount Reduction Tag I | 100 | Animal, Mythical Beast | Носит зверя до 3 уровня; достать/убрать — Minor Action |
| Mount Reduction Tag II | 500 | Animal, Mythical Beast | До 7 уровня |
| Mount Reduction Tag III | 2,000 | Animal, Mythical Beast | До 13 уровня |
| Manabike Storage Sphere | 10,000 | Magitech | Носит магитех, Minor Action |
| Secret Medicine of Section Regeneration | по маунту | Animal, Mythical Beast | Восстанавливает отключённую секцию до 1 HP за 10 минут |
| Restore Kit | 5,000 | Magitech | Чинит уничтоженный магитех за 1 час |

---

## Вооружение маунта (pp. 249–250)

Маунт носит **одно оружие и одну броню**; у многосекционного — по одному комплекту **на
каждую секцию**, и действует он только на свою секцию. Один и тот же предмет можно
переставлять между маунтами. **Усиливать снаряжение маунта нельзя.** Пометка «proprietary
mounts only» означает, что на арендованного маунта это не поставить.

### Оружие

| Название | Для кого | Цена | Эффект |
|----------|----------|------|--------|
| Big Horn | Animal, Mythical Beast | 800 | Damage +1 |
| Sideblade | Magitech | 800 | Accuracy −1, Damage +2 |
| Iron Rivet | Animal, Mythical Beast | 2,000 | Damage +2 |
| Flicker Hammer | все | 3,000 | Accuracy +1 |
| Flicker Star | все | 3,000 + 20 репутации | Accuracy +1, **только купленным** |
| Blade Horn | Animal, Mythical Beast | 5,000 | Damage +3 |
| Metal Horn | Animal, Mythical Beast | 5,000 + 20 репутации | Damage +3, **только купленным** |
| Manatite Plating | все | 15,000 | Damage +4 |
| Manatite Horn | все | 15,000 + 50 репутации | Damage +4, **только купленным** |

### Броня

| Название | Для кого | Цена | Эффект |
|----------|----------|------|--------|
| Leather Barding | Animal, Mythical Beast | 300 | Defense +1 |
| Chain Barding | Animal, Mythical Beast | 1,000 | Defense +2 |
| Anti-Magic Seal | Magitech | 2,000 | Magic Damage −1 |
| Plate Barding | Animal, Mythical Beast | 3,000 | Defense +3 |
| Blank Plate | Magitech | 3,000 | Max HP +10 |
| Wind Coat | Animal, Mythical Beast | 4,000 | Evasion +1, Defense +2 |
| Resist Barrier | Magitech | 8,000 | Magic Damage −2 |
| Gardner Shell | все | 12,000 | Evasion −1, Defense +4 |

**Отдельно:** щиты с пометкой **Mount Protection** (Knight Shield, Grand Partner, Paladin's
Pride — см. `15-items-core3.md`) распространяют свой Defense на все секции маунта. Это
единственная связка между снаряжением Jockey'я и маунтом.

---

## Что из этого попало в приложение

`src/data/mounts.ts` — 17 маунтов с полными таблицами по уровням и секциям, 7 вариантов за
репутацию, 27 предметов снаряжения маунта. Каталог индексный, как и остальные: имена
уникальных способностей без текста эффекта.

На листе — секция **Mounts**, видна при уровнях Rider (или если маунт уже записан: без
класса ездить можно только на Horse, War Horse, Mini Manabike и Manabike). Выбор маунта из
каталога заполняет блок на уровне, посчитанном из Adventurer Level и Appropriate Level;
смена уровня или контракта пересчитывает его заново, включая +10 Max HP за Proprietary
Contract. HP каждой секции отслеживается отдельно — секция на 0 HP отключается. Оружие и
броня маунта — свободный ввод с подсказками из каталога.

**Чего на листе нет:** списка Stunts класса Rider — он в Core III на pp. 84–106, вне этого
диапазона страниц, и построчно ещё не разобран. Пока Stunts пишутся в свободное поле
заметки маунта.
