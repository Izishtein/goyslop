# SW 2.5 — Geomancer Domain Aspects (Magus Arts pp. 18-27)

Разбор 2026-09-12. Закрывает часть roadmap § 1.6 (Геомант; Тактик остаётся отдельным пунктом). Источник — `files/Sword World 2.5 - Magus Arts.pdf`, Part 1 «Character»: класс и правила pp. 18-23, «Aspects Data» pp. 24-27. Кросс-проверка — `files/Аспекты Геоманта.docx`.

## Число записей: 27, не ~35

Роадмап оценивал Аспекты в 35 записей (оценка на глаз, до чтения книги). Фактически их **27**: 9 на каждый из трёх порогов (1/5/10 уровень класса), по 3 на каждую из трёх сфер (Heavenly/Earthly/Spirit) на каждом пороге. Число подтверждено дважды: подсчётом маркеров `Heavenly Domain:`/`Earthly Domain:`/`Spirit Domain:` в тексте (9+9+9) и построчным совпадением с русским сводом (`Аспекты Геоманта.docx`), который транскрибирует ровно те же 27 названий под теми же тремя порогами. Это тот же класс ошибки, что уже фиксировался для Divine/Magitech в § 1.0 — оценка объёма до чтения книги регулярно расходится с фактом, книга и русский свод здесь совпали.

## Механика (pp. 18-21)

- **Geograph** — предмет-фокус (Class-Specific Item, Accessory: Any), без которого Аспекты недоступны. Даёт Domain Range (радиус действия) и лимит Qi по каждой из трёх сфер. Каталог из 9 Географов — `src/data/equipment.ts` (категория `classItem`, `sourceBook: 'Magus Arts'`), таблица с ценами и лимитами есть и в самой книге (p. 22), и в справочнике приложения.
- **Qi Points** — три отдельных счётчика (Heavenly/Earthly/Spirit), которые **автоматически растут каждые 10 секунд в бою** (+1 каждого типа, до тройного максимума при разрыве хода) — тот же тип «живого» ресурса за столом, что Edge у Тактика (см. `GeomancerQiSchema` в `types/character.ts`), а не что-то, что лист обязан вычислять. Лист хранит только текущее значение трёх счётчиков.
- **Level = один слот на уровень Геоманта** (p. 19, «Geomancer level = you may open one Aspect of a matching level», подтверждено `files/Аспекты Геоманта.docx`: «Уровень Геоманта = можно открыть один Аспект подходящего уровня на выбор») — тот же принцип, что у Rider Stunts (`docs/sheet-content/32-rider-stunts.md`), реализован той же формулой `aspectSlots()`.
- Цена Аспекта — Qi того типа, что совпадает с его сферой (Heavenly Aspects тратят только Heavenly Qi и т.д.), поэтому в каталоге нет отдельного поля «тип Qi» — оно равно `domain`.
- Стоимость печатается то фиксированным числом («2»), то диапазоном на выбор игрока («1-4») — сохранено как строка, как и у Rider Stunts/снаряжения с нечисловыми ценами.

## Как устроены 27 записей

| Уровень | Heavenly | Earthly | Spirit |
|---|---|---|---|
| 1 | Descending Thunder, Deflecting Skies, Invisible Pavilion | Healing Earth, Liquidation, Quicksand | Refresh, Terror, Determination |
| 5 | Karma, Wrath of Tenma, Guiding Winds | Mountain Rapture, Sand Shield, Shifting Energies | Sundered Soul, Mana Siphon, Dream Eater |
| 10 | Way of the North Star, Mana Break, Stigmata | Footfalls, Cursed Snake Eyes, Mirage | Afterimage, Vanishment, Mirrored Soul |

Часть записей несёт печатный `Type` в строке Sum (Lightning, Curse, Psychic (weak)) — сохранено в `damageType`, где книга его печатает; там, где книга ставит явный дефис (`Type -`), поле оставлено пустым, как «нет типа».

Текст эффектов (что именно делает каждый Аспект) не переносился — то же решение, что для заклинаний, черт и Rider Stunts: приложение двуязычное, ресёрч-доки только русские, а описание — не механический индекс, а полноценный абзац; поле `notes` на листе — то место, где игрок пишет, что делает взятый Аспект.

## Что добавлено в код

- `src/data/aspects.ts` — новый каталог, 27 записей (`ASPECTS`), плюс `listAspectsByLevel`/`listAspectsByDomain`/`getAspect`.
- `src/data/equipment.ts` — 9 Географов в `GENERAL_ITEMS` (категория `classItem`, `sourceBook: 'Magus Arts'`), лимиты Qi и Domain Range — в `notes`, как и у грамуаров Библиоманта.
- `src/types/character.ts` — `AspectDomainSchema`, `KnownAspectSchema` (id/name/domain/notes — без текста эффекта), `GeomancerQiSchema` (три счётчика с `.default(0)`), `Character.aspects`/`Character.geomancerQi`.
- `src/lib/formulas/requirements.ts` — `aspectSlots()`, один слот за уровень Геоманта (та же формула, что `stuntSlots()`).
- Новая секция листа `GeomancerSection.tsx`: три поля Qi Points, таблица взятых Аспектов со счётчиком «взято / уровень», пикер по каталогу сгруппированный по требуемому уровню с пометкой «выше уровня класса» (как у заклинаний/техник/Rider Stunts), дубли блокируются.
- Справочник (`CatalogReference.tsx`) получил вкладку «Аспекты Геоманта»: все 27 записей по трём уровням и таблица всех 9 Географов.
- Тест `src/data/aspects.test.ts` — счётчики (27 всего, 9 на уровень, 3 на сферу), уникальность id, поиск по id.

## Проверка

396 → 408 тестов (`aspects.test.ts` — 5, `GeomancerSection.test.tsx` — 7, плюс обновлённые счётчики `equipment.test.ts` под новые 9 Географов), `tsc -b`/`oxlint`/`vite build` зелёные. Браузерная проверка (Chrome через `executablePath`, тот же метод, что и в предыдущих записях `state.md`): счётчик слотов, группировка каталога по уровню с пометкой выше класса, блокировка дублей, три поля Qi Points принимают ввод, вкладка справочника показывает все 27 Аспектов и 9 Географов, печать без переполнения, консоль пустая.
