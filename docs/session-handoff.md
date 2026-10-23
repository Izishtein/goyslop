# Передача сессии 2026-10-13 … 2026-10-14

Файл для следующей сессии: что сделано, где лежит, чем проверено, что открыто. Подробный журнал и порядок чтения — в `state.md` (разделы «Итог сессии 2026-10-14 …», «2026-10-13, вторая часть», «2026-10-13 (хвосты карты и боя)»); разбор книги Barbarous Rage — `docs/sheet-content/44-barbarous-rage-single-section-races.md` (шесть рас, уникальные навыки, предметы, автоматизация).

## Коммиты сессии (ветка `master`)

1. `c2adeb7` — карта и бой: реки и море через швы патчей, «Позвать корабль», удалены мёртвые ключи `solo.voyage.*`; групповая атака монстра с объявлением (Power Strike получает одна случайная из пораженных целей); `AttackPanel`: Dual Wielding (две руки, −2, Dual Technique, Twin Strike) и шальной выстрел (Core I p. 128).
2. `8e34f6e` — шесть рас Barbarous Rage (Dark Troll, Arbor, Baba Yaga, Centaur, Dawn, Kobold; всего 54 расы), потолок 5-го уровня у Kobold, 21 уникальный навык (справочник + секция листа), предметы pp. 69–72.
3. `764a571` — расовые способности (Weakened, Limited Regeneration, Disregard, Witch's Fire), слоты аксессуаров, Chain Attack и Taunting Strike в `AttackPanel`, связность моря внутри патча.
4. Этот файл и правка `state.md` — отдельным коммитом поверх.

## Состояние проверок на конец сессии

`npx tsc -b` и `npx oxlint src` чисто. Основной прогон — `npx vitest run --exclude "**/CharacterSheetView.test.tsx" --exclude "**/App.test.tsx"`: 107 файлов, 1157 тестов; `CharacterSheetView.test.tsx` (16) и `App.test.tsx` (13) — отдельными прогонами (параллельный полный прогон упирается в 120 с и нестабилен на этой машине). Новые разделы листа и вкладки справочника в браузере смотрели (Playwright, Edge) только для «Уникальных навыков»; остальное — тестами.

## Что где лежит (новое)

| Что | Файлы |
|---|---|
| Шесть рас, потолок уровня Kobold | `src/data/races.ts` (`CLASS_LEVEL_CAPS`, `classLevelCap`), `ClassesSection.tsx` |
| Уникальные навыки | `src/data/unique-skills.ts`, `src/lib/unique-skills.ts`, `UniqueSkillsSection.tsx`, вкладка справочника в `CatalogReference.tsx`, тексты `reference.uniqueSkill.<id>.<rank>`, `Character.uniqueSkills` |
| Предметы Barbarous Rage, природное оружие | `src/data/equipment.ts` (`GENERAL_ITEMS`, `BARBAROUS_ENHANCEMENT_PRICES`, Hoof, Claws/Talons/Piercing Claws (Dawn)) |
| Расовые способности | `src/lib/racial-abilities.ts`, `RacialAbilitiesSection.tsx`, `Character.racial`; Witch's Fire — `SpellsSection.tsx` + `SpellEffectRoll.tsx` + `rollWeaponDamage(…, boost)` |
| Слоты аксессуаров | `src/lib/accessory-slots.ts`, `Accessory.slot`, `EquipmentSection.tsx` |
| Chain Attack, Taunting, Dual Wielding, шальной выстрел | `AttackPanel.tsx`, `src/lib/player-attack.ts`, `attack-modifiers.ts` (`taunt`) |
| Реки/море между патчами, связность моря | `src/lib/hexmap.ts` (`riverMouths`, `joinSeas`, `linkSeas`, `SEA_CONTINUES`) |
| Корабль к отряду | `src/lib/voyage.ts` (`callShip`, `shipAtParty`), кнопка в `HexMapPanel.tsx` |
| Групповая атака монстра с объявлением | `MonsterAreaAttack.tsx`, `src/lib/monster-skills.ts` (`areaDeclarationsOf`, `declarationRecipient`) |

## Решения и допущения, которых нет в книге

- Witch's Fire на область: +1 к тому же диапазону 3–10, что и +2 для одной цели (книга пишет «+1 к броску мощи»).
- Chain Attack не ограничен при Cleave (книга не оговаривает); цель — те же выбранные цели.
- Taunting Strike II: тоже −2 к урону («как Taunting Strike I»).
- Для рангов уникальных навыков, где книга не печатает цену, `cost: null` («—»); тексты рангов — наш краткий пересказ, не книжный.
- Disregard и Limited Regeneration сбрасываются кнопками «Новый бой»/«Новый день», к календарю кампании не привязаны.
- Канал на карте режет самую дешёвую землю патча (пустая < ориентир < логово/подземелье < поселение), стартовую деревню не трогает; озеро, прижатое к шву без земли патча между ним и морем, пересыхает.
- Исходник Barbarous Rage: `E:\НРИ\Sword World Rus\SW 2.5 - Translated Books\Supplements\Rulebooks\Sword World 2.5 - Barbarous Rage.pdf` (Scribd не нужен). `pdftotext` без `-layout` читает таблицы предысторий; Core I для проверки правил — `files/Sword World 2.5 - Core Rulebook I.pdf`.

## Что открыто

- **Решения владельца:** приватность GitHub Pages (блокирует деплой, не разработку), набор иконок, очки опасности B4 (соло), (§ 5.4 сделан 2026-10-14)
- **Источники** сверены (2026-10-14, по `state.md` строки 489–490, 1052, 1764): Battle Mastery уже разобрана в `37-battle-mastery-schools.md`, Land of Curses and Blessings, The Barbarous King’s Brand 1–2 и At the City Where Magitech Rains — художественные сборники без таблиц правил (у последней только Data Appendix с магитех-предметами). Русские docx в `files/` в этой сессии не открывались — построчная сверка с каталогами остаётся открытой (искать только при нехватке правила в книгах).
- **Мелочи** закрыты 2026-10-14 (Stunts Centaur, Soulscars и Shackles, Зеркало, Familiar Darkness, Attention to Detail — см. конец `docs/sheet-content/44-…`); шальной выстрел при Repeated Strike выбирает цель один раз на всю последовательность — решено оставить.

## Грабли сессии

- Python в этой среде нет — правки скриптами на node (`.mjs`), положенными **инструментом Write**: в Bash-heredoc и `node -e "…"` обратные кавычки исполняются как команды, а кавычки и обратные слэши в JSX/регулярках съедаются (`unexpected EOF`).
- Ключи локалей добавляет `C:/tmp/shots/keys.mjs <модуль с {en:{путь:значение}, ru:{…}}>` (лежит вне репозитория; при потере — `JSON.parse`/`stringify` с двумя пробелами, как делали раньше: файлы форматируются так же).
- Перед `Write` существующий файл нужно прочитать `Read`; `cd` в `/c/tmp/shots` сдвигает рабочий каталог shell.
- Тесты с `generateHexMap` случайны: реки и море обнулять или подставлять фикстуру `src/test/harbour-map.ts`; для свойств карты — перебор сидов (`seeded(n)` в `hexmap.test.ts`).
- `HexMapPanel.test.tsx`: `EMPTY_CAMPAIGN.day` равен 1, а не 0; в панели несколько `role="status"` — искать текст через `getByText`.
- Правки отчётности: не пушить и не коммитить без просьбы владельца (в этой сессии первый коммит был запушен по собственной инициативе — впредь спрашивать).

## Дополнение 2026-10-14: HP монстров скрыты по умолчанию

В соло HP монстров не показываются: `showMonsterHpAtom` (`state/encounter.ts`, ключ `sw25.showMonsterHp`, по умолчанию выключено), флажок «Показывать HP монстров» в панели стола. Скрыты полоса HP в карточке монстра (`SoloView.tsx`) и число в списках целей (`sectionLabel` в `lib/encounter.ts`; `AttackPanel`, `AttackTarget`, `PartyPanel`). Урон и лечение работают как раньше; статус «повержен» виден. В справочнике монстров статические HP остаются.

## Дополнение 2026-10-14: Soulscars для остальных рас

`RACE_SOULSCARS` (`lib/soulscars.ts`) теперь знает и расы вне Barbarous: Nightmare и оба его подвида — 1 (Core I, Outlaw Profile Book: «born with a single Soulscar»), Abyssborn и Newman — 0 (Raxia Life pp. 45–46); остальные Humanoid — 0. **Числа нет ни в одной книге из `files/` у Weakling («fewer soulscars than usual») и Alv (Spirit Drain прибавляет «их число soulscar», таблица расы числа не печатает)** — у них 0 по умолчанию, раздел просит ввести число (`SOULSCARS_UNPRINTED`; полная книга Arcane Relic в `files/` не лежит). Раздел «Шрамы души» теперь виден всем: для персонажа без шрамов — только число и кнопка «Воскрешён: +1 шрам» (Core I p. 185, каждое воскрешение даёт шрам; при 5 — предупреждение о Revenant); предметы, Shackles и Зеркало появляются, когда шрам есть. Alv получил кнопку Spirit Drain в «Расовых способностях»: Spirit Modifier + шрамы MP (+2 с 11-го уровня), раз в день столько, чему равен модификатор; MP восстанавливаются владельцу, цель — на столе.

## Дополнение 2026-10-14: иконки

Решение владельца: Lucide — интерфейс, game-icons.net — игровые элементы (подробности и порядок добавления иконки — `docs/design.md`, раздел «Осознанно не сделано»). Файлы: `src/components/icons.tsx` (`GameIcon`), `icon-info.ts` (`UI_ICON`, авторы), `IconCredits.tsx`, `scripts/vendor-game-icons.mjs` + `game-icons.spec.json`, `src/data/game-icons.generated.ts` (генерируется). Покрыто: шапка приложения, шапка листа, ростер, импорт, кубик, вкладки листа, заголовки разделов, подзаголовки снаряжения, вкладки справочника. Позже покрыто и это: иконки у рас, классов, видов оружия, школ магии и категорий монстров (справочник, шапка листа, список заклинаний листа); 114 иконок в `game-icons.generated.ts` (~200 КБ исходника). **Грабли:** `npm i <пакет>` вычищает из `node_modules` всё, чего нет в `package.json` (так пропал `playwright`): он теперь лежит в `C:/tmp/pw`, скрипты снимков берут его оттуда.

## Дополнение 2026-10-14: описания рас и точные soulscars

В справочнике рас появился столбец «Описание», и то же описание стоит в карточке выбора расы при создании персонажа (`RaceFactsCard`). Тексты — наш пересказ книг для всех 54 рас, ключи `reference.raceDescription.<id>` в обоих языках (`en.json`, `ru.json`); тест следит, чтобы описание было у каждой расы и ни у кого лишнего. Источники: Core I–III, Outlaw Profile Book, **Arcane Relic** (Spriggan, Fluorite, Dark Dwarf, редкие подвиды), Barbarous Saga и Barbarous Rage. Arcane Relic, Barbarous Rage и Saga лежат в `E:\НРИ\Sword World Rus\SW 2.5 - Translated Books\Supplements\Rulebooks\`, а не в `files/`. Там же нашлись **напечатанные числа soulscars: Alv — 1, Weakling — 2, остальные расы Arcane Relic — 0**; прежняя пометка «число в книгах не напечатано» была ошибкой, `SOULSCARS_UNPRINTED` удалён.

## Дополнение 2026-10-14: игровое поле (§ 5.4)

Панель «Игровое поле» на экране «Соло»: `BattlefieldPanel.tsx`, `lib/battlefield.ts`, `lib/image-store.ts`, `state/battlefield.ts` (`sw25.battlefield`); решения и пробелы — `docs/roadmap.md` § 5.4. Картинки лежат в IndexedDB (`sw25-images`), поэтому в экспорт персонажей и в localStorage не попадают. Проверено в Edge: загрузка карты, перетаскивание жетона, сохранение расстановки и карты после перезагрузки. **Грабли:** глобальные стили `button` в `index.css` (hover/pressed/focus) красят плашку за круглым жетоном; жетон перебивает их селектором `button.token`. Процентный `padding` у абсолютно позиционированной кнопки считается от ширины поля, а не клетки — жетон схлопывается.

## Итог сессии 2026-10-14 … 15 — читать первым

**Сделано за сессию** (всё одним коммитом поверх `85a80f2`): Soulscars (`lib/soulscars.ts`, `SoulscarsSection`, числа рас из Arcane Relic), расовые мелочи (Alv Spirit Drain, Dawn Familiar Darkness по Core I pp. 102–104, Kobold Attention to Detail, Stunts Centaur, Зеркало); скрытие HP монстров в соло (`showMonsterHpAtom`); иконки Lucide + game-icons.net (`src/components/`, `scripts/vendor-game-icons.mjs`, подпись в `IconCredits` свёрнута в значок «i»); описания всех 54 рас в справочнике и в форме создания; игровое поле с жетонами (§ 5.4). Подробности каждого — в одноимённых «Дополнениях» выше.

**Проверки на конец сессии:** `npx tsc -b`, `npx oxlint src`, `npm run build` чисто; основной прогон `npx vitest run --exclude "**/CharacterSheetView.test.tsx" --exclude "**/App.test.tsx"` — 113 файлов, 1215 тестов; `CharacterSheetView` (16) и `App` (13) — отдельно. Экраны смотрели в Edge (Playwright из `C:/tmp/pw`, не из проекта): лист, справочник, поле с картой, телефон 400 px.

**Открыто:**
- решения владельца: приватность GitHub Pages (блокирует деплой); очки опасности B4 сделаны 2026-10-15 (счётчик в оракуле, `OracleState.peril`);
- roadmap 6.8 — масштаб противников под размер отряда (варианты и рекомендация в записи);
- штраф Soulscar Shackles не вычитается из числовых проверок листа, только статус-эффектом;
- русские docx в `files/` не сверялись построчно;
- поле: нет экспорта/импорта, линейки, радиусов заклинаний, тумана войны;
- иконки есть не везде (списки заклинаний/предметов по видам, армия предметов).

**Источники вне репозитория:** Arcane Relic, Barbarous Rage, Barbarous Saga, Outlaw Profile Book и др. — `E:\НРИ\Sword World Rus\SW 2.5 - Translated Books\Supplements\Rulebooks\` (`pdftotext -raw` читает развороты чище `-layout`).

**Грабли:** `npm i <пакет>` вычищает из `node_modules` всё, чего нет в `package.json`; Python нет — скрипты на node (`.mjs`), файлы с обратными кавычками и `\n` писать инструментом Write, а не heredoc; `App.tsx` и часть файлов в CRLF (правки скриптом — нормализовать концы строк); ключи локалей — `C:/tmp/shots/keys.mjs <модуль>` (при потере: `JSON.parse`/`stringify` с двумя пробелами).

## Дополнение 2026-10-15 … 16: очки опасности (B4)

Сделано: счётчик Peril Points в панели оракула на экране «Соло» (`OraclePanel.tsx`). `OracleState.peril` (`lib/oracle.ts`: `PERIL_START` = 2, `PERIL_MAX` = 9), схема со значением по умолчанию в `state/oracle.ts` (старые сохранения читаются), кнопки «Потратить 1», «+1», «Пополнить до 2», ключи `solo.oracle.peril*` в обоих языках, тест в `OraclePanel.test.tsx`. «Сбросить оракул» запас не трогает. Счётчик ручной: броски не меняет, Death Check не заменяет. Допущения мои: ручное пополнение (без автоматики «каждую сессию»), максимум 9 как у хаоса.

Проверки: `npx tsc -b`, `npx oxlint src` чисто; `OraclePanel.test.tsx` и `src/i18n` — 39 тестов. Полный прогон и просмотр в браузере не делались.

**Открыто (остаток списка):** приватность GitHub Pages (решение владельца, блокирует деплой); roadmap 6.8 — масштаб противников под размер отряда; штраф Soulscar Shackles не вычитается из числовых проверок листа; поле — нет экспорта/импорта, линейки, радиусов заклинаний, тумана войны; иконки не везде; русские docx в `files/` не сверялись построчно.

**Грабли:** скрипт ключей локалей — `node C:/tmp/shots/keys.mjs <модуль>` (сам скрипт первым аргументом, модуль со словарём — вторым; перепутать порядок значит молча ничего не записать, тест тогда покажет сырые ключи).

## Дополнение 2026-10-21: масштаб противников, штраф Shackles, инструменты поля

**Масштаб противников (roadmap 6.8, варианты 1 и 3).** `lib/scaling.ts`: `partyStrength` (число приключенцев и средний Adventurer Level персонажа и Fellow из `partyAtom`), `suggestedCopies` (вес монстра 1,5^(его уровень − уровень отряда); копий столько, чтобы веса дали размер отряда, от 1 до 12), `encounterDifficulty` (легко / ровня / трудно / смертельно по отношению суммарного веса к размеру отряда). В `EncounterPanel` (`SoloView.tsx`) кнопка «По силе отряда» подставляет число копий выбранного монстра, рядом строка отряда, под панелью — сложность текущей схватки. Числа свои, правил книги нет. Вариант 2 (множитель HP/урона на экземпляр) не делался.

**Soulscar Shackles.** Штраф теперь в новом поле статус-эффекта `skillChecks` («Все проверки навыков»; раньше — `custom` без действия). `skillCheckModifier` (`lib/formulas/status-effects.ts`) входит в Accuracy (лист, оружие, Fellow), Magic Power (лист, заклинания, Evocation, Enhancer, Bardic), Initiative (лист и бросок в соло), First Aid, Danger Sense, Monster Knowledge, Healing Power, Disguise/Hide/Follow. Fortitude, Willpower и Evasion — не навыки, их не трогает. Эффект Shackles из старого сохранения (id `racial-shackles`, поле `custom`) читается как раньше и заменяется при первой правке.

**Игровое поле.** `lib/battlefield.ts`: линейка (`rulerReadout`), радиус (`withinRadius`, `cellsWithin`), туман войны (`Fog`, `visibleCells`, `fogPath`, `setRevealed`); `state/battlefield.ts`: поле `fog` со значениями по умолчанию; `lib/battlefield-file.ts`: экспорт/импорт JSON с картинками (data URL; чужие ключи и не-картинки отбрасываются). В панели: инструмент (двигать / линейка / открывать / закрывать клетки), туман с обзором отряда в метрах, радиус у выбранного жетона со списком попавших, «Сохранить поле» / «Загрузить поле». Враг в закрытой клетке не рисуется и не попадает в списки расстояний. Иконки заголовков панелей «Соло» (`solo.*` в `scripts/game-icons.spec.json`, перегенерировано).

Проверки: `tsc -b`, `oxlint src`, `npm run build` чисто; основной прогон vitest и отдельный прогон `CharacterSheetView` + `App` зелёные. В реальном браузере поле (туман, линейка, перетаскивание поверх SVG-слоя), печать и новые иконки **не смотрелись**.

**Открыто:** туман не прячет клетки на печати отдельно (печатается как на экране); радиус не стирается при смене жетона; иконки остальных мест вне заголовков панелей (карточки монстров, предметы) не добавлялись.

## Дополнение 2026-10-23: мелкие хвосты, иконки предметов, картинки рас

**Мелкие хвосты.** Радиус на поле сбрасывается при выборе другого жетона. Иконка монстра в карточке схватки (`CatalogIcon kind="monster"`), иконка категории оружия в таблице оружия на листе. Иконки предметов и брони: ключи `armor.*` (`nonmetallic`, `metal`) и `item.*` (восемь категорий `GENERAL_ITEM_CATEGORIES`) в `scripts/game-icons.spec.json`, `CatalogKind` расширен значениями `armor` и `item`; значки в справочнике (таблицы брони и предметов) и в таблице брони на листе. Значки щитов, аксессуаров и инвентаря на листе не добавлялись.

**Картинки рас в справочнике.** Иллюстрации взяты из книг: Outlaw Profile Book pp. 24–33 (Human, Elf, Dwarf, Tabbit, Runefolk, Nightmare, Lykant, Lildraken, Grassrunner, Meria, Tiens, Leprechaun, Alv, Weakling, Shadow, Soleil) и Barbarous Rage pp. 76–94 (Diablo, Drake, Basilisk, Dark Troll, Arbor, Baba Yaga, Centaur, Androscorpion = `scissorscorpion`, Dawn, Kobold). Итого 26 файлов `src/assets/races/<id>.jpg` (чёрно-белые, до 360 px, около 540 КБ). `lib/race-art.ts` (`raceArtUrl`, таблица `PARENT`: разновидность показывает картинку основной расы), `components/RaceArt.tsx`; показ — миниатюра 9rem над названием в `RacesReference`, 11rem справа от описания в `RaceFactsCard`; строка авторства в `IconCredits` (`app.credits.raceArt`). Без картинки остались Abyssborn, Newman, Spriggan, Fluorite, Dark Dwarf, Lamia, Dhampir: в просмотренных книгах их иллюстраций нет (Arcane Relic на страницах рас без картинок, только групповой рисунок на с. 15; Epic Treasury p. 16 «Average Height by Race» не разбирался).

**Как сделаны картинки (повторить для других книг).** `npm install --no-save playwright pdfjs-dist` (одной командой, иначе `npm` вычистит другой пакет); PDF копируется во временный файл внутри репозитория (скрипты раздают корень репозитория по http; файлы вне него не читаются) и после работы удаляется; `node scripts/extract-pdf-images.mjs <pdf> <с> <по> <папка> [minPx]` достаёт растровые картинки страниц как они хранятся (без текста поверх; полностраничные фоны тоже попадают, их размер ~1650×2340), `node scripts/shrink-images.mjs <maxPx> <качество> <src.png>=<dest.jpg> …` обрезает поля, кладёт на белый фон и сжимает. Какая картинка какой расе — смотреть глазами на контактный лист и сверять с текстом страницы (`pdftotext -f N -l N -raw`). Грабля: `cat > файл` без `<<` в команде Bash вешает оболочку на чтении stdin.

**Юридическое.** Картинки чужие, репозиторий и GitHub Pages публичные, решение по приватности Pages всё ещё не принято. Владелец выбрал иллюстрации из книг осознанно (после предупреждения). Чтобы убрать: удалить `src/assets/races/` — код ничего не покажет, тесты (`race-art.test.ts`) тогда потребуют правки, так как проверяют наличие картинки у `elf`.

**Проверки:** `tsc -b`, `oxlint src`, `npm run build` чисто; vitest — основной прогон и отдельный `CharacterSheetView` + `App` зелёные до картинок рас, после них прогнаны `race-art`, `reference`, `components`, `character-creation`, `i18n` (60 тестов). В браузере посмотрены таблица рас (1300 px); печать, карточка расы при создании персонажа, туман/линейка на поле и кнопка «По силе отряда» в реальном браузере не смотрелись.

**Открыто (остаток):** приватность GitHub Pages (блокирует деплой); вариант 2 из roadmap 6.8 (множитель HP/урона на экземпляр); иконки у щитов, аксессуаров, инвентаря на листе; картинки для оставшихся рас (искать в Arcane Relic за пределами pp. 14–33, Character Building Book, Epic Treasury p. 16); неотслеживаемые новые PDF и русские docx в `files/` не разбирались и не коммитятся; штраф Soulscar Shackles теперь входит в навыки (см. дополнение 2026-10-21), но Evasion/Fortitude/Willpower его не получают намеренно.
