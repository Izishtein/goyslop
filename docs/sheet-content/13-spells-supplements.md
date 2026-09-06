# SW 2.5 — Spells: Nature Magic, Summoning Arts, Abyssal Magic

Sources: Monstrous Lore, pp. 20–27 (Nature Magic Data) и pp. 40–45 (Summoning Arts Data);
Abyss Breaker, pp. 20–27 (Abyssal Magic Data).

Три школы магии из дополнений — Druid, Daemonologist и Abyss Gazer. Механика классов
разобрана в `02-classes.md`; здесь построчные списки, которых там не было.

**Как получены названия и уровни.** Названия и стоимость MP извлекаются текстом
(`pdftotext -layout`). **Уровень заклинания в PDF текстом не лежит** — он нарисован
графикой: полосой «Nth Level …» над колонкой и значком-кружком слева от названия. Поэтому
уровни сняты с отрисованных страниц (Chromium + pdf.js), а не из текстового слоя. То же
верно для Core I/II: там уровень тоже графика, а не текст.

Формат ниже: **Уровень | Название | MP**. Эффекты не переносятся — на листе у каждого
известного заклинания своё свободное поле заметки, а каталог в приложении индексный.

---

## Nature Magic (Druid) — Monstrous Lore, pp. 20–27

Ровно **4 заклинания на каждом из 15 уровней = 60 штук** (в `02-classes.md` стояла оценка
«~59» — она была прикидкой, а не подсчётом).

| Ур. | Заклинания (MP) |
|-----|-----------------|
| 1 | Wing Flyer 3 · Wolf's Bite 3 · Canine Perception 4 · Surrounding Attackers 2 |
| 2 | Water Dweller 6 · Natural Power 0 · Bad Steam 3 · Pigeon Mail 4 |
| 3 | Nature Master 1 · Sharp Attacker 2 · Anaconda Constrictor 8 · Thorn Bash 5 |
| 4 | Big Defender/Dinos 4 · Multiple Actor/Giant Crab 10 · Freezing Breath 5 · Poison Spread 6 |
| 5 | Sharp Eye/Tiger 5 · Stubborn Survivor 6 · Rare Runner 5 · Reproducer/Bloody Petal 6 |
| 6 | Fire Protector 4 · Crimson Fang 11 · Pack Camouflage 9 · Petrovenom 5 |
| 7 | Sharp Eye/Giant Eagle 6 · Fossil Absorber 6 · Kong Smash 10 · Peaceful Nature 8 |
| 8 | Cold Protector 4 · Big Defender/Sea Serpent 10 · Eagle Vision 6 · Multiple Actor/Crash Bear «10 + уровень цели» |
| 9 | Wing Flyer II 6 · Noisy Disturbance 7 · Boar Rush 12 · Light Trapper 9 |
| 10 | Reproducer/Living Tree 9 · Chilling Breath 11 · Plant Regrowth 25 · Marsavra Smash 14 |
| 11 | Big Defender/Hydra 7 · Poisonous Attacker 6 · Hallucinogenic Spores 17 · Hollow Tree Gate 11 |
| 12 | Mind Protector 7 · Exhaustive Sucking 14 · Cryo Bolt 6 · Natural Power II 0 |
| 13 | Plants Gift 8 · Nature's Reprisal 14 · Beam Strike 14 · Lunar Attack 18 |
| 14 | Big Defender/Roc 12 · Suppressing Gaze 8 · Violent Storm 14 · Big Flight 15 |
| 15 | Purification Wave 15 · Double Stomp 24 · Natural Haven 30 · Blaze Shower 16 |

Особенности стоимости: **Multiple Actor/Crash Bear** стоит «MP10 + уровень цели»
(в каталоге — `mpVariable`), **Nature's Reprisal** можно кастовать и за 21 MP, тогда
сопротивление становится временным.

Заклинания с именем вида `[Имя/Животное]` — одноимённые не суммируются на одной цели.
Спеллы, помеченные в книге как **«Symbolic Lore»** (Big Defender/*, Multiple Actor/*,
Plants Gift) — те самые «раз в день на одного персонажа», механика в `02-classes.md`.

---

## Summoning Arts (Daemonologist) — Monstrous Lore, pp. 40–45

**3 заклинания на уровень, кроме 2-го (там 4) = 46 штук** — совпало с оценкой в `02-classes.md`.

| Ур. | Заклинания (MP) |
|-----|-----------------|
| 1 | Search Daemon 2 · Daemon's Arm 5 · Blood Branded 2 |
| 2 | Daemon's Dodge 4 · Avenger 4 · Daemons Sense 4 · Daemons Potential 3 |
| 3 | Re-Command 4 · Venom Breath 8 · Barrier Circle 3 |
| 4 | Another's Knowledge 1 · Evil Contract 3 · Daemon's Tail 4 |
| 5 | Astral Burn 5 · Evil Silhouette 8 · Blood Mist «MP5 и HP5» |
| 6 | Soul Eater 1 · Daemonic Skin 8 · Mighty Daemon 6 |
| 7 | Dark Soul 8 · Daemons Scream 6 · Splinter 10 |
| 8 | Daemons Tax 6 · Unsummon Gate 6 · Blood Marker 5 |
| 9 | Anti-Magic Barrier 5 · Venom Espada 9 · Daemon's Seed 6 |
| 10 | Atrophy 6 · Daemon's Hand 10 · Daemon's Flight 10 |
| 11 | Deficiency 4 · Leap to Gate 10 · Daemon's Blade 3 |
| 12 | Imitating Shadow 8 · Shield Circle 10 · Daemon Swap 7 |
| 13 | Daemons Spread 8 · Soul Drain 20 · Daemons Snap 16 |
| 14 | Burst Gate 22 · Fake Memory 8 · Worthless Magic 12 |
| 15 | Soul Sacrifice 50 · Daemon's Legion 50 · Lethal Dimension 36 |

**Blood Mist** — единственное заклинание школы, которое кроме MP стоит 5 HP (при
[Metamagic/Targets] расход HP тоже удваивается). **Daemon's Blade** создаёт оружие
ближнего боя (Power 50, 1H, отдельная строка в таблице оружия книги).

---

## Abyssal Magic (Abyss Gazer) — Abyss Breaker, pp. 20–27

**35 заклинаний** (в `02-classes.md` стояла оценка «~27» — исправлено подсчётом по книге):
по 2–3 на уровень.

| Ур. | Заклинания (MP) |
|-----|-----------------|
| 1 | Search Abyss 1 · Spirit Knife 3 · Mental Boost 1 |
| 2 | Take the Lead I 3 · Explore Abyss 2 · Healing Image 2 |
| 3 | Safety Zone 10 · Bad Halation 3 · Pessimism 4 |
| 4 | Observe the Abyss 4 · Phantom Blur 5 |
| 5 | Fast Pain 2 · Invisible Storage 5 · Abyssal Zone 11 |
| 6 | Virtual Friend 12 · Refresh Image 4 |
| 7 | Abyssal Vortex 10 · Send From Abyss 8 |
| 8 | Ideal Costume 6 · Autonomous Shield 5 |
| 9 | Take the Lead II 9 · Miasma Grenade 9 |
| 10 | Immortal Image 14 · Sense Abyss 10 |
| 11 | Abyssal Leap 20 · Slash Image 9 |
| 12 | Abyss Corridor 16 · Abyssal Legion 14 |
| 13 | Abyssal Storm 18 · Instant Abyssal Zone 22 |
| 14 | Infinity Circle 30 · Shallow Preservation 30 · Recall Soul 20 |
| 15 | Execution 50 · Fulfillment 50 |

**У каждого** заклинания Abyssal Magic напечатан один или два **Enhancement Effect** —
усиление за трату материала (1 × Daemon's Blood / Abyss Shard / Crystallized Daemon's Blood
/ Crystallized Great Daemon's Blood). Сами материалы уже есть на листе в секции Бездны
(`src/data/abyss.ts`), поэтому в каталог заклинаний вынесены только названия и базовая
стоимость; конкретное усиление игрок пишет в заметке заклинания.

---

## Что из этого попало в приложение

`src/data/spells/nature.ts`, `summoning.ts`, `abyssal.ts` — те же строки в виде данных;
школы добавлены в `CATALOGUED_SCHOOLS`. Без каталога осталась одна школа — **Arcane Magic**
(Bibliomancer, Tyrants Crypts под эмбарго переводчиков), для неё на листе ручной ввод.
