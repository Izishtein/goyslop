# SW 2.5 — Battle Mastery Schools and School Secrets (pp. 44-77)

Разбор 2026-09-12. Закрывает roadmap § 1.8 — последнюю часть Battle Mastery (боевые черты и класс Battle Dancer были закрыты раньше, см. `08-supplements-and-books.md`).

## Объём оказался больше, чем предполагал roadmap

Roadmap описывал пункт как «18 боевых школ и School Secrets — отдельная механика, на листе её негде вести», без оценки объёма. Разбор показал: это не плоский каталог вроде Плетений Эссенции, а полноценная подсистема — **вступление в школу за Reputation** (обычно 50, у трёх школ с доп. условием), опциональное **School Equipment** (уникальные предметы школы) и **64 School Secrets** (не 62, как показала первая прикидка по счётчику `grep "Required Reputation"` — точное число подтвердилось после разбора тиров El Elena's Dazzling Veil Dance Technique, где три именных Secret на деле распадаются на 8 отдельных пороговых записей).

## Где что лежит

Книга «Sword World 2.5 - Battle Mastery.pdf» — во второй коллекции владельца (`E:\НРИ\Sword World Rus\SW 2.5 - Translated Books\Supplements\Rulebooks`), тем же путём, что Barbarous Rage и Arcane Relic раньше. PDF-страница = печатная страница − 2 (проверено по номеру в подвале страницы).

| Печатные страницы | Раздел |
|---|---|
| 12-14 | Battle Dancer Class — закрыт раньше |
| 15-43 | Combat Feats — закрыты раньше |
| 44-47 | Введение в школы: вступление за Reputation, типы Secret, Expulsion, «How To Read Secrets» |
| 48-67 | 10 «родных» школ Alframe — полные развороты с лором |
| 68-69 | Общий блок-введение «Schools on Another Continent» (8 школ Терастира одним блоком, только флейвор) |
| 70-77 | 8 «континентальных» школ — сжатые записи, без лора, кросс-ссылки на книги, которых нет в коллекции |
| 78+ | «Note on Converting Schools» (правки 2.0→2.5) и далее — не школьные данные |

Итого 18 школ, как и указывал roadmap — но 10 из них полноформатные, 8 — сжатые «выдержки».

## Извлечение — четыре параллельных фоновых прохода

По объёму (18 школ, ожидаемо 60+ Secrets) разбор запущен как четыре параллельных фоновых агента, тем же приёмом, что уже использовался для заклинаний в § 1.0: каждый получил свои 4-5 школ, инструкцию по девяти полям Secret (Name/Required Reputation/Type/Prerequisite/Equip. Limit/Use/Appl./Risk/Summary — Summary в код не пошёл, только в этот док) и явное предупреждение про риск смешивания колонок на страницах 68-77.

**Смешивание колонок, которого не случилось.** Общий блок-введение (pp. 68-69) действительно свёрстан в две колонки, но при извлечении `-raw` абзацы всех восьми школ шли в правильном порядке рядом со своими именами — ни один агент не нашёл реального смешивания на страницах самих школьных данных (только на страницах 62-65, где сидят школы №8-9 из первой десятки, но это не входило в зону риска и не проверялось специально). Название школы иногда не извлекалось вовсе (напечатано декоративной графикой) — тогда агенты опознавали школу по номеру страницы из кросс-ссылки «(see p. NN)» в общем блоке-введении, либо по совпадению темы (Kuuheiken — единственная школа с секретами про Jockey/Mount/хвосты/чешую и требованием класса Rider).

**Расхождение в названии, найденное по пути.** Общий блок-введение называет школу №17 «Iron Wall Style Of Logan **The Paladin**», а её собственный заголовок на странице данных — «Iron Wall Style of Logan **the Crusader**». Взято книжное значение (заголовок страницы данных), по тому же правилу «при конфликте выигрывает более первичный источник», что и раньше в проекте.

## Классификация Secret — переиспользован `CombatFeatCategory`

Книга прямым текстом пишет: «Secrets are classified as follows... very similar to the Combat Feat classification (see p. 16). The only difference is that 'Declared type' is further classified into two types» (p. 45) — поэтому `SchoolSecretDefinition.type` не заводит новый enum, а использует существующий `CombatFeatCategory` (`'passive' | 'declaration' | 'majorAction' | 'auto'`, `'auto'` у Secret не встречается). Большинство Declared Secret — это «[Basic Feat] Secret Variant» существующего боевого фита (`basicFeat`, кросс-проверено по каталогу `combat-feats.ts` — все 30+ упомянутых базовых фитов там нашлись без единого расхождения), меньшая часть — «Unique Declared Type» без Basic Feat.

## Нет уровня класса и нет лимита слотов

В отличие от Rider Stunts / Geomancer Aspects / Tactician Stratagems / Dark Hunter Essence Weavings, у Secrets нет ни требуемого уровня класса, ни счётчика слотов — и вступление в школу, и каждый Secret покупаются исключительно за Reputation (число печатается у каждой записи отдельно). Reputation в этом приложении — одно бегущее число без бюджетирования расходов (как и у предметов/маунтов, купленных за репутацию), поэтому секция листа не считает «потрачено/осталось» — она просто показывает цену как информационный текст, тем же способом, что и стоимость маунта или предмета снаряжения.

## Крайний случай: Dikehorn Twin Ice Spirit Technique не даёт Secrets

Эта школа прямым текстом объявляет: «This School does not have Secrets in the usual form. Instead, it teaches its own spells exclusively to those who have entered the school» — шесть заклинаний Спиритизма/Магии Фей (Snowman, Frost Field I/II, Element Swap, Shivering Resonance, Freezing Zone) для Conjurer, каждое со своей ценой Reputation (20-50). Форма данных заклинания (Cost/Target/Range/Duration/Resistance) не совпадает с формой `SchoolSecretDefinition` (нет этих полей вообще), поэтому вместо силового впихивания в общую схему — `SchoolDefinition.secretsNote` с объяснением и рекомендацией добавить эти шесть заклинаний вручную через существующую секцию «Заклинания». Список:

| Заклинание | Reputation | MP | Ранг Fairy Magic (Вода/Лёд) |
|---|---|---|---|
| Snowman | 20 | 1 | 1+ |
| Frost Field I | 20 | 5 | 2+ |
| Element Swap | 30 | 1 | 3+ |
| Shivering Resonance | 30 | 8 | 4+ |
| Frost Field II | 50 | 7 | 5+ |
| Freezing Zone | 50 | 12 | 8+ |

## School Equipment — оставлено информационным текстом, не в каталоге снаряжения

Решение из соображений объёма: у полноформатных школ (1-10) оружие/броня/аксессуары занесены как `{name, price, notes}` внутри `SchoolDefinition.equipment`, без полных статов по рангам (Acc./Power/Crit) — в отличие от предметов Core III, которые лежат в `data/equipment.ts` и доступны через обычный пикер экипировки. У сжатых школ (11-18) статы предметов вообще не напечатаны в этой книге (только имя и кросс-ссылка на страницу с полным описанием — «(see p. 88)» и т.п.), поэтому там записаны только имя и ссылка. Если понадобится реальный пикер экипировки школьного оружия — отдельная задача, не блокирующая этот пункт.

## Данные

64 Secret по 18 школам, полный список с Reputation/Type/Prerequisite/Equip. Limit/Use/Appl./Risk — в коде `src/data/schools.ts` (структура выбрана без хранения текста эффекта, как и у всех остальных каталогов способностей в проекте; Summary из книги не хранится нигде, кроме этого дока).

### 1-10: родные школы Alframe (48 Secrets)

| Школа | Secrets |
|---|---|
| Ivar Frenzy Style | 3 |
| Michal Style Circular Combat Arts | 3 |
| Kaslot Great Sand Fist/Batas School | 3 |
| Makajahat Pro Grappling | 3 |
| Narzaland Flexible Shield Style | 3 |
| Alster Strongshot Style | 3 |
| Hiadem Magical Flow Manipulation Strikes | 3 |
| Ancient Morganthine Battlefield Sorcery | 3 |
| Dikehorn Twin Ice Spirit Technique | 0 (6 заклинаний вместо Secrets, см. выше) |
| Scholten Mounted Combat | 4 |

### 11-18: континентальные школы (16 Secrets)

| Школа | Secrets |
|---|---|
| Ardorian Style Martial Arts - Merciano School | 3 |
| El Elena's Dazzling Veil Dance Technique | 8 (три именных Secret по 2-3 порога Reputation каждый) |
| Phylasten School - Wind Style (Twin Sword Style) | 3 |
| Modified Kwaelan Method of Dark Archery | 3 |
| Wald Style Battlefield Sword Slaying Method | 3 |
| Gaon Peerless Beast Hurling Technique | 3 |
| Iron Wall Style of Logan the Crusader | 4 |
| Kuuheiken Fierce Dragon Riding | 9 (три именных Secret по 3 порога Reputation) |

48 + 16 = **64**.

## Что добавлено в код

- `src/types/character.ts`: `KnownSchoolSchema` (`{id, name}`), `KnownSchoolSecretSchema` (`{id, name, schoolId, type, notes}`, `type` — `CombatFeatCategory`), `Character.schools`/`Character.schoolSecrets` (`.default(() => [])`).
- `src/data/schools.ts`: `SchoolDefinition`/`SchoolSecretDefinition`, `SCHOOLS` (18), `SCHOOL_SECRETS` (64), `getSchool`/`getSchoolSecret`/`listSecretsBySchool`.
- Слот-функция не заводилась — Reputation не бюджетируется нигде в приложении, см. выше.
- `SchoolsSection.tsx` — новая top-level секция листа (между Плетениями Эссенции и SCA), не привязана ни к одному классу (видна всегда, как боевые фиты): список школ-членств + список известных Secrets (имя, школа, тип с возможностью правки, заметка, кнопка удаления), два независимых пикера по каталогу.
- `CatalogReference.tsx`/`ReferenceView.tsx`: новая вкладка «Школы Battle Mastery» — все 18 школ, для каждой таблица School Equipment (если есть) и таблица Secrets (кроме Dikehorn — там текстовое примечание).
- Тесты: `src/data/schools.test.ts` (счётчики 18/64, уникальность id, каждый Secret ссылается на существующую школу, каждый prerequisite/basicFeat указывает на реально существующий Secret или боевой фит — включая цепочки через запятую и «or», единственное исключение по Secrets — Dikehorn), `SchoolsSection.test.tsx` (секция видна всегда, вступление в школу и добавление Secret из каталога, пометка «не вступили» без блокировки, блокировка повторного взятия, бэкфилл полей).

Проверено в реальном браузере (Playwright, `executablePath` на уже установленный Chrome): секция листа показывает вступление в Ivar Frenzy Style и добавленный Angry Bear Strike с типом «По объявлению» и школой в таблице, вкладка справочника показывает все 18 школ с таблицами снаряжения и Secrets (Dikehorn — с примечанием вместо таблицы), печать не переполняется, консоль пустая.
