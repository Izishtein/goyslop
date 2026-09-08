# SW 2.5 — Arcane Magic (Bibliomancer)

**Источник — не книга.** Полный список заклинаний Arcane Magic напечатан в Tyrants Crypts на pp. 20–24, а доступное нам превью обрывается на p. 19, ровно перед ними (дальше — уведомление переводчиков об эмбарго). Данные ниже сняты 2026-09-06 с фан-вики [sw25.wikidot.com](http://sw25.wikidot.com/spells:arcane), лицензия CC BY-SA 3.0.

**Что это меняет.** Механика класса (Grimoire, слоты Prepared/Emergency, Critical Failure Value, цены покупки и продажи заклинаний) уже разобрана по превью и лежит в `02-classes.md`. Здесь — только построчный список, которого там не было.

## Насколько этому можно верить

Вики помечает все страницы Библиоманта плашкой «This is SW2.0 content»: класс родом из сапплемента SW **2.0** «エイジ・オブ・グリモワール» (Age of Grimoire, 2017), где школа называется 秘奥魔法, а класс — グリモワール技能. Книга 2.5 «タイラントクリプト ‐墳墓と秘文‐» (ISBN 4040761987, декабрь 2025) его возрождает.

За то, что данные совпадают с версией 2.5:

- таблица слотов на вики совпадает с нашей транскрипцией из превью 2.5-книги **уровень в уровень**, все 15 строк;
- пороги рангов те же: ранг 2 с 4-го уровня класса, 3 с 7-го, 4 с 10-го, 5 с 13-го;
- Magic Power = уровень Bibliomancer + модификатор INT — тоже совпадает;
- японский лист персонажа на ytsheet показывает те же заклинания в оригинале: 【－悪意の針－】 = Acus Malitiae, 【－肉体修復－】 = Corpus Reparare, 【－破滅の槍－】 = Lancare Ruinas.

Против: сам список из книги 2.5 никто не сверял, и она могла что-то добавить или убрать.

**Третий источник, появившийся 2026-09-08.** Владелец добавил `files/Классы/Классы 2.0.docx` — свод классов SW 2.0. Там есть **Арканист (Arcanist)**, тот самый класс из Age of Grimoire: основной магического типа, «Тайная магия» (созданная, чтобы превзойти Истинную Речь, Спиритизм и **Глубинную магию**), заклинание берётся из гримуара в руке проведением пальца по открытой странице, одно заклинание на 1-м уровне и одно за уровень. В конце записи прямо перечислены его боевые черты: **[Владение Гримуарами A/S] и [Мастерство Гримуарами]** — независимое подтверждение той самой цепочки грамуарных фитов, которая у нас заведена с вики. Заодно закрепляет линию наследования: в 2.0 класс зовётся Arcanist, в 2.5 — Bibliomancer.

**Каталог заведён 2026-09-07** решением владельца: `src/data/spells/arcane.ts` (28 заклинаний) и три фита в `src/data/combat-feats.ts`. В колонке источника и в справочнике они подписаны «Tyrants Crypts (fan wiki)» — оговорка выше видна прямо на экране, а не только здесь. Arcane Magic была последней школой без каталога; теперь каталог есть у всех девяти.

**Ранги в каталоге записаны требуемым уровнем класса, а не номером ранга.** Поле `circle` у остальных школ значит «доступно с этого уровня», и лист сравнивает его с уровнем класса напрямую. У Arcane Magic ранги открываются на 1/4/7/10/13, поэтому ранг 2 записан как круг 4 — иначе пометка «above class level» врала бы на три уровня. Цена решения: в пикере и справочнике группы называются «Круг 4», а не «Ранг 2».

## Заклинания (28 штук, 5 рангов)

Обозначения как у остальных школ: **⏩** — можно Малым действием, **△** — можно в фазе подготовки к бою. Названия оставлены латиницей, как их печатает источник.

### Ранг 1 — требуется Bibliomancer 1

| Заклинание | MP | Действие | Цель | Дальность/Область | Длительность | Сопротивление |
|---|---|---|---|---|---|---|
| **⏩Acus Malitiae** | 3 | 1 Minor Action | 1 character | 1 (10m) / Shot | Instant | Can't Type: Curse |
| **Corpus Reparare** | 5 | 1 Major Action | 1 character | 2 (30m) / Target | Instant | Optional |
| **Lancare Ruinas** | 6 | 1 Major Action | 1 character | 2 (30m) / Shot | Instant | Half Type: Energy |
| **Nebra Venedamus** | 8 | 1 Major Action | 1 Area (3m radius) / 5 | 2 (30m) / Target | Instant | Half Type: Poison |
| **Spatium Oculus** | 6 | 1 Major Action | 2-3 Areas (10m radius) / Space | Caster | Instant | Can't |
| **Welm Rejectus** | 6 | 1 Major Action | 1 character | 2 (30m) / Target | 3 minutes (18 rounds) | Optional |

### Ранг 2 — требуется Bibliomancer 4

| Заклинание | MP | Действие | Цель | Дальность/Область | Длительность | Сопротивление |
|---|---|---|---|---|---|---|
| **⏩Adicio Elementum** | 5 | 1 Minor Action | Caster | Caster | 10 seconds (1 round) | Optional |
| **⏩Aktio Exokisumus** | 6 | 1 Minor Action | Caster | Caster | Instant | Negates |
| **⏩Magica Auguetas** | 6 | 1 Minor Action | Caster | Caster | 10 seconds (1 round) | Optional |
| **Lux Trikience** | 9 | 1 Major Action | Any Point | 2 (50m) / Line | Instant | Half Type: Energy |
| **Parare Absconditus** | 7 | 1 Major Action | Caster | Caster | 1 hour | Can't |
| **Pulkeritoud** | 4 | 1 Major Action | Caster | Caster | 1 hour | Optional |

### Ранг 3 — требуется Bibliomancer 7

| Заклинание | MP | Действие | Цель | Дальность/Область | Длительность | Сопротивление |
|---|---|---|---|---|---|---|
| **⏩Momento Reparare** | 7 | 1 Minor Action | 1 character | 1 (10m) / Target | Instant | Optional |
| **Atmos Iraptio** | 12 | 1 Major Action | 1 Area (4m radius) / 10 | 2 (30m) / Target | Instant | Half Type: Bludgeoning |
| **Lancair Damnatorius** | 7 | 1 Major Action | 1 character | 2 (50m) / Shot | Instant | Half Type: Energy |
| **Magna Perceptio** | 14 | 1 Major Action | 1 Entire Character | Touch | 1 hour | Optional |
| **Magna Saltous** | 5 | 1 Major Action | Caster | Caster | 3 minutes (18 rounds) | Optional |
| **Renato Inceptum** | 10 | 1 Major Action | 1 Character | 2 (30m) / Target | Instant | Negates |

### Ранг 4 — требуется Bibliomancer 10

| Заклинание | MP | Действие | Цель | Дальность/Область | Длительность | Сопротивление |
|---|---|---|---|---|---|---|
| **△Conglare Rapidus** | 18 | Combat Preparation Phase only | 1 Character | 2 (30m) / Target | 10 seconds (1 round) | Can't Type: Curse |
| **Defensio Perfectus** | 20 | 1 Major Action | 1 Object or 1 Entire Character | 2 (50m) / Target | 3 minutes (18 rounds) | Optional |
| **Denebras Cayence Luminous** | 14 | 1 Major Action | Any Point | 2 (50m) / Line | Instant | Half Type: Energy |
| **Kerelitas Walatous** | 20 | 1 Major Action | 1 Character X | Touch | 1 hour | Optional |
| **Mors Excessus** | 20 | 1 Major Action | 1 Entire Character | 2 (30m) / Target | 1 day | Optional Type: Curse |

### Ранг 5 — требуется Bibliomancer 13

| Заклинание | MP | Действие | Цель | Дальность/Область | Длительность | Сопротивление |
|---|---|---|---|---|---|---|
| **⏩Ensis Variabilis** | 1 | 1 Minor Action | 1 Character | 2 (30m) / Target | Instant | Can't Type: Curse |
| **Lancare Ferriodeus** | 18 | 1 Major Action | 1 Character | 2 (100m) / Target | Instant | Half Type: Energy |
| **Lux Sanctum Adventus** | 30 | 1 Major Action | 1 area (6m radius) / 20 | 2 (50m) / Target | Instant | Optional |
| **Mors Tempestus** | 30 | 1 Major Action | 1 Area (6m radius) / 20 | 2 (100m) / Target | Instant | Half Type: Curse |
| **Spatium Teleportus** | 25 | 1 Major Action | 2-3 areas (10m radius) / All | Caster | Instant | Optional |

## Боевые фиты Библиоманта (3 штуки)

Цепочка построена как Weapon/Armor Proficiency — по рангу грамуара. Все три: selectively acquired passive, «Use: —».

| Фит | Пререквизит | Эффект |
|---|---|---|
| **Grimoire Proficiency A** | нет | Можно использовать грамуары ранга A |
| **Grimoire Proficiency S** | [Grimoire Proficiency A], Bibliomancer 5+ | Ранга S |
| **Grimoire Mastery** | [Grimoire Proficiency S], Bibliomancer 11+ | Ранга SS |

Отсюда же следует, что грамуары идут по рангам B/A/S/SS. **Самих предметных данных грамуаров (цены, эффекты по рангам) нет нигде в открытом доступе:** на вики просмотрены все 38 страниц раздела предметов, слова Grimoire нет ни на одной, хотя `items:class-specific` перечисляет фокусы всех остальных школ — Abyssal Knife, Imp Seal, Alchemy Kit, Material Card, Staff of the Sacred Tree.

## Чего в книге ещё нет ни в каком виде

Из Tyrants Crypts недоступны, и публичных источников не нашлось: 8 Work Skills (pp. 25–33), Dig Arts (pp. 40–46), именные магические предметы и списки снаряжения (pp. 99–128), 80+ монстров (pp. 129–181). Для листа персонажа из этого нужны были бы только предметы; остальное — контент мастера.

## Как это было собрано

Страницы вики отдаются только по http (WebFetch поднимает до https и упирается в редирект), поэтому качались через `curl`. Страница `/spells:arcane` **не подключена к индексу** `/spells` — найдена перебором `system:list-all-pages` (13 страниц, 2379 записей). Оттуда же выяснилось, что на вики есть Deep Magic, техники, стратагемы, аспекты, вливания и 716 монстров — то есть она годится как независимая сверка почти для любого нашего каталога.
