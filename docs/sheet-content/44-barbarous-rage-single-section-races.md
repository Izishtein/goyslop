# Barbarous Rage: шесть рас с одной частью тела, уникальные навыки и предметы

Источник: **Barbarous Rage** (SW 2.5), `E:\НРИ\Sword World Rus\SW 2.5 - Translated Books\Supplements\Rulebooks\Sword World 2.5 - Barbarous Rage.pdf` (английский текст; PDF-страница = книжная; текст — `pdftotext`, не `-layout`, для таблиц предысторий). Расы: Dark Troll pp. 23–26, Arbor pp. 27–30, Baba Yaga pp. 31–34, Centaur pp. 35–38, Dawn pp. 43–46, Kobold pp. 47–50; уникальные навыки pp. 65–68; предметы pp. 69–72; дополнительные правила p. 73. Остальные четыре расы книги (Diablo, Drake, Basilisk, Scissorscorpion) — в `43-barbarous-rage-multi-section-races.md`. Данные: `src/data/races.ts`, `src/data/unique-skills.ts`, `src/data/equipment.ts`.

## Шесть рас

У этих рас одно тело: нет предыстории Shapeshifter (Heritor), нет таблицы частей. Для каждой — кости, две таблицы по 5 строк (2–4, 5–6, 7, 8–9, 10–12), Skill/Body/Mind постоянной суммы на расу.

| | Кости A–F (DEX AGI STR VIT INT SPR) | Языки | Soulscars | Запрет классов | Слабое место | Σ S/B/M |
|---|---|---|---|---|---|---|
| Dark Troll | 2d 1d 2d 2d+6 1d 2d | Barbaric, Giantish | 4 | нет | магический урон +2 | 30 |
| Arbor | 2d 2d 1d 1d+3 2d 2d | Trade Common, Barbaric, Drakish (+ говорит на Sylvan) | 2 | нет | урон огнём +3 | 30 |
| Baba Yaga | 2d 1d 1d 1d 2d 1d+6 | Trade Common, Arcana, Barbaric, Drakish | 2 (+2 в облике ведьмы) | нет | физический урон +2 | 26 |
| Centaur | 2d+6 1d 2d 2d 1d 2d | Barbaric, Centaurian | 3 | **Grappler** | урон землёй +3 | 26 |
| Dawn | 2d+6 2d 1d 2d 2d 1d | Barbaric, Trade Common | 2 | нет | Accuracy +1 | 27 |
| Kobold | 2d 2d 1d 1d 2d 2d | Barbaric, Trade Common (+ говорит на Youma) | 1 | нет | магический урон +2 | 18 |

Кости напечатаны как «A: … F: …» в порядке DEX, AGI, STR, VIT, INT, SPR; сверены тестом (`races.test.ts`). Отдельный пункт Kobold: «Hobbyist» в основной таблице даёт **Sage или Bard** на выбор (`joiner: 'or'`).

### Предыстории (основная / дополнительная)

- **Dark Troll**: Bodybuilder (Enhancer) 9/13/8, 2500; Boxer (Grappler) 10/14/6, 2000; Warrior (Fighter) 9/14/7, 2000; Priest 8/13/9, 2000; Spy (Scout) 10/13/7, 2500 — / Tactician 9/12/9, 2500; Geomancer 10/12/8, 2500; Dancer (Battle Dancer) 11/14/5, 2000; Jockey (Rider) 11/12/7, 2500; Hunter (Ranger) 11/13/6, 2500.
- **Arbor**: Fairy Tamer 9/7/14, 2000; Sorcerer 10/7/13, 2000; Conjurer 11/7/12, 2000; Priest 11/8/11, 2000; Spy (Scout) 12/8/10, 2500 — / Warlock 9/8/13, 2000; Geomancer 10/9/11, 2500; Druid 11/7/12, 2000; Tactician 10/10/10, 2500; Sage 10/8/12, 2500.
- **Baba Yaga**: Sage 9/8/9, 2500; Conjurer 8/8/10, 2000; Sorcerer 7/8/11, 2000; Priest 7/10/9, 2000; Fairy Tamer 7/9/10, 2000 — / Hunter (Ranger) 10/6/10, 2500; Tactician 8/9/9, 2500; Warlock 7/7/12, 2000; Druid 9/6/11, 2000; Geomancer 10/8/8, 2500.
- **Centaur**: Bodybuilder (Enhancer) 8/9/9, 2500; Fairy Tamer 7/9/10, 2000; Warrior (Fighter) 8/10/8, 2000; Sorcerer 7/8/11, 2000; Hunter (Ranger) 9/8/9, 2500 — / Druid 8/7/11, 2000; Agile Warrior (Fencer) 10/8/8, 2500; Dancer 9/10/7, 2000; Tactician 9/9/8, 2500; Geomancer 8/8/10, 2500.
- **Dawn**: Sorcerer 9/6/12, 2000; Boxer (Grappler) 11/5/11, 2000; Assassin (Fencer) 12/6/9, 2500; Spy (Scout) 11/6/10, 2500; Priest 10/7/10, 2000 — / Geomancer 11/7/9, 2500; Archer (Marksman) 12/4/11, 2500; Dancer 10/7/10, 2000; Warrior (Fighter) 11/8/8, 2000; Warlock 11/5/11, 2000.
- **Kobold**: Hobbyist (Sage или Bard) 7/4/7, 2500; Scout 9/4/5, 2500; Agile Warrior (Fencer) 8/5/5, 2500; Hunter (Ranger) 7/5/6, 2500; Sorcerer 6/4/8, 2000 — / Officer (Tactician) 8/4/6, 2500; Geomancer 6/6/6, 2500; Dancer 7/6/5, 2000; Archer (Marksman) 9/5/4, 2500; Artificer 8/3/7, 2000.

## Расовые способности

- **Dark Troll**: Darkvision; **Weakened** — на солнце −2 к Accuracy и Evasion; **Troll Physique** — Defense +1. Ур. 6: **Limited Regeneration** — раз в день Major Action, «уровень авантюриста × 5» HP; ур. 11: Minor Action.
- **Arbor**: **Flame of Anger** — при создании выбирается один из уникальных навыков Fire Weapon или Fire Shield. Ур. 6: Fire Weapon — Minor Action, либо Fire Shield — +2 к магическому урону по атакующему (всего +3); ур. 11: Fire Weapon +2 к физическому урону (всего +4), либо Fire Shield +3 к Defense (всего +5).
- **Baba Yaga**: **Witch Transformation** (Minor Action или при Combat Preparation) — Magic Power всех +1, Soulscars +2 (до 4), открывает **Witch's Fire**; вернуться нельзя 1 час, возврат — Major Action; текущие HP/MP и эффекты сохраняются. **Witch's Fire**: к заклинанию «Target: 1 Character» с таблицей мощи, брошенному Major Action, можно доплатить MP, равные уровню (rank) заклинания: результат 2d «3–10» считается как «+2» (до 12); двойная единица остаётся. Ур. 6: можно и для «Target: 1 Area», +1 к броску мощи по всем целям; ур. 11: доплата — половина уровня заклинания (с округлением вверх).
- **Centaur**: **Half-Horse, Half-Human** — природное оружие Hoof (p. 64), скорость = AGI × 2, нельзя ездить на маунтах (но на нём можно), нет слота аксессуаров «Feet» — вместо него второй «Waist». **Martial Art of the Horse People** — верхняя часть всегда считается верхом; уровень Rider даёт часть Stunts самому кентавру (Intimidation, Attack Obstruction, Elevated Attack, Tandem, Charge, HP Required Enhancement — ур. 1; Lion's Fury, Improved Elevated Attack, Trample, Improved HP Enhancement — ур. 5; Mounted Command, Greater Elevated Attack, Super Charge, Improved Attack Obstruction, Orochi's Fury — ур. 10; поле «Compatible» игнорируется; если кентавр управляет маунтом Rider-ом, все Stunts идут маунту). Ур. 6: может нести одного пассажира (CR III p. 91); ур. 11: штраф от плохой опоры вдвое меньше (с округлением вверх).
- **Dawn**: Darkvision; **Assassination Skills** — врождённое оружие Claws (выпускаются/убираются Minor Action, не отличимы от человеческих ногтей): +1 к Accuracy, +2 к Extra Damage; Вливаниями не улучшается. Ур. 6: Talons (ранг A), Extra Damage +3, без Weapon Proficiency A/Wrestling; ур. 11: Piercing Claws (ранг S), Accuracy +2, Extra Damage +4. **Familiar Darkness** — +2 к Success Value проверок Disguise (на себя), Hide и Follow; ур. 11 — +4.
- **Kobold**: **Species Limit** — любой класс не выше 5-го уровня; **Disregard** — раз за бой попросить Мастера перевести атаку или уникальный навык на другого персонажа; **Attention to Detail** — +2 к проверкам DEX вне боя; рабочие навыки (Work Skills) до 15 уровней всего, при создании не больше 5 в одном (дальше — правила Raxia Life). Усилений нет.

Шаги усиления: `RacialAbility.fromLevel` — 0 / 6 / 11. Потолок Kobold — `CLASS_LEVEL_CAPS` / `classLevelCap` в `races.ts`, учитывается в `ClassesSection` (кнопка +1 гаснет на 5-м уровне).

### Природное оружие (p. 64 и p. 44)

Все — борцовские (wrestling), Min STR 1, без цены. **Hoof** (Centaur): B-ранг, 1H#, Power 11, Crit 10, Accuracy и Extra Damage — нет. Когти **Dawn** с бонусами Assassination Skills: Claws (Dawn) 1HW, Accuracy +1, Power 6, Extra Damage +2; Talons (Dawn) Accuracy +1, Power 16, +3; Piercing Claws (Dawn) Accuracy +3 (+1 по таблице и +2 от навыка), Power 21, +4; Crit везде 10. Добавлены в каталог оружия (`equipment.ts`) отдельными строками с пометкой источника.

## Уникальные навыки (pp. 65–68)

Каталог — `src/data/unique-skills.ts`: 21 навык, 54 записи по рангам; описание каждого ранга — `reference.uniqueSkill.<id>.<rank>` в обеих локалях (краткий пересказ, не текст книги); вкладка справочника «Уникальные навыки»; секция листа «Уникальные навыки» (вкладка «Умения») — игрок отмечает изученные навыки и ранг, лист считает Standard Value и бросает 2d6 + SV.

- **Diablo** (по одному рангу; изучаются одноимёнными Вливаниями): Daemonic Roar (SV Heritor + SPR, Willpower, 6 MP), Raw Deal (без SV, 4 MP), Daemonic Eyes (2 MP за цель), Soul Absorption (Heritor + INT, Willpower, Power 40, 20 MP за цель), Chain of Curses (Heritor + INT, Power 20, 5 HP + 4 MP за цель), Erosive Poisonous Breath (Heritor + VIT, Fortitude, Power 10, 8 MP).
- **Drake**: Breath of Light (уровень авантюриста + VIT, Fortitude, Power 20, дальность 2 (30 м); раз в раунд, не в идущих подряд ходах). Усиливается Вливаниями Shining Light Breath и Radiant Breath.
- **Basilisk**: 11 «Evil Eye» — по четыре ранга B/A/S/SS; SV = уровень авантюриста + SPR, спасбросок Willpower (кроме Exaltation и All-Seeing); Eye Of Stone меняет цвет по применяемому глазу; Petrification ранга B берётся автоматически при создании; применять можно любой ранг не выше изученного. Глаза: Petrification (5 MP / … / 10 MP), Destruction (4/8/12/20; тип и цвет выбираются раз), Unlocking (4/8/24/32), Revitalization (3/6/12/36), Exaltation (6/…/18), Dissipation (6/9/18, SS — только цена запуска A или S), Revivification (3/6/12/24), All-Seeing (всегда включён, 0 MP; S — 5 MP), Manipulation (4/8/…/32), Stagnation (6/…/12), Soul Transfer (8/12/24/36). Там, где книга не печатает цену ранга, в данных стоит `null` («—»).
- **Arbor**: Fire Weapon и Fire Shield (уровень авантюриста + INT, 8 MP, 3 минуты, область 3 м радиусом, до 5 целей).
- **Scissorscorpion**: Poisonous Tail (Heritor + VIT, Fortitude, 1d яда к удару Scorpion Tail).

Зеркало (p. 73): персонаж с зеркалом при [Evil Eye of Petrification] бросает Willpower как обычно; если результат выше Success Value глаза на 4 и больше, глаз отражается на Василиска, и тот сопротивляться не может.

## Предметы (pp. 69–72, 73)

В `GENERAL_ITEMS` (`equipment.ts`, источник Barbarous Rage): Drake's Magic Sword, Eye Of Stone, Diablo Core (не продаются, «не предмет»); Barbarous Portable Set 100; Soulscar Shackles 3000; Humanoid Blood 50; Residual Chalk 100; Ignis Charm и Wrath Cloaker по 1000 + 10 репутации; Camouflage of Soulscars 1100; Blessed Bead of Ignis 5000 + 30 репутации; зелья Tinted Potion 500, Jet Black Revitalizing Wine 2000, Soulscarred Dried Meat 1000; аксессуары Soulscar Night Visor 600 (Face), Stone Dance Earrings 1000, Numerous Earrings 1000 + 50 репутации, Hell's Earrings 2000 (Ears), Untrue Collar: Thin 100 / Thick 1000 (Neck; в книге у них по ошибке указано «Ears»).

Усиления (`BARBAROUS_ENHANCEMENT_PRICES`, только цены по рангу B/A/S/SS): Magic Weapon +2 (20 000 / 40 000 / 80 000 / 160 000; поверх Magic Weapon +1, SS-оружия или оружия с отметкой SS: ещё +1 к Accuracy и Extra Damage), Soulscar Processing (3000 / 6000 / 12 000 / 24 000; Extra Damage на число Soulscars владельца ценой столько же HP, раз в 10 минут, месяц работы), Denudation (1000 / 2000 / 4000 / 8000; броня сбрасывается Minor Action, неделя работы, 10 минут на надевание).

## Что осталось за кадром

Автоматически не считаются: Witch's Fire (доп. MP и +2 к броску мощи), Limited Regeneration (раз в день), Weakened (на солнце), Disregard (раз за бой), второй слот Waist у Centaur, Stunts, применимые к самому кентавру, штраф Soulscar Shackles и прочие эффекты предметов, зеркало против Petrification — лист хранит названия способностей по уровням, число Soulscars и эти эффекты остаются на игроке.
