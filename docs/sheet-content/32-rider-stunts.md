# SW 2.5 — Rider Stunts (Core Rulebook III pp. 180–189)

Разбор 2026-09-12. Закрывает roadmap § 1.5 — последнее, чего классу Rider не хватало на листе.

## Где что лежит

Роадмап ссылался на pp. 84–106 — это оказался не тот диапазон: там живут только описательные правила («Rider Class and Mount Rules», «Acquiring Stunts» и т. п.), а сама таблица данных — в Part 3 «Data», согласно оглавлению книги (pp. 4–9 PDF):

| Страницы | Раздел |
|---|---|
| 86 | «Acquiring Stunts»: «When taking a level of the Rider class, including the first, you can choose a Stunt from the Stunts available at your level» — источник правила «один Трюк за уровень» |
| 180 | Начало «Stunts Data», «How to Read the Stunts» |
| 181–184 | 1st Level Rider Required — 12 Трюков |
| 185–187 | 5th Level Rider Required — 9 Трюков |
| 187–189 | 10th Level Rider Required — 10 Трюков |
| 190 | Evocation Data начинается (Stunts закончились) |

Итого 31 Трюк — совпадает со счётчиком русского свода (`files/Всадник/Трюки Всадника.docx`: «31 штука по трём порогам 1/5/10»).

## Три типа Трюков — только графика, не текст

Как и круг заклинания у Divine/Magitech, значок перед именем Трюка (кружок ◯ = «always in effect», ► = Major Action, » = Minor Action) существует только на картинке — в текстовом слое (`pdftotext -raw`/`-layout`) все три превращаются в пустоту. Установлены двумя способами разом:

1. Русский свод прямым текстом объясняет значки («Трюк с ⏩ … Малым действием», «Трюк с ► … Основным действием») и расставляет их перед каждым именем — 31 из 31 однозначно.
2. Шесть Трюков разных типов (Riding As One, Improved Elevated Attack, Unique Skill Release — ◯; Trample — ►; Intimidation — »; Mind to Mind — ◯) перепроверены отрисовкой страниц (`node scripts/render-pdf-pages.mjs`, страницы 181 и 186) — совпадение полное, расхождений нет.

## Грабля: Trample — свод и книга расходятся в пререквизите

Русский свод пишет для «Топот» (Trample) условие `[Атака]` (= Charge). Английский текст пишет `Trample Prer. -` — не «None», как у остальных беспрекословных Трюков, а буквальный дефис. Отрисовка p. 186 подтвердила: в колонке «Prer.» напечатан именно дефис, никакой скобочной ссылки на другой Трюк там нет. Решено по правилу проекта «при конфликте выигрывает книга»: **Trample пререквизита не имеет**, дефис — не дефис, «Charge» — не Charge. Свод, похоже, добавил логичный, но не напечатанный в книге пререквизит от себя.

Расхождение того же рода нашлось и в поле «Area» у Unique Skill Release/Unique Skill Perfect Release: свод пишет «Основная, или Все, или нет», книга (подтверждено рендером p. 186) печатает просто «All». Взято книжное значение.

## Слоты — не как у SCA, а один в один за уровень

Роадмап предполагал систему слотов «как у SCA» (боевые фиты — 1 слот на нечётный уровень персонажа). Прочитанное правило (p. 86) устроено проще: **один Трюк за каждый уровень класса Rider**, включая первый — без деления на чёт/нечет и без привязки к Adventurer Level. `stuntSlots(riderLevel)` в `lib/formulas/requirements.ts` — тождественная функция (`Math.max(0, riderLevel)`), заведена ради единообразия с `combatFeatSlots`, а не потому что формула сложная.

`requiredLevel` (1/5/10) Трюка — это **не** второй слот, а фильтр «какие Трюки вообще доступны на выбор» (совпадает с трактовкой самого правила: «choose a Stunt from the Stunts available at your level»).

## Данные

Все 31 запись — имя, тип, требуемый уровень, пререквизит (если есть), совместимые типы маунтов (`Animals`/`Mythical Beasts`/`Magitech`, ровно `MountCategory` из `data/mounts.ts`), поле Area как в книге.

### 1st Level Rider Required (12)

| Трюк | Тип | Совместимость | Area |
|---|---|---|---|
| Intimidation | Minor | Animals, Mythical Beasts | Main |
| Mind to Mind | Passive | Animals, Mythical Beasts, Magitech | All |
| Remote Command | Passive | Animals, Mythical Beasts | All |
| Search Command | Passive | Animals, Mythical Beasts | Main |
| Enhance Mount | Passive | Animals, Mythical Beasts, Magitech | Main or All |
| Mount's Devotion | Passive | Animals, Mythical Beasts | Main |
| Attack Obstruction | Passive | Animals, Mythical Beasts, Magitech | None |
| Elevated Attack | Passive | Animals, Mythical Beasts, Magitech | None |
| Tandem | Passive | Animals, Mythical Beasts, Magitech | None |
| Charge | Major | Animals, Mythical Beasts, Magitech | All |
| Magic Command | Major | Animals, Mythical Beasts | All |
| HP Enhancement | Passive | Animals, Mythical Beasts | All |

### 5th Level Rider Required (9)

| Трюк | Тип | Пререквизит | Совместимость | Area |
|---|---|---|---|---|
| Limit Drive | Minor | — | Magitech | All |
| Lion's Fury | Passive | — | Animals, Mythical Beasts, Magitech | All |
| Steady Command | Minor | — | Animals, Mythical Beasts, Magitech | None |
| Riding As One | Passive | — | Animals, Mythical Beasts, Magitech | None |
| Improved Elevated Attack | Passive | Elevated Attack | Animals, Mythical Beasts, Magitech | None |
| Unique Skill Release | Passive | — | Animals, Mythical Beasts, Magitech | All |
| Trample | Major | — (см. «Грабля» выше) | Animals, Mythical Beasts, Magitech | All |
| Improved Magic Command | Passive | Magic Command | Animals, Mythical Beasts | All |
| Improved HP Enhancement | Passive | HP Enhancement | Animals, Mythical Beasts, Magitech | All |

### 10th Level Rider Required (10)

| Трюк | Тип | Пререквизит | Совместимость | Area |
|---|---|---|---|---|
| Improved Enhance Mount | Passive | Enhance Mount | Animals, Mythical Beasts, Magitech | Main or All |
| Mounted Command | Major | — | Animals, Mythical Beasts, Magitech | None |
| Greater Elevated Attack | Passive | Improved Elevated Attack | Animals, Mythical Beasts, Magitech | None |
| Instant Magic Command | Passive | Magic Command | Animals, Mythical Beasts | All |
| Super Charge | Major | Charge | Animals, Mythical Beasts, Magitech | All |
| Overdrive | Minor | Limit Drive | Magitech | All |
| Improved Attack Obstruction | Passive | Attack Obstruction | Animals, Mythical Beasts, Magitech | None |
| Unique Skill Perfect Release | Passive | Unique Skill Release | Animals, Mythical Beasts, Magitech | All |
| Orochi's Fury | Major | Lion's Fury | Animals, Mythical Beasts, Magitech | All |
| Balance | Passive | Steady Command | Animals, Mythical Beasts, Magitech | All |

Текст эффектов не переносится — то же решение, что и во всех остальных доках каталога; у Трюка на листе есть своё поле для заметок игрока (как и у боевых фитов).

## Что добавлено в код

- `src/types/character.ts`: `StuntTypeSchema`/`StuntSchema` (`{ id, name, type }`), `Character.stunts` (`.default(() => [])`).
- `src/data/stunts.ts`: `STUNTS` (31 запись), `getStunt`, `listStuntsByLevel`.
- `src/lib/formulas/requirements.ts`: `stuntSlots(riderLevel)`.
- `MountsSection.tsx`: новая подсекция «Трюки Всадника» — таблица известных Трюков (имя + тип), счётчик слотов «взято / уровень Rider» с подсветкой перерасхода, пикер по каталогу сгруппированный по требуемому уровню (с пометкой «выше уровня класса», как у заклинаний/техник), пикер не блокирует уже взятые Трюки повторно и подсказывает пререквизит через `title`, но не блокирует по нему — стол решает сам.
- `CatalogReference.tsx`: таблица всех 31 Трюка добавлена во вкладку «Маунты» (не отдельной вкладкой — тематически часть класса Rider, как Abyss Skills остались во «Предметы и Бездна», а не получили свою вкладку).
- Тесты: `src/data/stunts.test.ts` (счётчики, уникальность id, пререквизиты указывают на реально существующие Трюки), новые кейсы в `requirements.test.ts` и `MountsSection.test.tsx` (слоты, фильтр по уровню, блокировка дублей, печать не проверялась тестами — только вручную в браузере).

Проверено в реальном браузере (Playwright, executablePath на уже установленный Chrome — см. `state.md`): счётчик слотов, группировка по уровню с пометкой выше класса, подсказка пререквизита, блокировка повторного взятия, таблица в справочнике, печать без переполнения, консоль пустая.
