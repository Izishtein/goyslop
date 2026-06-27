# SW 2.5 — Character Sheet Research Index

Всё собранное по листу персонажа Sword World 2.5 для разработки digital app.
Исследование проведено 2026-06-20.

---

## Файлы

| Файл | Содержание |
|------|-----------|
| [01-races.md](01-races.md) | 10 рас (Core I + II): Background-таблицы, кости A–F, расовые способности, Enhanced Racial Abilities, языки, XP до уровня 10 |
| [02-classes.md](02-classes.md) | Все 23 класса по типам (Warrior/Wizard/Other), XP-стоимость, ключевые характеристики |
| [03-ability-scores-and-formulas.md](03-ability-scores-and-formulas.md) | 6 характеристик, таблица модификаторов, HP/MP формулы, Power Table, все формулы |
| [04-combat-and-scas.md](04-combat-and-scas.md) | SCA (4 категории), поля оружия/брони, Check Packages, статус-эффекты; Combat Feats Core II (47 новых) |
| [05-magic-spells.md](05-magic-spells.md) | Все 12 магических школ/систем, структура секций заклинаний на листе |
| [06-equipment.md](06-equipment.md) | Ранги, поля оружия/брони/аксессуаров, расходники, валюта, репутация; **Abyss Enhancement (Core II)** |
| [07-general-skills-and-misc.md](07-general-skills-and-misc.md) | General Skills, расовые способности, Character Info, опыт, Fellow, доп. секции |
| [08-supplements-and-books.md](08-supplements-and-books.md) | Все книги и дополнения, что они добавляют, версии листов |
| [09-spells-core1.md](09-spells-core1.md) | Полные списки заклинаний Core I: Truespeech, Spiritualism, Divine, Magitech (кр. 1–6) |
| [10-spells-core2.md](10-spells-core2.md) | Дополнения Core II: Truespeech/Spiritualism/Divine/Magitech (кр. 7–10) + 5 новых богов Divine |
| [11-fairy-magic.md](11-fairy-magic.md) | Fairy Magic: 7 типов × 10 кругов (70 заклинаний), механика Fairy Tamer |
| [12-techniques-spellsongs.md](12-techniques-spellsongs.md) | Techniques (Enhancer, 20 штук) + Spellsongs (Bard, 17 штук) + Finales (8 штук) |

---

## Ключевые факты для разработки

### Формулы (подтверждены)
- **HP max** = Adventurer Level × 3 + VIT (само значение, не модификатор)
- **MP max** = Σ всех Wizard Class Levels × 3 + SPR (само значение)
- **Modifier** = floor(Total / 6)
- **Fortitude** = Adv.Lv + VIT modifier
- **Willpower** = Adv.Lv + SPR modifier
- **Accuracy SV** = Warrior Lv + DEX modifier
- **Evasion SV** = Warrior Lv (не Marksman) + AGI modifier
- **Extra Damage** = Warrior Lv + STR modifier
- **Magic Power SV** = Wizard Lv + INT modifier

### Классы (23 итого)
- **Warrior** (5): Fighter, Grappler, Fencer, Marksman, Battle Dancer
- **Wizard** (8): Sorcerer, Conjurer, Priest, Artificer, Fairy Tamer, Druid, Abyss Gazer, Bibliomancer
- **Other** (10): Scout, Ranger, Sage, Enhancer, Bard, Rider, Alchemist, Tactician, Geomancer, Dark Hunter

### Расы (11 основных + расы доп.)
Core I: Human, Elf, Dwarf, Tabbit, Runefolk, Nightmare, Lykant
Core II: Lildraken, Grassrunner
Core III: Meria, Tiens, Leprechaun
Outlaw: Alv, Shadow, Soleil, Weaklings

### SCA категории (4)
Always-On | Declaration | Major Action | Auto-Acquired
Начальное количество: 1; +1 на нечётном Adv.Lv (1, 3, 5, 7, 9, 11, 13, 15)

### Магические школы (9 систем)
Truespeech | Spiritualism | Divine | Magitech | Fairy | Nature | Daemon/Summoning | Book | Geomancy
+ Spellsongs (Bard), Techniques (Enhancer), Essence Weavings (Dark Hunter)

### Power Table
- 100 строк (Power 1–100+)
- Dice explosion при ≥ Critical Value
- Максимум ~30 урона (Power 100, бросок 12)

---

## Открытые вопросы (актуальные)

### Закрыто по Core Rulebook I PDF
- ✅ **Расовые коррекции** — полные таблицы Skill/Body/Mind и кости A–F для 7 рас Core I (→ 01-races.md)
- ✅ **Background-таблицы** — точные Skill/Body/Mind для каждой расы × фона (→ 01-races.md)
- ✅ **Заклинания Core I** — все 4 школы × 6 кругов (Truespeech, Spiritualism, Divine, Magitech) (→ 09-spells-core1.md)
- ✅ **Specialized Divine Spells** — 8 богов × 2 заклинания (→ 09-spells-core1.md)

### Остаётся открытым
1. **Полный список SCA** — категории известны, конкретные способности требуют Part 3 PDF (pp. 248–265)
2. **Расы Core II/III** — Lildraken, Grassrunner, Meria, Tiens, Leprechaun; нужен PDF Core II/III
3. **General Skills список** — структура известна, конкретные 72+ навыка требуют Epic Treasury PDF
4. **Fairy/Nature/Daemon/Book/Geomancy Magic** — школы из Core II и дополнений
5. **Bibliomancer** — механика Book Magic (Core II)
6. **War Leader** — отдельный класс или вариант Tactician?
7. **Точные расовые коррекции для рас из доп.** (Alv, Shadow, Soleil и др.)

---

## Источники

- https://www.groupsne.co.jp/products/sw/character_2.5.html
- https://fujimi-trpg-online.jp/download/sw25.html
- https://fujimi-trpg-online.jp/game/sw25rule.html
- https://www.gmbinder.com/share/-O9xxbHe0uFqFkdIEi5r
- https://ccxp.info/sword-world-2-5-an-overview-part-one/ (и parts 2, 3, 6, 7)
- https://ccxp.info/sword-world-2-5-new-supplements/
- https://www.enworld.org/threads/lets-read-sword-world-2-5.691213/ (и pages 2-3)
- https://app.roll20.net/forum/post/11523212/sword-world-2-dot-5-sheet-in-progress
- https://steamcommunity.com/sharedfiles/filedetails/?id=3006150901
- https://danielhkwan.substack.com/p/tabletop-rpgs-of-asia-sword-world
- https://ameblo.jp/laytontrpg/entry-12901437363.html
- https://trpg.syachi.work/sw25/forbeginner/ytsheet/
- https://yutorize.work/ytsheet/sw2.5/
- https://www.scribd.com/document/703207328/Character-Sheet-Fillable-by-MomijiLoop
- https://www.rpgpub.com/threads/sword-world-2-5-english-translation-to-get-a-ks.12243/page-4
