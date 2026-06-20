# SW 2.5 — Races (Полный список рас)

Sources: ccxp.info overview parts 1-2, danielhkwan.substack.com, ameblo.jp/laytontrpg,
GM Binder rules intro, Wikipedia JA, fujimi-trpg-online supplement list.

---

## Система характеристик рас

Каждая раса задаёт **кости для броска коррекций** по шести характеристикам:
Dexterity (DEX), Agility (AGI), Strength (STR), Vitality (VIT), Intelligence (INT), Spirit (SPR).

Структура поля на листе:
- **Skill** (база) = DEX + AGI (из предыстории/Background)
- **Body** (база) = STR + VIT
- **Mind** (база) = INT + SPR
- **Corrections A–F** — результаты расовых бросков кубиков, добавляемые к базам

Некоторые расы бросают 2d6, другие 1d6, иногда добавляется фиксированное число.
Пример: Tabbit бросает 2d6+6 для INT; Dwarf бросает 1d6 для STR.

**Финальный бонус** = (Base + Corrections + Growths) ÷ 6, округление вниз.

---

## Расы из Основных Книг Правил

### Rulebook I (7 рас)

| Раса | Профиль | Оптимальный класс | Особые черты |
|------|---------|-------------------|--------------|
| **Human** (人間) | Сбалансированная | Fencer | Способность «Change Fate»: 1 раз в день перебросить оба кубика после броска 2d6 |
| **Elf** (エルフ) | Высокие INT/SPR | Fairy Tamer | Darkvision, плавание без штрафа, сопротивление яду/болезни |
| **Dwarf** (ドワーф) | Высокие STR/VIT | Fighter | Darkvision, полный иммунитет к огневому урону (включая предметы) |
| **Tabbit** (タビット) | Высокие DEX/AGI | Sorcerer | Шестое чувство (+Lvl к Danger Sense); не может быть Priest |
| **Runefolk** (ルーンフォーク) | Высокие STR/DEX | Fighter | Darkvision, 1×день конвертировать HP в MP; нельзя быть Priest или Fairy Tamer |
| **Nightmare** (ナイトメア) | Высокий INT | Conjurer | Alternate Form: игнорирует штрафы магической брони, каст без вербальных/соматических компонентов; бонусы на уровне 11+ |
| **Lykant** (ライカンスロープ) | Высокие STR/AGI | Grappler | Beast Form: голова животного, Darkvision, речь только на Lykant-языке |

### Rulebook II (2 расы)

| Раса | Профиль | Оптимальный класс | Особые черты |
|------|---------|-------------------|--------------|
| **Lildraken** (リルドラケン) | Высокие STR/VIT | Fighter | Чешуя (бонус защиты), Tail Whip, 1 минута полёта в день; лучший фронтлайн на низких уровнях |
| **Grassrunner** (グラスランナー) | Высокие DEX/AGI | Fencer | Mana Interference: нет MP, но нейтрализует заклинания через проверку Willpower; Natural Communication; сильный танк на высоких уровнях |

### Rulebook III (2 расы)

| Раса | Профиль | Оптимальный класс | Особые черты |
|------|---------|-------------------|--------------|
| **Meria** (メリア) | Высокие VIT/SPR | Priest | Не спит; каждый рассвет восстанавливает 20% HP и весь MP; растительная жизнеформа |
| **Tiens** (ティエンス) | Сбалансированная | Fighter / Rider | Телепатическая связь в радиусе 10м независимо от языка |
| **Leprechaun** (レプラコーン) | Высокие DEX/INT | Magitech-стрелок | Darkvision, дополнительные слоты для магических предметов, постоянная невидимость |

---

## Расы из Дополнений

### Outlaw Profile Book (4 расы)

| Раса | Описание | Особые черты |
|------|----------|--------------|
| **Alv** (アルヴ) | Готические эльфы с одним Soulscar | Darkvision, Spirit Drain (нужно поглощать MP 1×/неделю) |
| **Shadow** (シャドウ) | Серокожие с третьим глазом и кошачьими глазами | Darkvision, Moonlight's Protection (+4 к Willpower) |
| **Soleil** (ソレイル) | Мускулистые поклонники солнца с татуировками | Radiant Physique (ослепляющее сияние), солнечное исцеление, бонусы днём / штрафы ночью |
| **Weaklings** | Гибриды с меньшим числом Soulscars | Могут скрываться под видом людей; мотивированы на социальные реформы |

### Barbaros Rage (10+ расовых опций для Barbaros PC)
Включают: Diabolo, Drake, Basilisk, Dark Troll, Centaur, Arbor Fairy, Baba Yaga, Scissors Scorpion, Doorn, Kobold.

---

## Поля на листе для раздела «Раса»

```
[ Раса ]         [ Расовая способность 1 ]
                 [ Расовая способность 2 ]
[ Подраса/вариант ]
[ Наличие Soulscar / Corruption Level ]  (по умолчанию 0, зависит от расы)
```

---

## Подрасы / варианты

- **Tabbit**: Pico Tabbit (DEX +3, AGI +3, STR -3, VIT -3) vs Lupus Tabbit (AGI +3, STR +3, INT -3, SPR -3)
- Другие расы также могут иметь варианты (редкие расы — Rare Variants)

---

## Примечания для разработки

1. Поле «Раса» должно влиять на доступные классы (Tabbit не может быть Priest; Runefolk не может быть Priest или Fairy Tamer).
2. Поле Corruption Level (Abyss Taint) — трекер морального / духовного разложения, варьируется по расе.
3. Grassrunner — единственная раса без MP; нужен специальный режим на листе.
4. Barbaros PC имеет отдельный лист с трекером трансформации.
