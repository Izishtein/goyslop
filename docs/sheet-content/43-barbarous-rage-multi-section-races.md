# Barbarous Rage: расы с несколькими частями тела

Источник: **Barbarous Rage** (SW 2.5) — книга из второй коллекции владельца (`E:\НРИ\Sword World Rus\…\Supplements\Rulebooks`). Расы: Diablo pp. 11–14, Drake pp. 15–18, Basilisk pp. 19–22, Scissorscorpion pp. 39–42; правила — «About Transformations» pp. 53–54, «Characters with Multiple Sections» pp. 54–56, класс Heritor p. 57, «Basic Values of Multiple Sections» p. 63, «List of Innate Weapons» p. 64. Данные: `src/data/races.ts` (расы), `src/data/sections.ts` (части, таблица, природное оружие), `src/lib/forms.ts` (логика), `FormsSection` на листе и вкладка справочника «Части тела».

## Четыре расы

| | Кости A–F | Языки | Soulscars | Слабое место | Предметы превращения |
|---|---|---|---|---|---|
| Diablo | 2d 2d 2d+6 2d 1d 1d+6 | Barbaric, Daemonic | 4 | урон энергией +3 | Diablo Core (p. 69) |
| Drake | 1d 1d 2d 2d 2d+6 2d | Trade Common, Barbaric, Drakish | 4 | магический урон +2 | Drake's Magic Sword |
| Basilisk | 1d+6 2d 2d 2d 1d 1d | Trade Common, Basilisk, Drakish, Barbaric (+ speak Youma) | 4 | урон водой/льдом +3 | Eye Of Stone |
| Scissorscorpion | 1d+6 1d 2d 2d 2d 2d | Barbaric, Androscorpion, Magitech | 4 | физический урон +2 | — |

Запретов классов нет («Restricted Classes: None»). Две таблицы предысторий по 5 строк (2–4, 5–6, 7, 8–9, 10–12); сумма Skill+Body+Mind постоянна для расы: 28 / 32 / 33 / 26. «Shapeshifter» (Heritor) — в основной таблице у всех четырёх.

## Расовые способности и усиления

- **Diablo**: Darkvision, Flying (+1 к Evasion/Accuracy в ближнем бою, скорость = AGI), Daemon Skin (−3 к урону рубящего/дробящего типа), Daemonshift (Major Action; ур. 6 — выбор, сохранять ли эффекты Головы; ур. 8 — Minor Action; раз в 3 часа, вернуться нельзя 1 час). Ур. 11: Flying II (скорость ×2 AGI, +2).
- **Drake**: Darkvision, Magic Sword (оружие B-ранга ближнего боя, волшебное и магический инструмент), Flying, Dragonification (Major Action; ур. 6 — выбор эффектов Тела; ур. 11 — Minor Action, иммунитет к энергии). Ур. 13: Flying II. Вернуться нельзя 1 час.
- **Basilisk**: Evil Eyes and Petrifying Gaze (Truespeech/Spiritualism/Deep без инструмента, Evil Eye of Petrification B), Poisonous Blood (1d яда магического урона, ур. 9 — 2d), Monstrous Form (Major Action; INT −12; ур. 6 — выбор эффектов Головы и иммунитет к яду; ур. 11 — Minor Action).
- **Scissorscorpion**: Darkvision, Scorpion Body (три части с самого начала; ур. 6 — вторая «спина»), Scorpion Body Art (Evasion Верхней части по уровню Heritor + AGI; ур. 11 — не теряется при 0 HP Скорпиона).

Шаги усиления бывают не только 6/11: 8 (Daemonshift Minor), 9 (Poisonous Blood), 13 (Flying II у Drake), поэтому `RacialAbility.fromLevel` расширен до `0 | 6 | 8 | 9 | 11 | 13`.

## Части тела (pp. 54–56)

- Diablo в облике: **Голова (Главная)** + **Тело**; Drake: **Тело (Главная)** + **Крыло** ×2; Basilisk: **Голова (Главная)** + **Тело** + **Дурной глаз**; Scissorscorpion всегда: **Верхняя часть (Главная)** + **Скорпион** + **Клешни**.
- Главная часть — сам персонаж: свои HP/MP, классы, способности; из таблицы берётся **только Защита** (кроме Верхней части Scissorscorpion: она носит доспех, у неё из таблицы ничего). Смерть — по Death Check при 0 HP Главной части.
- Остальные части: Max HP, Max MP, Защита — из таблицы по уровню Heritor (без класса — колонка «0»). Проверки Accuracy/Evasion — «уровень Heritor + модификатор DEX/AGI» (без класса — простой бросок), в Extra Damage идёт «уровень Heritor + модификатор STR». Fortitude/Willpower — Главной части; Death Check остальной части идёт по Fortitude Главной: успех — без сознания (будят [Awaken]), провал — «выведена из строя» навсегда (до Resurrection и т. п., сгоревших soulscars нет).
- При превращении все части — на максимуме (даже Главная восстанавливает HP/MP); при возврате Главная сохраняет потери HP/MP, остальные части отпускаются; лежащие без сознания/выведенные остаются такими при новом превращении.
- Правила превращения: предметы в руках падают, аксессуары кроме «Ears» слетают, металлический доспех мешает превращению (нужна «Денудация»), верховая езда прекращается, в тесноте нельзя; Главная часть без рук получает −4 к проверкам навыков (кроме Тела Diablo и Верхней части Scissorscorpion).

## Таблица p. 63 (шесть колонок × уровни Heritor 0–15)

Таблица вынесена в `src/data/sections.ts` как `[HP, MP, Защита]`; сверена с пробным примером p. 56 (Basilisk, Heritor 3, Tenacious Infusion I + Section Quick Reaction I): Голова — Defense 2; Тело 37 HP / 16 MP / Defense 5, Accuracy и Evasion +7; Дурной глаз 21 HP / 16 MP / Defense 1 — тест `lib/forms.test.ts`. Колонка Wing: Защита равна уровню Heritor (в текстовом слое PDF она теряется — прочитана по картинке страницы).

## Природное оружие (p. 64)

Все — борцовские (wrestling), Min STR 1, без цены и доп. урона. Ранги B → A → S → SS растут от Вливаний [Innate Weapons Mastery A/S/SS]: Claws → Talons → Piercing Claws → Murderous Talons (1HW, Acc 0/0/+1/+1, Power 6/16/21/26, Crit 10/10/10/9); Bite → Sharp Bite → Cleaving Bite → Steel Rending Bite (2H#, 11/21/31/41, Crit 10); Wing → … → Wing of Judgement (1H#, 6/16/26/36, Crit 11); Drill → … → Destructive Drill (1H#, 16/26/36/46, Crit 11); Scorpion Tail → Whiptail → Sharp Tail → Dream Tail (1H#, Acc −1, 11/21/31/41, Crit 10); Pincers → … → Indestructible Pincers (1HW, Acc +1, 6/16/26/36, Crit 11). Копыто (Hoof) — Centaur, в каталог не входит.

## Что автоматизировано на листе

Превращение/возврат, HP/MP/Защита каждой части, Death Check, природное оружие нужного ранга с бросками Точности/Уклонения/Урона для остальных частей; **Tenacious Infusion I/II/Mastery** (Defense +1/+2/+4, HP +5/+10/+20) и **Section Quick Reaction I/II + Meticulous Infusion Mastery** (+1/+2/+3 к Accuracy и Evasion) считаются сами, по высшему из выученных (в тексте каждого «в сумме»). Остальные Вливания, предметы Diablo Core/Magic Sword/Eye of Stone и уникальные навыки (pp. 65–66) остаются текстом: числа, которых они касаются, правятся в «Добавках» части.
