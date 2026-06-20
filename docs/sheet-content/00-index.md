# SW 2.5 — Character Sheet Research Index

Всё собранное по листу персонажа Sword World 2.5 для разработки digital app.
Исследование проведено 2026-06-20.

---

## Файлы

| Файл | Содержание |
|------|-----------|
| [01-races.md](01-races.md) | Полный список рас (11+4 в доп.), механика коррекций, расовые способности |
| [02-classes.md](02-classes.md) | Все 23 класса по типам (Warrior/Wizard/Other), XP-стоимость, ключевые характеристики |
| [03-ability-scores-and-formulas.md](03-ability-scores-and-formulas.md) | 6 характеристик, таблица модификаторов, HP/MP формулы, Power Table, все формулы |
| [04-combat-and-scas.md](04-combat-and-scas.md) | SCA (4 категории), поля оружия/брони, Check Packages, статус-эффекты, зоны боя |
| [05-magic-spells.md](05-magic-spells.md) | Все 12 магических школ/систем, структура секций заклинаний на листе |
| [06-equipment.md](06-equipment.md) | Ранги, поля оружия/брони/аксессуаров, расходники, валюта, репутация |
| [07-general-skills-and-misc.md](07-general-skills-and-misc.md) | General Skills, расовые способности, Character Info, опыт, Fellow, доп. секции |
| [08-supplements-and-books.md](08-supplements-and-books.md) | Все книги и дополнения, что они добавляют, версии листов |

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

1. **Точные расовые коррекции** — числа по всем расам не задокументированы в EN-источниках; нужен доступ к PDF Rulebook или японскому вики
2. **Полный список SCA** — только категории известны, не список
3. **Точная книга для каждой расы** (Lildraken: Core II или I?)
4. **General Skills список** — 72 навыка из Epic Treasury не задокументированы на EN
5. **Конкретные заклинания** — только примеры, не полные списки
6. **Bibliomancer** — механика Book Magic не задокументирована на EN
7. **War Leader** — упоминается в контексте Mage Arts; отдельный класс или Tactician?
8. **Background таблица** — точные значения Skill/Body/Mind для каждой расы×профессии

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
