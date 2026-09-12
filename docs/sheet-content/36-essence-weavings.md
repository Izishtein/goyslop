# SW 2.5 — Dark Hunter Essence Weavings (Abyss Breaker pp. 29–35)

Разбор 2026-09-12. Закрывает roadmap § 1.6/1.9 для Dark Hunter — последний класс без собственного каталога способностей.

## Где что лежит

Оглавление книги (p. 11) указывает раздел «Abyss Enhancement» на p. 38, но Essence Weavings в этом списке не названы отдельно — они компилируются прямо внутри «Dark Hunter Class» (p. 28), согласно вступительному тексту книги («Data and descriptions … Essence Weavings used by the Dark Hunter class are also compiled in this first part»).

| Страницы | Раздел |
|---|---|
| 28 | «Dark Hunter Class»: правило слота, ограничения по уровню, три типа Плетений |
| 29 | «How to Read the Data», начало списка Плетений |
| 29–30 | 11 Плетений без ограничения по уровню |
| 30–32 | 11 Плетений, открывающихся на 5 уровне |
| 32–35 | 6 Плетений, открывающихся на 10 уровне |
| 36 | Дополнительные заметки (Type Infusion со стеком типов, Fellow), затем начинаются метательные оружия |

Итого 28 — совпадает со счётчиком, который уже был занесён в описание класса (`reference.classDescription.dark-hunter`) заранее, по русскому своду.

## Уровневые пороги — только в русском своде

В отличие от Rider Stunts/Geomancer Aspects/Tactician Stratagems, английская книга **не печатает страничных заголовков-баннеров** по уровню («1st/5th/10th Level Required») — все 28 Плетений идут одним потоком, разделённым лишь визуальной вёрсткой в две колонки. Уровневый порог определён по правилу текста («some Essence Weavings have a minimum required class level (5 or 10)»), но какие именно — не выделено типографически нигде в текстовом слое.

Единственный источник, разбивающий список по уровням явно — русский свод (`files/Заклинания и Похожие Способности/Плетения Эссенции Тёмного Охотника.docx`), с заголовками «1 уровень» / «5 уровень» / «10 уровень» (11/11/6 записей). Использован как единственный источник этой конкретной оси данных — случай, отличный от обычного «книга выигрывает при конфликте», потому что книга здесь просто не публикует эту ось в текстовом виде, а не публикует другое значение.

## Тип Плетения (Passive/Minor/Major) — тоже графика без текста

Как и тип Rider Stunt, значок перед именем (⏩ = Minor Action, иногда с «△» = ещё и в Подготовке к бою; ► = Major Action; ◯ = Passive) существует только на картинке. Восстановлен тем же способом, что и уровень — из свода, — и перепроверен по собственным правилам книги, независимо от свода:

- Passive Weavings по правилу «For Passive Weavings, data for [Target/Range/Duration/Resistance] is omitted (as they are self-evident)» — в книге у них действительно нет строк Target/Range/Duration/Resistance, и Cost всегда «-».
- Major Action Weavings по правилу «It involves a skill check, and Success Value should be determined» — у всех пяти (Spectral Throw, Evil-Banishing Light Bullet/Lance, Soul Tethers Hands I/II) Cost на «2d» (с максимумом или без) и это подтверждается описанием эффекта (проверка Mental Power как Standard Value).
- Всё остальное — Minor Action.

Все 28 совпали между двумя независимыми проверками (текст свода и правила книги) без единого расхождения.

## △-маркер «доступно в Подготовке к бою»

Пять Плетений (Abyss Exploration Techniques, Spectral Protective Circle, Affliction Ward, Levitation Technique, Mind Binding Technique Enhancement) отмечены сводом дополнительным значком «△» — «can also be used during Combat Preparation» (p. 28 английского текста, без привязки к конкретным именам, но подтверждено сопоставлением с сводом). Заведено как `usableInPreparation?: boolean`, тот же приём, что `preparation` у `KnownEvocationSchema`.

## Пререквизит Mind Binding Technique Enhancement — свёрнут до тир I

Книга печатает «Prer. [Mind Binding Technique]» дословно, без номера тира — эффект «regardless of whether it's I, II, or III». Поскольку цепочка строгая (II требует I, III требует II), владение любым из трёх уже подразумевает владение I. `prerequisite: 'Mind Binding Technique I'` — точное и при этом единственное имя, гарантированно уже присутствующее в каталоге персонажа.

## Данные

### 1 уровень (11)

| Плетение | Тип | Стоимость | Пререквизит |
|---|---|---|---|
| Abyss Exploration Techniques △ | Minor | 1d | — |
| Essence Focus | Minor | 1d | — |
| Mass Looting | Passive | - | — |
| Mind Binding Technique I | Minor | 1d | — |
| Monster Watch | Passive | - | — |
| Pull of Soul Tethers | Minor | 2 | — |
| Spectral Protective Circle △ | Minor | 1d | — |
| Spectral Throw | Major | 2d(6) | — |
| Strong Throws | Passive | - | — |
| Type Infusion: Roar | Minor | 1d | — |
| Type Infusion: Tear | Minor | 1d | — |

### 5 уровень (11)

| Плетение | Тип | Стоимость | Пререквизит |
|---|---|---|---|
| Affliction Ward △ | Minor | 1d | — |
| Dark Life | Passive | - | — |
| Dual Weaving | Minor | 2 | Spectral Throw |
| Evil-Banishing Light Bullet | Major | 2d(9) | — |
| Levitation Technique △ | Minor | 1d | — |
| Long-Range Technique | Passive | - | Spectral Throw |
| Mind Binding Technique II | Minor | 1d | Mind Binding Technique I |
| Soul Protection Seal | Minor | 2 | Spectral Curve |
| Soul Tethers Hands I | Major | 2d(9) | — |
| Spectral Curve | Minor | 1d | Pull of Soul Tethers |
| Universal Manipulation | Passive | - | Spectral Throw |

### 10 уровень (6)

| Плетение | Тип | Стоимость | Пререквизит |
|---|---|---|---|
| Dark Magic Techniques | Passive | - | Abyss Exploration Techniques or Dark Life |
| Evil-Banishing Light Lance | Major | 2d | Evil-Banishing Light Bullet |
| Heavy Throws | Passive | - | Universal Manipulation |
| Mind Binding Technique III | Minor | 1d | Mind Binding Technique II |
| Mind Binding Technique Enhancement △ | Minor | 1d | Mind Binding Technique I |
| Soul Tethers Hands II | Major | 2d | Soul Tethers Hands I |

Текст эффектов не переносится — то же решение, что и во всех остальных доках каталога способностей (Rider Stunts, Geomancer Aspects, Tactician Stratagems/Maneuvers); справочная вкладка несёт Тип/Стоимость/Пререквизит, полный текст остаётся в книге.

## Что добавлено в код

- `src/types/character.ts`: `EssenceWeavingTypeSchema`/`KnownEssenceWeavingSchema` (`{ id, name, type }`), `Character.essenceWeavings` (`.default(() => [])`).
- `src/data/essence-weavings.ts`: `ESSENCE_WEAVINGS` (28 записей), `getEssenceWeaving`, `listEssenceWeavingsByLevel`.
- `src/lib/formulas/requirements.ts`: `essenceWeavingSlots(darkHunterLevel)` — один слот за уровень, тождественная функция как у Rider Stunts/Geomancer Aspects/Tactician.
- `EssenceWeavingSection.tsx` (новая, top-level секция листа, между Tactician и Combat Feats): счётчик слотов «известно / уровень Dark Hunter», таблица известных Плетений (имя + тип), пикер по каталогу сгруппированный по уровню (с пометкой «выше уровня класса»), подсказка пререквизита через `title`, без блокировки — стол решает сам, как у Rider Stunts.
- `CatalogReference.tsx` + `ReferenceView.tsx`: новая вкладка «Плетения Эссенции» (не подсекция другой вкладки — у класса нет родственной механики вроде маунтов у Rider), таблица всех 28 по уровню с Типом/Стоимостью/Пререквизитом, △-маркер подписан в названии строки.
- Тесты: `src/data/essence-weavings.test.ts` (счётчики 28/11/11/6, уникальность id, пререквизиты — включая цепочку «or» — указывают на реально существующие записи, Passive всегда без Cost, `usableInPreparation` только у Minor Action), `EssenceWeavingSection.test.tsx` (те же кейсы, что у `GeomancerSection.test.tsx`: скрытие секции, добавление из каталога, пометка выше уровня, блокировка дублей, счётчик перерасхода, бэкфилл поля при чтении старого персонажа).

Проверено в реальном браузере (Playwright, `executablePath` на уже установленный Chrome — см. `state.md`): секция на листе показывает счётчик 0/5 → 1/5 после добавления Spectral Throw с правильным типом «Основное действие», вкладка справочника показывает все 28 по трём уровням с △-пометкой у пяти записей, печатный вид не переполняется, консоль пустая.
