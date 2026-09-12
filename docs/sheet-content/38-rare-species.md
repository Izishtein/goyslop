# SW 2.5 — Rare Species: 20 subspecies across 10 categories (pp. 34-53)

Разбор 2026-09-12. Закрывает хвост roadmap § 1.7 (20 редких подвидов), оставленный неразобранным в `35-arcane-relic-races.md`. Источник — тот же `Sword World 2.5 - Arcane Relic.pdf` (вторая коллекция владельца), Part 1 «Characters» pp. 34-53: **Rare Elven/Tabbit/Runefolk/Nightmare/Lykant/Lildraken/Grassrunner/Meria/Tiens/Leprechaun Species**, по развороту на категорию — общий блок костей A-F и одна таблица предысторий на пару, затем по развороту на каждый из двух подвидов (флейвор → замена расовой способности → усиления 6/11 уровня → авторский совет по игре).

## Решение по структуре данных: не понадобилась новая

Предыдущая запись (`35-arcane-relic-races.md`) предполагала, что нужна отдельная структура вроде `RareSpeciesDefinition` — три причины: (1) кости и таблица общие на категорию, а не на подвид, (2) часть подвидов меняет характеристики плоской поправкой вместо новых костей, (3) подвид заменяет способность родителя, а не добавляет к ней.

При разборе всех 20 записей ни одна причина не подтвердилась как блокер:

- **(1) Общие кости/таблица** — вопрос дублирования данных, не выразимости. Каждый `RaceDefinition` уже самодостаточен (ни один не ссылается на другой), так что два подвида одной категории просто получают одинаковый литерал `dice(...)` и один и тот же массив фона — ровно так же, как уже устроены все прочие 39 записей файла. Комментарий в коде фиксирует, что это преднамеренное повторение, а не забытая переменная.
- **(2) Плоская поправка вместо костей** — единственная реальная находка пачки: `dice()` парсил бонус только со знаком `+` (`/^(\d+)d(?:\+(\d+))?$/`). Поправки Pico/Lupus Tabbit ("Dexterity +3 Agility +3 Strength -3 Vitality -3") требуют отрицательного бонуса. Regex расширен до `[+-]\d+`, `correctionRange`/`abilityPointCost` уже были знаково-нейтральны (простое сложение/вычитание), а `formatDiceNotation` дополнен веткой для отрицательного бонуса. Три строки правки формул, не новая структура.
- **(3) Замена способности** — `RACIAL_ABILITIES` и так framework-независим по расе: подвид просто не наследует старую запись родителя, а вписывает новую под своим id. Ровно тот же приём уже применялся для Weakling/Abyssborn (`35-arcane-relic-races.md`) и для всех предыдущих замен вида «класс X меняет способность на Y» в остальных пачках § 1.6.

Итог: 20 подвидов заведены как ещё 20 записей `RACES`/`RACIAL_ABILITIES` — той же формы, что обычная раса, без новых типов, компонентов или вкладок справочника. Каталог рос **21 → 41**.

## Устройство извлечения

- `pdftotext -raw` тем же способом, что и в `35-arcane-relic-races.md` — развороты «таблица+кости слева, флейвор с колонкой справа» читаются линейно без перестановок на всех 20 страницах данных, специально сверено по всем десяти категориям.
- Колонки таблицы предыстории — `2d Background | Starting Classes | Skill/Body/Mind | Experience` (проверено `-layout` отдельно на Elf и Grassrunner, где имя фона и класс(ы) расходятся, например строка «7 Wizard / Sorcerer & Conjurer»).
- «Warlock» в этих таблицах — снова `daemonologist`, тем же способом, что в `35-arcane-relic-races.md`; «Jockey» — `rider`; «Hobbyist»/«Apothecary» с колонкой «Sage & Ranger»/«Sage & Bard» — оба класса (`joiner: 'and'`), той же конвенцией, что уже в каталоге (`bg('4', 'Herbalist', ['sage', 'ranger'], …)`, `bg('10-12', 'Hobbyist', ['sage', 'bard'], …)`).

## Находка: кости категории не всегда равны костям родительской расы

Ожидание (по аналогии с остальными восемью категориями) — кости подвидов дословно повторяют уже занесённые кости родительской расы. Подтвердилось для 8 из 10: Elf, Tabbit (база, до подвидовой поправки), Runefolk, Nightmare, Lykant, Lildraken, Grassrunner, Meria — совпадение побуквенное.

**Два исключения, подтверждённые дважды (`-raw` и `-layout`):**
- **Tiens**: книга печатает `F: 2d+3` для редких Tiens, но каталог уже хранит `F: 2d+6` для обычного Tiens (Core Rulebook III).
- **Leprechaun**: книга печатает `D: 1d` для редких Leprechaun, каталог хранит `D: 2d` для обычного Leprechaun (Core Rulebook III).

Расхождение зафиксировано как книжное значение выигрывает (правило `roadmap.md` «При конфликте выигрывает книга») — Tech Tiens/Daemonic Tiens и Leprechaun Nomad/Explorer получили именно то, что печатает Arcane Relic, не то, что было в Core III записи. Тест `races.test.ts` фиксирует оба значения явно, чтобы это не потерялось при следующей правке.

## Подвиды и их замены способностей

| Категория | Подвид A | Подвид B | Заменяемая способность родителя | Новые способности |
|---|---|---|---|---|
| Elf | Snow Elf | Mist Elf | Sword's Grace/Gentle Water | Solemn Ice / Beguiling Mist |
| Tabbit | Pico Tabbit (DEX+3 AGI+3 STR-3 VIT-3) | Lupus Tabbit (AGI+3 STR+3 INT-3 SPR-3) | — (добавочная, не замена) | Whistle / Darkvision |
| Runefolk | Guardian Type | Combat Type | HP Conversion | Fellowship / Will to Perform |
| Nightmare | Shadow-born | Soleil-born | — (те же абилки, разный модификатор Weakness) | — |
| Lykant | Large Herbivore | Small Herbivore | Beast Form | Beast Form (Large/Small Herbivore) |
| Lildraken | Small-Winged | Hairy | Wings of the Wind / (Tail Whip + Scaly Hide) | Dragon's Roar / Warm Breeze |
| Grassrunner | Alisha | Crimenos | — (те же абилки, замена только текста усиления Mana Interference) | — |
| Meria | Carnivorous | Fungi | Thriving Life | Predatory Life / Sporulation |
| Tiens | Tech | Daemonic | Intercommunication | Tech-Link / Daemonic Communion |
| Leprechaun | Nomad | Explorer | Unseen Artisan | Invisible Artisan / Artisan's Partner |

**Grassrunner и Nightmare не переименовывают ни одной способности** — книга прямо пишет «No change in racial abilities» (Grassrunner) или «the same racial ability, but the type of weak point is different for each» (Nightmare). Для Grassrunner при этом текст усиления Mana Interference на 6/11 уровне у Alisha и Crimenos свой (и оба добавляют 6-й уровень, которого нет у базового Grassrunner — там только 0 и 11). Для Nightmare разница чисто числовая (Shadow-born теряет доп. урон от слабого места, но получает -1 к Fortitude/Willpower против psychic-эффектов; Soleil-born получает +2 к урону energy-типа) — она не сохранена как отдельная механика, только как имя расы: тот же уровень детализации, что уже принят для Weakling/Abyssborn (числа не считаются автоматически нигде в каталоге способностей, только имя+уровень).

**Hairy Lildraken — единственный случай замены двух способностей одной**: `[Tail As Weapon]` и `[Scaly Hide]` вместе становятся `[Warm Breeze]` (книга: «will be changed to the following», единственное новое имя на оба старых).

**Leprechaun Nomad/Explorer оставляют нетронутым `[Invisible Hand]`** — заменяется только `[Unseen Artisan]`; фраза книги «the enhancements are the same» относится к [Invisible Hand], а не к новой способности (у новой способности своего усиления вообще нет — тест на 0-уровневый Whistle/Invisible Artisan/Artisan's Partner подтверждает отсутствие записей на 6/11).

**Whistle (Pico) не имеет своего усиления** — книга прямо говорит «[Whistle] will not be enhanced», усиливается только унаследованный [Sixth Sense].

## Что не занесено (осознанно)

- **Числовые нюансы Nightmare/Grassrunner-подвидов** (см. выше) — та же степень детализации, что уже принята для всего каталога способностей: имя + уровень, не текст эффекта.
- **Точное сохранение [Darkvision (Beast Form)] у Lykant-подвидов** — книга не упоминает эту способность вообще при описании новых Beast Form-вариантов; оставлена как есть по умолчанию (не сказано, что убрана), отмечено комментарием в коде как допущение.
- **Priest у Pico/Lupus Tabbit и Guardian/Combat Runefolk** — ограничение унаследовано от родительской расы (Tabbit/Runefolk оба ограничены Priest), не переподтверждено книгой явно для подвидов, но их общая таблица предыстории (как и у родителей) ни разу не даёт Priest — тест это фиксирует тем же методом, что уже применялся к Fluorite/Tabbit в `35-arcane-relic-races.md`.

## Что добавлено в код

- `src/data/races.ts`: `dice()` принимает знаковый бонус (`[+-]\d+`); 20 новых `RaceDefinition` (по одному комментарию на секцию, поясняющему совместное использование костей/таблицы); 20 новых записей `RACIAL_ABILITIES`.
- `src/lib/formulas/ability-base.ts`: `formatDiceNotation` печатает отрицательный бонус (`1d6-3`), не только положительный.
- Тесты: `races.test.ts` — количество (21→41), парсинг отрицательного бонуса, наличие/форма всех 20 записей, разделяемость костей/таблицы внутри пары (кроме двух Tabbit-подвидов, у каждого своя поправка), два исключения Tiens/Leprechaun зафиксированы явно, наследование ограничения Priest, отсутствие старого имени способности после замены.

## Проверка

462 → 470 тестов (races.test.ts 11→19, +8 новых), `tsc -b`/`oxlint`/`vite build` зелёные. Браузерная проверка (Chrome через `executablePath`): все 20 подвидов доступны в выборе расы формы создания, у Pico Tabbit подсказка кубика показывает `1d6-3` с диапазоном `-2–3` (отрицательный бонус отрисован верно) и ограничение Priest, персонаж Snow Elf создан целиком через форму и на листе показывает `[Sword's Grace/Solemn Ice]` вместо родительской `[Sword's Grace/Gentle Water]`, вкладка справочника показывает новые расы и их способности (включая `Warm Breeze` у Hairy Lildraken), печать без переполнения, консоль пустая.
